import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService } from '../services';
import { translationService } from '../services/translationService';
import { generateExtraWorkPDF } from '../services/pdfService';
import { ExtraWork } from '../types';
import { API_BASE_URL } from '../config/api';
import api from '../services/api';

const ExtraWorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [extraWork, setExtraWork] = useState<ExtraWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnComment, setReturnComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [translations, setTranslations] = useState<{
    name?: string;
    description?: string;
    materialDescription?: string;
  }>({});
  const [translating, setTranslating] = useState<{
    name?: boolean;
    description?: boolean;
    materialDescription?: boolean;
  }>({});

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

  const handleTranslate = async (field: 'name' | 'description' | 'materialDescription', text: string) => {
    setTranslating({ ...translating, [field]: true });
    try {
      const translated = await translationService.translateToCzech(text);
      setTranslations({ ...translations, [field]: translated });
    } catch (error) {
      console.error('Chyba při překladu:', error);
      alert('Překlad se nezdařil');
    } finally {
      setTranslating({ ...translating, [field]: false });
    }
  };

  const handleDownloadPDF = async () => {
    if (!extraWork) return;
    try {
      await generateExtraWorkPDF(extraWork);
    } catch (error) {
      console.error('Chyba při generování PDF:', error);
      alert('Generování PDF se nezdařilo');
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'forward' | 'return') => {
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
      } else if (action === 'return') {
        // Return logic
        if (extraWork.status === 'submitted_to_foreman' && user?.role === 'foreman') {
          await extraWorkService.returnToWorker(extraWork.id, returnComment);
        } else if (extraWork.status === 'submitted_to_manager' && user?.role === 'manager') {
          await extraWorkService.returnToForeman(extraWork.id, returnComment);
        }
        setShowReturnModal(false);
        setReturnComment('');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles([...selectedFiles, ...files]);

    // Vytvořit preview adresy
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      alert('Prosím vyberte alespoň jednu fotografii');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      await api.post(`/extra-work/${id}/photos`, formData);

      // Znovu načíst vícepráci s novými fotkami
      await loadExtraWork();
      
      // Vyčistit výběr
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      alert('Fotografie byly úspěšně nahrány');
    } catch (error) {
      console.error('Chyba při nahrávání fotografií:', error);
      alert('Chyba při nahrávání fotografií');
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = () => {
    return user?.role === 'worker' && ['draft', 'returned_to_worker'].includes(extraWork?.status || '');
  };

  const canApproveForeman = () => {
    return user?.role === 'foreman' && ['submitted_to_foreman', 'returned_to_foreman'].includes(extraWork?.status || '');
  };

  const canApproveManager = () => {
    return user?.role === 'manager' && extraWork?.status === 'submitted_to_manager';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Načítám vícepráci...</div>
      </div>
    );
  }

  if (!extraWork) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vícepráce nenalezena</h3>
        <Link to="/extra-work" className="mt-4 text-primary hover:text-primary-dark">
          Zpět na seznam
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Hlavní obsah - levá strana */}
        <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/extra-work" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zpět na seznam
          </Link>
          {user?.role === 'manager' && (
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Stáhnout PDF
            </button>
          )}
        </div>

        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-primary-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{extraWork.custom_id}</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Vytvořeno {formatDate(extraWork.created_at)}
                </p>
              </div>
              <span className={`badge-glass ${getStatusColor(extraWork.status)}`}>
                {getStatusText(extraWork.status)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
          {/* Základní informace */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
              Základní informace
            </h3>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {extraWork.name && (
                <div className="glass-card p-4">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                    Název vícepráce
                    <button
                      onClick={() => handleTranslate('name', extraWork.name || '')}
                      disabled={translating.name}
                      className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 transition"
                    >
                      {translating.name ? 'Překládám...' : '🌐 Přeložit'}
                    </button>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {extraWork.name}
                    {translations.name && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Překlad:</span>
                        <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{translations.name}</p>
                      </div>
                    )}
                  </dd>
                </div>
              )}
              <div className="glass-card p-4">
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                  Popis
                  <button
                    onClick={() => handleTranslate('description', extraWork.description || '')}
                    disabled={translating.description}
                    className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 transition"
                  >
                    {translating.description ? 'Překládám...' : '🌐 Přeložit'}
                  </button>
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {extraWork.description}
                  {translations.description && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Překlad:</span>
                      <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{translations.description}</p>
                    </div>
                  )}
                </dd>
              </div>
              <div className="glass-card p-4">
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Projekt</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{extraWork.project_name}</dd>
              </div>
              <div className="glass-card p-4">
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vytvořil</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {extraWork.created_by_first_name} {extraWork.created_by_last_name}
                </dd>
              </div>
              {extraWork.duration_hours && (
                <div className="glass-card p-4">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Doba trvání</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{extraWork.duration_hours} hodin</dd>
                </div>
              )}
              <div className="glass-card p-4">
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Datum vytvoření</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(extraWork.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Fotografie */}
          {extraWork.photos && extraWork.photos.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                📷 Fotografie
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {extraWork.photos.map((photo: any, index: number) => {
                  const photoUrl = photo.file_path.startsWith('http') 
                    ? photo.file_path 
                    : `${API_BASE_URL}${photo.file_path}`;
                  
                  return (
                    <div key={photo.id || index} className="relative aspect-square group glass-card p-2 hover:scale-105 transition-transform duration-300">
                      <img
                        src={photoUrl}
                        alt={photo.file_name || `Fotografie ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl cursor-pointer"
                        onClick={() => window.open(photoUrl, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EObrazek nenalezen%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 right-2 glass-card p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white font-medium truncate">{photo.file_name || `Fotografie ${index + 1}`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nahrát fotografie - jen pro dělníka v konceptu nebo vrácené */}
          {canSubmit() && (
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                📷 {extraWork.photos && extraWork.photos.length > 0 ? 'Přidat další fotografie' : 'Nahrát fotografie'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer group">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    📷 Vybrat fotografie
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF do 10MB</p>
                </div>

                {previewUrls.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {previewUrls.map((preview, index) => (
                        <div key={index} className="relative aspect-square group glass-card p-2 animate-scale-in">
                          <img
                            src={preview}
                            alt={`Náhled ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleUploadPhotos}
                      disabled={uploading}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Nahrávám...
                        </>
                      ) : (
                        <>
                          ⬆️ Nahrát fotografie ({selectedFiles.length})
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Materiály - textový popis od dělníka */}
          {extraWork.material_description_text && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                Popis použitých materiálů (od dělníka)
                <button
                  onClick={() => handleTranslate('materialDescription', extraWork.material_description_text || '')}
                  disabled={translating.materialDescription}
                  className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 transition"
                >
                  {translating.materialDescription ? 'Překládám...' : '🌐 Přeložit'}
                </button>
              </h3>
              <div className="glass-card p-4">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{extraWork.material_description_text}</p>
                {translations.materialDescription && (
                  <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-700/50">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Překlad:</p>
                    <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-line">{translations.materialDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materiály - přesné přiřazení od stavbyvedoucího */}
          {extraWork.materials && extraWork.materials.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                Přesné přiřazení materiálů (stavbyvedoucí)
              </h3>
              <div className="glass-card overflow-hidden">
                <table className="min-w-full divide-y divide-white/10 dark:divide-gray-700/50">
                  <thead className="bg-gradient-to-r from-primary-500/10 to-transparent">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Materiál</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Množství</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Jednotka</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
                    {extraWork.materials.map((material: any, index: number) => (
                      <tr key={index} className="hover:bg-white/50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{material.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{material.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{material.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Akce */}
          <div className="border-t border-white/20 dark:border-gray-700/50 pt-6">
            <div className="flex flex-wrap gap-3">
            {canSubmit() && (
              <button
                onClick={() => handleAction('submit')}
                disabled={actionLoading}
                className="btn-primary disabled:opacity-50"
              >
                {actionLoading ? 'Odesílám...' : 'Odeslat stavbyvedoucímu'}
              </button>
            )}

            {/* Přidání materiálů stavbyvedoucím */}
            {user?.role === 'foreman' && (extraWork.status === 'submitted_to_foreman' || extraWork.status === 'draft') && (
              <Link
                to={`/extra-work/${extraWork.id}/add-materials`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Přidat přesné materiály
              </Link>
            )}

            {(canApproveForeman() || canApproveManager()) && (
              <>
                <button
                  onClick={() => (user?.role === 'foreman' ? handleAction('forward') : handleAction('approve'))}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {actionLoading ? 'Zpracovávám...' : user?.role === 'foreman' ? 'Postoupit manažerovi' : 'Schválit'}
                </button>
                <button
                  onClick={() => setShowReturnModal(true)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  Vrátit
                </button>
              </>
            )}
            </div>
          </div>
        </div>
        </div>
        </div>

    {/* Sidebar - Komentáře a historie (VPRAVO) */}
    <div className="w-full lg:w-96 flex-shrink-0">
      <div className="lg:sticky lg:top-6 glass-card overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Komentáře a historie
          </h3>
        </div>
        <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {extraWork.comments && extraWork.comments.length > 0 ? (
            <div className="space-y-3">
              {extraWork.comments.map((comment: any, index: number) => {
                const statusTranslations: Record<string, string> = {
                  'draft': 'Vytvořeno jako koncept',
                  'submitted_to_foreman': 'Odesláno stavbyvedoucímu',
                  'submitted_to_manager': 'Odesláno manažerovi',
                  'approved': 'Schváleno manažerem',
                  'returned_to_worker': 'Vráceno dělníkovi',
                  'returned_to_foreman': 'Vráceno stavbyvedoucímu',
                  'rejected': 'Zamítnuto'
                };
                
                const translatedComment = comment.status_to 
                  ? (statusTranslations[comment.status_to] || comment.status_to)
                  : comment.comment;
                
                return (
                  <div key={index} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.author_name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{translatedComment}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Zatím žádné komentáře</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>

    {/* Return Modal */}
    {showReturnModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card max-w-md w-full mx-4 animate-scale-in">
          <div className="px-6 py-4 bg-gradient-to-r from-red-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vrátit vícepráci</h3>
          </div>
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Důvod vrácení
            </label>
            <textarea
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              placeholder="Vysvětlete, proč vrací tuto vícepráci..."
              className="input-glass w-full h-32 resize-none"
            />
          </div>
          <div className="px-6 py-4 border-t border-white/20 dark:border-gray-700/50 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowReturnModal(false);
                setReturnComment('');
              }}
              className="btn-secondary"
            >
              Zrušit
            </button>
            <button
              onClick={() => handleAction('return')}
              disabled={actionLoading || !returnComment.trim()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              {actionLoading ? 'Vracím...' : 'Vrátit'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default ExtraWorkDetail;
