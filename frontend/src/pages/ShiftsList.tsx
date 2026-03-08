import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config/api';

interface Shift {
  id: number;
  project_id: number;
  project_name: string;
  worker_names?: string;
  workers?: Array<{ id: number; first_name: string; last_name: string; role: string }>;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: string | number;
  created_at: string;
}

const ShiftsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{ id: number; name: string; custom_id: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string }>>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    projectId: '',
    userId: ''
  });

  useEffect(() => {
    loadShifts();
    loadProjects();
    loadUsers();
  }, []);

  const loadShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShifts(response.data);
    } catch (error) {
      console.error('Chyba při načítání směn:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const filteredShifts = shifts.filter(shift => {
    // Extract just the date part (YYYY-MM-DD) from ISO string
    const shiftDatePart = shift.date.split('T')[0];
    if (filters.dateFrom && shiftDatePart < filters.dateFrom) return false;
    if (filters.dateTo && shiftDatePart > filters.dateTo) return false;
    if (filters.projectId && shift.project_id !== parseInt(filters.projectId)) return false;
    if (filters.userId && !(shift.workers || []).some(w => w.id === parseInt(filters.userId))) return false;
    return true;
  });

  // Seskupit směny podle týdnů
  const groupByWeek = (shifts: Shift[]) => {
    const weeks: { [key: string]: Shift[] } = {};
    shifts.forEach(shift => {
      const dateStr = shift.date.split('T')[0]; // Extract YYYY-MM-DD
      const date = new Date(dateStr);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Pondělí
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(shift);
    });
    return weeks;
  };

  const weeklyShifts = groupByWeek(filteredShifts);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            {t('shifts.title')}
          </h1>
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('shifts.total')}: <span className="font-bold">{filteredShifts.length}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/shifts/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('shifts.newShift')}
          </Link>
        </div>
      </div>

      {/* Filtry */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtry</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('shifts.dateFrom')}
            </label>
            <input
              type="date"
              id="dateFrom"
              className="input-glass"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('shifts.dateTo')}
            </label>
            <input
              type="date"
              id="dateTo"
              className="input-glass"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('shifts.project')}
            </label>
            <select
              id="projectId"
              className="input-glass"
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            >
              <option value="">{t('common.allProjects')}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.custom_id} - {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('shifts.worker')}
            </label>
            <select
              id="userId"
              className="input-glass"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              <option value="">{t('common.allWorkers')}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ dateFrom: '', dateTo: '', projectId: '', userId: '' })}
              className="w-full btn-secondary"
            >
              {t('shifts.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Seznam směn seskupených po týdnech */}
      <div className="space-y-6">
        {Object.keys(weeklyShifts).length === 0 ? (
          <div className="glass-card p-12 text-center animate-scale-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
              <svg
                className="mx-auto h-12 w-12 text-blue-600 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{t('shifts.noShifts')}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('shifts.createFirst')}</p>
            <div className="mt-8">
              <Link
                to="/shifts/new"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('shifts.newShift')}
              </Link>
            </div>
          </div>
        ) : (
          Object.keys(weeklyShifts).sort().reverse().map(weekKey => {
            const weekShifts = weeklyShifts[weekKey];
            const totalHours = weekShifts.reduce((sum, shift) => sum + parseFloat(String(shift.duration_hours)), 0);
            const weekStart = new Date(weekKey);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            return (
              <div key={weekKey} className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: `${Object.keys(weeklyShifts).sort().reverse().indexOf(weekKey) * 50}ms` }}>
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      {t('shifts.week')} {formatDate(weekStart.toISOString())} - {formatDate(weekEnd.toISOString())}
                    </h3>
                    <span className="badge-glass">
                      {t('shifts.totalHours')}: <span className="font-bold">{totalHours.toFixed(1)}h</span>
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 dark:divide-gray-700/50">
                    <thead className="bg-gradient-to-r from-primary-500/10 to-transparent">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('shifts.date')}</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('shifts.workers')}</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('shifts.project')}</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('shifts.time')}</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('shifts.hours')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
                    {weekShifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200" onClick={() => navigate(`/shifts/${shift.id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(shift.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {shift.worker_names || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {shift.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {parseFloat(String(shift.duration_hours)).toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShiftsList;
