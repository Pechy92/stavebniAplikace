import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config/api';

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

interface Task {
  id?: string;
  name: string;
  description: string;
  assigned_worker_id?: string;
  due_date: string;
}

const ShiftForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    name: '',
    description: '',
    assigned_worker_id: '',
    due_date: ''
  });
  const [formData, setFormData] = useState({
    projectId: '',
    userIds: [] as string[],
    date: '',
    startTime: '07:00',
    endTime: '15:00',
    workerInstructions: ''
  });

  useEffect(() => {
    loadProjects();
    loadUsers();
    if (isEditMode && id) {
      loadShiftData(parseInt(id));
    }
  }, [id]);

  const loadShiftData = async (shiftId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const shift = response.data;
      
      // Extract YYYY-MM-DD from ISO datetime
      const dateStr = shift.date.split('T')[0];
      
      // Extract worker IDs
      const workerIds = (shift.workers || []).map((w: any) => String(w.id));
      
      setFormData({
        projectId: String(shift.project_id),
        userIds: workerIds,
        date: dateStr,
        startTime: shift.start_time.substring(0, 5),
        endTime: shift.end_time.substring(0, 5),
        workerInstructions: shift.worker_instructions || ''
      });
    } catch (error) {
      console.error('Chyba při načítání dat směny:', error);
      alert('Nepodařilo se načíst data směny');
      navigate('/shifts');
    } finally {
      setLoadingData(false);
    }
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
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
      const response = await axios.get(`${API_URL}/users`, {
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

    if (!formData.projectId || formData.userIds.length === 0 || !formData.date || !formData.startTime || !formData.endTime) {
      alert(t('errors.fillAllFields'));
      return;
    }

    if (calculateDuration() <= 0) {
      alert(t('shifts.endAfterStart'));
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        project_id: parseInt(formData.projectId),
        user_ids: formData.userIds.map((id) => parseInt(id)),
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        worker_instructions: formData.workerInstructions,
        tasks: isEditMode 
          ? tasks.filter(t => !t.id || typeof t.id === 'string').map((t, index) => ({
              name: t.name,
              description: t.description,
              assigned_worker_id: t.assigned_worker_id ? parseInt(t.assigned_worker_id) : null,
              due_date: t.due_date,
              order_index: index
            }))
          : tasks.map((t, index) => ({
              name: t.name,
              description: t.description,
              assigned_worker_id: t.assigned_worker_id ? parseInt(t.assigned_worker_id) : null,
              due_date: t.due_date,
              order_index: index
            }))
      };

      console.log('📤 Odesílám směnu s úkoly:', payload);

      let shiftId = id;
      if (isEditMode && id) {
        await axios.put(
          `${API_URL}/shifts/${id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // V edit módu přidat úkoly samostatně (email se již neodesílá)
        if (tasks.length > 0 && shiftId) {
          for (const task of tasks) {
            if (!task.id) { // Přidat jen nové úkoly
              try {
                await axios.post(
                  `${API_URL}/shifts/${shiftId}/tasks`,
                  {
                    name: task.name,
                    description: task.description,
                    assigned_worker_id: task.assigned_worker_id ? parseInt(task.assigned_worker_id) : null,
                    due_date: task.due_date
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
              } catch (error) {
                console.error('Chyba při přidávání úkolu:', error);
              }
            }
          }
        }
        
        alert(t('shifts.shiftUpdated'));
      } else {
        const response = await axios.post(
          `${API_URL}/shifts`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        shiftId = String(response.data.id);
        alert(t('shifts.shiftCreated'));
      }

      navigate('/shifts');
    } catch (error: any) {
      console.error('Chyba:', error);
      alert(error.response?.data?.message || (isEditMode ? t('shifts.errorUpdating') : t('shifts.errorCreating')));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.name.trim()) {
      alert(t('shifts.taskName') + ' ' + t('errors.required'));
      return;
    }
    setTasks([...tasks, { ...newTask, id: String(Date.now()) }]);
    setNewTask({ name: '', description: '', assigned_worker_id: '', due_date: '' });
    setShowTaskForm(false);
  };

  const handleRemoveTask = (taskId: string | undefined) => {
    if (taskId) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  return (
    <div>
      <div className="mb-6 animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {isEditMode ? t('shifts.editShift') : t('shifts.newShift')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isEditMode ? t('shifts.editDescription') : t('shifts.createDescription')}
        </p>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center h-64">
          <div className="glass-card inline-flex items-center gap-3 px-6 py-4 animate-pulse">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">{t('shifts.loadingData')}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card max-w-3xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="px-6 py-5 space-y-6">
            {/* Projekt */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('shifts.project')} <span className="text-red-500">*</span>
              </label>
              <select
                id="project"
                required
                className="input-glass"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">{t('shifts.selectProject')}</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.custom_id} - {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pracovníci (více) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('shifts.workers')} <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({t('shifts.multipleSelection')})
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                {users.map(user => {
                  const checked = formData.userIds.includes(String(user.id));
                  return (
                    <label 
                      key={user.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        checked 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                        checked={checked}
                        onChange={(e) => {
                          const value = String(user.id);
                          setFormData(prev => ({
                            ...prev,
                            userIds: e.target.checked
                              ? [...prev.userIds, value]
                              : prev.userIds.filter(id => id !== value)
                          }));
                        }}
                      />
                      <span className={`text-sm font-medium ${checked ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {user.first_name} {user.last_name}
                        <span className="ml-1 text-xs opacity-75">({user.role})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {formData.userIds.length === 0 && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {t('shifts.selectWorkers')}
                </p>
              )}
              {formData.userIds.length > 0 && (
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {formData.userIds.length} {formData.userIds.length === 1 ? t('shifts.workerSelected') : t('shifts.workersSelected')}
                </p>
              )}
            </div>

            {/* Datum */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('shifts.date')} <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                type="date"
                required
                className="input-glass"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* Časy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('shifts.startTime')} <span className="text-red-500">*</span>
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
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('shifts.endTime')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="endTime"
                  type="time"
                  required
                  className="input-glass"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Zobrazení délky směny */}
            {formData.startTime && formData.endTime && (
              <div className="glass-card p-4 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t('shifts.shiftDuration')}: <span className="font-bold text-blue-600">{calculateDuration().toFixed(1)} {t('shifts.hours')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instrukce pro pracovníky */}
            <div>
              <label htmlFor="workerInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instrukce pro pracovníky
              </label>
              <textarea
                id="workerInstructions"
                rows={4}
                className="input-glass"
                value={formData.workerInstructions}
                onChange={(e) => setFormData({ ...formData, workerInstructions: e.target.value })}
                placeholder="Důležité informace pro pracovníky na této směně..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Tyto instrukce uvidí pracovníci v emailu a na detailu směny
              </p>
            </div>

            {/* Úkoly */}
            <div className="border-t border-white/20 dark:border-gray-700/50 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {t('shifts.tasks')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('shifts.addTask')}
                </button>
              </div>

              {showTaskForm && (
                <div className="glass-card p-5 mb-4 space-y-4 animate-slide-up bg-gradient-to-br from-green-500/5 to-transparent">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('shifts.taskName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-glass"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      placeholder={t('shifts.taskName')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('shifts.taskDescription')}
                    </label>
                    <textarea
                      className="input-glass"
                      rows={2}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder={t('shifts.taskDescription')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('shifts.assignTo')}
                      </label>
                      <select
                        className="input-glass"
                        value={newTask.assigned_worker_id || ''}
                        onChange={(e) => setNewTask({ ...newTask, assigned_worker_id: e.target.value })}
                      >
                        <option value="">{t('shifts.noAssignment')}</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('shifts.dueDate')}
                      </label>
                      <input
                        type="datetime-local"
                        className="input-glass"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="btn-primary"
                    >
                      {t('common.add')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="btn-secondary"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {tasks.length > 0 && (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={task.id} className="glass-card p-4 flex items-start gap-3 hover:scale-[1.01] transition-transform animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{task.name}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {(task.assigned_worker_id || task.due_date) && (
                          <div className="mt-2 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {task.assigned_worker_id && (
                              <span>
                                {t('shifts.assignedTo')}: {users.find(u => u.id === parseInt(task.assigned_worker_id!))?.first_name} {users.find(u => u.id === parseInt(task.assigned_worker_id!))?.last_name}
                              </span>
                            )}
                            {task.due_date && (
                              <span>
                                {t('shifts.dueDate')}: {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.id)}
                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-all p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gradient-to-r from-primary-500/5 to-transparent border-t border-white/20 dark:border-gray-700/50 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/shifts')}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? t('shifts.updateShift') : t('shifts.createShift')}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShiftForm;
