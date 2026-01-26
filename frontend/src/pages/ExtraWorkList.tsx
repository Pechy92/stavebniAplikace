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
  const canCreate = user?.role === 'worker';
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    search: ''
  });

  useEffect(() => {
    loadExtraWorks();
  }, [filters]);

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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted_to_foreman': 'bg-blue-100 text-blue-800',
      'returned_to_worker': 'bg-yellow-100 text-yellow-800',
      'submitted_to_manager': 'bg-purple-100 text-purple-800',
      'returned_to_foreman': 'bg-orange-100 text-orange-800',
      'approved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('dashboard.withoutDate');
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('extraWork.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('shifts.total')}: {translatedExtraWorks.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to={canCreate ? '/extra-work/new' : '#'}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${canCreate ? 'bg-primary hover:bg-primary-dark focus:ring-primary' : 'bg-gray-400 cursor-not-allowed'}`}
            aria-disabled={!canCreate}
            onClick={(e) => {
              if (!canCreate) {
                e.preventDefault();
                alert('Novou vícepráci může založit pouze uživatel s rolí Dělník.');
              }
            }}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('dashboard.newExtraWork')}
          </Link>
        </div>
      </div>

      {/* Filtry */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.search')}
            </label>
            <input
              type="text"
              id="search"
              placeholder={`${t('extraWork.description')} nebo ${t('extraWork.customId')}...`}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              {t('extraWork.status')}
            </label>
            <select
              id="status"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">{t('common.filter')} - {t('extraWork.status')}</option>
              <option value="draft">{t('extraWork.statuses.draft')}</option>
              <option value="submitted_to_foreman">{t('extraWork.statuses.submitted_to_foreman')}</option>
              <option value="returned_to_worker">{t('extraWork.statuses.returned_to_worker')}</option>
              <option value="submitted_to_manager">{t('extraWork.statuses.submitted_to_manager')}</option>
              <option value="returned_to_foreman">{t('extraWork.statuses.returned_to_foreman')}</option>
              <option value="approved">{t('extraWork.statuses.approved')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', projectId: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700"
            >
              {t('shifts.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabulka */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {translatedExtraWorks.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('extraWork.noWork')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user?.role === 'worker' ? t('extraWork.createFirst') : t('extraWork.noneFound')}
            </p>
            {user?.role === 'worker' && (
              <div className="mt-6">
                <Link
                  to="/extra-work/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {t('dashboard.newExtraWork')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('extraWork.customId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('extraWork.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('shifts.project')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('shifts.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('extraWork.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('extraWork.createdBy')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('dashboard.view')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {translatedExtraWorks.map((extraWork) => (
                <tr key={extraWork.id} className="hover:bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {extraWork.custom_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="max-w-xs truncate">{extraWork.name || extraWork.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="max-w-xs truncate">{extraWork.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(extraWork.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(extraWork.status)}`}>
                      {getStatusText(extraWork.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {extraWork.created_by_first_name && extraWork.created_by_last_name 
                      ? `${extraWork.created_by_first_name} ${extraWork.created_by_last_name}`
                      : 'Neznámý'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/extra-work/${extraWork.id}`}
                      className="text-primary hover:text-primary-dark"
                    >
                      Zobrazit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExtraWorkList;
