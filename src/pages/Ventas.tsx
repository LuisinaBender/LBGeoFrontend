import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShoppingCart, Calendar } from 'lucide-react';
import { registrosVentaApi, clientesApi, repuestosApi } from '../services/api';
import type { RegistroVenta, Cliente, Repuesto } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<RegistroVenta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState<RegistroVenta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_repuesto: '',
    id_cliente: '',
    cantidad: 1,
    precio_unitario: 0,
    fecha_venta: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ventasRes, clientesRes, repuestosRes] = await Promise.all([
        registrosVentaApi.getAll(),
        clientesApi.getAll(),
        repuestosApi.getAll(),
      ]);
      
      setVentas(ventasRes.data.filter(venta => !venta.eliminado));
      setClientes(clientesRes.data.filter(cliente => !cliente.eliminado));
      setRepuestos(repuestosRes.data.filter(repuesto => !repuesto.eliminado));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const precio_total = formData.cantidad * formData.precio_unitario;
      const data = {
        ...formData,
        id_repuesto: Number(formData.id_repuesto),
        id_cliente: Number(formData.id_cliente),
        precio_total,
      };

      if (editingVenta) {
        await registrosVentaApi.update(editingVenta.id_registro_venta, data);
      } else {
        await registrosVentaApi.create({ ...data, eliminado: false });
      }
      
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving venta:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta venta?')) {
      try {
        await registrosVentaApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting venta:', error);
      }
    }
  };

  const openModal = (venta?: RegistroVenta) => {
    if (venta) {
      setEditingVenta(venta);
      setFormData({
        id_repuesto: venta.id_repuesto.toString(),
        id_cliente: venta.id_cliente.toString(),
        cantidad: venta.cantidad,
        precio_unitario: venta.precio_unitario,
        fecha_venta: venta.fecha_venta.split('T')[0],
      });
    } else {
      setEditingVenta(null);
      setFormData({
        id_repuesto: '',
        id_cliente: '',
        cantidad: 1,
        precio_unitario: 0,
        fecha_venta: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVenta(null);
  };

  const handleRepuestoChange = (repuestoId: string) => {
    const repuesto = repuestos.find(r => r.id_repuesto === Number(repuestoId));
    setFormData({
      ...formData,
      id_repuesto: repuestoId,
      precio_unitario: repuesto ? repuesto.precio : 0,
    });
  };

  const filteredVentas = ventas.filter(venta => {
    const cliente = clientes.find(c => c.id_cliente === venta.id_cliente);
    const repuesto = repuestos.find(r => r.id_repuesto === venta.id_repuesto);
    
    return (
      cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto?.marca_auto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto?.modelo_auto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto?.codigo_OEM_original.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-600 mt-1">Gestiona las ventas de repuestos</p>
        </div>
        <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
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
            placeholder="Buscar por cliente o repuesto..."
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVentas.map((venta) => {
          const cliente = clientes.find(c => c.id_cliente === venta.id_cliente);
          const repuesto = repuestos.find(r => r.id_repuesto === venta.id_repuesto);
          
          return (
            <div key={venta.id_registro_venta} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Venta #{venta.id_registro_venta}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(venta.fecha_venta).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ${venta.precio_total.toLocaleString()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Cliente</h4>
                  <p className="text-sm text-slate-600">
                    {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado'}
                  </p>
                  <p className="text-sm text-slate-500">{cliente?.email}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Repuesto</h4>
                  <p className="text-sm text-slate-600">
                    {repuesto ? `${repuesto.marca_auto} ${repuesto.modelo_auto}` : 'Repuesto no encontrado'}
                  </p>
                  <p className="text-sm text-slate-500 font-mono">
                    {repuesto?.codigo_OEM_original} - {repuesto?.marca_OEM}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-slate-500">Cantidad</p>
                    <p className="font-semibold text-slate-900">{venta.cantidad}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Precio Unit.</p>
                    <p className="font-semibold text-slate-900">${venta.precio_unitario.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Total</p>
                    <p className="font-semibold text-green-600">${venta.precio_total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal(venta)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(venta.id_registro_venta)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVentas.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-400 text-lg mb-2">No se encontraron ventas</div>
          <p className="text-slate-500">Intenta ajustar tu búsqueda o registra una nueva venta</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVenta ? 'Editar Venta' : 'Nueva Venta'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cliente *
            </label>
            <select
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} {cliente.apellido} - {cliente.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Repuesto *
            </label>
            <select
              value={formData.id_repuesto}
              onChange={(e) => handleRepuestoChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar repuesto</option>
              {repuestos.map((repuesto) => (
                <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                  {repuesto.marca_auto} {repuesto.modelo_auto} - {repuesto.codigo_OEM_original} (${repuesto.precio.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio Unitario *
              </label>
              <input
                type="number"
                value={formData.precio_unitario}
                onChange={(e) => setFormData({ ...formData, precio_unitario: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha de Venta *
            </label>
            <input
              type="date"
              value={formData.fecha_venta}
              onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Total Preview */}
          {formData.cantidad > 0 && formData.precio_unitario > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Total de la Venta:</span>
                <span className="text-2xl font-bold text-blue-900">
                  ${(formData.cantidad * formData.precio_unitario).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              {editingVenta ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Ventas;