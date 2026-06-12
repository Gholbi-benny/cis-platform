const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /notifications - mes notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notifications/unread/count - nombre non lues
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ unread: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /notifications/:id/read - marquer comme lue
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notifications - créer une notification (interne)
router.post('/', authMiddleware, async (req, res) => {
  const { user_id, type, title, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, type, title, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;