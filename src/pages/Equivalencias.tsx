import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RotateCcw, Link } from 'lucide-react';
import { equivalenciasApi } from '../services/api';
import type { Equivalencia } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Equivalencias: React.FC = () => {
  const [equivalencias, setEquivalencias] = useState<Equivalencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquivalencia, setEditingEquivalencia] = useState<Equivalencia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Equivalencia[]>([]);
  const [formData, setFormData] = useState({
    codigo_OEM_original: '',
    codigo_OEM_equivalente: '',
  });

  useEffect(() => {
    fetchEquivalencias();
  }, []);

  const fetchEquivalencias = async () => {
    try {
      const response = await equivalenciasApi.getAll();
      setEquivalencias(response.data.filter(equiv => !equiv.eliminado));
    } catch (error) {
      console.error('Error fetching equivalencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingEquivalencia) return;

  try {
    const payload = {
      ...editingEquivalencia, // trae todos los campos existentes
      codigo_OEM_original: formData.codigo_OEM_original,
      codigo_OEM_equivalente: formData.codigo_OEM_equivalente,
      eliminado: false
    };
    await equivalenciasApi.update(editingEquivalencia.id_equivalencia, payload);
    fetchEquivalencias();
    closeModal();
  } catch (error) {
    console.error('Error saving equivalencia:', error);
  }
};


const handleDelete = async (id: number) => {
  if (!window.confirm('¿Está seguro de eliminar esta equivalencia?')) return;

  try {
    const equiv = equivalencias.find(e => e.id_equivalencia === id);
    if (!equiv) return;

    await equivalenciasApi.update(id, { ...equiv, eliminado: true });
    fetchEquivalencias();
  } catch (error) {
    console.error('Error deleting equivalencia:', error);
  }
};


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await equivalenciasApi.searchByCode(searchTerm);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching equivalencias:', error);
      setSearchResults([]);
    }
  };

  const openModal = (equivalencia?: Equivalencia) => {
    if (equivalencia) {
      setEditingEquivalencia(equivalencia);
      setFormData({
        codigo_OEM_original: equivalencia.codigo_OEM_original || '',
        codigo_OEM_equivalente: equivalencia.codigo_OEM_equivalente || '',
      });
    } else {
      setEditingEquivalencia(null);
      setFormData({ codigo_OEM_original: '', codigo_OEM_equivalente: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEquivalencia(null);
  };

  const filteredEquivalencias = equivalencias.filter(equiv =>
    equiv.codigo_OEM_equivalente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equiv.codigo_OEM_original.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equivalencias OEM</h1>
          <p className="text-slate-600 mt-1">Sistema inteligente de códigos OEM equivalentes</p>
        </div>
        <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Equivalencia
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código OEM..."
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Button onClick={handleSearch} className="px-6">
          <RotateCcw className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-slate-900 mb-3">Equivalencias Encontradas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((equiv) => (
              <div key={equiv.id_equivalencia} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">ID: {equiv.id_equivalencia}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-slate-600">Original:</span>
                    <div className="font-mono text-slate-900 bg-white px-2 py-1 rounded border">{equiv.codigo_OEM_original}</div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Equivalente:</span>
                    <div className="font-mono text-slate-900 bg-white px-2 py-1 rounded border">{equiv.codigo_OEM_equivalente}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Equivalencias Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Todas las Equivalencias</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código OEM Original</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código OEM Equivalente</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredEquivalencias.map((equiv) => (
                <tr key={equiv.id_equivalencia} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{equiv.id_equivalencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded">{equiv.codigo_OEM_original}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-slate-900 bg-blue-100 px-2 py-1 rounded">{equiv.codigo_OEM_equivalente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => openModal(equiv)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(equiv.id_equivalencia)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEquivalencias.length === 0 && (
            <div className="text-center py-12">
              <RotateCcw className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-lg mb-2">No se encontraron equivalencias</div>
              <p className="text-slate-500">Agrega la primera equivalencia OEM</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEquivalencia ? 'Editar Equivalencia' : 'Nueva Equivalencia'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código OEM Original *</label>
            <input
              type="text"
              value={formData.codigo_OEM_original}
              onChange={(e) => setFormData({ ...formData, codigo_OEM_original: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: ABC123456"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código OEM Equivalente *</label>
            <input
              type="text"
              value={formData.codigo_OEM_equivalente}
              onChange={(e) => setFormData({ ...formData, codigo_OEM_equivalente: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: XYZ789012"
              required
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Previsualización</h4>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{formData.codigo_OEM_original || 'Original'}</span>
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{formData.codigo_OEM_equivalente || 'Equivalente'}</span>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal} type="button">Cancelar</Button>
            <Button type="submit">{editingEquivalencia ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equivalencias;
