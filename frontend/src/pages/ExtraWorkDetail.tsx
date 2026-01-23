import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService } from '../services';
import { ExtraWork } from '../types';

const ExtraWorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [extraWork, setExtraWork] = useState<ExtraWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadExtraWork();
  }, [id]);

  const loadExtraWork = async () => {
    if (!id) return;
    try {
      const data = await extraWorkService.getById(parseInt(id));
      setExtraWork(data);
    } catch (error) {
      console.error('Chyba při načítání vícepráce:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'forward') => {
    if (!extraWork) return;
    
    try {
      setActionLoading(true);
      
      if (action === 'submit') {
        await extraWorkService.submitToForeman(extraWork.id);
      } else if (action === 'approve') {
        // Manager approval
        await extraWorkService.approve(extraWork.id);
      } else if (action === 'forward') {
        // Foreman forwards to manager
        await extraWorkService.submitToManager(extraWork.id);
      }
      
      await loadExtraWork();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Chyba při provádění akce');
    } finally {
      setActionLoading(false);
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
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canSubmit = () => {
    return user?.role === 'worker' && extraWork?.status === 'draft';
  };

  const canApproveForeman = () => {
    return user?.role === 'foreman' && extraWork?.status === 'submitted_to_foreman';
  };

  const canApproveManager = () => {
    return user?.role === 'manager' && extraWork?.status === 'submitted_to_manager';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám vícepráci...</div>
      </div>
    );
  }

  if (!extraWork) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Vícepráce nenalezena</h3>
        <Link to="/extra-work" className="mt-4 text-primary hover:text-primary-dark">
          Zpět na seznam
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/extra-work" className="text-primary hover:text-primary-dark text-sm font-medium">
          ← Zpět na seznam
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{extraWork.custom_id}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Vytvořeno {formatDate(extraWork.created_at)}
              </p>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(extraWork.status)}`}>
              {getStatusText(extraWork.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {/* Základní informace */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Základní informace</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {extraWork.name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Název vícepráce</dt>
                  <dd className="mt-1 text-sm text-gray-900">{extraWork.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Popis</dt>
                <dd className="mt-1 text-sm text-gray-900">{extraWork.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Projekt</dt>
                <dd className="mt-1 text-sm text-gray-900">{extraWork.project_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Vytvořil</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {extraWork.created_by_first_name} {extraWork.created_by_last_name}
                </dd>
              </div>
              {extraWork.duration_hours && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Doba trvání</dt>
                  <dd className="mt-1 text-sm text-gray-900">{extraWork.duration_hours} hodin</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Datum vytvoření</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(extraWork.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Fotografie */}
          {extraWork.photos && extraWork.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fotografie</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {extraWork.photos.map((photo: any, index: number) => (
                  <div key={photo.id || index} className="relative aspect-square group">
                    <img
                      src={`http://localhost:3001${photo.file_path}`}
                      alt={photo.file_name || `Fotografie ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(`http://localhost:3001${photo.file_path}`, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EObrazek nenalezen%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                      {photo.file_name || `Fotografie ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materiály - textový popis od dělníka */}
          {extraWork.material_description_text && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popis použitých materiálů (od dělníka)</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-line">{extraWork.material_description_text}</p>
              </div>
            </div>
          )}

          {/* Materiály - přesné přiřazení od stavbyvedoucího */}
          {extraWork.materials && extraWork.materials.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Přesné přiřazení materiálů (stavbyvedoucí)</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materiál</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Množství</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jednotka</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extraWork.materials.map((material: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{material.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{material.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{material.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Komentáře a historie */}
          {extraWork.comments && extraWork.comments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Komentáře a historie</h3>
              <div className="space-y-3">
                {extraWork.comments.map((comment: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Akce */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-4">
              {canSubmit() && (
                <div>
                  <button
                    onClick={() => handleAction('submit')}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {actionLoading ? 'Odesílám...' : 'Odeslat stavbyvedoucímu'}
                  </button>
                </div>
              )}

              {/* Přidání materiálů stavbyvedoucím */}
              {user?.role === 'foreman' && (extraWork.status === 'submitted_to_foreman' || extraWork.status === 'draft') && (
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    to={`/extra-work/${extraWork.id}/add-materials`}
                    className="inline-flex items-center px-4 py-2 border border-primary rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Přidat přesné materiály
                  </Link>
                </div>
              )}

              {(canApproveForeman() || canApproveManager()) && (
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => (user?.role === 'foreman' ? handleAction('forward') : handleAction('approve'))}
                      disabled={actionLoading}
                      className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {actionLoading ? 'Zpracovávám...' : user?.role === 'foreman' ? 'Postoupit manažerovi' : 'Schválit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraWorkDetail;
