import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import ShiftTasks from '../components/ShiftTasks';
import { translationService } from '../services/translationService';
import { API_BASE_URL } from '../config/api';

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
  description?: string;
  worker_instructions?: string;
  status?: string;
  created_at: string;
}

interface Photo {
  id: number;
  shift_id: number;
  file_path: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  created_at: string;
}

const ShiftDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [shift, setShift] = useState<Shift | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [translations, setTranslations] = useState<{ description?: string }>({});
  const [translating, setTranslating] = useState<{ description?: boolean }>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadShiftDetail();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Chyba při načítání profilu:', error);
    }
  };

  const loadShiftDetail = async () => {
    try {
      const response = await api.get(`/shifts/${id}`);
      setShift(response.data);

      // Načíst fotografie pro tuto směnu
      const photosResponse = await api.get(`/shifts/${id}/photos`);
      setPhotos(photosResponse.data || []);
    } catch (error) {
      console.error('Chyba při načítání detailu směny:', error);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (text: string) => {
    setTranslating({ description: true });
    try {
      const translated = await translationService.translateToCzech(text);
      setTranslations({ description: translated });
    } catch (error) {
      console.error('Chyba při překladu:', error);
      alert('Překlad se nezdařil');
    } finally {
      setTranslating({ description: false });
    }
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError(t('errors.fillAllFields'));
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await api.post(`/shifts/${id}/photos`, formData);

      // Přidat nové fotografie do seznamu
      setPhotos([...photos, ...response.data.photos]);
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Chyba při nahrávání fotografií:', error);
      setError(t('errors.serverError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Opravdu chcete smazat tuto fotografii?')) return;

    try {
      await api.delete(`/shifts/${id}/photos/${photoId}`);
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Chyba při mazání fotografie:', error);
      setError(t('errors.serverError'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('shifts.loadingShift') || 'Načítám detail směny...'}</div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-900 font-medium">{t('shifts.shiftNotFound')}</h3>
        <button
          onClick={() => navigate('/shifts')}
          className="mt-4 text-red-700 hover:text-red-900 font-medium"
        >
          {t('shifts.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content - LEFT SIDE */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t('shifts.shiftDetail')}
          </h1>
          <div className="flex items-center space-x-3">
            {(userRole === 'manager' || userRole === 'foreman') && (
              <button
                onClick={() => navigate(`/shifts/${id}/edit`)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Upravit
              </button>
            )}
            <button
              onClick={() => navigate('/shifts')}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zpět na seznam
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Shift Info */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              Základní informace
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Datum</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(shift.date)}</p>
            </div>
            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Čas</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </p>
            </div>
            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Projekt</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{shift.project_name}</p>
            </div>
            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Trvání</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(String(shift.duration_hours)).toFixed(1)} hodin
              </p>
            </div>
            <div className="sm:col-span-2 glass-card p-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pracovníci</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{shift.worker_names || '—'}</p>
            </div>
            {shift.description && (
              <div className="sm:col-span-2 glass-card p-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                  Popis
                  <button
                    onClick={() => {
                      console.log('🔘 Translate shift description button clicked');
                      handleTranslate(shift.description || '');
                    }}
                    disabled={translating.description}
                    className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 transition"
                  >
                    {translating.description ? 'Překládám...' : '🌐 Přeložit'}
                  </button>
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{shift.description}</p>
                {translations.description && (
                  <div className="mt-3 p-3 glass-card bg-blue-500/10">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Překlad:</p>
                    <p className="text-sm text-blue-900 dark:text-blue-200">{translations.description}</p>
                  </div>
                )}
              </div>
            )}
            {shift.worker_instructions && (
              <div className="sm:col-span-2 glass-card p-4 bg-yellow-500/10 border-l-4 border-yellow-500">
                <label className="block text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instrukce pro pracovníky
                </label>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{shift.worker_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              Fotodokumentace
            </h2>
          </div>
          <div className="p-6">

            {/* File Upload */}
            <div className="glass-card border-2 border-dashed border-primary-300 dark:border-primary-600 p-6 mb-6 hover:border-primary-500 transition">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
                  <svg
                    className="h-12 w-12 text-purple-600 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Klikněte pro výběr fotografií nebo je sem přetáhněte
                </span>
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                  Vybrané soubory ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative glass-card p-2 group hover:scale-105 transition-transform duration-300">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 hover:scale-110 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold shadow-lg transition"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                        {selectedFiles[index].name}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-4 w-full btn-primary disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Nahrávám...
                    </span>
                  ) : 'Nahrát fotografie'}
                </button>
              </div>
            )}

            {/* Uploaded Photos */}
            {photos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  Nahrané fotografie ({photos.length})
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {photos.map((photo) => {
                    // Pokud je file_path Cloudinary URL (začíná http), použij ji přímo
                    const photoUrl = photo.file_path.startsWith('http') 
                      ? photo.file_path 
                      : `${API_BASE_URL}${photo.file_path}`;
                    
                    return (
                      <div key={photo.id} className="relative glass-card p-2 group hover:scale-105 transition-transform duration-300">
                        <img
                          src={photoUrl}
                          alt="Shift photo"
                          className="w-full h-24 object-cover rounded-lg cursor-pointer"
                          onClick={() => window.open(photoUrl, '_blank')}
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 hover:scale-110 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold shadow-lg transition opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {new Date(photo.created_at).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {photos.length === 0 && selectedFiles.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Zatím nejsou nahrány žádné fotografie.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* End main content */}

      {/* Sidebar - Úkoly a aktivita (VPRAVO) */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="lg:sticky lg:top-6">
          {shift && <ShiftTasks shiftId={shift.id} />}
        </div>
      </div>
    </div>
  );
};

export default ShiftDetail;
