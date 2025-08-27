import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Calendar } from 'lucide-react';
import { registrosApi, registrosVentaApi, repuestosApi } from '../services/api';
import type { Registro, RegistroVenta, Repuesto } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Registros: React.FC = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [registrosVenta, setRegistrosVenta] = useState<RegistroVenta[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<Registro | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_registro_venta: '',
    id_repuesto: '',
    cantidad: 1,
    precio_unitario: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [registrosRes, ventasRes, repuestosRes] = await Promise.all([
        registrosApi.getAll(),
        registrosVentaApi.getAll(),
        repuestosApi.getAll(),
      ]);

      setRegistros(registrosRes.data.filter(r => !r.eliminado));
      setRegistrosVenta(ventasRes.data.filter(v => !v.eliminado));
      setRepuestos(repuestosRes.data.filter(r => !r.eliminado));
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
        id_registro_venta: Number(formData.id_registro_venta),
        id_repuesto: Number(formData.id_repuesto),
        precio_total,
        eliminado: false,
      };

      if (editingRegistro) {
        await registrosApi.update(editingRegistro.id_registro, { ...editingRegistro, ...data });
      } else {
        await registrosApi.create(data);
      }

      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving registro:', error);
    }
  };

  const handleDeleteRegistro = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        const registro = registros.find(r => r.id_registro === id);
        if (!registro) return;
        await registrosApi.update(id, { ...registro, eliminado: true });
        fetchData();
      } catch (error) {
        console.error('Error eliminando registro:', error);
      }
    }
  };

  const handleDeleteRepuesto = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este repuesto?')) {
      try {
        const repuesto = repuestos.find(r => r.id_repuesto === id);
        if (!repuesto) return;
        await repuestosApi.update(id, { ...repuesto, eliminado: true });
        fetchData();
      } catch (error) {
        console.error('Error eliminando repuesto:', error);
      }
    }
  };

  const openModal = (registro?: Registro) => {
    if (registro) {
      setEditingRegistro(registro);
      setFormData({
        id_registro_venta: registro.id_registro_venta.toString(),
        id_repuesto: registro.id_repuesto.toString(),
        cantidad: registro.cantidad,
        precio_unitario: registro.precio_unitario,
      });
    } else {
      setEditingRegistro(null);
      setFormData({
        id_registro_venta: '',
        id_repuesto: '',
        cantidad: 1,
        precio_unitario: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRegistro(null);
  };

  const handleRepuestoChange = (repuestoId: string) => {
    const repuesto = repuestos.find(r => r.id_repuesto === Number(repuestoId));
    setFormData({
      ...formData,
      id_repuesto: repuestoId,
      precio_unitario: repuesto ? repuesto.precio : 0,
    });
  };

  const filteredRegistros = registros.filter(registro => {
    const venta = registrosVenta.find(v => v.id_registro_venta === registro.id_registro_venta);
    const repuesto = repuestos.find(r => r.id_repuesto === registro.id_repuesto);

    return (
      registro.id_registro.toString().includes(searchTerm) ||
      venta?.id_registro_venta.toString().includes(searchTerm) ||
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
          <h1 className="text-2xl font-bold text-slate-900">Registros</h1>
          <p className="text-slate-600 mt-1">Gestiona los registros detallados de ventas</p>
        </div>
        <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Registro
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
            placeholder="Buscar por ID, venta o repuesto..."
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Repuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRegistros.map((registro) => {
                const venta = registrosVenta.find(v => v.id_registro_venta === registro.id_registro_venta);
                const repuesto = repuestos.find(r => r.id_repuesto === registro.id_repuesto);

                return (
                  <tr key={registro.id_registro} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            Registro #{registro.id_registro}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        Venta #{registro.id_registro_venta}
                      </div>
                      {venta && (
                        <div className="text-sm text-slate-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(venta.fecha_venta).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {repuesto ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {repuesto.marca_auto} {repuesto.modelo_auto}
                          </div>
                          <div className="text-sm text-slate-500 font-mono">
                            {repuesto.codigo_OEM_original}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Repuesto no encontrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {registro.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${registro.precio_unitario.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-green-600">
                        ${registro.precio_total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal(registro)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRegistro(registro.id_registro)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRegistros.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-lg mb-2">No se encontraron registros</div>
              <p className="text-slate-500">Intenta ajustar tu búsqueda o agrega un nuevo registro</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRegistro ? 'Editar Registro' : 'Nuevo Registro'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Registro de Venta *
            </label>
            <select
              value={formData.id_registro_venta}
              onChange={(e) => setFormData({ ...formData, id_registro_venta: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar registro de venta</option>
              {registrosVenta.map((venta) => (
                <option key={venta.id_registro_venta} value={venta.id_registro_venta}>
                  Venta #{venta.id_registro_venta} - {new Date(venta.fecha_venta).toLocaleDateString()} (${venta.precio_total.toLocaleString()})
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
                min={1}
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
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {formData.cantidad > 0 && formData.precio_unitario > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Total del Registro:</span>
                <span className="text-2xl font-bold text-green-900">
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
              {editingRegistro ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Registros;
