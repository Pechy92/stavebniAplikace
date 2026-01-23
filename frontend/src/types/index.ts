export type UserRole = 'admin' | 'manager' | 'foreman' | 'worker';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  customId?: string;
  address?: string;
  startDate?: string;
  plannedEndDate?: string;
  status: 'preparation' | 'active' | 'paused' | 'completed';
}

export interface Material {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  unit: string;
  category?: string;
  sku?: string;
}

export interface ExtraWork {
  id: number;
  name: string;
  // camelCase (legacy in frontend)
  projectId?: number;
  projectName?: string;
  workerId?: number;
  workerFirstName?: string;
  workerLastName?: string;
  startDatetime?: string;
  endDatetime?: string;
  durationHours?: number;
  workDescription?: string;
  materialDescriptionText?: string;
  // snake_case (from backend API)
  custom_id?: string;
  project_id?: number;
  project_name?: string;
  created_at?: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
  description?: string;
  duration_hours?: number;
  material_description_text?: string;
  // collections
  photos?: Array<{ id?: number; file_path: string; file_name?: string }>;
  materials?: Array<{ name: string; quantity: number; unit?: string }>;
  comments?: Array<{ author_name: string; created_at: string; comment: string }>;
  // status
  status: 'draft' | 'submitted_to_foreman' | 'returned_to_worker' | 'submitted_to_manager' | 'returned_to_foreman' | 'approved';
}

export interface ExtraWorkMaterial {
  id: number;
  materialId: number;
  materialName: string;
  quantity: number;
  unitPriceSnapshot: number;
  totalPrice: number;
  unit?: string;
}

export interface ExtraWorkPhoto {
  id: number;
  filePath: string;
  fileName: string;
}

export interface Shift {
  id: number;
  name: string;
  projectId: number;
  projectName?: string;
  startDatetime: string;
  endDatetime: string;
  durationHours: number;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}
