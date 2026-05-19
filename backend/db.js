const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'cis_plateform',
  user: 'postgres',       // change si ton user PostgreSQL est différent
  password: 'Gholbi_10',   // change par ton mot de passe PostgreSQL
});

pool.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL'))
  .catch(err => console.error('❌ Erreur connexion PostgreSQL:', err.message));

module.exports = pool;
