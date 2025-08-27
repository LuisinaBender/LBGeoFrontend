import axios from 'axios';
import type { Cliente, Proveedor, Repuesto, Equivalencia, Usuario, RegistroVenta, Registro } from '../types';

const API_BASE_URL = 'https://datalbgeo.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clientes API
export const clientesApi = {
  getAll: () => api.get<Cliente[]>('/clientes'),
  getById: (id: number) => api.get<Cliente>(`/clientes/${id}`),
  create: (cliente: Omit<Cliente, 'id_cliente'>) => api.post<Cliente>('/clientes', cliente),
  update: (id: number, cliente: Partial<Cliente>) => api.put<Cliente>(`/clientes/${id}`, cliente),
  delete: (id: number) => api.delete(`/clientes/${id}`),
};

// Proveedores API
export const proveedoresApi = {
  getAll: () => api.get<Proveedor[]>('/proveedores'),
  getById: (id: number) => api.get<Proveedor>(`/proveedores/${id}`),
  create: (proveedor: Omit<Proveedor, 'id_proveedor'>) => api.post<Proveedor>('/proveedores', proveedor),
  update: (id: number, proveedor: Partial<Proveedor>) => api.put<Proveedor>(`/proveedores/${id}`, proveedor),
  delete: (id: number) => api.delete(`/proveedores/${id}`),
};

// Repuestos API
export const repuestosApi = {
  getAll: () => api.get<Repuesto[]>('/repuestos'),
  getById: (id: number) => api.get<Repuesto>(`/repuestos/${id}`),
  create: (repuesto: Omit<Repuesto, 'id_repuesto'>) => api.post<Repuesto>('/repuestos', repuesto),
  update: (id: number, repuesto: Partial<Repuesto>) => api.put<Repuesto>(`/repuestos/${id}`, repuesto),
  delete: (id: number) => api.delete(`/repuestos/${id}`),
  searchByOEM: (codigo: string) => api.get<Repuesto[]>(`/repuestos/search?codigo_oem=${codigo}`),
};

// Equivalencias API
export const equivalenciasApi = {
  getAll: () => api.get<Equivalencia[]>('/equivalencias'),
  getById: (id: number) => api.get<Equivalencia>(`/equivalencias/${id}`),
  create: (equivalencia: Omit<Equivalencia, 'id_equivalencia'>) => api.post<Equivalencia>('/equivalencias', equivalencia),
  update: (id: number, equivalencia: Partial<Equivalencia>) => api.put<Equivalencia>(`/equivalencias/${id}`, equivalencia),
  delete: (id: number) => api.delete(`/equivalencias/${id}`),
  searchByCode: (codigo: string) => api.get<Equivalencia[]>(`/equivalencias/search?codigo=${codigo}`),
};

// Usuarios API
export const usuariosApi = {
  getAll: () => api.get<Usuario[]>('/usuarios'),
  getById: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  create: (usuario: Omit<Usuario, 'id_usuario'>) => api.post<Usuario>('/usuarios', usuario),
  update: (id: number, usuario: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, usuario),
  delete: (id: number) => api.delete(`/usuarios/${id}`),
};

// Registros de Venta API
export const registrosVentaApi = {
  getAll: () => api.get<RegistroVenta[]>('/registrosventas'),
  getById: (id: number) => api.get<RegistroVenta>(`/registrosventas/${id}`),
  create: (registro: Omit<RegistroVenta, 'id_registro_venta'>) => api.post<RegistroVenta>('/registrosventas', registro),
  update: (id: number, registro: Partial<RegistroVenta>) => api.put<RegistroVenta>(`/registrosventas/${id}`, registro),
  delete: (id: number) => api.delete(`/registrosventas/${id}`),
};

// Registros API
export const registrosApi = {
  getAll: () => api.get<Registro[]>('/registros'),
  getById: (id: number) => api.get<Registro>(`/registros/${id}`),
  create: (registro: Omit<Registro, 'id_registro'>) => api.post<Registro>('/registros', registro),
  update: (id: number, registro: Partial<Registro>) => api.put<Registro>(`/registros/${id}`, registro),
  delete: (id: number) => api.delete(`/registros/${id}`),
};

export default api;