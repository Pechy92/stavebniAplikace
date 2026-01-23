import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService } from '../services';
import { ExtraWork } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExtraWorks();
  }, []);

  const loadExtraWorks = async () => {
    try {
      const data = await extraWorkService.getAll();
      setExtraWorks(data.slice(0, 5));
    } catch (error) {
      console.error('Chyba při načítání víceprací:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      'draft': 'Koncept',
      'submitted_to_foreman': 'U stavbyvedoucího',
      'returned_to_worker': 'Vráceno k dopracování',
      'submitted_to_manager': 'U manažera',
      'returned_to_foreman': 'Vráceno stavbyvedoucímu',
      'approved': 'Schváleno'
    };
    return statusTexts[status] || status;
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

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Vítejte, {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-gray-600">
          Role: {user?.role === 'admin' ? 'Administrátor' : user?.role === 'manager' ? 'Manažer' : user?.role === 'foreman' ? 'Stavbyvedoucí' : 'Dělník'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {user?.role === 'worker' && (
          <Link
            to="/extra-work/new"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Nová vícepráce
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Vytvořit
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/extra-work"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Všechny vícepráce
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Zobrazit
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/shifts"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Směny
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Zobrazit
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Poslední vícepráce
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="p-4 text-center">Načítání...</div>
          ) : extraWorks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Žádné vícepráce</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {extraWorks.map((extraWork) => (
                <li key={extraWork.id}>
                  <Link
                    to={`/extra-work/${extraWork.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary truncate">
                          {extraWork.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(extraWork.status)}`}>
                            {getStatusText(extraWork.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {extraWork.project_name || 'Bez projektu'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {extraWork.created_at ? new Date(extraWork.created_at).toLocaleDateString('cs-CZ') : 'Bez data'}
                          </p>
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
