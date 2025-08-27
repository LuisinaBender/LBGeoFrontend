import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Shield, UserCheck } from 'lucide-react';
import { usuariosApi } from '../services/api';
import type { Usuario } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rol: '',
    email: '',
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await usuariosApi.getAll();
      setUsuarios(response.data.filter(usuario => !usuario.eliminado));
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        await usuariosApi.update(editingUsuario.id_usuario, formData);
      } else {
        await usuariosApi.create({ ...formData, eliminado: false });
      }
      
      fetchUsuarios();
      closeModal();
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuariosApi.delete(id);
        fetchUsuarios();
      } catch (error) {
        console.error('Error deleting usuario:', error);
      }
    }
  };

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        email: usuario.email,
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nombre: '',
        apellido: '',
        rol: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
  };

  const getRoleIcon = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return Shield;
      case 'vendedor':
        return UserCheck;
      default:
        return User;
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'vendedor':
        return 'bg-blue-100 text-blue-800';
      case 'gerente':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-600 mt-1">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
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
            placeholder="Buscar por nombre, email o rol..."
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.map((usuario) => {
          const RoleIcon = getRoleIcon(usuario.rol);
          
          return (
            <div key={usuario.id_usuario} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {usuario.nombre} {usuario.apellido}
                    </h3>
                    <p className="text-sm text-slate-500">ID: {usuario.id_usuario}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <RoleIcon className="w-4 h-4 text-slate-600" />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm text-slate-600">Email:</span>
                  <div className="text-sm text-slate-900 mt-1">{usuario.email}</div>
                </div>
                
                <div>
                  <span className="text-sm text-slate-600">Rol:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(usuario.rol)}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {usuario.rol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal(usuario)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(usuario.id_usuario)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-400 text-lg mb-2">No se encontraron usuarios</div>
          <p className="text-slate-500">Intenta ajustar tu búsqueda o agrega un nuevo usuario</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rol *
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Gerente">Gerente</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Operador">Operador</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Usuario</h4>
            <div className="text-sm text-blue-700">
              <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Rol:</strong> {formData.rol}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              {editingUsuario ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;