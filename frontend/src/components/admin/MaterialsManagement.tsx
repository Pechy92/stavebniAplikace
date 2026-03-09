import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Material {
  id: number;
  name: string;
  unit: string;
  description: string | null;
  unit_price: number | string | null;
  category: string | null;
  sku: string | null;
  project_id: number | null;
}

interface Project {
  id: number;
  name: string;
  custom_id: string;
}

const MaterialsManagement: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    description: '',
    unitPrice: '',
    category: '',
    sku: '',
    projectId: ''
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadProjects();
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [selectedProjectId]);

  const toArray = <T,>(value: any): T[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const formatUnitPrice = (value: number | string | null) => {
    if (value === null || value === undefined || value === '') return '-';
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '-';
    return `${numeric.toFixed(2)} Kč`;
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(toArray<Project>(response.data));
      setError(null);
    } catch (error: any) {
      console.error('Chyba při načítání projektů:', error);
      setError(`Chyba při načítání projektů: ${error.message}`);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const params = selectedProjectId ? { projectId: selectedProjectId } : {};
      const response = await axios.get(`${API_URL}/materials`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setMaterials(toArray<Material>(response.data));
    } catch (error: any) {
      console.error('Chyba při načítání materiálů:', error);
      setError(`Chyba při načítání materiálů: ${error.message}`);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        unit: material.unit || '',
        description: material.description || '',
        unitPrice: material.unit_price?.toString() || '',
        category: material.category || '',
        sku: material.sku || '',
        projectId: material.project_id?.toString() || ''
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        unit: '',
        description: '',
        unitPrice: '',
        category: '',
        sku: '',
        projectId: selectedProjectId
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        unit: formData.unit || null,
        description: formData.description || null,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
        category: formData.category || null,
        sku: formData.sku || null,
        projectId: formData.projectId ? parseInt(formData.projectId) : null
      };
      
      if (editingMaterial) {
        await axios.put(
          `${API_URL}/materials/${editingMaterial.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Materiál byl úspěšně upraven');
      } else {
        await axios.post(
          `${API_URL}/materials`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Materiál byl úspěšně vytvořen');
      }
      
      handleCloseModal();
      loadMaterials();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Chyba při ukládání materiálu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tento materiál?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Materiál byl úspěšně smazán');
      loadMaterials();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Chyba při mazání materiálu');
    }
  };

  const getProjectName = (projectId: number | null) => {
    if (!projectId) return '🌍 Globální';
    const project = projects.find(p => p.id === projectId);
    return project ? `📍 ${project.name}` : `ID: ${projectId}`;
  };

  if (loading && !materials.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="glass-card inline-flex items-center gap-3 px-6 py-4 animate-pulse">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Načítám materiály...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">❌ Chyba</h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadProjects();
            loadMaterials();
          }}
          className="btn-primary"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filtr podle stavby</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProjectId('')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedProjectId === '' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            🌍 Všechny materiály
          </button>
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id.toString())}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedProjectId === project.id.toString()
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📍 {project.custom_id || project.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedProjectId 
              ? `Materiály - ${getProjectName(parseInt(selectedProjectId))}`
              : '🌍 Všechny materiály'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {materials.length} materiálů
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nový materiál
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Název</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Jednotka</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cena/j.</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kategorie</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stavba</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-white/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {material.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {material.unit || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {formatUnitPrice(material.unit_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {material.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {material.sku || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {getProjectName(material.project_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenModal(material)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materials.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Žádné materiály k zobrazení</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-scale-in">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom glass-card text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                    {editingMaterial ? '✏️ Upravit materiál' : '➕ Nový materiál'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název materiálu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="input-glass"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stavba (projekt)
                      </label>
                      <select
                        className="input-glass"
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      >
                        <option value="">🌍 Globální materiál (dostupný všem)</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            📍 {project.custom_id || project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jednotka
                        </label>
                        <select
                          className="input-glass"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                          <option value="">Vyberte jednotku</option>
                          <option value="ks">ks (kusy)</option>
                          <option value="m">m (metry)</option>
                          <option value="m²">m² (metry čtvereční)</option>
                          <option value="m³">m³ (metry krychlové)</option>
                          <option value="kg">kg (kilogramy)</option>
                          <option value="t">t (tuny)</option>
                          <option value="l">l (litry)</option>
                          <option value="bal">bal (balení)</option>
                          <option value="pytl">pytl (pytle)</option>
                          <option value="kbelík">kbelík (kbelíky)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cena za jednotku (Kč)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input-glass"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategorie
                      </label>
                      <input
                        type="text"
                        className="input-glass"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="např. Cementy, Kamenivo, Zdivo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU (Kód materiálu)
                      </label>
                      <input
                        type="text"
                        className="input-glass font-mono"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="např. CEM-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Popis
                      </label>
                      <textarea
                        rows={3}
                        className="input-glass"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Podrobný popis materiálu..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                  >
                    {editingMaterial ? '💾 Uložit' : '➕ Vytvořit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    ✕ Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsManagement;
