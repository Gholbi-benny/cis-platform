import type { Project, Task, User } from './data/mockData';

const API_BASE = 'http://localhost:3001';
const LOCAL_STORAGE_TOKEN_KEY = 'token';

const getAuthToken = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
};

const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText || 'Erreur réseau';
    throw new Error(message);
  }

  return body as T;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: getHeaders(options.headers),
    ...options,
  });

  return handleResponse<T>(response);
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type CreateProjectRequest = Omit<Project, 'id'>;
export type UpdateProjectRequest = Partial<Omit<Project, 'id'>> & { id: number };
export type CreateTaskRequest = Omit<Task, 'id'>;
export type UpdateTaskRequest = Partial<Omit<Task, 'id'>> & { id: number };
export type UpdateUserRequest = Partial<User> & { id: number };
export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type TaskComment = {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  task_id: number;
};

export type Notification = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password } as LoginRequest),
  });

  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.token);
  return response;
};

export const logout = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
};

export const getProjects = async (): Promise<Project[]> => {
  return request<Project[]>('/projects');
};

export const getProjectById = async (projectId: number): Promise<Project> => {
  return request<Project>(`/projects/${projectId}`);
};

export const createProject = async (project: CreateProjectRequest): Promise<Project> => {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
};

export const updateProject = async (project: UpdateProjectRequest): Promise<Project> => {
  return request<Project>(`/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });
};

export const getTasks = async (projectId?: number, assignedTo?: number): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (projectId !== undefined) params.append('project_id', String(projectId));
  if (assignedTo !== undefined) params.append('assigned_to', String(assignedTo));

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<Task[]>(`/tasks${query}`);
};

export const createTask = async (task: CreateTaskRequest): Promise<Task> => {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const updateTask = async (task: UpdateTaskRequest): Promise<Task> => {
  const { id, ...payload } = task;
  return request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const getUsers = async (): Promise<User[]> => {
  return request<User[]>('/users');
};

export const getUser = async (userId: number): Promise<User> => {
  return request<User>(`/users/${userId}`);
};

export const updateUser = async (user: UpdateUserRequest): Promise<User> => {
  return request<User>(`/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
};

export const createUser = async (newUser: CreateUserRequest): Promise<User> => {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(newUser),
  });
};

export const getComments = async (taskId: number): Promise<TaskComment[]> => {
  const query = `?task_id=${encodeURIComponent(String(taskId))}`;
  return request<TaskComment[]>(`/commentaires${query}`);
};

export const createComment = async (taskId: number, content: string): Promise<TaskComment> => {
  return request<TaskComment>('/commentaires', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, content }),
  });
};

export const getNotifications = async (): Promise<Notification[]> => {
  return request<Notification[]>('/notifications');
};

export const getUnreadCount = async (): Promise<{ unread: number }> => {
  return request<{ unread: number }>('/notifications/unread/count');
};

export const markNotificationAsRead = async (id: number): Promise<Notification> => {
  return request<Notification>(`/notifications/${id}/read`, {
    method: 'PUT',
  });
};