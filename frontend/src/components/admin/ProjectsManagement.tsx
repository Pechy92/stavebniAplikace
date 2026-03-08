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
      console.log('📋 Načteno projektů:', response.data.length);
      response.data.forEach((p: any, i: number) => {
        console.log(`  ${i+1}. ID: ${p.id}, Custom ID: ${p.custom_id}, Název: ${p.name}`);
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (project?: Project) => {
    if (project) {
      console.log('📝 Editace projektu:', project);
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
        
        console.log('👥 Načtení manažeři:', managersRes.data);
        console.log('👷 Načtení stavbyvedoucí:', foremenRes.data);
        
        const managerIds = managersRes.data.map((m: User) => m.id);
        const foremanIds = foremenRes.data.map((f: User) => f.id);
        
        console.log('🔢 Manager IDs:', managerIds);
        console.log('🔢 Foreman IDs:', foremanIds);
        
        // Převést datum na YYYY-MM-DD formát pro input[type="date"]
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        const formDataToSet = {
          name: project.name,
          customId: project.custom_id,
          address: project.address,
          startDate: formatDate(project.start_date),
          plannedEndDate: formatDate(project.planned_end_date),
          status: project.status,
          managerIds: managerIds,
          foremanIds: foremanIds
        };
        
        console.log('📋 Nastavuji formData:', formDataToSet);
        setFormData(formDataToSet);
      } catch (error) {
        console.error('Chyba při načítání přiřazení:', error);
        
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          name: project.name,
          customId: project.custom_id,
          address: project.address,
          startDate: formatDate(project.start_date),
          plannedEndDate: formatDate(project.planned_end_date),
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
      active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      paused: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="glass-card inline-flex items-center gap-3 px-6 py-4 animate-pulse">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Načítám projekty...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nový projekt
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Číslo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Název</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Adresa</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Začátek</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stav</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {projects.map((project) => {
              console.log(`🔍 Zobrazuji projekt: ID=${project.id}, custom_id="${project.custom_id}", name="${project.name}"`);
              return (
                <tr key={project.id} className="hover:bg-white/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.custom_id || <span className="text-red-500">(chybí)</span>}
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
                  <span className={`badge-glass ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(project)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    ✏️ Upravit
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-scale-in">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom glass-card text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                    {editingProject ? '✏️ Upravit projekt' : '➕ Nový projekt'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název projektu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="input-glass"
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
                        className="input-glass"
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
                        className="input-glass"
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
                          className="input-glass"
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
                          className="input-glass"
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
                        className="input-glass"
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
                      {editingProject && (
                        <p className="text-xs text-gray-500 mb-1">
                          Debug: Vybrané IDs: {JSON.stringify(formData.managerIds)}
                        </p>
                      )}
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                        {users.filter(u => u.role === 'manager' || u.role === 'admin').map(user => {
                          const isChecked = formData.managerIds.includes(user.id);
                          return (
                            <label key={user.id} className={`flex items-center space-x-2 p-1 rounded cursor-pointer ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  console.log(`Manager ${user.id} (${user.first_name}):`, e.target.checked ? 'přidán' : 'odebrán');
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
                                <span className="text-gray-500 text-xs ml-1">
                                  ({user.role === 'admin' ? 'Admin' : 'Manažer'}) [ID: {user.id}]
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stavbyvedoucí
                      </label>
                      {editingProject && (
                        <p className="text-xs text-gray-500 mb-1">
                          Debug: Vybrané IDs: {JSON.stringify(formData.foremanIds)}
                        </p>
                      )}
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                        {users.filter(u => u.role === 'foreman').map(user => {
                          const isChecked = formData.foremanIds.includes(user.id);
                          return (
                            <label key={user.id} className={`flex items-center space-x-2 p-1 rounded cursor-pointer ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  console.log(`Foreman ${user.id} (${user.first_name}):`, e.target.checked ? 'přidán' : 'odebrán');
                                  if (e.target.checked) {
                                    setFormData({ ...formData, foremanIds: [...formData.foremanIds, user.id] });
                                  } else {
                                    setFormData({ ...formData, foremanIds: formData.foremanIds.filter(id => id !== user.id) });
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-900">
                                {user.first_name} {user.last_name} [ID: {user.id}]
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                  >
                    {editingProject ? '💾 Uložit' : '➕ Vytvořit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    ✕ Zrušit
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
