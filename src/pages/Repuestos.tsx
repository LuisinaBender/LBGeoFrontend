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
    id_proveedor: '',
    id_equivalencia: '',
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        marca_auto: formData.marca_auto,
        modelo_auto: formData.modelo_auto,
        codigo_OEM_original: formData.codigo_OEM_original,
        marca_OEM: formData.marca_OEM,
        anio: Number(formData.anio),
        motor: formData.motor,
        precio: Number(formData.precio),
        id_proveedor: Number(formData.id_proveedor),
        id_equivalencia: formData.id_equivalencia ? Number(formData.id_equivalencia) : null,
        imagen_url: formData.imagen_url || null,
        texto: formData.texto || null,
        eliminado: false,
      };

      if (editingRepuesto) {
        await repuestosApi.update(editingRepuesto.id_repuesto, payload);
      } else {
        await repuestosApi.create(payload);
      }
      console.log("Payload a enviar:", payload);
      await repuestosApi.create(payload);


      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving repuesto:', error);
      alert('No se pudo guardar el repuesto. Verifica los campos y vuelve a intentar.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este repuesto?')) {
      try {
        const repuesto = repuestos.find(r => r.id_repuesto === id);
        if (!repuesto) return;

        await repuestosApi.update(id, { ...repuesto, eliminado: true });
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
        id_proveedor: repuesto.id_proveedor.toString(),
        id_equivalencia: repuesto.id_equivalencia?.toString() || '',
        precio: repuesto.precio,
        imagen_url: repuesto.imagen_url,
        texto: repuesto.texto,
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
        id_proveedor: '',
        id_equivalencia: '',
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
                  <div className="flex justify-between items-center">
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

      {filteredRepuestos.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-400 text-lg mb-2">No se encontraron repuestos</div>
          <p className="text-slate-500">Intenta ajustar tu búsqueda o agrega un nuevo repuesto</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Marca Auto" required value={formData.marca_auto} onChange={e => setFormData({ ...formData, marca_auto: e.target.value })} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Modelo Auto" required value={formData.modelo_auto} onChange={e => setFormData({ ...formData, modelo_auto: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Código OEM Original" required value={formData.codigo_OEM_original} onChange={e => setFormData({ ...formData, codigo_OEM_original: e.target.value })} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Marca OEM" required value={formData.marca_OEM} onChange={e => setFormData({ ...formData, marca_OEM: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="number" placeholder="Año" required value={formData.anio} onChange={e => setFormData({ ...formData, anio: Number(e.target.value) })} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Motor" required value={formData.motor} onChange={e => setFormData({ ...formData, motor: e.target.value })} className="border p-2 rounded w-full" />
            <input type="number" placeholder="Precio" required value={formData.precio} onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })} className="border p-2 rounded w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select required value={formData.id_proveedor} onChange={e => setFormData({ ...formData, id_proveedor: e.target.value })} className="border p-2 rounded w-full">
              <option value="">Seleccionar proveedor</option>
              {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
            <select value={formData.id_equivalencia} onChange={e => setFormData({ ...formData, id_equivalencia: e.target.value })} className="border p-2 rounded w-full">
              <option value="">Sin equivalencia</option>
              {equivalencias.map(eq => <option key={eq.id_equivalencia} value={eq.id_equivalencia}>{eq.codigo_OEM_original} → {eq.codigo_OEM_equivalente}</option>)}
            </select>
          </div>
          <input type="url" placeholder="URL Imagen" value={formData.imagen_url} onChange={e => setFormData({ ...formData, imagen_url: e.target.value })} className="border p-2 rounded w-full" />
          <textarea placeholder="Descripción" rows={3} value={formData.texto} onChange={e => setFormData({ ...formData, texto: e.target.value })} className="border p-2 rounded w-full" />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingRepuesto ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title="Detalles del Repuesto" maxWidth="max-w-2xl">
        {viewingRepuesto && (
          <div className="space-y-4">
            {viewingRepuesto.imagen_url && <img src={viewingRepuesto.imagen_url} alt={`${viewingRepuesto.marca_auto} ${viewingRepuesto.modelo_auto}`} className="w-full h-64 object-cover rounded" />}
            <div>Año: {viewingRepuesto.anio}</div>
            <div>Motor: {viewingRepuesto.motor}</div>
            <div>Código OEM: {viewingRepuesto.codigo_OEM_original}</div>
            <div>Marca OEM: {viewingRepuesto.marca_OEM}</div>
            <div>Proveedor: {proveedores.find(p => p.id_proveedor === viewingRepuesto.id_proveedor)?.nombre || 'N/A'}</div>
            <div>Precio: ${viewingRepuesto.precio.toLocaleString()}</div>
            <div>Nombre del Repuesto: {viewingRepuesto.texto}</div>
            <div className="flex justify-end mt-4">
              <Button onClick={closeViewModal}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Repuestos;
