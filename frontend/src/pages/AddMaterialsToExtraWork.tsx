import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

interface Material {
  id: number;
  name: string;
  unit: string;
  unit_price: number;
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
    loadMaterials();
    loadExtraWork();
  }, [id]);

  const loadMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/materials`, {
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
      alert('Vyplňte všechna pole materiálů');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/extra-work/${id}/materials`,
        { materials: selectedMaterials },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Materiály byly úspěšně přidány');
      navigate(`/extra-work/${id}`);
    } catch (error: any) {
      console.error('Chyba při přidávání materiálů:', error);
      alert(error.response?.data?.error || 'Chyba při přidávání materiálů');
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
        <Link to={`/extra-work/${id}`} className="text-primary hover:text-primary-dark text-sm font-medium">
          ← Zpět na detail vícepráce
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Přidat materiály</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vícepráce: {extraWork.custom_id} - {extraWork.name}
          </p>
        </div>

        {extraWork.material_description_text && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popis materiálů od dělníka:</h3>
            <p className="text-sm text-gray-900 whitespace-pre-line">{extraWork.material_description_text}</p>
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
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-light hover:bg-primary-light-dark"
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Přidat materiál
                </button>
              </div>

              {selectedMaterials.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Zatím nebyly přidány žádné materiály</p>
              ) : (
                <div className="space-y-3">
                  {selectedMaterials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={material.materialId}
                        onChange={(e) => updateMaterial(index, 'materialId', parseInt(e.target.value))}
                        required
                      >
                        <option value="">Vyberte materiál</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit}) - {m.unit_price} Kč/{m.unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Množství"
                        className="w-32 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={material.quantity || ''}
                        onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="p-2 text-red-600 hover:text-red-800"
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

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Link
                to={`/extra-work/${id}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700"
              >
                Zrušit
              </Link>
              <button
                type="submit"
                disabled={loading || selectedMaterials.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Ukládám...' : 'Uložit materiály'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialsToExtraWork;
