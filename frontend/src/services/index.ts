import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (registerData: RegisterData): Promise<void> => {
    await api.post('/auth/register', registerData);
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<void> => {
    await api.put('/auth/profile', userData);
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  }
};

export const projectService = {
  getAll: async () => {
    const { data } = await api.get('/projects');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  create: async (projectData: any) => {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  update: async (id: number, projectData: any) => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/projects/${id}`);
  }
};

export const extraWorkService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/extra-work', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/extra-work/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await api.post('/extra-work', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  submitToForeman: async (id: number) => {
    const { data } = await api.post(`/extra-work/${id}/submit-to-foreman`);
    return data;
  },

  addMaterials: async (id: number, materials: any[]) => {
    const { data } = await api.post(`/extra-work/${id}/materials`, { materials });
    return data;
  },

  submitToManager: async (id: number) => {
    const { data } = await api.post(`/extra-work/${id}/submit-to-manager`);
    return data;
  },

  approve: async (id: number) => {
    const { data } = await api.post(`/extra-work/${id}/approve`);
    return data;
  }
};
