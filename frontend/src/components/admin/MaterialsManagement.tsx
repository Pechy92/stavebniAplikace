import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Material {
  id: number;
  name: string;
  unit: string;
  description: string | null;
}

const MaterialsManagement: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    description: ''
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Chyba při načítání materiálů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        unit: material.unit,
        description: material.description || ''
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        unit: '',
        description: ''
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
      
      if (editingMaterial) {
        await axios.put(
          `http://localhost:3001/api/materials/${editingMaterial.id}`,
          {
            name: formData.name,
            unit: formData.unit,
            description: formData.description || null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Materiál byl úspěšně upraven');
      } else {
        await axios.post(
          'http://localhost:3001/api/materials',
          {
            name: formData.name,
            unit: formData.unit,
            description: formData.description || null
          },
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
      await axios.delete(`http://localhost:3001/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Materiál byl úspěšně smazán');
      loadMaterials();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Chyba při mazání materiálu');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Načítám materiály...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nový materiál
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jednotka</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popis</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {material.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.unit || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {material.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenModal(material)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingMaterial ? 'Upravit materiál' : 'Nový materiál'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název materiálu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jednotka <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                        Popis
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingMaterial ? 'Uložit' : 'Vytvořit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Zrušit
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
