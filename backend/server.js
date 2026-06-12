const express = require('express');
const cors = require('cors');
const app = express();

// Middleware CORS et JSON
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));
app.use('/tasks', require('./routes/tasks'));
app.use('/commentaires', require('./routes/commentaires'));
app.use('/notifications', require('./routes/notifications'));

// Health check
app.get('/', (req, res) => res.json({ status: 'CIS Platform API en ligne ✅' }));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`✅ Connecté à PostgreSQL`);
});