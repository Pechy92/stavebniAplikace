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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('shifts.tasks')}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
        >
          {t('shifts.addTask')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateTask} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('shifts.taskName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('shifts.taskName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('shifts.taskDescription')}
            </label>
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('shifts.taskDescription')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('shifts.dueDate')}
              </label>
              <input
                type="datetime-local"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.loading')}...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('shifts.noTasks')}</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                task.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleCompleteTask(task.id)}
                className="mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.status === 'completed'
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                >
                  {task.name}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                {(task.first_name || task.due_date) && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {task.first_name && (
                      <span>
                        {t('shifts.assignedTo')}: {task.first_name} {task.last_name}
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
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 p-1"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftTasks;
