import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService } from '../services';
import { ExtraWork } from '../types';

const ExtraWorkList: React.FC = () => {
  const { user } = useAuth();
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      setExtraWorks(filtered);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bez data';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám vícepráce...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vícepráce</h1>
          <p className="mt-1 text-sm text-gray-500">
            Celkem {extraWorks.length} {extraWorks.length === 1 ? 'vícepráce' : extraWorks.length < 5 ? 'vícepráce' : 'víceprací'}
          </p>
        </div>
        {user?.role === 'worker' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/extra-work/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nová vícepráce
            </Link>
          </div>
        )}
      </div>

      {/* Filtry */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Hledat
            </label>
            <input
              type="text"
              id="search"
              placeholder="Popis nebo číslo..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Stav
            </label>
            <select
              id="status"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Všechny stavy</option>
              <option value="draft">Koncept</option>
              <option value="submitted_to_foreman">U stavbyvedoucího</option>
              <option value="returned_to_worker">Vráceno k dopracování</option>
              <option value="submitted_to_manager">U manažera</option>
              <option value="returned_to_foreman">Vráceno stavbyvedoucímu</option>
              <option value="approved">Schváleno</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', projectId: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Vymazat filtry
            </button>
          </div>
        </div>
      </div>

      {/* Tabulka */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {extraWorks.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné vícepráce</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'worker' ? 'Začněte vytvořením nové vícepráce.' : 'Žádné vícepráce nebyly nalezeny.'}
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
                  Nová vícepráce
                </Link>
              </div>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Číslo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projekt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vytvořil
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Zobrazit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extraWorks.map((extraWork) => (
                <tr key={extraWork.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {extraWork.custom_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{extraWork.name || extraWork.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{extraWork.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(extraWork.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(extraWork.status)}`}>
                      {getStatusText(extraWork.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
