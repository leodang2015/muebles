import { Cliente, Mueble, Pedido } from './types';

// Define online high-quality image URLs for the applet
const mesaNaturalImg = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600';
const mesaCaobaImg = 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600';
const mesaAvellanaImg = 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600';
const bannerImg = 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=1200';
const sillaGriegaImg = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=600';
const credenzaClasicaImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
const mesaTeExteriorImg = 'https://images.unsplash.com/photo-1622397333309-3056849bc70b?auto=format&fit=crop&q=80&w=600';

export const BANNER_IMAGE = bannerImg;

export const INICIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-001',
    tipoDocumento: 'Cédula de Cédula de Ciudadanía',
    numeroDocumento: '1020456789',
    nombreCompleto: 'Camila Restrepo',
    telefonoResidencia: '6013234567',
    telefonoCelular: '3157894561',
    direccion: 'Carrera 15 # 85-12',
    ciudadResidencia: 'Bogotá',
    departamento: 'Cundinamarca',
    pais: 'Colombia',
    profesion: 'Diseñadora de Interiores',
    email: 'camila.restrepo@example.com',
    isJuridica: false
  },
  {
    id: 'cli-002',
    tipoDocumento: 'Cédula de Cédula de Ciudadanía',
    numeroDocumento: '91234567',
    nombreCompleto: 'Carlos Gómez',
    telefonoResidencia: '6077245678',
    telefonoCelular: '3004567890',
    direccion: 'Calle 12 # 4-50 Centro',
    ciudadResidencia: 'San Gil',
    departamento: 'Santander',
    pais: 'Colombia',
    profesion: 'Comerciante',
    email: 'carlos.gomez@example.com',
    isJuridica: false
  },
  {
    id: 'cli-003',
    tipoDocumento: 'NIT',
    numeroDocumento: '900123456-1',
    nombreCompleto: 'Constructora Alpes S.A.S.',
    telefonoResidencia: '6024889900',
    telefonoCelular: '3112223344',
    direccion: 'Avenida Sexta Norte # 22N-50',
    ciudadResidencia: 'Cali',
    departamento: 'Valle del Cauca',
    pais: 'Colombia',
    profesion: 'Constructor',
    email: 'compras@construalpes.com',
    isJuridica: true,
    nit: '900123456-1'
  },
  {
    id: 'cli-004',
    tipoDocumento: 'Cédula de Cédula de Ciudadanía',
    numeroDocumento: '43567890',
    nombreCompleto: 'Diana Ospina',
    telefonoResidencia: '6042661122',
    telefonoCelular: '3109876543',
    direccion: 'Calle 10 # 36-24 El Poblado',
    ciudadResidencia: 'Medellín',
    departamento: 'Antioquia',
    pais: 'Colombia',
    profesion: 'Arquitecta',
    email: 'diana.ospina@example.com',
    isJuridica: false
  }
];

export const INICIAL_MUEBLES: Mueble[] = [
  {
    referencia: 'MESONAT001',
    nombre: 'Mesa Ovalada estilo griego',
    descripcion: 'Mesa ovalada de comedor con un elegante diseño de estilo griego clásico, ideal para brindar un toque de sofisticación a tus espacios interiores.',
    tipo: 'Interior',
    material: 'Madera',
    dimensiones: 'Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm',
    alto: 140,
    ancho: 40,
    profundidad: 55,
    color: 'Natural',
    peso: 30000,
    foto: mesaNaturalImg,
    precio: 140000,
    stock: 2
  },
  {
    referencia: 'MESOCAO001',
    nombre: 'Mesa Ovalada estilo griego (Caoba)',
    descripcion: 'Mesa ovalada con un elegante estilo griego, exquisitamente terminada en un acabado caoba rojizo oscuro que resalta las finas vetas de la madera selecta.',
    tipo: 'Interior',
    material: 'Madera',
    dimensiones: 'Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm',
    alto: 140,
    ancho: 40,
    profundidad: 55,
    color: 'Caoba',
    peso: 30000,
    foto: mesaCaobaImg,
    precio: 140000,
    stock: 3
  },
  {
    referencia: 'MESOAVE001',
    nombre: 'Mesa Ovalada estilo griego (Avellana)',
    descripcion: 'Mesa ovalada con un elegante estilo griego y patas de columna tallada, en un matiz avellana cálido y profundo ideal para salones prestigiosos.',
    tipo: 'Interior',
    material: 'Madera',
    dimensiones: 'Alto: 140 cm, Ancho: 60 cm, Profundidad: 55 cm',
    alto: 140,
    ancho: 60,
    profundidad: 55,
    color: 'Avellana',
    peso: 60000,
    foto: mesaAvellanaImg,
    precio: 180000,
    stock: 1
  },
  {
    referencia: 'SILAEXT001',
    nombre: 'Silla Exterior Imperial',
    descripcion: 'Sustentable e inmune al clima, esta silla de exterior está diseñada en aluminio fundido de alta pureza tratado con pintura electrostática en polvo súper resistente.',
    tipo: 'Exterior',
    material: 'Aluminio fundido',
    dimensiones: 'Alto: 90 cm, Ancho: 55 cm, Profundidad: 55 cm',
    alto: 90,
    ancho: 55,
    profundidad: 55,
    color: 'Gris Antracita',
    peso: 8000,
    foto: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    precio: 90000,
    stock: 10
  },
  {
    referencia: 'SOFAEXT002',
    nombre: 'Sofá Modular de Jardín Premium',
    descripcion: 'Sofá elegante elaborado de mimbre sintético (rattan) de alta resistencia contra rayos UV, con almohadones rellenados de espuma de alta densidad impermeables.',
    tipo: 'Exterior',
    material: 'Mimbre Sintético',
    dimensiones: 'Alto: 85 cm, Ancho: 180 cm, Profundidad: 80 cm',
    alto: 85,
    ancho: 180,
    profundidad: 80,
    color: 'Beige',
    peso: 25000,
    foto: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600',
    precio: 450000,
    stock: 4
  },
  {
    referencia: 'SILAGRI001',
    nombre: 'Silla Griega Imperial Caoba',
    descripcion: 'Silla de comedor aristocrática de estilo griego clásico, finamente tallada en madera de caoba lustrada y tapizada con un sofisticado tejido damasco en tono crema dorado.',
    tipo: 'Interior',
    material: 'Madera de Caoba',
    dimensiones: 'Alto: 105 cm, Ancho: 52 cm, Profundidad: 55 cm',
    alto: 105,
    ancho: 52,
    profundidad: 55,
    color: 'Caoba / Oro',
    peso: 9500,
    foto: sillaGriegaImg,
    precio: 135000,
    stock: 8
  },
  {
    referencia: 'CRECLAS001',
    nombre: 'Credenza Neoclásica Premium',
    descripcion: 'Espectacular aparador o credenza clásica de madera noble con finas molduras talladas e incrustaciones doradas neoclásicas, aportando gran suntuosidad y almacenamiento.',
    tipo: 'Interior',
    material: 'Madera Noble',
    dimensiones: 'Alto: 90 cm, Ancho: 160 cm, Profundidad: 45 cm',
    alto: 90,
    ancho: 160,
    profundidad: 45,
    color: 'Nogal Oscuro / Oro',
    peso: 45000,
    foto: credenzaClasicaImg,
    precio: 680000,
    stock: 2
  },
  {
    referencia: 'MESTEXT001',
    nombre: 'Mesa de Té Imperial Oxford',
    descripcion: 'Lujoso juego de mesa de té circular para exterior confeccionado en aluminio de fundición ornamental blanco, acompañado de sillas de encaje metálico, inmune a la corrosión.',
    tipo: 'Exterior',
    material: 'Aluminio fundido',
    dimensiones: 'Alto: 75 cm, Ancho: 80 cm, Profundidad: 80 cm',
    alto: 75,
    ancho: 80,
    profundidad: 80,
    color: 'Blanco Imperial',
    peso: 18000,
    foto: mesaTeExteriorImg,
    precio: 320000,
    stock: 3
  }
];

export const INICIAL_PEDIDOS: Pedido[] = [
  {
    id: 'ORD-2026-001',
    fecha: '2026-06-15',
    clienteId: 'cli-001',
    clienteNombre: 'Camila Restrepo',
    ciudad: 'Bogotá',
    items: [
      {
        referencia: 'MESONAT001',
        nombre: 'Mesa Ovalada estilo griego',
        cantidad: 1,
        precioUnitario: 140000,
        total: 140000,
        tipo: 'Interior'
      },
      {
        referencia: 'SILAEXT001',
        nombre: 'Silla Exterior Imperial',
        cantidad: 2,
        precioUnitario: 90000,
        total: 180000,
        tipo: 'Exterior'
      }
    ],
    valorTotal: 320000,
    formaPago: 'Tarjeta de Crédito',
    descripcionCompra: 'Compra de 1 Mesa Griega Natural y 2 Sillas de Exterior Imperial'
  },
  {
    id: 'ORD-2026-002',
    fecha: '2026-06-16',
    clienteId: 'cli-003',
    clienteNombre: 'Constructora Alpes S.A.S.',
    ciudad: 'Cali',
    items: [
      {
        referencia: 'MESOCAO001',
        nombre: 'Mesa Ovalada estilo griego (Caoba)',
        cantidad: 2,
        precioUnitario: 140000,
        total: 280000,
        tipo: 'Interior'
      },
      {
        referencia: 'SOFAEXT002',
        nombre: 'Sofá Modular de Jardín Premium',
        cantidad: 1,
        precioUnitario: 450000,
        total: 450000,
        tipo: 'Exterior'
      }
    ],
    valorTotal: 730000,
    formaPago: 'Cuenta Corriente',
    descripcionCompra: 'Compra corporativa de mobiliario para oficinas de recreación'
  },
  {
    id: 'ORD-2026-003',
    fecha: '2026-06-17',
    clienteId: 'cli-002',
    clienteNombre: 'Carlos Gómez',
    ciudad: 'San Gil',
    items: [
      {
        referencia: 'MESOAVE001',
        nombre: 'Mesa Ovalada estilo griego (Avellana)',
        cantidad: 1,
        precioUnitario: 180000,
        total: 180000,
        tipo: 'Interior'
      }
    ],
    valorTotal: 180000,
    formaPago: 'Cuenta de Ahorros / PSE',
    descripcionCompra: 'Compra personal de mesa estilo griego avellana selecta'
  },
  {
    id: 'ORD-2026-004',
    fecha: '2026-06-17',
    clienteId: 'cli-004',
    clienteNombre: 'Diana Ospina',
    ciudad: 'Medellín',
    items: [
      {
        referencia: 'SILAEXT001',
        nombre: 'Silla Exterior Imperial',
        cantidad: 4,
        precioUnitario: 90000,
        total: 360000,
        tipo: 'Exterior'
      }
    ],
    valorTotal: 360000,
    formaPago: 'Tarjeta de Crédito',
    descripcionCompra: 'Lote de 4 Sillas Exterior Imperial'
  }
];
