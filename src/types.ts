export interface Cliente {
  id: string;
  tipoDocumento: string; // e.g. 'Cédula de Ciudadanía', 'Cédula de Extranjería', 'NIT'
  numeroDocumento: string;
  nombreCompleto: string;
  telefonoResidencia: string;
  telefonoCelular: string;
  direccion: string;
  ciudadResidencia: string;
  departamento: string;
  pais: string;
  profesion: string;
  email: string;
  isJuridica: boolean;
  nit?: string;
}

export interface Mueble {
  referencia: string;
  nombre: string;
  descripcion: string;
  tipo: 'Interior' | 'Exterior';
  material: string;
  dimensiones: string; // e.g., "Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm"
  alto: number; // in cm
  ancho: number; // in cm
  profundidad: number; // in cm
  color: string;
  peso: number; // in grams
  foto: string; // Image URL/Path
  precio: number; // in COP
  stock: number; // quantity in stock
}

export interface ItemCarrito {
  mueble: Mueble;
  cantidad: number;
}

export interface ItemPedido {
  referencia: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  tipo: 'Interior' | 'Exterior';
}

export interface Pedido {
  id: string; // Número de orden / Referencia
  fecha: string; // e.g., '2026-06-18' (YYYY-MM-DD)
  clienteId: string;
  clienteNombre: string;
  ciudad: string;
  items: ItemPedido[];
  valorTotal: number;
  formaPago: 'Tarjeta de Crédito' | 'Cuenta Corriente' | 'Cuenta de Ahorros / PSE';
  descripcionCompra: string;
}
