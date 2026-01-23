import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
  custom_id: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

const ShiftForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    userId: '',
    date: '',
    startTime: '07:00',
    endTime: '15:00'
  });

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const duration = (endH * 60 + endM - startH * 60 - startM) / 60;
    return duration > 0 ? duration : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.userId || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Vyplňte prosím všechna povinná pole');
      return;
    }

    if (calculateDuration() <= 0) {
      alert('Čas konce musí být po času začátku');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3001/api/shifts',
        {
          project_id: parseInt(formData.projectId),
          user_id: parseInt(formData.userId),
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Směna byla úspěšně vytvořena');
      navigate('/shifts');
    } catch (error: any) {
      console.error('Chyba při vytváření směny:', error);
      alert(error.response?.data?.message || 'Chyba při vytváření směny');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nová směna</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vytvořte nový záznam o odpracované směně
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden max-w-2xl">
        <div className="px-6 py-5 space-y-6">
          {/* Projekt */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Projekt <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Vyberte projekt</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.custom_id} - {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pracovník */}
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
              Pracovník <span className="text-red-500">*</span>
            </label>
            <select
              id="user"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              <option value="">Vyberte pracovníka</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Datum */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Časy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Začátek <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Konec <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Zobrazení délky směny */}
          {formData.startTime && formData.endTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Délka směny: <span className="font-medium">{calculateDuration().toFixed(1)} hodin</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/shifts')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Ukládám...' : 'Vytvořit směnu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShiftForm;
