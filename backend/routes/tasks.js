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
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, due_date, project_id, assigned_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, status || 'pending', due_date, project_id, assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id - modifier statut ou infos
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4, assigned_to=$5 WHERE id=$6 RETURNING *',
      [title, description, status, due_date, assigned_to, req.params.id]
    );
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
