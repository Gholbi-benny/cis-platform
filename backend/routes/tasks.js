const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /tasks
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

// POST /tasks
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, due_date, project_id, assigned_to } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis' });

  try {
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

    const createdTask = result.rows[0];

    if (assigned_to) {
      try {
        const senderName = req.user.name || 'Le coordinateur';
        const notifTitle = 'Nouvelle étape assignée';
        const notifMessage = `${senderName} vous a assigné l'étape "${title}"`;
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, task_id) VALUES ($1, $2, $3, $4, $5)',
          [assigned_to, 'assignment', notifTitle, notifMessage, createdTask.id]
        );
      } catch (e) { console.error('Erreur création notification:', e.message || e); }
    }

    res.status(201).json(createdTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;
  try {
    const existing = await pool.query('SELECT assigned_to, title, project_id FROM tasks WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Tâche introuvable' });

    const prevAssigned = existing.rows[0].assigned_to;
    const taskTitle = title || existing.rows[0].title || '';
    const projectId = existing.rows[0].project_id;

    // Déterminer le nouveau assigned_to
    const newAssigned = assigned_to !== undefined && assigned_to !== null ? parseInt(assigned_to) : prevAssigned;
    const assigneeChanged = newAssigned !== prevAssigned;

    // Vérifier les droits seulement si l'assignation change vraiment
    if (assigneeChanged && newAssigned) {
      const allowedRoles = ['Coordinateur de projet', 'Directeur technique', 'Directeur général', 'Directeur général adjoint'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Vous n\'avez pas la permission d\'assigner une étape' });
      }
    }

    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4, assigned_to=$5 WHERE id=$6 RETURNING *',
      [title, description, status, due_date, newAssigned, req.params.id]
    );

    // Notification si assignation changée
    if (assigneeChanged && newAssigned) {
      try {
        const senderName = req.user.name || 'Le coordinateur';
        const notifTitle = 'Nouvelle étape assignée';
        const notifMessage = `${senderName} vous a assigné l'étape "${taskTitle}"`;
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, task_id) VALUES ($1, $2, $3, $4, $5)',
          [newAssigned, 'assignment', notifTitle, notifMessage, parseInt(req.params.id)]
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