export type Project = {
  id: number;
  name: string;
  status: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
  documents: Document[];
  comments: Comment[];
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: 'À faire' | 'En cours' | 'Terminé' | 'En retard';
  assignee: string;
  projectId: number;
  priority: 'Faible' | 'Moyenne' | 'Élevée';
  startDate?: string;
  dueDate: string;
  comments: Comment[];
};

export type Role = 'Directeur général' | 'Directeur général adjoint' | 'Coordinateur de projet' | 'Équipe technique' | 'Directeur commercial' | 'Directeur technique';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export type UserAccount = User & { password: string };

export const userAccounts: UserAccount[] = [
  { id: 1, name: 'El_Lee-Segnor', email: 'el_lee-segnor@ciscongo.com', role: 'Directeur général', password: 'demo123' },
  { id: 2, name: 'Gholbi Moannaka', email: 'gholbi@ciscongo.com', role: 'Coordinateur de projet', password: 'demo123' },
  { id: 3, name: 'Gloire Guioro', email: 'gloire@ciscongo.com', role: 'Équipe technique', password: 'demo123' },
  { id: 4, name: 'Chalbery Malonga', email: 'chalbery@ciscongo.com', role: 'Directeur commercial', password: 'demo123' },
];

export const users: User[] = userAccounts.map(({ password: _password, ...u }) => u);

export type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
  taskId?: number;
  projectId?: number;
};

export type ClientMessage = {
  id: number;
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  status: 'Nouveau' | 'En attente' | 'Validé';
  requestedDate: string;
  projectName: string;
  reply: string;
};

export type Document = {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  projectId: number;
};

export type DashboardData = {
  projects: number;
  delayedTasks: number;
  performance: number;
  activeProjects: number;
  completedTasks: number;
};

export const dashboardData: DashboardData = {
  projects: 5,
  delayedTasks: 2,
  performance: 85,
  activeProjects: 3,
  completedTasks: 12,
};

export const projects: Project[] = [
  {
    id: 1,
    name: "Site Web Client A",
    status: "En cours",
    description: "Développement d'un site web responsive pour le client A",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    manager: "Marie Martin",
    team: ["Paul Durand", "Sophie Leroy"],
    documents: [],
    comments: []
  },
  {
    id: 2,
    name: "Application Mobile",
    status: "Terminé",
    description: "Application mobile pour la gestion interne",
    startDate: "2023-11-01",
    endDate: "2024-01-30",
    manager: "Marie Martin",
    team: ["Paul Durand"],
    documents: [],
    comments: []
  },
];

export const tasks: Task[] = [
  {
    id: 1,
    title: "Créer UI",
    description: "Concevoir l'interface utilisateur du dashboard",
    status: "En cours",
    assignee: "Paul Durand",
    projectId: 1,
    priority: "Élevée",
    dueDate: "2024-02-15",
    comments: []
  },
  {
    id: 2,
    title: "API Backend",
    description: "Développer l'API REST pour les données",
    status: "À faire",
    assignee: "Paul Durand",
    projectId: 1,
    priority: "Moyenne",
    dueDate: "2024-02-28",
    comments: []
  },
];

export const messages: ClientMessage[] = [
  {
    id: 1,
    clientName: "Client A",
    clientEmail: "client.a@example.com",
    subject: "Demande de création de site web",
    message: "Je souhaite un site e-commerce complet avec paiement en ligne.",
    status: "Nouveau",
    requestedDate: "2024-04-20",
    projectName: "Site Web Client A",
    reply: ""
  },
  {
    id: 2,
    clientName: "Client B",
    clientEmail: "client.b@example.com",
    subject: "Application mobile pour la vente interne",
    message: "Nous avons besoin d'une app mobile pour nos commerciaux.",
    status: "En attente",
    requestedDate: "2024-04-22",
    projectName: "Application Mobile",
    reply: "Rendez-vous proposé le 25/04 à 10h à l'agence."
  },
];