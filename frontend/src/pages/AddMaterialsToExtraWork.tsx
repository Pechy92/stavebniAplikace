import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

interface Material {
  id: number;
  name: string;
  unit: string;
  project_id?: number | null;
}

interface SelectedMaterial {
  materialId: number;
  quantity: number;
}

const AddMaterialsToExtraWork: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [extraWork, setExtraWork] = useState<any>(null);

  useEffect(() => {
    loadExtraWork();
  }, [id]);

  // Načíst materiály po načtení vícepráce (potřebujeme project_id)
  useEffect(() => {
    if (extraWork?.project_id) {
      loadMaterials(extraWork.project_id);
    }
  }, [extraWork]);

  const loadMaterials = async (projectId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/materials`, {
        params: { projectId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Chyba při načítání materiálů:', error);
    }
  };

  const loadExtraWork = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/extra-work/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExtraWork(response.data);
    } catch (error) {
      console.error('Chyba při načítání vícepráce:', error);
    }
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: 0, quantity: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: 'materialId' | 'quantity', value: number) => {
    const updated = [...selectedMaterials];
    updated[index][field] = value;
    setSelectedMaterials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMaterials.length === 0) {
      alert('Přidejte alespoň jeden materiál');
      return;
    }

    const invalidMaterial = selectedMaterials.find(m => !m.materialId || m.quantity <= 0);
    if (invalidMaterial) {
      alert('Vyplňte všechna pole materiálů a zadejte platné množství');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('Odesílám materiály:', { materials: selectedMaterials });

      const response = await axios.post(
        `${API_URL}/extra-work/${id}/materials`,
        { materials: selectedMaterials },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Odpověď serveru:', response.data);
      alert('Materiály byly úspěšně přidány');
      navigate(`/extra-work/${id}`);
    } catch (error: any) {
      console.error('Chyba při přidávání materiálů:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Chyba při přidávání materiálů';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!extraWork) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Načítám vícepráci...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/extra-work/${id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center gap-2 transition-colors">
          ← Zpět na detail vícepráce
        </Link>
      </div>

      <div className="glass-card animate-slide-up">
        <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📦 Přidat materiály
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Vícepráce: <span className="font-semibold">{extraWork.custom_id}</span> - {extraWork.name}
          </p>
        </div>

        {extraWork.material_description_text && (
          <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              💬 Popis materiálů od dělníka:
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{extraWork.material_description_text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Přesné přiřazení materiálů
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="btn-secondary inline-flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  ➕ Přidat materiál
                </button>
              </div>

              {selectedMaterials.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Zatím nebyly přidány žádné materiály</p>
              ) : (
                <div className="space-y-3">
                  {selectedMaterials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-3 glass-card p-3 animate-scale-in">
                      <select
                        className="input-glass flex-1"
                        value={material.materialId}
                        onChange={(e) => updateMaterial(index, 'materialId', parseInt(e.target.value))}
                        required
                      >
                        <option value="">Vyberte materiál</option>
                        
                        {/* Globální materiály */}
                        {materials.filter(m => !m.project_id).length > 0 && (
                          <optgroup label="📦 Globální materiály">
                            {materials.filter(m => !m.project_id).map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {/* Projektové materiály */}
                        {materials.filter(m => m.project_id).length > 0 && (
                          <optgroup label="🏗️ Materiály projektu">
                            {materials.filter(m => m.project_id).map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Množství"
                        className="input-glass w-32"
                        value={material.quantity || ''}
                        onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                        title="Odstranit materiál"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 -mx-6 px-6 -mb-5 pb-5 mt-6">
              <Link
                to={`/extra-work/${id}`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                ✕ Zrušit
              </Link>
              <button
                type="submit"
                disabled={loading || selectedMaterials.length === 0}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ukládám...
                  </>
                ) : (
                  <>
                    💾 Uložit materiály
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialsToExtraWork;
