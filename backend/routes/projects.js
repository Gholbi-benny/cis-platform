const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /projects - tous les projets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /projects/:id - un projet + ses tâches
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await pool.query('SELECT p.*, u.name as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id WHERE p.id = $1', [req.params.id]);
    if (!project.rows[0]) return res.status(404).json({ error: 'Projet introuvable' });

    const tasks = await pool.query('SELECT * FROM tasks WHERE project_id = $1', [req.params.id]);
    const collaborators = await pool.query(`
      SELECT c.*, u.name, u.email FROM collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = $1
    `, [req.params.id]);

    res.json({ ...project.rows[0], tasks: tasks.rows, collaborators: collaborators.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /projects - créer un projet
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis' });

  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, owner_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, req.user.id, status || 'En cours']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /projects/:id - modifier un projet
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET title=$1, description=$2, status=$3 WHERE id=$4 RETURNING *',
      [title, description, status || 'En cours', req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /projects/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Projet supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;