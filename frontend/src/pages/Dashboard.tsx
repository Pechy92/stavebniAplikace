import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService, projectService } from '../services';
import { ExtraWork } from '../types';
import { useTranslation } from 'react-i18next';
import { translationService } from '../services/translationService';

interface Project {
  id: number;
  name: string;
  custom_id: string;
  status: string;
  address?: string;
  start_date?: string;
  planned_end_date?: string;
  managers?: string | null;
  foremen?: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [translatedExtraWorks, setTranslatedExtraWorks] = useState<ExtraWork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await extraWorkService.getAll();
      const recentWorks = data.slice(0, 5);
      
      // Automaticky přeložit názvy a popisy
      const translated = await Promise.all(
        recentWorks.map(async (work: ExtraWork) => ({
          ...work,
          name: await translationService.autoTranslateToCzech(work.name),
          description: await translationService.autoTranslateToCzech(work.description),
          project_name: await translationService.autoTranslateToCzech(work.project_name)
        }))
      );
      setTranslatedExtraWorks(translated);

      // Pokud je manager, načti jeho projekty
      if (user?.role === 'manager') {
        try {
          const allProjects = await projectService.getAll();
          setProjects(allProjects || []);
        } catch (error) {
          console.error('Chyba při načítání projektů:', error);
        }
      }
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
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

  const getProjectStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'preparation': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'paused': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="px-4 sm:px-0 animate-slide-up">
      {/* Header with Glass Effect */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
          {t('dashboard.welcome')}, {user?.firstName} {user?.lastName}
        </h1>
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {t('dashboard.role')}: <span className="text-primary-600 dark:text-primary-400">{t(`dashboard.roles.${user?.role}`)}</span>
          </p>
        </div>
      </div>

      {/* Action Cards with Glassmorphism - Only for non-managers */}
      {user?.role !== 'manager' && (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {user?.role === 'worker' && (
          <Link
            to="/extra-work/new"
            className="group floating-card p-6"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('dashboard.newExtraWork')}
                </dt>
                <dd className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {t('dashboard.create')} →
                </dd>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/extra-work"
          className="group floating-card p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-5 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('dashboard.allExtraWork')}
              </dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t('dashboard.view')} →
              </dd>
            </div>
          </div>
        </Link>

        <Link
          to="/shifts"
          className="group floating-card p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('shifts.title')}
              </dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {t('dashboard.view')} →
              </dd>
            </div>
          </div>
        </Link>
      </div>
      )}

      {/* Manager Projects Section */}
      {user?.role === 'manager' && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Moje projekty
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full glass-card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Žádné projekty k dispozici</p>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}/overview`}
                className="group glass-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      {project.custom_id}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      {project.name}
                    </h3>
                  </div>
                  <span className={`badge-glass text-xs font-semibold px-3 py-1 whitespace-nowrap ml-2 ${getProjectStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {project.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
                    📍 {project.address}
                  </p>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <p className="line-clamp-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Manažer:</span>{' '}
                    {project.managers || 'Neobsazeno'}
                  </p>
                  <p className="line-clamp-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Stavbyvedoucí:</span>{' '}
                    {project.foremen || 'Neobsazeno'}
                  </p>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {project.start_date && (
                    <p>Zahájeno: {new Date(project.start_date).toLocaleDateString('cs-CZ')}</p>
                  )}
                  {project.planned_end_date && (
                    <p>Term: {new Date(project.planned_end_date).toLocaleDateString('cs-CZ')}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/50 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    Podrobný přehled →
                  </span>
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      )}

      {/* Recent Extra Work with Glass Card */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-primary-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
            {t('dashboard.recentExtraWork')}
          </h3>
        </div>
        <div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{t('dashboard.loading')}</p>
            </div>
          ) : translatedExtraWorks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3">{t('dashboard.noExtraWork')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10 dark:divide-gray-700/50">
              {translatedExtraWorks.map((extraWork, index) => (
                <li key={extraWork.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
                  <Link
                    to={`/extra-work/${extraWork.id}`}
                    className="block hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                          {extraWork.name}
                        </p>
                        <span className={`badge-glass ${getStatusColor(extraWork.status)}`}>
                          {getStatusText(extraWork.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {extraWork.project_name || t('dashboard.withoutProject')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {extraWork.created_at ? new Date(extraWork.created_at).toLocaleDateString('cs-CZ') : t('dashboard.withoutDate')}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
