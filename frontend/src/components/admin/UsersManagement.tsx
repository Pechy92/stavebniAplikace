import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  active: boolean;
  created_at: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'worker'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const toArray = <T,>(value: any): T[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users?include_inactive=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Map is_active to active for frontend
      const rawUsers = toArray<any>(response.data);
      const mappedUsers = rawUsers.map((user: any) => ({
        ...user,
        active: user.is_active
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'worker'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingUser) {
        // Upravit existujícího uživatele
        await axios.put(
          `${API_URL}/users/${editingUser.id}`,
          {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            ...(formData.password && { password: formData.password })
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Uživatel byl úspěšně upraven');
      } else {
        // Vytvořit nového uživatele
        await axios.post(
          `${API_URL}/users`,
          {
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Uživatel byl úspěšně vytvořen');
      }
      
      handleCloseModal();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Chyba při ukládání uživatele');
    }
  };

  const handleToggleActive = async (userId: number, active: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/users/${userId}/toggle-active`,
        { active: !active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Toggle response:', response.data);
      loadUsers();
    } catch (error: any) {
      console.error('Toggle error:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Chyba při změně stavu uživatele');
    }
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: 'Administrátor',
      manager: 'Manažer',
      foreman: 'Stavbyvedoucí',
      worker: 'Dělník'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="glass-card inline-flex items-center gap-3 px-6 py-4 animate-pulse">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Načítám uživatele...</span>
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
          Nový uživatel
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Jméno</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Telefon</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stav</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {getRoleName(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge-glass ${user.active ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'}`}>
                    {user.active ? '✓ Aktivní' : '○ Neaktivní'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    ✏️ Upravit
                  </button>
                  <button
                    onClick={() => handleToggleActive(user.id, user.active)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                  >
                    {user.active ? '⊘ Deaktivovat' : '✓ Aktivovat'}
                  </button>
                </td>
              </tr>
            ))}
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
                    {editingUser ? '✏️ Upravit uživatele' : '➕ Nový uživatel'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="input-glass"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heslo {!editingUser && <span className="text-red-500">*</span>}
                        {editingUser && <span className="text-gray-500 text-xs">(nechte prázdné pro zachování)</span>}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        className="input-glass"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jméno <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="input-glass"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Příjmení <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="input-glass"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        className="input-glass"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="input-glass"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="worker">Dělník</option>
                        <option value="foreman">Stavbyvedoucí</option>
                        <option value="manager">Manažer</option>
                        <option value="admin">Administrátor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                  >
                    {editingUser ? '💾 Uložit' : '➕ Vytvořit'}
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

export default UsersManagement;
