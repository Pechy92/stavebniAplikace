import api from './api';

const API_URL = '/shifts';

export interface ShiftTask {
  id: number;
  shift_id: number;
  name: string;
  description?: string;
  assigned_worker_id?: number;
  first_name?: string;
  last_name?: string;
  status: 'new' | 'completed';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  order_index: number;
}

export const shiftTaskService = {
  getAll: async (shiftId: number): Promise<ShiftTask[]> => {
    const response = await api.get(`${API_URL}/${shiftId}/tasks`);
    return response.data;
  },

  create: async (shiftId: number, taskData: Partial<ShiftTask>): Promise<ShiftTask> => {
    const response = await api.post(`${API_URL}/${shiftId}/tasks`, taskData);
    return response.data;
  },

  update: async (shiftId: number, taskId: number, taskData: Partial<ShiftTask>): Promise<void> => {
    await api.put(`${API_URL}/${shiftId}/tasks/${taskId}`, taskData);
  },

  delete: async (shiftId: number, taskId: number): Promise<void> => {
    await api.delete(`${API_URL}/${shiftId}/tasks/${taskId}`);
  },

  complete: async (shiftId: number, taskId: number): Promise<void> => {
    await api.post(`${API_URL}/${shiftId}/tasks/${taskId}/complete`);
  }
};
