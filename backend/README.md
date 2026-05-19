# CIS Platform — Backend

## Installation

```bash
cd backend
npm install
```

## Configuration

Dans `db.js`, modifie ces valeurs selon ton PostgreSQL :
```js
user: 'postgres',      // ton user PostgreSQL
password: 'postgres',  // ton mot de passe PostgreSQL
database: 'cis_plateform'
```

## Lancer le serveur

```bash
# Mode normal
npm start

# Mode développement (redémarre automatiquement)
npm run dev
```

Le serveur tourne sur : http://localhost:3001

## Endpoints disponibles

### Auth
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /auth/login | Connexion → retourne un token JWT |
| POST | /auth/register | Créer un compte |

### Projets (token requis)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /projects | Liste tous les projets |
| GET | /projects/:id | Détails + tâches d'un projet |
| POST | /projects | Créer un projet |
| PUT | /projects/:id | Modifier un projet |
| DELETE | /projects/:id | Supprimer un projet |

### Tâches (token requis)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /tasks | Toutes les tâches (filtre: ?project_id=X ou ?assigned_to=X) |
| POST | /tasks | Créer une tâche |
| PUT | /tasks/:id | Modifier une tâche |
| DELETE | /tasks/:id | Supprimer une tâche |

### Utilisateurs (token requis)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /users | Liste des utilisateurs |
| GET | /users/:id | Profil d'un utilisateur |
| PUT | /users/:id | Modifier nom/mot de passe |

### Commentaires (token requis)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /commentaires?task_id=X | Commentaires d'une tâche |
| POST | /commentaires | Ajouter un commentaire |

## Utilisation du token dans le front

Après login, stocker le token et l'envoyer dans chaque requête :
```js
const response = await fetch('http://localhost:3001/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Créer des comptes de test

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Directeur Test","email":"directeur@cis.com","password":"test123","role":"Directeur"}'
```
