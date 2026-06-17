const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const ADMIN_ROLES = ['Directeur général', 'Directeur général adjoint'];

// GET /users - liste tous les utilisateurs (pour assigner des tâches)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id - profil d'un utilisateur
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users - créer un utilisateur (réservé Directeur général / Directeur général adjoint)
router.post('/', authMiddleware, async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Seuls le Directeur général et le Directeur général adjoint peuvent créer des utilisateurs.' });
  }

  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.trim(), hashed, role || 'Équipe technique']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/:id - modifier un utilisateur
// - L'utilisateur lui-même peut modifier son nom et son mot de passe
// - Le Directeur général / Directeur général adjoint peut modifier nom, email, rôle et mot de passe de n'importe qui
router.put('/:id', authMiddleware, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const isSelf = req.user.id === targetId;
  const isAdmin = ADMIN_ROLES.includes(req.user.role);

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  const { name, email, role, password } = req.body;

  try {
    if (isAdmin) {
      // Vérifier que l'utilisateur cible existe
      const target = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
      if (!target.rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });

      // Vérifier l'unicité de l'email si modifié
      if (email && email !== target.rows[0].email) {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, targetId]);
        if (existing.rows[0]) {
          return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }
      }

      const finalName = name?.trim() || target.rows[0].name;
      const finalEmail = email?.trim() || target.rows[0].email;
      const finalRole = role || target.rows[0].role;

      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE users SET name=$1, email=$2, role=$3, password=$4 WHERE id=$5',
          [finalName, finalEmail, finalRole, hashed, targetId]
        );
      } else {
        await pool.query(
          'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4',
          [finalName, finalEmail, finalRole, targetId]
        );
      }
    } else {
      // Auto-modification : nom et mot de passe uniquement
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET name=$1, password=$2 WHERE id=$3', [name, hashed, targetId]);
      } else {
        await pool.query('UPDATE users SET name=$1 WHERE id=$2', [name, targetId]);
      }
    }

    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id - supprimer un utilisateur (réservé Directeur général / Directeur général adjoint)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Seuls le Directeur général et le Directeur général adjoint peuvent supprimer des utilisateurs.' });
  }

  const targetId = parseInt(req.params.id);

  if (req.user.id === targetId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }

  try {
    const target = await pool.query('SELECT id FROM users WHERE id = $1', [targetId]);
    if (!target.rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await pool.query('DELETE FROM users WHERE id = $1', [targetId]);
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: "Impossible de supprimer cet utilisateur : il est encore lié à des projets ou des étapes. Réaffectez-les d'abord." });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;