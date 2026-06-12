const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /tasks - toutes les tâches (filtrables par projet ou utilisateur)
router.get('/', authMiddleware, async (req, res) => {
  const { project_id, assigned_to } = req.query;
  try {
    let query = `
      SELECT t.*, u.name as assignee_name, p.title as project_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) { params.push(project_id); query += ` AND t.project_id = $${params.length}`; }
    if (assigned_to) { params.push(assigned_to); query += ` AND t.assigned_to = $${params.length}`; }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks - créer une tâche
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, due_date, project_id, assigned_to } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis' });

  try {
    // Si une assignation est demandée, vérifier que l'utilisateur est coordinateur du projet
    if (assigned_to) {
      if (!project_id) return res.status(400).json({ error: 'project_id requis pour assignation' });
      const proj = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [project_id]);
      if (!proj.rows[0]) return res.status(400).json({ error: 'Projet introuvable' });
      const ownerId = proj.rows[0].owner_id;
      if (req.user.id !== ownerId) return res.status(403).json({ error: 'Seul le coordinateur du projet peut assigner une étape' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, due_date, project_id, assigned_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, status || 'pending', due_date, project_id, assigned_to]
    );

    // Création d'une notification pour l'utilisateur assigné
    if (assigned_to) {
      try {
        const notifTitle = 'Nouvelle étape assignée';
        const notifMessage = `Une étape vous a été assignée: ${title}`;
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
          [assigned_to, 'assignment', notifTitle, notifMessage]
        );
      } catch (e) { console.error('Erreur création notification:', e.message || e); }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id - modifier statut ou infos
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;
  try {
    // Récupérer assigné actuel pour détecter changement
    const existing = await pool.query('SELECT assigned_to, title FROM tasks WHERE id = $1', [req.params.id]);
    const prevAssigned = existing.rows[0]?.assigned_to;
    const taskTitle = existing.rows[0]?.title ?? title ?? '';
    // Si assignation modifiée, vérifier que l'utilisateur est coordinateur du projet lié
    if (assigned_to && assigned_to !== prevAssigned) {
      // récupérer project_id
      const t = await pool.query('SELECT project_id FROM tasks WHERE id = $1', [req.params.id]);
      const projectId = t.rows[0]?.project_id;
      if (!projectId) return res.status(400).json({ error: 'Tâche sans projet associé' });
      const proj = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
      if (!proj.rows[0]) return res.status(400).json({ error: 'Projet introuvable' });
      const ownerId = proj.rows[0].owner_id;
      if (req.user.id !== ownerId) return res.status(403).json({ error: 'Seul le coordinateur du projet peut assigner une étape' });
    }

    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4, assigned_to=$5 WHERE id=$6 RETURNING *',
      [title, description, status, due_date, assigned_to, req.params.id]
    );

    // Création notification si assignation changée
    if (assigned_to && assigned_to !== prevAssigned) {
      try {
        const notifTitle = 'Nouvelle étape assignée';
        const notifMessage = `Une étape vous a été assignée: ${taskTitle}`;
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
          [assigned_to, 'assignment', notifTitle, notifMessage]
        );
      } catch (e) { console.error('Erreur création notification:', e.message || e); }
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
