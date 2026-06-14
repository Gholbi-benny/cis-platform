const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /projects
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

// GET /projects/:id
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

// POST /projects
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis' });

  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, owner_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, req.user.id, status || 'En cours']
    );

    const createdProject = result.rows[0];

    // Si le projet est soumis par le Directeur commercial, notifier le Directeur technique
    if (status === 'En attente de validation') {
      try {
        const techDirectors = await pool.query("SELECT id FROM users WHERE role = 'Directeur technique'");
        const senderName = req.user.name || 'Le Directeur commercial';

        for (const dt of techDirectors.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, project_id) VALUES ($1, $2, $3, $4, $5)',
            [
              dt.id,
              'project_submission',
              'Nouveau projet soumis',
              `${senderName} a soumis le projet "${title}" pour validation`,
              createdProject.id
            ]
          );
        }
      } catch (e) { console.error('Erreur notification soumission:', e.message || e); }
    }

    res.status(201).json(createdProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /projects/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, owner_id } = req.body;
  try {
    const existing = await pool.query('SELECT owner_id, title FROM projects WHERE id = $1', [req.params.id]);
    const prevOwnerId = existing.rows[0]?.owner_id;
    const projectTitle = title || existing.rows[0]?.title || '';

    const result = await pool.query(
      'UPDATE projects SET title=$1, description=$2, status=$3, owner_id=COALESCE($4, owner_id) WHERE id=$5 RETURNING *',
      [title, description, status || 'En cours', owner_id || null, req.params.id]
    );

    const updated = result.rows[0];

    if (updated) {
      const ownerResult = await pool.query('SELECT name FROM users WHERE id = $1', [updated.owner_id]);
      updated.owner_name = ownerResult.rows[0]?.name ?? 'Inconnu';
    }

    if (owner_id && owner_id !== prevOwnerId) {
      try {
        const senderName = req.user.name || 'La direction';
        const notifTitle = 'Nouveau projet assigné';
        const notifMessage = `${senderName} vous a assigné le projet "${projectTitle}"`;
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, project_id) VALUES ($1, $2, $3, $4, $5)',
          [owner_id, 'project_assignment', notifTitle, notifMessage, parseInt(req.params.id)]
        );
      } catch (e) { console.error('Erreur création notification projet:', e.message || e); }
    }

    res.json(updated);
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