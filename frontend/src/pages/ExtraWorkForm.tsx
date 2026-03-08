import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extraWorkService, projectService } from '../services';

interface Project {
  id: number;
  name: string;
  custom_id: string;
}

const ExtraWorkForm: React.FC = () => {
  const navigate = useNavigate();
  // Auth context available if needed later
  useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    materialText: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...filesArray]);
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.name || !formData.description) {
      alert('Vyplňte prosím všechna povinná pole (Projekt, Název, Popis)');
      console.log('Validace selhala:', { projectId: formData.projectId, name: formData.name, description: formData.description });
      return;
    }
    try {
      setLoading(true);
      const data = new FormData();
      data.append('project_id', formData.projectId);
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.startDatetime) data.append('start_datetime', formData.startDatetime);
      if (formData.endDatetime) data.append('end_datetime', formData.endDatetime);
      if (formData.materialText) data.append('material_description_text', formData.materialText);
      photos.forEach(photo => data.append('photos', photo));

      const response = await extraWorkService.create(data);
      alert('Vícepráce byla úspěšně vytvořena');
      navigate(`/extra-work/${response.id}`);
    } catch (error: any) {
      console.error('Chyba při vytváření vícepráce:', error);
      alert(error.response?.data?.message || 'Chyba při vytváření vícepráce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Nová vícepráce</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Vytvořte novou vícepráci a přidejte fotografie a materiály
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="px-6 py-5 space-y-6">
          {/* Projekt */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Projekt <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              required
              className="input-glass"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Vyberte projekt</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.custom_id} - {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Název vícepráce */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Název vícepráce <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              className="input-glass"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Např. Dodatečné základy pro přístavbu"
            />
          </div>

          {/* Popis */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Popis práce <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="input-glass"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Popište provedenou vícepráci..."
            />
          </div>

          {/* Datum a čas práce */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDatetime" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Začátek práce
              </label>
              <input
                type="datetime-local"
                id="startDatetime"
                className="input-glass"
                value={formData.startDatetime}
                onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="endDatetime" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Konec práce
              </label>
              <input
                type="datetime-local"
                id="endDatetime"
                className="input-glass"
                value={formData.endDatetime}
                onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
              />
            </div>
          </div>

          {/* Fotografie */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              📷 Fotografie
            </label>
            <div className="mt-2">
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                📷 Přidat fotografie
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF do 10MB</p>
            </div>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square group glass-card p-2 animate-scale-in">
                    <img
                      src={preview}
                      alt={`Náhled ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materiály */}
          <div>
            <label htmlFor="materialText" className="block text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              📦 Použité materiály
            </label>
            <textarea
              id="materialText"
              rows={4}
              className="input-glass"
              value={formData.materialText}
              onChange={(e) => setFormData({ ...formData, materialText: e.target.value })}
              placeholder="Např. 10 pytlů cementu, 2 m³ písku, 50 cihel..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Vyplňte přibližný popis použitých materiálů. Přesný výběr materiálů provede stavbyvedoucí.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/extra-work')}
            className="btn-secondary"
          >
            ✕ Zrušit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Ukládám...
              </>
            ) : (
              <>
                💾 Uložit jako koncept
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExtraWorkForm;
