import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Trash2, ArrowLeft, CheckCircle, 
  CreditCard, Search, Info, MapPin, User, LogIn,
  Mail, Phone, ShieldCheck, HelpCircle, Truck, Package 
} from 'lucide-react';
import { Cliente, Mueble, ItemCarrito, Pedido } from '../types';
import { BANNER_IMAGE } from '../initialData';

interface ClientPortalProps {
  muebles: Mueble[];
  setMuebles: React.Dispatch<React.SetStateAction<Mueble[]>>;
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  pedidos: Pedido[];
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
  currentCliente: Cliente | null;
  setCurrentCliente: (cliente: Cliente | null) => void;
}

export default function ClientPortal({
  muebles,
  setMuebles,
  clientes,
  setClientes,
  pedidos,
  setPedidos,
  currentCliente,
  setCurrentCliente
}: ClientPortalProps) {
  // Navigation: 'store' | 'detail' | 'cart' | 'checkout' | 'success' | 'profile' | 'purchases'
  const [view, setView] = useState<'store' | 'detail' | 'cart' | 'checkout' | 'success' | 'profile' | 'purchases'>('store');
  const [selectedMueble, setSelectedMueble] = useState<Mueble | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Interior' | 'Exterior'>('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');

  // Registration states
  const [showRegForm, setShowRegForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Cliente>>({
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '',
    nombreCompleto: '',
    telefonoResidencia: '',
    telefonoCelular: '',
    direccion: '',
    ciudadResidencia: '',
    departamento: '',
    pais: 'Colombia',
    profesion: '',
    email: '',
    isJuridica: false,
    nit: ''
  });
  const [regError, setRegError] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta de Crédito' | 'Cuenta Corriente' | 'Cuenta de Ahorros / PSE'>('Tarjeta de Crédito');
  const [paymentInfo, setPaymentInfo] = useState({
    nombreTarjeta: '',
    numeroTarjeta: '',
    codigoSeguridad: '',
    tarjetaMes: '01',
    tarjetaAnio: '2026',
    cuotas: '1',
    bancoPSE: 'Bancolombia',
    numeroCuenta: ''
  });
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Pedido | null>(null);

  // Get unique list of materials for filter
  const materials = ['Todos', ...Array.from(new Set(muebles.map(m => m.material).filter(Boolean)))];

  // Filter products
  const filteredMuebles = muebles.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.referencia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'Todos' || m.tipo === filterType;
    const matchesMaterial = filterMaterial === 'Todos' || m.material === filterMaterial;
    return matchesSearch && matchesType && matchesMaterial;
  });

  // Add item to cart
  const handleAddToCart = (mueble: Mueble, qty: number) => {
    const existing = carrito.find(item => item.mueble.referencia === mueble.referencia);
    const currentCartQty = existing ? existing.cantidad : 0;
    const totalRequestQty = currentCartQty + qty;

    if (totalRequestQty > mueble.stock) {
      alert(`Lo sentimos. No es posible agregar ${qty} unidad(es) de "${mueble.nombre}". La cantidad solicitada supera el inventario actual (${mueble.stock} unidades en existencia).`);
      return;
    }

    if (existing) {
      setCarrito(carrito.map(item => 
        item.mueble.referencia === mueble.referencia 
          ? { ...item, cantidad: totalRequestQty }
          : item
      ));
    } else {
      setCarrito([...carrito, { mueble, cantidad: qty }]);
    }
    
    // Switch to stores view or stay
    setView('store');
    setSelectedMueble(null);
  };

  // Modify cart item quantity
  const handleUpdateCartQty = (reference: string, newQty: number) => {
    const item = carrito.find(i => i.mueble.referencia === reference);
    if (!item) return;

    if (newQty <= 0) {
      handleRemoveFromCart(reference);
      return;
    }

    if (newQty > item.mueble.stock) {
      alert(`Solo hay ${item.mueble.stock} unidades del producto en inventario.`);
      return;
    }

    setCarrito(carrito.map(i => 
      i.mueble.referencia === reference ? { ...i, cantidad: newQty } : i
    ));
  };

  // Remove item from cart
  const handleRemoveFromCart = (reference: string) => {
    setCarrito(carrito.filter(item => item.mueble.referencia !== reference));
  };

  // Calculate cart totals
  const subtotal = carrito.reduce((sum, item) => sum + (item.mueble.precio * item.cantidad), 0);
  const total = subtotal; // Free shipping

  // Handle Client Auto-Login or Registration
  const handleSelectClient = (clientId: string) => {
    const client = clientes.find(c => c.id === clientId);
    if (client) {
      setCurrentCliente(client);
    }
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Check mandatory fields
    if (!newClient.numeroDocumento || !newClient.nombreCompleto || !newClient.telefonoResidencia || !newClient.direccion || !newClient.ciudadResidencia || !newClient.departamento || !newClient.email) {
      setRegError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    // Check if doc number already exists
    const duplicate = clientes.find(c => c.numeroDocumento === newClient.numeroDocumento);
    if (duplicate) {
      setRegError('Ya existe un cliente registrado con este número de documento.');
      return;
    }

    if (newClient.isJuridica && !newClient.nit) {
      setRegError('Para personas jurídicas es obligatorio el campo NIT.');
      return;
    }

    const created: Cliente = {
      id: `cli-${Date.now()}`,
      tipoDocumento: newClient.tipoDocumento || 'Cédula de Cédula de Ciudadanía',
      numeroDocumento: newClient.numeroDocumento,
      nombreCompleto: newClient.nombreCompleto,
      telefonoResidencia: newClient.telefonoResidencia,
      telefonoCelular: newClient.telefonoCelular || '',
      direccion: newClient.direccion,
      ciudadResidencia: newClient.ciudadResidencia,
      departamento: newClient.departamento,
      pais: newClient.pais || 'Colombia',
      profesion: newClient.profesion || '',
      email: newClient.email,
      isJuridica: !!newClient.isJuridica,
      nit: newClient.nit
    };

    setClientes([...clientes, created]);
    setCurrentCliente(created);
    setShowRegForm(false);
    // Reset form
    setNewClient({
      tipoDocumento: 'Cédula de Cédula de Ciudadanía',
      numeroDocumento: '',
      nombreCompleto: '',
      telefonoResidencia: '',
      telefonoCelular: '',
      direccion: '',
      ciudadResidencia: '',
      departamento: '',
      pais: 'Colombia',
      profesion: '',
      email: '',
      isJuridica: false,
      nit: ''
    });
  };

  // Modify client profile
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCliente) return;

    setClientes(clientes.map(c => c.id === currentCliente.id ? currentCliente : c));
    alert('Información del perfil actualizada exitosamente.');
    setView('store');
  };

  // Checkout purchase
  const handleProcessCheckout = () => {
    // Check if customer is registered and authenticated
    if (!currentCliente) {
      setView('profile');
      alert('Debe estar registrado o autenticarse con sus datos en el sistema para realizar una compra.');
      return;
    }

    // Check stock one final time
    for (const item of carrito) {
      const realMueble = muebles.find(m => m.referencia === item.mueble.referencia);
      if (!realMueble || realMueble.stock < item.cantidad) {
        alert(`Ooops. El producto ${item.mueble.nombre} ya no tiene suficiente disponibilidad. Stock: ${realMueble?.stock || 0}. Ajuste su carrito.`);
        return;
      }
    }

    setView('checkout');
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCliente || carrito.length === 0) return;

    // Generate simulated order
    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaActual = '2026-06-18'; // Matches context date

    const itemPedidos = carrito.map(item => ({
      referencia: item.mueble.referencia,
      nombre: item.mueble.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.mueble.precio,
      total: item.mueble.precio * item.cantidad,
      tipo: item.mueble.tipo
    }));

    const description = `Pedido de ${carrito.map(i => `${i.cantidad}x ${i.mueble.nombre}`).join(', ')}`;

    const nuevoPedido: Pedido = {
      id: orderNum,
      fecha: fechaActual,
      clienteId: currentCliente.id,
      clienteNombre: currentCliente.nombreCompleto,
      ciudad: currentCliente.ciudadResidencia,
      items: itemPedidos,
      valorTotal: total,
      formaPago: paymentMethod,
      descripcionCompra: description
    };

    // Decrement stock in state
    const updatedMuebles = muebles.map(m => {
      const cartItem = carrito.find(item => item.mueble.referencia === m.referencia);
      if (cartItem) {
        return {
          ...m,
          stock: Math.max(0, m.stock - cartItem.cantidad)
        };
      }
      return m;
    });

    setMuebles(updatedMuebles);
    setPedidos([nuevoPedido, ...pedidos]);
    setLastPlacedOrder(nuevoPedido);
    setCarrito([]);
    setView('success');
  };

  // Helper formatting for currency
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-[#fdfcf7] min-h-screen text-slate-800 font-sans pb-16">
      
      {/* Banner / Hero */}
      {view === 'store' && (
        <div className="relative h-72 md:h-96 w-full flex items-center justify-center overflow-hidden bg-stone-900">
          <img 
            src={BANNER_IMAGE} 
            alt="Muebles los Alpes Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl" id="hero-banner-text">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-amber-50 font-bold mb-3 tracking-wide">
              Muebles los Alpes
            </h1>
            <p className="text-amber-100 text-sm md:text-lg lg:text-xl font-light tracking-wide max-w-xl mx-auto">
              Diseños exclusivos, elegantes y justos a la necesidad del mercado. Muebles de calidad sublime para el interior y exterior de su hogar.
            </p>
          </div>
        </div>
      )}

      {/* Primary Actions & Info Dashboard Header */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-full text-amber-800">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-800">Portal E-commerce</h2>
              <p className="text-xs text-stone-500">Muebles de Interior & Aluminio Fundido para Exterior</p>
            </div>
          </div>

          {/* User profile toggle */}
          <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-xl">
            {currentCliente ? (
              <div className="flex items-center gap-3 px-1">
                <div className="text-right">
                  <p className="text-xs text-stone-500">Sesión iniciada
                    {currentCliente.isJuridica && <span className="ml-1 bg-amber-800 text-amber-50 text-[10px] px-1.5 py-0.5 rounded">JURÍDICA</span>}
                  </p>
                  <p className="text-sm font-semibold text-stone-800">{currentCliente.nombreCompleto}</p>
                </div>
                <button 
                  onClick={() => setView('profile')}
                  className="bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs px-3 py-1.5 transition font-medium"
                >
                  Mi Perfil
                </button>
                <button 
                  onClick={() => setView('purchases')}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs px-3 py-1.5 transition"
                >
                  Mis Compras
                </button>
                <button
                  onClick={() => {
                    setCurrentCliente(null);
                    setCarrito([]);
                  }}
                  className="text-xs text-red-600 hover:underline px-1 font-semibold"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600 font-light pl-2">Para comprar se requiere registro:</span>
                <button 
                  onClick={() => setView('profile')}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                >
                  <LogIn size={14} />
                  Ingresar o Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* ==================== 1. CATALOGUE VIEW ==================== */}
        {view === 'store' && (
          <div>
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por referencia, nombre..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm focus:outline-none focus:border-amber-600 transition"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-widest pl-2">Filtrar:</span>
                
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  {(['Todos', 'Interior', 'Exterior'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        filterType === t 
                          ? 'bg-amber-800 text-white shadow-xs' 
                          : 'text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 focus:outline-none focus:border-amber-600"
                >
                  <option value="Todos">Material: Todos</option>
                  {materials.filter(m => m !== 'Todos').map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* View Cart button */}
              <button
                onClick={() => setView('cart')}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-semibold text-xs px-4 py-2.5 rounded-xl ml-auto flex items-center gap-2 transition"
              >
                <ShoppingBag size={16} />
                <span>Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})</span>
                {subtotal > 0 && <span className="font-mono bg-amber-800 text-amber-50 text-[10px] px-1.5 py-0.5 rounded-full">{formatCOP(subtotal)}</span>}
              </button>
            </div>

            {/* Product count */}
            <p className="text-xs text-stone-500 mb-4 font-mono">
              Mostrando {filteredMuebles.length} de {muebles.length} diseños de alta gama
            </p>

            {/* List products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMuebles.map((mueble) => (
                <div 
                  key={mueble.referencia}
                  className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 duration-300 flex flex-col group h-full"
                  id={`mueble-card-${mueble.referencia}`}
                >
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img 
                      src={mueble.foto} 
                      alt={mueble.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] uppercase tracking-widest font-bold font-serif text-stone-800 py-1 px-3 rounded-full shadow-xs">
                      {mueble.tipo}
                    </div>
                    {mueble.stock === 0 ? (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-600 text-stone-50 text-xs font-bold px-4 py-2 rounded-xl tracking-wider">AGOTADO</span>
                      </div>
                    ) : mueble.stock <= 2 ? (
                      <div className="absolute bottom-3 left-3 bg-red-100/95 text-red-800 text-[10px] font-bold py-1 px-2.5 rounded-md shadow-xs border border-red-200">
                        ¡ÚLTIMAS {mueble.stock} UNIDADES!
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md uppercase">
                          REF: {mueble.referencia}
                        </span>
                        <span className="text-xs text-stone-500 border border-stone-200 rounded-md px-1.5 py-0.2 select-none">
                          {mueble.material}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-lg font-bold text-stone-900 mb-1 group-hover:text-amber-950 transition-colors">
                        {mueble.nombre}
                      </h3>
                      
                      <p className="text-xs text-stone-600 line-clamp-3 font-light mb-4 leading-relaxed">
                        {mueble.descripcion || 'Sin descripción detallada disponible.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between border-t border-stone-100 pt-3.5 mb-3.5">
                        <span className="text-xs text-stone-400 uppercase tracking-wider font-light">Precio COP:</span>
                        <span className="text-lg font-serif font-black text-amber-900">
                          {formatCOP(mueble.precio)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMueble(mueble);
                            setView('detail');
                          }}
                          className="flex-1 bg-stone-100 group-hover:bg-amber-50 text-stone-700 hover:text-amber-900 text-xs font-semibold py-3.5 rounded-2xl transition border border-transparent hover:border-amber-200 flex items-center justify-center gap-1.5"
                        >
                          <Info size={14} />
                          Ver detalles
                        </button>
                        {mueble.stock > 0 && (
                          <button
                            onClick={() => handleAddToCart(mueble, 1)}
                            className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-semibold py-3.5 px-3.5 rounded-2xl transition shadow-xs"
                            title="Agregar rápido"
                          >
                            + Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMuebles.length === 0 && (
              <div className="bg-white p-16 rounded-3xl border border-stone-200 text-center" id="catalog-empty-view">
                <p className="text-stone-400 mb-2 font-serif text-lg italic">No se encontraron muebles que coincidan con los filtros seleccionados.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('Todos');
                    setFilterMaterial('Todos');
                  }}
                  className="text-xs text-amber-800 hover:underline font-bold"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. DETAILED MUEBLE VIEW ==================== */}
        {view === 'detail' && selectedMueble && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm" id="furniture-detailed-screen">
            <button 
              onClick={() => setView('store')}
              className="mb-6 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 uppercase tracking-widest pl-1"
            >
              <ArrowLeft size={16} />
              Volver al Catálogo
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image side */}
              <div className="lg:col-span-5 aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 h-fit">
                <img 
                  src={selectedMueble.foto} 
                  alt={selectedMueble.nombre} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Data specs side */}
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-amber-100 text-amber-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    {selectedMueble.tipo}
                  </span>
                  <span className="bg-stone-100 text-stone-600 text-[10px] font-mono px-3 py-1 rounded-full border border-stone-200">
                    SENA MODEL - REF: {selectedMueble.referencia}
                  </span>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-black text-stone-900 mb-3 leading-tight">
                  {selectedMueble.nombre}
                </h2>

                <p className="text-sm font-light text-stone-600 mb-6 leading-relaxed">
                  {selectedMueble.descripcion}
                </p>

                {/* Specs list block */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/60 mb-6 col-span-1">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4 border-b border-stone-200 pb-2">Especificaciones Técnicas</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-stone-700">
                    <div>
                      <p className="text-stone-400 font-normal mb-0.5">Material de Fabricación:</p>
                      <p className="font-serif">{selectedMueble.material}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-normal mb-0.5">Color / Terminado:</p>
                      <p>{selectedMueble.color}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-normal mb-0.5">Dimensiones (Alto x Ancho x Profundidad):</p>
                      <p className="font-mono text-[11px]">{selectedMueble.dimensiones}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-normal mb-0.5">Peso Unitario:</p>
                      <p className="font-mono">{selectedMueble.peso >= 1000 ? `${(selectedMueble.peso / 1000).toFixed(1)} kg` : `${selectedMueble.peso} g`}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-y border-stone-100 py-4 mb-6">
                  <div>
                    <span className="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider font-light">Precio Venta (COP)</span>
                    <span className="text-2xl font-serif text-amber-900 font-black">{formatCOP(selectedMueble.precio)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider font-light">Disponibilidad</span>
                    {selectedMueble.stock > 0 ? (
                      <span className="bg-emerald-100 font-mono text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {selectedMueble.stock} unidades en stock
                      </span>
                    ) : (
                      <span className="bg-red-100 font-mono text-red-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        Sin existencia / Agotado
                      </span>
                    )}
                  </div>
                </div>

                {/* Add control */}
                {selectedMueble.stock > 0 ? (
                  <div className="bg-stone-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold pl-2 text-stone-600">Comprar unidades:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAddToCart(selectedMueble, 1)}
                        className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-semibold px-6 py-3 rounded-xl transition shadow-sm"
                      >
                        Compilar al Carrito
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center text-xs font-semibold text-red-800">
                    No se pueden realizar pedidos. Inventario agotado para esta referencia de mueble.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. SHOPPING CART VIEW ==================== */}
        {view === 'cart' && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm" id="shopping-cart-screen">
            <button 
              onClick={() => setView('store')}
              className="mb-6 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 uppercase tracking-widest pl-1"
            >
              <ArrowLeft size={16} />
              Volver a la Tienda
            </button>

            <h2 className="font-serif text-2xl font-black text-stone-900 mb-6">Su Carrito de Compras</h2>

            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-400 italic font-serif text-lg mb-4">No tiene elementos agregados al carrito de compras.</p>
                <button
                  onClick={() => setView('store')}
                  className="bg-stone-800 hover:bg-stone-950 text-stone-50 text-xs font-semibold px-6 py-3 rounded-xl transition"
                >
                  Explorar Catálogo de Muebles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cart list */}
                <div className="lg:col-span-8 space-y-4">
                  {carrito.map((item) => (
                    <div 
                      key={item.mueble.referencia}
                      className="border border-stone-200 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-200 transition bg-stone-50/50"
                    >
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 shrink-0">
                        <img 
                          src={item.mueble.foto} 
                          alt={item.mueble.nombre} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                          REF: {item.mueble.referencia} • {item.mueble.tipo}
                        </span>
                        <h4 className="font-serif text-[15px] font-bold text-stone-900 leading-tight">
                          {item.mueble.nombre}
                        </h4>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">
                          U. Cost: {formatCOP(item.mueble.precio)}
                        </p>
                      </div>

                      {/* Quantity adjuster */}
                      <div className="flex items-center gap-2 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 shrink-0">
                        <button 
                          onClick={() => handleUpdateCartQty(item.mueble.referencia, item.cantidad - 1)}
                          className="text-stone-500 hover:text-stone-800 font-bold px-1.5"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm w-6 text-center font-bold text-stone-800">
                          {item.cantidad}
                        </span>
                        <button 
                          onClick={() => handleUpdateCartQty(item.mueble.referencia, item.cantidad + 1)}
                          className="text-stone-500 hover:text-stone-800 font-bold px-1.5"
                        >
                          +
                        </button>
                      </div>

                      {/* Row total */}
                      <div className="text-right shrink-0 min-w-[100px]">
                        <p className="text-xs text-stone-400 font-light">Subtotal</p>
                        <p className="font-serif text-sm font-black text-amber-900">
                          {formatCOP(item.mueble.precio * item.cantidad)}
                        </p>
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => handleRemoveFromCart(item.mueble.referencia)}
                        className="text-stone-400 hover:text-red-600 rounded-lg p-2 hover:bg-red-50 transition shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 bg-stone-100 p-4 rounded-2xl border border-stone-200">
                    <Truck size={20} className="text-amber-800 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-800">¡Envío gratis a nivel nacional!</p>
                      <p className="text-[10px] text-stone-500 leading-relaxed">Sujeto a cobertura urbana de Muebles los Alpes (San Gil, Bogotá, Bucaramanga, Cali, Medellín, etc.).</p>
                    </div>
                  </div>
                </div>

                {/* Summary side */}
                <div className="lg:col-span-4 bg-stone-50 border border-stone-200 rounded-2xl p-6 h-fit h-full">
                  <h3 className="font-serif font-bold text-lg text-stone-850 mb-4 border-b border-stone-200 pb-2">
                    Resumen del Pedido
                  </h3>

                  <div className="space-y-3 text-xs text-stone-600 font-medium mb-6">
                    <div className="flex justify-between">
                      <span className="font-light">Subtotal muebles:</span>
                      <span className="font-mono text-stone-900">{formatCOP(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span className="font-light">Costo de envío:</span>
                      <span className="font-mono uppercase text-[10px] bg-green-100 px-1.5 rounded py-0.5">Gratis</span>
                    </div>
                    <div className="border-t border-stone-200 pt-3 flex justify-between text-sm font-serif font-bold text-stone-900">
                      <span>Total Neto (COP):</span>
                      <span className="text-lg font-black text-amber-900">{formatCOP(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleProcessCheckout}
                      className="w-full bg-amber-850 hover:bg-amber-950 text-amber-50 text-xs font-bold py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <CheckCircle size={16} />
                      Proceder a Efectuar Compra
                    </button>
                    
                    <button
                      onClick={() => setView('store')}
                      className="w-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold py-3.5 rounded-xl transition uppercase tracking-wider"
                    >
                      Continuar Comprando
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. AUTENTICACIÓN / REGISTRO CLIENTE DRAWER ==================== */}
        {view === 'profile' && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto" id="registration-login-portal">
            <button 
              onClick={() => setView('store')}
              className="mb-6 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 uppercase tracking-widest"
            >
              <ArrowLeft size={16} />
              Volver a la Tienda
            </button>

            <h2 className="font-serif text-2xl font-black text-stone-900 mb-2">
              {currentCliente ? 'Mi Perfil de Cliente' : 'Registro y Acceso de Clientes'}
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Para formalizar pedidos en el portal de Muebles los Alpes, requiere estar registrado y activo en el sistema.
            </p>

            {/* If logged in - Edit Profile profile form */}
            {currentCliente ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Nombre Completo (*)</label>
                    <input 
                      type="text"
                      value={currentCliente.nombreCompleto}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, nombreCompleto: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Email (*)</label>
                    <input 
                      type="email"
                      value={currentCliente.email}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Dirección (*)</label>
                    <input 
                      type="text"
                      value={currentCliente.direccion}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Ciudad (*)</label>
                    <input 
                      type="text"
                      value={currentCliente.ciudadResidencia}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, ciudadResidencia: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Teléfono Residencia (*)</label>
                    <input 
                      type="text"
                      value={currentCliente.telefonoResidencia}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, telefonoResidencia: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Teléfono Celular</label>
                    <input 
                      type="text"
                      value={currentCliente.telefonoCelular}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, telefonoCelular: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Profesión / Ocupación</label>
                    <input 
                      type="text"
                      value={currentCliente.profesion}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, profesion: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">NIT {currentCliente.isJuridica && '(*)'}</label>
                    <input 
                      type="text"
                      disabled={!currentCliente.isJuridica}
                      value={currentCliente.nit || ''}
                      onChange={(e) => setCurrentCliente({ ...currentCliente, nit: e.target.value })}
                      placeholder="Identificación tributaria..."
                      className="w-full px-3 py-2 bg-stone-100 disabled:opacity-50 border border-stone-200 rounded-xl text-stone-800 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    className="bg-amber-850 hover:bg-amber-950 text-amber-50 text-xs font-bold px-6 py-3 rounded-xl transition"
                  >
                    Guardar Cambios de Perfil
                  </button>
                </div>
              </form>
            ) : (
              /* If Anonymous - Switch either register or quick login */
              <div className="space-y-8">
                {/* Auto select / Log in */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3 block">Acceso Rápido (Seleccione un Cliente Registrado)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleSelectClient(c.id);
                          setView('store');
                        }}
                        className="text-left bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs p-3.5 rounded-xl transition flex items-center gap-3 group"
                      >
                        <div className="bg-stone-100 group-hover:bg-amber-50 p-2 rounded-lg text-stone-500 group-hover:text-amber-800">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-stone-900">{c.nombreCompleto}</p>
                          <p className="text-[10px] text-stone-500 font-mono">Doc: {c.numeroDocumento} • {c.ciudadResidencia}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switcher to register brand-new client form */}
                <div className="text-center">
                  {!showRegForm ? (
                    <div>
                      <p className="text-sm text-stone-500 mb-2">¿Es su primera vez adquiriendo mobiliario en Muebles los Alpes?</p>
                      <button
                        onClick={() => setShowRegForm(true)}
                        className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold px-6 py-3.5 rounded-xl transition"
                      >
                        Registrar Nuevo Cliente
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-stone-150 p-6 rounded-2xl text-left border border-amber-100 bg-amber-50/10">
                      <h3 className="font-serif font-bold text-lg text-amber-950 mb-4 border-b border-amber-100 pb-2">Planilla de Registro de Cliente</h3>
                      
                      {regError && (
                        <div className="p-3 mb-4 bg-red-100 text-red-800 text-xs rounded-xl border border-red-200">
                          {regError}
                        </div>
                      )}

                      <form onSubmit={handleRegisterClient} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Tipo de Cliente:</label>
                            <div className="flex gap-4">
                              <label className="inline-flex items-center text-xs">
                                <input 
                                  type="radio" 
                                  checked={!newClient.isJuridica} 
                                  onChange={() => setNewClient({ ...newClient, isJuridica: false, tipoDocumento: 'Cédula de Cédula de Ciudadanía' })}
                                  className="mr-1.5 focus:ring-amber-500 h-4 w-4"
                                />
                                Persona Natural
                              </label>
                              <label className="inline-flex items-center text-xs">
                                <input 
                                  type="radio" 
                                  checked={newClient.isJuridica} 
                                  onChange={() => setNewClient({ ...newClient, isJuridica: true, tipoDocumento: 'NIT' })}
                                  className="mr-1.5 focus:ring-amber-500 h-4 w-4"
                                />
                                Persona Jurídica / Empresa
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Tipo de Documento (*)</label>
                            <select
                              value={newClient.tipoDocumento}
                              onChange={(e) => setNewClient({ ...newClient, tipoDocumento: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            >
                              {!newClient.isJuridica ? (
                                <>
                                  <option value="Cédula de Cédula de Ciudadanía">Cédula de Ciudadanía (CC)</option>
                                  <option value="Cédula de Extranjería">Cédula de Extranjería (CE)</option>
                                  <option value="Pasaporte">Pasaporte</option>
                                </>
                              ) : (
                                <option value="NIT">NIT (Número de Identificación Tributaria)</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Número Documento (*)</label>
                            <input 
                              type="text"
                              value={newClient.numeroDocumento}
                              onChange={(e) => setNewClient({ ...newClient, numeroDocumento: e.target.value })}
                              required
                              placeholder="Ej: 1020456789"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Nombre Completo o Razón Social (*)</label>
                            <input 
                              type="text"
                              value={newClient.nombreCompleto}
                              onChange={(e) => setNewClient({ ...newClient, nombreCompleto: e.target.value })}
                              required
                              placeholder="Ej: Diana Ospina o Comercializadora S.A.S."
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Teléfono Residencia (*)</label>
                            <input 
                              type="text"
                              value={newClient.telefonoResidencia}
                              onChange={(e) => setNewClient({ ...newClient, telefonoResidencia: e.target.value })}
                              required
                              placeholder="Ej: 6013234567"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Teléfono Celular</label>
                            <input 
                              type="text"
                              value={newClient.telefonoCelular}
                              onChange={(e) => setNewClient({ ...newClient, telefonoCelular: e.target.value })}
                              placeholder="Ej: 3157894561"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Dirección (*)</label>
                            <input 
                              type="text"
                              value={newClient.direccion}
                              onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                              required
                              placeholder="Ej: Carrera 15 # 85-12"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Ciudad Residencia (*)</label>
                            <input 
                              type="text"
                              value={newClient.ciudadResidencia}
                              onChange={(e) => setNewClient({ ...newClient, ciudadResidencia: e.target.value })}
                              required
                              placeholder="Ej: San Gil"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Departamento (*)</label>
                            <input 
                              type="text"
                              value={newClient.departamento}
                              onChange={(e) => setNewClient({ ...newClient, departamento: e.target.value })}
                              required
                              placeholder="Ej: Santander"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Profesión</label>
                            <input 
                              type="text"
                              value={newClient.profesion}
                              onChange={(e) => setNewClient({ ...newClient, profesion: e.target.value })}
                              placeholder="Ej: Comerciante, Diseñador..."
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Email (*)</label>
                            <input 
                              type="email"
                              value={newClient.email}
                              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                              required
                              placeholder="Ej: info@cliente.com"
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          {newClient.isJuridica && (
                            <div>
                              <label className="text-xs font-semibold text-stone-500 block mb-1">Número de NIT (*)</label>
                              <input 
                                type="text"
                                value={newClient.nit}
                                onChange={(e) => setNewClient({ ...newClient, nit: e.target.value })}
                                required
                                placeholder="Ej: 900.123.456-1"
                                className="w-full px-3 py-2 bg-white border border-stone-200 border-amber-300 rounded-xl text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end pt-4 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setShowRegForm(false)}
                            className="bg-stone-200 text-stone-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold px-6 py-2.5 rounded-xl transition"
                          >
                            Registrarse e Iniciar Sesión
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 5. CHECKOUT SUMMARY & SIMULATED PAYMENTS ==================== */}
        {view === 'checkout' && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm" id="checkout-payment-screen">
            <button 
              onClick={() => setView('cart')}
              className="mb-6 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 uppercase tracking-widest pl-1"
            >
              <ArrowLeft size={16} />
              Volver al Carrito
            </button>

            <h2 className="font-serif text-2xl font-black text-stone-950 mb-2">Formalizar Pedido y Checkout</h2>
            <p className="text-xs text-stone-500 mb-6">Muebles los Alpes procesa su solicitud simulando conexión bancaria local de manera segura.</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product recap */}
              <div className="lg:col-span-4 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h3 className="font-serif text-sm font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">Recibo de Compra</h3>
                
                <div className="space-y-3 mb-6">
                  {carrito.map((item) => (
                    <div key={item.mueble.referencia} className="flex justify-between text-xs text-stone-600 font-medium">
                      <span>{item.cantidad}x {item.mueble.nombre}</span>
                      <span className="font-mono text-stone-900">{formatCOP(item.mueble.precio * item.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-serif font-bold text-stone-900">
                  <span>VALOR TOTAL (COP):</span>
                  <span className="text-lg font-black text-amber-900">{formatCOP(total)}</span>
                </div>

                {/* Delivery info */}
                <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500 space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-stone-400" />
                    <span>Entregar en: <strong className="text-stone-800">{currentCliente?.direccion}</strong></span>
                  </div>
                  <div className="pl-4">
                    <span>{currentCliente?.ciudadResidencia}, {currentCliente?.departamento}</span>
                  </div>
                </div>
              </div>

              {/* Payment selection & processing (Matches SENA wireframes) */}
              <div className="lg:col-span-8">
                {/* Simulated Bank header */}
                <div className="bg-amber-800/10 text-amber-900 border border-amber-800/20 px-4 py-3 rounded-2xl text-xs font-medium mb-6 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-800" />
                  <span><strong>Asulado de Pasarela</strong> • Para el proyecto no se va a realizar conexión con la entidad bancaria, se asumirá que los datos ingresados son correctos.</span>
                </div>

                <form onSubmit={handleCompletePayment} className="space-y-6">
                  {/* Step 1: Select payment organization */}
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-1.5 mb-3">
                      1. Seleccione la entidad con la que realizará su pago:
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                      {(['Tarjeta de Crédito', 'Cuenta Corriente', 'Cuenta de Ahorros / PSE'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center transition ${
                            paymentMethod === method 
                              ? 'border-amber-700 bg-amber-50/20 text-amber-900 font-bold shadow-xs' 
                              : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          <CreditCard size={20} className={paymentMethod === method ? 'text-amber-800' : 'text-stone-400'} />
                          <span className="text-[10px] mt-1.5">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Payment details form fields based on SENA structure */}
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-1.5 mb-3">
                      2. Ingrese los detalles de su transacción:
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/60 p-5 rounded-2xl border border-stone-200">
                      {paymentMethod === 'Tarjeta de Crédito' ? (
                        <>
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Nombre Tarjetahabiente (*)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej: Camila Restrepo"
                              value={paymentInfo.nombreTarjeta}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, nombreTarjeta: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            />
                          </div>

                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Número de la Tarjeta (*)</label>
                            <input 
                              type="text" 
                              required
                              maxLength={16}
                              placeholder="4111 2222 3333 4444"
                              value={paymentInfo.numeroTarjeta}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, numeroTarjeta: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Vencimiento (*)</label>
                            <div className="flex gap-2">
                              <select 
                                value={paymentInfo.tarjetaMes}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, tarjetaMes: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono text-xs"
                              >
                                {Array.from({ length: 12 }).map((_, i) => {
                                  const val = String(i + 1).padStart(2, '0');
                                  return <option key={val} value={val}>{val}</option>;
                                })}
                              </select>
                              <select
                                value={paymentInfo.tarjetaAnio}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, tarjetaAnio: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono text-xs"
                              >
                                {['2026', '2027', '2028', '2029', '2030'].map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-600 block mb-1">Código Seguridad (CVC) (*)</label>
                            <input 
                              type="password" 
                              required
                              maxLength={3}
                              placeholder="***"
                              value={paymentInfo.codigoSeguridad}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, codigoSeguridad: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-600 block mb-1">Cuotas Diferidas</label>
                            <select
                              value={paymentInfo.cuotas}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, cuotas: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono text-xs"
                            >
                              <option value="1">1 pago (Contado)</option>
                              <option value="3">3 pagos mensuales</option>
                              <option value="6">6 pagos mensuales</option>
                              <option value="12">12 pagos mensuales</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        // PSE or Direct bank transfers (Page 7 SENA)
                        <>
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Banco Transmisor (*)</label>
                            <select
                              value={paymentInfo.bancoPSE}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, bancoPSE: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                            >
                              <option value="Bancolombia">Bancolombia</option>
                              <option value="Banco de Bogotá">Banco de Bogotá</option>
                              <option value="Davivienda">Davivienda</option>
                              <option value="BBVA Colombia">BBVA Colombia</option>
                              <option value="Banco de Occidente">Banco de Occidente</option>
                              <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                            </select>
                          </div>

                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-semibold text-stone-500 block mb-1">Número de Cuenta Bancaria (*)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej: 0023-4567-8901"
                              value={paymentInfo.numeroCuenta}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, numeroCuenta: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-mono"
                            />
                          </div>

                          <div className="col-span-2">
                            <p className="text-[11px] text-stone-500 font-light">Se debitarán {formatCOP(total)} directamente del saldo de esta cuenta bancaria al presionar el botón "Pagar". Un mensaje de confirmación será enviado a {currentCliente?.email}.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setView('cart')}
                      className="bg-stone-100 hover:bg-stone-250 text-stone-600 font-semibold text-xs px-5 py-3 rounded-xl transition"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-850 hover:bg-amber-950 text-amber-50 text-xs font-bold px-8 py-3.5 rounded-xl transition tracking-wide uppercase"
                    >
                      PAGAR {formatCOP(total)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 6. SUCCESS CHECKOUT POPUP / RECEIPT (Page 7 SENA) ==================== */}
        {view === 'success' && lastPlacedOrder && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm text-center max-w-2xl mx-auto" id="checkout-success-receipt">
            <div className="bg-green-100 p-4 rounded-full text-green-800 w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-green-200">
              <CheckCircle size={32} />
            </div>

            <h2 className="font-serif text-3xl font-bold text-stone-900 mb-1">¡Compra Exitosa!</h2>
            <p className="text-xs text-stone-500 mb-6">El pedido de mobiliario fue formalizado de manera correcta</p>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-250/50 text-left mb-6 space-y-3 font-medium">
              <div className="flex justify-between border-b border-stone-200 pb-2 text-xs">
                <span className="text-stone-400">NÚMERO DE ORDEN (REF):</span>
                <span className="font-mono text-amber-900 font-black">{lastPlacedOrder.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Cliente Adquiriente:</span>
                <span className="text-stone-850">{lastPlacedOrder.clienteNombre}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Ciudad de Despacho:</span>
                <span className="text-stone-850">{lastPlacedOrder.ciudad}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Método Pago Empleado:</span>
                <span className="text-stone-850">{lastPlacedOrder.formaPago}</span>
              </div>
              
              <div className="border-t border-stone-200 pt-3 text-xs text-stone-605">
                <p className="font-semibold text-stone-900 mb-1">Muebles solicitados:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {lastPlacedOrder.items.map((it, idx) => (
                    <li key={idx}>
                      {it.cantidad} unidad(es) de "{it.nombre}" ({it.tipo}) — {formatCOP(it.total)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-stone-250 text-right text-sm">
                <span className="text-stone-400 text-xs mr-2">Costo Neto debitado:</span>
                <span className="font-serif font-bold text-amber-900 text-base">{formatCOP(lastPlacedOrder.valorTotal)}</span>
              </div>
            </div>

            {/* Simulated Emitted Email Receipt box */}
            <div className="bg-amber-50/30 border border-amber-200/50 p-4 rounded-xl text-left text-xs mb-6 text-stone-600">
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-amber-100">
                <Mail size={14} className="text-amber-800" />
                <span className="font-semibold text-amber-900">NOTIFICACIÓN POR CORREO EMITIDA TRAS COMPRA:</span>
              </div>
              <p className="mb-1"><strong>Para:</strong> {currentCliente?.email}</p>
              <p className="mb-2"><strong>Asunto:</strong> Confirmación de Pedido {lastPlacedOrder.id} - Muebles los Alpes</p>
              <p className="italic font-light leading-relaxed">
                "Estimado(a) {currentCliente?.nombreCompleto}, le agradecemos su compra de mobiliario exclusivo muebles para interior y exterior. Hemos registrado el número de orden {lastPlacedOrder.id} por valor de {formatCOP(lastPlacedOrder.valorTotal)}. Su mercancía está siendo empaquetada de manera segura para ser transportada a {currentCliente?.direccion}, {currentCliente?.ciudadResidencia}."
              </p>
            </div>

            <button
              onClick={() => {
                setView('store');
                setLastPlacedOrder(null);
              }}
              className="bg-stone-800 hover:bg-stone-950 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition"
            >
              Volver a la Tienda Principal
            </button>
          </div>
        )}

        {/* ==================== 7. PERSONAL PURCHASES LIST VIEW ==================== */}
        {view === 'purchases' && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm" id="customer-personal-orders">
            <button 
              onClick={() => setView('store')}
              className="mb-6 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 uppercase tracking-widest pl-1"
            >
              <ArrowLeft size={16} />
              Volver a la Tienda
            </button>

            <h2 className="font-serif text-2xl font-black text-stone-900 mb-2">Mi Historial de Compras</h2>
            <p className="text-xs text-stone-500 mb-6">Detalle de pedidos realizados en línea en Muebles los Alpes por su usuario</p>

            {pedidos.filter(p => p.clienteId === currentCliente?.id).length === 0 ? (
              <div className="text-center py-10 italic text-stone-400 font-serif">
                Aún no ha efectuado ninguna compra en el portal.
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.filter(p => p.clienteId === currentCliente?.id).map((order) => (
                  <div key={order.id} className="border border-stone-200 rounded-2xl p-5 hover:border-amber-200 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 mb-3">
                      <div>
                        <span className="font-mono text-amber-900 font-bold block text-sm">Nº Orden: {order.id}</span>
                        <span className="text-[10px] text-stone-500">Fecha: {order.fecha}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block font-light">Pago por: {order.formaPago}</span>
                        <span className="font-serif font-bold text-stone-950">{formatCOP(order.valorTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between pl-4 border-l-2 border-amber-800">
                          <span className="text-stone-700">{it.cantidad}x {it.nombre} - Material: {it.tipo}</span>
                          <span className="font-mono font-medium text-stone-500">{formatCOP(it.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
