import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Eye } from 'lucide-react';
import { repuestosApi, proveedoresApi, equivalenciasApi } from '../services/api';
import type { Repuesto, Proveedor, Equivalencia } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Repuestos: React.FC = () => {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [equivalencias, setEquivalencias] = useState<Equivalencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);
  const [viewingRepuesto, setViewingRepuesto] = useState<Repuesto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    marca_auto: '',
    modelo_auto: '',
    codigo_OEM_original: '',
    marca_OEM: '',
    anio: new Date().getFullYear(),
    motor: '',
    id_proveedor: 0,
    id_equivalencia: 0,
    precio: 0,
    imagen_url: '',
    texto: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repuestosRes, proveedoresRes, equivalenciasRes] = await Promise.all([
        repuestosApi.getAll(),
        proveedoresApi.getAll(),
        equivalenciasApi.getAll(),
      ]);

      setRepuestos(repuestosRes.data.filter(r => !r.eliminado));
      setProveedores(proveedoresRes.data.filter(p => !p.eliminado));
      setEquivalencias(equivalenciasRes.data.filter(e => !e.eliminado));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar los datos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (event: React.FormEvent) => {

  event.preventDefault();

  // Validación: proveedor obligatorio, equivalencia opcional
  if (!formData.id_proveedor || Number(formData.id_proveedor) === 0) {
    alert('Debe seleccionar un proveedor.');
    return;
  }


  // Equivalencia: enviar null si no se selecciona ninguna
  const equivalenciaValue = formData.id_equivalencia && Number(formData.id_equivalencia) !== 0
    ? Number(formData.id_equivalencia)
    : null;


  // Si estamos editando, realizar actualización
  if (editingRepuesto) {
    // Equivalencia: enviar null si no se selecciona ninguna
    const equivalenciaValue = formData.id_equivalencia && Number(formData.id_equivalencia) !== 0
      ? Number(formData.id_equivalencia)
      : null;

    const payload = {
      id_repuesto: editingRepuesto.id_repuesto,
      marca_auto: formData.marca_auto.trim(),
      modelo_auto: formData.modelo_auto.trim(),
      codigo_OEM_original: formData.codigo_OEM_original.trim(),
      marca_OEM: formData.marca_OEM.trim(),
      anio: Number(formData.anio),
      motor: formData.motor.trim(),
      precio: Number(formData.precio),
      id_proveedor: Number(formData.id_proveedor),
      id_equivalencia: equivalenciaValue,
      imagen_url: formData.imagen_url?.trim() ? formData.imagen_url.trim() : null,
      texto: formData.texto?.trim() ? formData.texto.trim() : null,
      eliminado: editingRepuesto.eliminado,
    } as any;

    try {
      await repuestosApi.update(editingRepuesto.id_repuesto, payload);
      fetchData();
      closeModal();
    } catch (error: any) {
      console.error('Error actualizando repuesto:', error.response?.data || error.message);
    }
    return;
  }

  // CREACIÓN: solo los campos requeridos y con tipos correctos
  const payload = {
    marca_auto: formData.marca_auto.trim(),
    modelo_auto: formData.modelo_auto.trim(),
    codigo_OEM_original: formData.codigo_OEM_original.trim(),
    marca_OEM: formData.marca_OEM.trim(),
    anio: Number(formData.anio),
    motor: formData.motor.trim(),
    precio: Number(formData.precio),
    id_proveedor: Number(formData.id_proveedor),
    id_equivalencia: equivalenciaValue,
    imagen_url: formData.imagen_url?.trim() ? formData.imagen_url.trim() : null,
    texto: formData.texto?.trim() ? formData.texto.trim() : null,
    eliminado: false,
  };

  fetchData();
  closeModal();
  try {
  const response = await repuestosApi.create(payload as any);
    console.log('Repuesto creado:', response.data);
  } catch (error: any) {
    console.error('Error saving repuesto:', error.response?.data || error.message);
  }
};


  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este repuesto?')) {
      try {
        const repuesto = repuestos.find(r => r.id_repuesto === id);
        if (!repuesto) return;
        await repuestosApi.update(id, { ...repuesto, eliminado: true } as any);
        fetchData();
      } catch (error) {
        console.error('Error deleting repuesto:', error);
      }
    }
  };

  const openModal = (repuesto?: Repuesto) => {
    if (repuesto) {
      setEditingRepuesto(repuesto);
      setFormData({
        marca_auto: repuesto.marca_auto,
        modelo_auto: repuesto.modelo_auto,
        codigo_OEM_original: repuesto.codigo_OEM_original,
        marca_OEM: repuesto.marca_OEM,
        anio: repuesto.anio,
        motor: repuesto.motor,
        id_proveedor: repuesto.id_proveedor,
        id_equivalencia: repuesto.id_equivalencia,
        precio: repuesto.precio,
        imagen_url: repuesto.imagen_url || '',
        texto: repuesto.texto || '',
      });
    } else {
      setEditingRepuesto(null);
      setFormData({
        marca_auto: '',
        modelo_auto: '',
        codigo_OEM_original: '',
        marca_OEM: '',
        anio: new Date().getFullYear(),
        motor: '',
        id_proveedor: 0,
        id_equivalencia: 0,
        precio: 0,
        imagen_url: '',
        texto: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRepuesto(null);
  };

  const openViewModal = (repuesto: Repuesto) => {
    setViewingRepuesto(repuesto);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingRepuesto(null);
  };

  const filteredRepuestos = repuestos.filter(r =>
    r.marca_auto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.modelo_auto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.codigo_OEM_original.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.marca_OEM.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Repuestos</h1>
          <p className="text-slate-600 mt-1">Gestiona el inventario de repuestos automotrices</p>
        </div>
        <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Repuesto
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo, código OEM..."
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepuestos.map(repuesto => {
          const proveedor = proveedores.find(p => p.id_proveedor === repuesto.id_proveedor);
          const equivalencia = equivalencias.find(eq => eq.id_equivalencia === repuesto.id_equivalencia);

          return (
            <div key={repuesto.id_repuesto} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 relative">
                {repuesto.imagen_url ? (
                  <img src={repuesto.imagen_url} alt={`${repuesto.marca_auto} ${repuesto.modelo_auto}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 text-lg">{repuesto.marca_auto} {repuesto.modelo_auto}</h3>
                <p className="text-sm text-slate-600">{repuesto.anio} - {repuesto.motor}</p>
                <div className="space-y-2 my-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Código OEM:</span>
                    <span className="font-mono text-slate-900">{repuesto.codigo_OEM_original}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Marca OEM:</span>
                    <span className="text-slate-900">{repuesto.marca_OEM}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Proveedor:</span>
                    <span className="text-slate-900">{proveedor?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Equivalencia:</span>
                    <span className="text-slate-900 font-mono text-xs">{equivalencia?.codigo_OEM_equivalente || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-600 text-sm">Precio:</span>
                    <span className="text-xl font-bold text-blue-600">${repuesto.precio.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => openViewModal(repuesto)} className="flex-1">
                    <Eye className="w-4 h-4 mr-2" /> Ver
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openModal(repuesto)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(repuesto.id_repuesto)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRepuestos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-400 text-lg mb-2">No se encontraron repuestos</div>
          <p className="text-slate-500">{searchTerm ? 'Intenta ajustar tu búsqueda' : 'Agrega tu primer repuesto'}</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="marca_auto"
              value={formData.marca_auto}
              onChange={e => setFormData({ ...formData, marca_auto: e.target.value })}
              placeholder="Marca del Auto"
              className="border p-2 rounded w-full"
            />
            <input
              name="modelo_auto"
              value={formData.modelo_auto}
              onChange={e => setFormData({ ...formData, modelo_auto: e.target.value })}
              placeholder="Modelo del Auto"
              className="border p-2 rounded w-full"
            />
            <input
              name="codigo_OEM_original"
              value={formData.codigo_OEM_original}
              onChange={e => setFormData({ ...formData, codigo_OEM_original: e.target.value })}
              placeholder="Código OEM Original"
              className="border p-2 rounded w-full"
            />
            <input
              name="marca_OEM"
              value={formData.marca_OEM}
              onChange={e => setFormData({ ...formData, marca_OEM: e.target.value })}
              placeholder="Marca OEM"
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              name="anio"
              value={formData.anio}
              onChange={e => setFormData({ ...formData, anio: Number(e.target.value) })}
              placeholder="Año"
              className="border p-2 rounded w-full"
            />
            <input
              name="motor"
              value={formData.motor}
              onChange={e => setFormData({ ...formData, motor: e.target.value })}
              placeholder="Motor"
              className="border p-2 rounded w-full"
            />
            <select
              name="id_proveedor"
              value={formData.id_proveedor}
              onChange={e => setFormData({ ...formData, id_proveedor: Number(e.target.value) })}
              className="border p-2 rounded w-full"
            >
              <option value={0}>Selecciona un proveedor</option>
              {proveedores.map(p => (
                <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
              ))}
            </select>
            <select
              name="id_equivalencia"
              value={formData.id_equivalencia}
              onChange={e => setFormData({ ...formData, id_equivalencia: Number(e.target.value) })}
              className="border p-2 rounded w-full"
            >
              <option value={0}>Selecciona una equivalencia</option>
              {equivalencias.map(eq => (
                <option key={eq.id_equivalencia} value={eq.id_equivalencia}>{eq.codigo_OEM_equivalente}</option>
              ))}
            </select>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })}
              placeholder="Precio"
              className="border p-2 rounded w-full"
            />
            <input
              name="imagen_url"
              value={formData.imagen_url}
              onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
              placeholder="URL de la Imagen"
              className="border p-2 rounded w-full"
            />
            <input
              name="texto"
              value={formData.texto}
              onChange={e => setFormData({ ...formData, texto: e.target.value })}
              placeholder="Descripción"
              className="border p-2 rounded w-full col-span-1 md:col-span-2"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingRepuesto ? 'Actualizar' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title="Detalle Repuesto" maxWidth="max-w-xl">
        {viewingRepuesto && (
          <div className="space-y-2">
            <p><strong>Marca Auto:</strong> {viewingRepuesto.marca_auto}</p>
            <p><strong>Modelo Auto:</strong> {viewingRepuesto.modelo_auto}</p>
            <p><strong>Código OEM:</strong> {viewingRepuesto.codigo_OEM_original}</p>
            <p><strong>Marca OEM:</strong> {viewingRepuesto.marca_OEM}</p>
            <p><strong>Año:</strong> {viewingRepuesto.anio}</p>
            <p><strong>Motor:</strong> {viewingRepuesto.motor}</p>
            <p><strong>Proveedor:</strong> {proveedores.find(p => p.id_proveedor === viewingRepuesto.id_proveedor)?.nombre || 'N/A'}</p>
            <p><strong>Equivalencia:</strong> {equivalencias.find(eq => eq.id_equivalencia === viewingRepuesto.id_equivalencia)?.codigo_OEM_equivalente || 'N/A'}</p>
            <p><strong>Precio:</strong> ${viewingRepuesto.precio.toLocaleString()}</p>
            {viewingRepuesto.imagen_url && <img src={viewingRepuesto.imagen_url} alt="Imagen repuesto" className="w-full mt-2 rounded" />}
            {viewingRepuesto.texto && <p className="mt-2">{viewingRepuesto.texto}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Repuestos;
