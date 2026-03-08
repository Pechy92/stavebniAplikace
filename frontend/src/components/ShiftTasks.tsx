import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shiftTaskService, ShiftTask } from '../services/shiftTaskService';

interface ShiftTasksProps {
  shiftId: number;
}

const ShiftTasks: React.FC<ShiftTasksProps> = ({ shiftId }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<ShiftTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_worker_id: '',
    due_date: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, [shiftId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await shiftTaskService.getAll(shiftId);
      setTasks(data || []);
      setError('');
    } catch (err) {
      console.error('Chyba při načítání úkolů:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t('shifts.taskName') + ' ' + t('errors.required'));
      return;
    }

    try {
      await shiftTaskService.create(shiftId, {
        name: formData.name,
        description: formData.description,
        assigned_worker_id: formData.assigned_worker_id ? parseInt(formData.assigned_worker_id) : undefined,
        due_date: formData.due_date
      });

      setFormData({ name: '', description: '', assigned_worker_id: '', due_date: '' });
      setShowForm(false);
      setError('');
      loadTasks();
    } catch (err) {
      setError(t('errors.serverError'));
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await shiftTaskService.complete(shiftId, taskId);
      loadTasks();
    } catch (err) {
      setError(t('errors.serverError'));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm(t('common.confirm') + '?')) return;

    try {
      await shiftTaskService.delete(shiftId, taskId);
      loadTasks();
    } catch (err) {
      setError(t('errors.serverError'));
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-green-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t('shifts.tasks')}
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-transform shadow-md"
          >
            {showForm ? '×' : '+'}
          </button>
        </div>
      </div>
      <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">

        {error && (
          <div className="mb-4 glass-card p-4 border-l-4 border-red-500 bg-red-500/10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateTask} className="glass-card p-4 mb-4 space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('shifts.taskName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input-glass"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('shifts.taskName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('shifts.taskDescription')}
              </label>
              <textarea
                className="input-glass"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('shifts.taskDescription')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('shifts.dueDate')}
              </label>
              <input
                type="datetime-local"
                className="input-glass"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-md"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('shifts.noTasks')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`glass-card p-4 animate-slide-up ${
                  task.status === 'completed'
                    ? 'bg-green-500/10 border-l-4 border-green-500'
                    : 'hover:scale-[1.02] transition-transform'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleCompleteTask(task.id)}
                    className="mt-1 w-5 h-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        task.status === 'completed'
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {task.name}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    )}
                    {(task.first_name || task.due_date) && (
                      <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {task.first_name && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {task.first_name} {task.last_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:scale-110 transition p-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
      </div>
    </div>
  );
};

export default ShiftTasks;
