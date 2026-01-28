import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Project {
  id: number;
  name: string;
  custom_id: string;
  address: string;
  start_date: string;
  planned_end_date: string;
  actual_end_date: string | null;
  status: string;
  managers?: User[];
  foremen?: User[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    customId: '',
    address: '',
    startDate: '',
    plannedEndDate: '',
    status: 'active',
    managerIds: [] as number[],
    foremanIds: [] as number[]
  });

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📋 Načteno projektů:', response.data.length, response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (project?: Project) => {
    if (project) {
      setEditingProject(project);
      
      // Načíst manažery a stavbyvedoucí projektu
      try {
        const token = localStorage.getItem('token');
        const [managersRes, foremenRes] = await Promise.all([
          axios.get(`${API_URL}/projects/${project.id}/managers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/projects/${project.id}/foremen`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setFormData({
          name: project.name,
          customId: project.custom_id,
          address: project.address,
          startDate: project.start_date,
          plannedEndDate: project.planned_end_date,
          status: project.status,
          managerIds: managersRes.data.map((m: User) => m.id),
          foremanIds: foremenRes.data.map((f: User) => f.id)
        });
      } catch (error) {
        console.error('Chyba při načítání přiřazení:', error);
        setFormData({
          name: project.name,
          customId: project.custom_id,
          address: project.address,
          startDate: project.start_date,
          plannedEndDate: project.planned_end_date,
          status: project.status,
          managerIds: [],
          foremanIds: []
        });
      }
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        customId: '',
        address: '',
        startDate: '',
        plannedEndDate: '',
        status: 'active',
        managerIds: [],
        foremanIds: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 Odesílám projekt:', formData);
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingProject) {
        await axios.put(
          `${API_URL}/projects/${editingProject.id}`,
          {
            name: formData.name,
            custom_id: formData.customId,
            address: formData.address,
            start_date: formData.startDate,
            planned_end_date: formData.plannedEndDate,
            status: formData.status,
            manager_ids: formData.managerIds,
            foreman_ids: formData.foremanIds
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Projekt byl úspěšně upraven');
      } else {
        await axios.post(
          `${API_URL}/projects`,
          {
            name: formData.name,
            custom_id: formData.customId,
            address: formData.address,
            start_date: formData.startDate,
            planned_end_date: formData.plannedEndDate,
            status: formData.status,
            manager_ids: formData.managerIds,
            foreman_ids: formData.foremanIds
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Projekt byl úspěšně vytvořen');
      }
      
      await loadProjects(); // Počkat na refresh seznamu
      handleCloseModal();
    } catch (error: any) {
      console.error('❌ Chyba při ukládání projektu:', error.response?.data);
      alert(error.response?.data?.message || 'Chyba při ukládání projektu');
    }
  };

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      active: 'Aktivní',
      completed: 'Dokončený',
      paused: 'Pozastavený',
      cancelled: 'Zrušený'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Načítám projekty...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nový projekt
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Číslo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Začátek</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {project.custom_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {project.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {project.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(project.start_date).toLocaleDateString('cs-CZ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(project)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Upravit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingProject ? 'Upravit projekt' : 'Nový projekt'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název projektu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Číslo projektu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.customId}
                        onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Začátek <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Plánovaný konec
                        </label>
                        <input
                          type="date"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={formData.plannedEndDate}
                          onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stav <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Aktivní</option>
                        <option value="completed">Dokončený</option>
                        <option value="paused">Pozastavený</option>
                        <option value="cancelled">Zrušený</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manažeři
                      </label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                        {users.filter(u => u.role === 'manager' || u.role === 'admin').map(user => (
                          <label key={user.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.managerIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, managerIds: [...formData.managerIds, user.id] });
                                } else {
                                  setFormData({ ...formData, managerIds: formData.managerIds.filter(id => id !== user.id) });
                                }
                              }}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-900">
                              {user.first_name} {user.last_name} 
                              <span className="text-gray-500 text-xs ml-1">({user.role === 'admin' ? 'Admin' : 'Manažer'})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stavbyvedoucí
                      </label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                        {users.filter(u => u.role === 'foreman').map(user => (
                          <label key={user.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.foremanIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, foremanIds: [...formData.foremanIds, user.id] });
                                } else {
                                  setFormData({ ...formData, foremanIds: formData.foremanIds.filter(id => id !== user.id) });
                                }
                              }}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-900">
                              {user.first_name} {user.last_name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingProject ? 'Uložit' : 'Vytvořit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;
