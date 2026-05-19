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
    const message = body?.message || response.statusText || 'Erreur réseau';
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

export type UpdateUserRequest = User;

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password } as LoginRequest),
  });

  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.token);
  return response;
};

export const getProjects = async (): Promise<Project[]> => {
  return request<Project[]>('/projects');
};

export const createProject = async (project: CreateProjectRequest): Promise<Project> => {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
};

export const getTasks = async (): Promise<Task[]> => {
  return request<Task[]>('/tasks');
};

export const getUsers = async (): Promise<User[]> => {
  return request<User[]>('/users');
};

export const updateUser = async (user: UpdateUserRequest): Promise<User> => {
  return request<User>(`/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
};

export const logout = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
};
