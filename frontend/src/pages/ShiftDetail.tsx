import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import ShiftTasks from '../components/ShiftTasks';
import { translationService } from '../services/translationService';

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

      const response = await api.post(`/shifts/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('shifts.shiftDetail')}</h1>
        <div className="flex items-center space-x-3">
          {(userRole === 'manager' || userRole === 'foreman') && (
            <button
              onClick={() => navigate(`/shifts/${id}/edit`)}
              className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50"
            >
              ✏️ Upravit
            </button>
          )}
          <button
            onClick={() => navigate('/shifts')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Zpět na seznam
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Shift Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Datum</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{formatDate(shift.date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Čas</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Projekt</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{shift.project_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Trvání</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {parseFloat(String(shift.duration_hours)).toFixed(1)} hodin
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Pracovníci</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{shift.worker_names || '—'}</p>
          </div>
          {shift.description && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                Popis
                <button
                  onClick={async () => {
                    const isUkr = await translationService.isUkrainian(shift.description || '');
                    if (isUkr) handleTranslate(shift.description || '');
                  }}
                  disabled={translating.description}
                  className="text-xs text-primary hover:text-primary-dark disabled:opacity-50"
                >
                  {translating.description ? 'Překládám...' : 'Přeložit'}
                </button>
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">{shift.description}</p>
              {translations.description && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Překlad:</p>
                  <p className="text-sm text-blue-900 dark:text-blue-200">{translations.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fotodokumentace</h2>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
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
            <svg
              className="h-12 w-12 text-gray-400"
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
            <span className="mt-2 text-sm text-gray-600">
              Klikněte pro výběr fotografií nebo je sem přetáhněte
            </span>
          </label>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Vybrané soubory ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {selectedFiles[index].name}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {uploading ? 'Nahrávám...' : 'Nahrát fotografie'}
            </button>
          </div>
        )}

        {/* Uploaded Photos */}
        {photos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Nahrané fotografie ({photos.length})
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  <img
                    src={`http://localhost:3001${photo.file_path}`}
                    alt="Shift photo"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(photo.created_at).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 && selectedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Zatím nejsou nahrány žádné fotografie.
          </div>
        )}
      </div>

      {/* Shift Tasks */}
      {shift && <ShiftTasks shiftId={shift.id} />}
    </div>
  );
};

export default ShiftDetail;
