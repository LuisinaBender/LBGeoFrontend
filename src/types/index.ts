export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  nro_documento: string;
  eliminado: boolean;
}

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  eliminado: boolean;
}

export interface Repuesto {
  id_repuesto: number;
  marca_auto: string;
  modelo_auto: string;
  codigo_OEM_original: string;
  marca_OEM: string;
  anio: number;
  motor: string;
  id_proveedor: number;
  id_equivalencia: number;
  precio: number;
  imagen_url: string;
  texto: string;
  stock: number;
  eliminado: boolean;
  proveedor?: Proveedor;
}

export interface Equivalencia {
  id_equivalencia: number;
  codigo_OEM_equivalente: string;
  codigo_OEM_original: string;
  eliminado: boolean;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
  eliminado: boolean;
}

export interface RegistroVenta {
  id_registro_venta: number;
  id_repuesto: number;
  id_cliente: number;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  fecha_venta: string;
  eliminado: boolean;
  cliente?: Partial<Cliente>;
  repuesto?: Partial<Repuesto>;
}

export type TipoAct = 'Entrada' | 'Salida';

export interface Registro {
  id_registro: number;
  id_registro_venta: number;
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  tipo_act: TipoAct;
  eliminado: boolean;
}