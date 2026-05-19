const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /commentaires?task_id=X
router.get('/', authMiddleware, async (req, res) => {
  const { task_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as author_name
      FROM commentaires c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `, [task_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /commentaires
router.post('/', authMiddleware, async (req, res) => {
  const { content, task_id } = req.body;
  if (!content || !task_id) return res.status(400).json({ error: 'content et task_id requis' });

  try {
    const result = await pool.query(
      'INSERT INTO commentaires (content, task_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, task_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
