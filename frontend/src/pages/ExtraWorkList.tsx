import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService } from '../services';
import { ExtraWork } from '../types';
import { useTranslation } from 'react-i18next';
import { translationService } from '../services/translationService';

const ExtraWorkList: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [translatedExtraWorks, setTranslatedExtraWorks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{ id: number; name: string; custom_id: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string }>>([]);
  const canCreate = user?.role === 'worker';
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    authorId: '',
    search: ''
  });

  useEffect(() => {
    loadExtraWorks();
  }, [filters]);

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const loadExtraWorks = async () => {
    try {
      setLoading(true);
      const data = await extraWorkService.getAll();
      
      // Filtrování
      let filtered: ExtraWork[] = data as ExtraWork[];
      if (filters.status) {
        filtered = filtered.filter((ew: ExtraWork) => ew.status === filters.status);
      }
      if (filters.projectId) {
        filtered = filtered.filter((ew: ExtraWork) => ew.project_id === parseInt(filters.projectId));
      }
      if (filters.authorId) {
        filtered = filtered.filter((ew: ExtraWork) => ew.created_by === parseInt(filters.authorId));
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((ew: ExtraWork) => 
          ew.description?.toLowerCase().includes(searchLower) ||
          ew.custom_id?.toLowerCase().includes(searchLower)
        );
      }
      
      // Automaticky přeložit názvy a popisy
      const translated = await Promise.all(
        filtered.map(async (work: ExtraWork) => ({
          ...work,
          name: await translationService.autoTranslateToCzech(work.name),
          description: await translationService.autoTranslateToCzech(work.description),
          project_name: await translationService.autoTranslateToCzech(work.project_name)
        }))
      );
      setTranslatedExtraWorks(translated);
    } catch (error) {
      console.error('Chyba při načítání víceprací:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    return t(`extraWork.statuses.${status}`, status);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('dashboard.withoutDate');
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="glass-card inline-flex items-center gap-3 px-6 py-4 animate-pulse">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{t('common.loading')}...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-slide-up">
            {t('extraWork.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('shifts.total')}: <span className="font-bold text-primary-600">{translatedExtraWorks.length}</span>
          </p>
        </div>
        <div className="mt-4 sm:mt-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            to={canCreate ? '/extra-work/new' : '#'}
            className={canCreate ? 'btn-primary inline-flex items-center gap-2' : 'inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-xl font-medium cursor-not-allowed opacity-50'}
            aria-disabled={!canCreate}
            onClick={(e) => {
              if (!canCreate) {
                e.preventDefault();
                alert('Novou vícepráci může založit pouze uživatel s rolí Dělník.');
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('dashboard.newExtraWork')}
          </Link>
        </div>
      </div>

      {/* Filtry */}
      <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.search')}
            </label>
            <input
              type="text"
              id="search"
              placeholder={`${t('extraWork.description')} nebo ${t('extraWork.customId')}...`}
              className="input-glass"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('extraWork.status')}
            </label>
            <select
              id="status"
              className="input-glass"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">{t('common.all')}</option>
              <option value="draft">{t('extraWork.statuses.draft')}</option>
              <option value="submitted_to_foreman">{t('extraWork.statuses.submitted_to_foreman')}</option>
              <option value="returned_to_worker">{t('extraWork.statuses.returned_to_worker')}</option>
              <option value="submitted_to_manager">{t('extraWork.statuses.submitted_to_manager')}</option>
              <option value="returned_to_foreman">{t('extraWork.statuses.returned_to_foreman')}</option>
              <option value="approved">{t('extraWork.statuses.approved')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('shifts.project')}
            </label>
            <select
              id="projectId"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
            <label htmlFor="authorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('extraWork.author')}
            </label>
            <select
              id="authorId"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.authorId}
              onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}
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
              onClick={() => setFilters({ status: '', projectId: '', authorId: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {t('shifts.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabulka */}
      <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
        {translatedExtraWorks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('extraWork.noWork')}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {user?.role === 'worker' ? t('extraWork.createFirst') : t('extraWork.noneFound')}
            </p>
            {user?.role === 'worker' && (
              <div className="mt-6">
                <Link
                  to="/extra-work/new"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('dashboard.newExtraWork')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
              <tr className="border-b border-white/10 dark:border-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('extraWork.customId')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('extraWork.name')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('shifts.project')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('shifts.date')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('extraWork.status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('extraWork.createdBy')}
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">{t('dashboard.view')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 dark:divide-gray-700/30">
              {translatedExtraWorks.map((extraWork, index) => (
                <tr key={extraWork.id} className="group hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{extraWork.custom_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white">{extraWork.name || extraWork.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">{extraWork.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(extraWork.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge-glass">
                      {getStatusText(extraWork.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {extraWork.created_by_first_name && extraWork.created_by_last_name 
                      ? `${extraWork.created_by_first_name} ${extraWork.created_by_last_name}`
                      : 'Neznámý'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/extra-work/${extraWork.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-end gap-1 group-hover:gap-2 transition-all"
                    >
                      Zobrazit
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraWorkList;
