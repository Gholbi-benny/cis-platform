const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

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
  const allowedRoles = ['Directeur général', 'Directeur général adjoint'];
  if (!allowedRoles.includes(req.user.role)) {
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

// PUT /users/:id - modifier nom ou mot de passe
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, password } = req.body;

  // Sécurité : un user ne peut modifier que son propre profil
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: 'Non autorisé' });

  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name=$1, password=$2 WHERE id=$3', [name, hashed, req.params.id]);
    } else {
      await pool.query('UPDATE users SET name=$1 WHERE id=$2', [name, req.params.id]);
    }
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;