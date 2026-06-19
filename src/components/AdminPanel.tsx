import React, { useState } from 'react';
import { 
  Users, Package, TrendingUp, Plus, Edit3, Trash2, 
  Search, ShieldAlert, Key, HelpCircle, Check, Info, Save, DollarSign 
} from 'lucide-react';
import { Cliente, Mueble, Pedido, ItemPedido } from '../types';

interface AdminPanelProps {
  muebles: Mueble[];
  setMuebles: React.Dispatch<React.SetStateAction<Mueble[]>>;
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  pedidos: Pedido[];
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
  setCurrentCliente: (cliente: Cliente | null) => void;
}

export default function AdminPanel({
  muebles,
  setMuebles,
  clientes,
  setClientes,
  pedidos,
  setPedidos,
  setCurrentCliente
}: AdminPanelProps) {
  // Navigation: 'muebles' | 'clientes' | 'precios' | 'reportes'
  const [adminTab, setAdminTab] = useState<'muebles' | 'clientes' | 'precios' | 'reportes'>('muebles');

  // Client search/edit states
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientToEdit, setSelectedClientToEdit] = useState<Cliente | null>(null);
  const [showClientDeleteConfirm, setShowClientDeleteConfirm] = useState<string | null>(null);

  // Furniture states
  const [muebleSearch, setMuebleSearch] = useState('');
  const [selectedMuebleToEdit, setSelectedMuebleToEdit] = useState<Mueble | null>(null);
  const [selectedMuebleToView, setSelectedMuebleToView] = useState<Mueble | null>(null);
  const [showMuebleDeleteConfirm, setShowMuebleDeleteConfirm] = useState<string | null>(null);
  const [isCreatingMueble, setIsCreatingMueble] = useState(false);
  const [newMueble, setNewMueble] = useState<Mueble>({
    referencia: '',
    nombre: '',
    descripcion: '',
    tipo: 'Interior',
    material: 'Madera',
    dimensiones: 'Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm',
    alto: 140,
    ancho: 40,
    profundidad: 55,
    color: 'Natural',
    peso: 30000,
    foto: '',
    precio: 140000,
    stock: 2
  });
  const [muebleError, setMuebleError] = useState('');

  // Bulk Price and stock registry state
  const [bulkPrices, setBulkPrices] = useState<{ [ref: string]: { precio: number; stock: number } }>(
    muebles.reduce((acc, curr) => ({ ...acc, [curr.referencia]: { precio: curr.precio, stock: curr.stock } }), {})
  );

  // Reports state
  const [repType, setRepType] = useState<'ventas' | 'mas_vendido' | 'historial'>('ventas');
  const [repStartDate, setRepStartDate] = useState('2026-06-01');
  const [repEndDate, setRepEndDate] = useState('2026-06-30');
  const [repCity, setRepCity] = useState('Todas');
  const [repMuebleType, setRepMuebleType] = useState<'Todos' | 'Interior' | 'Exterior'>('Todos');
  const [repSelectedClient, setRepSelectedClient] = useState('');

  // Auto update bulk prices buffer when main muebles changes
  React.useEffect(() => {
    setBulkPrices(
      muebles.reduce((acc, curr) => ({ ...acc, [curr.referencia]: { precio: curr.precio, stock: curr.stock } }), {})
    );
  }, [muebles]);

  // General helpers
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // ==================== 1. CLIENTE ACTIONS ====================
  // Check if a client has purchases
  const clientHasPurchases = (clientId: string) => {
    return pedidos.some(p => p.clienteId === clientId);
  };

  // Filtered clients list
  const filteredClientes = clientes.filter(c => {
    const q = clientSearch.toLowerCase();
    return c.numeroDocumento.toLowerCase().includes(q) || 
           c.nombreCompleto.toLowerCase().includes(q) || 
           c.email.toLowerCase().includes(q);
  });

  // Handle client delete
  const handleDeleteClient = (clientId: string) => {
    if (clientHasPurchases(clientId)) {
      alert('RESTRICCIÓN: No es posible eliminar este cliente ya que cuenta con transacciones históricas registradas en el sistema.');
      setShowClientDeleteConfirm(null);
      return;
    }

    setClientes(clientes.filter(c => c.id !== clientId));
    alert('Cliente eliminado exitosamente del sistema.');
    setShowClientDeleteConfirm(null);
  };

  // Handle Save Client edit
  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientToEdit) return;

    // Validate fields
    if (!selectedClientToEdit.nombreCompleto || !selectedClientToEdit.direccion || !selectedClientToEdit.email) {
      alert('Los campos con asterisco (*) son obligatorios.');
      return;
    }

    setClientes(clientes.map(c => c.id === selectedClientToEdit.id ? selectedClientToEdit : c));
    alert('Datos del cliente actualizados exitosamente.');
    setSelectedClientToEdit(null);
  };

  // ==================== 2. MUEBLES ACTIONS ====================
  // Filtered muebles list
  const filteredMuebles = muebles.filter(m => {
    const q = muebleSearch.toLowerCase();
    return m.nombre.toLowerCase().includes(q) || 
           m.referencia.toLowerCase().includes(q) || 
           m.tipo.toLowerCase().includes(q);
  });

  // Check if mueble was purchased
  const muebleWasPurchased = (ref: string) => {
    return pedidos.some(p => p.items.some(item => item.referencia === ref));
  };

  // Delete mueble
  const handleDeleteMueble = (ref: string) => {
    if (muebleWasPurchased(ref)) {
      alert('RESTRICCIÓN DE SEGURIDAD: No se puede eliminar este mueble porque ha sido adquirido previamente por algún cliente en el historial.');
      setShowMuebleDeleteConfirm(null);
      return;
    }

    setMuebles(muebles.filter(m => m.referencia !== ref));
    alert('El mueble fue dado de baja exitosamente del catálogo.');
    setShowMuebleDeleteConfirm(null);
  };

  // Create furniture
  const handleCreateMueble = (e: React.FormEvent) => {
    e.preventDefault();
    setMuebleError('');

    if (!newMueble.referencia || !newMueble.nombre || !newMueble.material || !newMueble.color || !newMueble.peso) {
      setMuebleError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    // Check if reference is unique
    const dup = muebles.find(m => m.referencia.toUpperCase() === newMueble.referencia.toUpperCase());
    if (dup) {
      setMuebleError('El código de referencia ingresado ya existe en la base de datos.');
      return;
    }

    const created: Mueble = {
      ...newMueble,
      referencia: newMueble.referencia.toUpperCase(),
      foto: newMueble.foto || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
    };

    setMuebles([...muebles, created]);
    setIsCreatingMueble(false);
    alert('Nuevo mueble ingresado al catálogo correctamente.');
    // reset form
    setNewMueble({
      referencia: '',
      nombre: '',
      descripcion: '',
      tipo: 'Interior',
      material: 'Madera',
      dimensiones: 'Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm',
      alto: 140,
      ancho: 40,
      profundidad: 55,
      color: 'Natural',
      peso: 30000,
      foto: '',
      precio: 140000,
      stock: 2
    });
  };

  // Save furniture Edit
  const handleSaveMuebleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuebleToEdit) return;

    setMuebles(muebles.map(m => m.referencia === selectedMuebleToEdit.referencia ? selectedMuebleToEdit : m));
    alert('Mueble modificado con éxito.');
    setSelectedMuebleToEdit(null);
  };

  // ==================== 3. BULK PRICES ACTIONS ====================
  const handleSaveBulkPrices = () => {
    const updated = muebles.map(m => {
      const bFields = bulkPrices[m.referencia];
      if (bFields) {
        return {
          ...m,
          precio: Number(bFields.precio),
          stock: Number(bFields.stock)
        };
      }
      return m;
    });

    setMuebles(updated);
    alert('Registro de Precios y Existencias de Unidades guardado con éxito.');
  };

  // ==================== 4. REPORTS GENERATORS ====================
  const generationDateString = '2026-06-18 05:38:56'; // Context actual date

  // Cities extracted
  const cities = ['Todas', ...Array.from(new Set(pedidos.map(p => p.ciudad).filter(Boolean)))];

  // Report 1: Daily Sales lists
  const getDailySalesReportData = () => {
    // filter orders by dates and city
    const filteredOrders = pedidos.filter(p => {
      const matchCity = repCity === 'Todas' || p.ciudad === repCity;
      const matchDate = p.fecha >= repStartDate && p.fecha <= repEndDate;
      return matchCity && matchDate;
    });

    // aggregate items
    const interiorItems: { [ref: string]: { name: string; qty: number; unitCost: number; totalCost: number } } = {};
    const exteriorItems: { [ref: string]: { name: string; qty: number; unitCost: number; totalCost: number } } = {};

    filteredOrders.forEach(order => {
      order.items.forEach(it => {
        if (it.tipo === 'Interior') {
          if (interiorItems[it.referencia]) {
            interiorItems[it.referencia].qty += it.cantidad;
            interiorItems[it.referencia].totalCost += it.total;
          } else {
            interiorItems[it.referencia] = {
              name: it.nombre,
              qty: it.cantidad,
              unitCost: it.precioUnitario,
              totalCost: it.total
            };
          }
        } else {
          if (exteriorItems[it.referencia]) {
            exteriorItems[it.referencia].qty += it.cantidad;
            exteriorItems[it.referencia].totalCost += it.total;
          } else {
            exteriorItems[it.referencia] = {
              name: it.nombre,
              qty: it.cantidad,
              unitCost: it.precioUnitario,
              totalCost: it.total
            };
          }
        }
      });
    });

    const interiorList = Object.keys(interiorItems).map(ref => ({ ref, ...interiorItems[ref] }));
    const exteriorList = Object.keys(exteriorItems).map(ref => ({ ref, ...exteriorItems[ref] }));

    const sumInterior = interiorList.reduce((sum, item) => sum + item.totalCost, 0);
    const sumExterior = exteriorList.reduce((sum, item) => sum + item.totalCost, 0);

    return {
      interiorList,
      exteriorList,
      sumInterior,
      sumExterior,
      grandTotal: sumInterior + sumExterior,
      orderCount: filteredOrders.length
    };
  };

  // Report 2: Best Seller
  const getBestSellerReportData = () => {
    const filteredOrders = pedidos.filter(p => {
      const matchCity = repCity === 'Todas' || p.ciudad === repCity;
      const matchDate = p.fecha >= repStartDate && p.fecha <= repEndDate;
      return matchCity && matchDate;
    });

    const counts: { [ref: string]: { name: string; qty: number; type: string } } = {};
    filteredOrders.forEach(o => {
      o.items.forEach(it => {
        const matchType = repMuebleType === 'Todos' || it.tipo === repMuebleType;
        if (matchType) {
          if (counts[it.referencia]) {
            counts[it.referencia].qty += it.cantidad;
          } else {
            counts[it.referencia] = {
              name: it.nombre,
              qty: it.cantidad,
              type: it.tipo
            };
          }
        }
      });
    });

    const sorted = Object.keys(counts)
      .map(ref => ({ ref, ...counts[ref] }))
      .sort((a, b) => b.qty - a.qty);

    return sorted;
  };

  // Report 3: Customer History
  const getCustomerHistoryData = () => {
    if (!repSelectedClient) return [];
    
    return pedidos
      .filter(p => p.clienteId === repSelectedClient)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)); // sort date descending
  };

  const salesReport = getDailySalesReportData();
  const bestSellers = getBestSellerReportData();
  const customerHistory = getCustomerHistoryData();

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-slate-800 p-4 md:p-8">
      {/* Admin Title Block */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-stone-900 text-stone-100 p-2.5 rounded-full">
              <Key size={22} className="text-amber-300" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black text-stone-900 tracking-wide">Panel Administrativo</h1>
              <p className="text-xs text-stone-500 font-mono">Control de Inventario, Gestión de Clientes y Reportes Gerenciales</p>
            </div>
          </div>

          {/* Tab controllers */}
          <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1 mt-4 md:mt-0 shadow-sm">
            <button
              onClick={() => setAdminTab('muebles')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                adminTab === 'muebles' ? 'bg-white text-stone-900 shadow-xs border border-stone-200/50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package size={14} className="inline mr-1.5" />
              muebles
            </button>
            <button
              onClick={() => setAdminTab('clientes')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                adminTab === 'clientes' ? 'bg-white text-stone-900 shadow-xs border border-stone-200/50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users size={14} className="inline mr-1.5" />
              clientes
            </button>
            <button
              onClick={() => setAdminTab('precios')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                adminTab === 'precios' ? 'bg-white text-stone-900 shadow-xs border border-stone-200/50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <DollarSign size={14} className="inline mr-1.5" />
              Precios y Existencias
            </button>
            <button
              onClick={() => setAdminTab('reportes')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                adminTab === 'reportes' ? 'bg-white text-stone-900 shadow-xs border border-stone-200/50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp size={14} className="inline mr-1.5" />
              Analítica & Reportes
            </button>
          </div>
        </div>

        {/* ======================================================== TAB 1: MUEBLES (CRUD) ======================================================== */}
        {adminTab === 'muebles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-stone-400" size={17} />
                <input
                  type="text"
                  placeholder="Buscar mueble..."
                  value={muebleSearch}
                  onChange={(e) => setMuebleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedMuebleToEdit(null);
                  setIsCreatingMueble(true);
                }}
                className="bg-amber-850 hover:bg-amber-950 text-amber-50 text-xs font-bold px-5 py-3 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} />
                Registrar Nuevo Mueble
              </button>
            </div>

            {/* MAIN FURNITURE LIST TABLE */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                    <th className="py-3.5 px-6">Referencia</th>
                    <th className="py-3.5 px-6">Nombre del Mueble</th>
                    <th className="py-3.5 px-6">Tipo</th>
                    <th className="py-3.5 px-6">Material</th>
                    <th className="py-3.5 px-6">Dimensiones</th>
                    <th className="py-3.5 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredMuebles.map((m) => (
                    <tr key={m.referencia} className="hover:bg-stone-50/50 transition">
                      {/* Reference as details trigger */}
                      <td className="py-3.5 px-6 font-mono font-bold text-amber-900">
                        <button
                          onClick={() => setSelectedMuebleToView(m)}
                          className="hover:underline text-left cursor-pointer"
                        >
                          {m.referencia}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 font-serif font-bold text-stone-900">{m.nombre}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.tipo === 'Interior' ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-orange-50 text-orange-855 border border-orange-100'
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-stone-500">{m.material}</td>
                      <td className="py-3.5 px-6 font-mono text-stone-400 text-[11px] max-w-[200px] truncate" title={m.dimensiones}>
                        {m.dimensiones}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedMuebleToView(m)}
                          className="text-stone-500 hover:text-stone-800 p-1.5 hover:bg-stone-100 rounded-lg transition"
                          title="Ver Ficha Técnica"
                        >
                          <Info size={14} className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMuebleToEdit(m);
                            setIsCreatingMueble(false);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition"
                          title="Modificar"
                        >
                          <Edit3 size={14} className="inline" />
                        </button>
                        <button
                          onClick={() => setShowMuebleDeleteConfirm(m.referencia)}
                          className="text-red-500 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar de catálogo"
                        >
                          <Trash2 size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMuebles.length === 0 && (
                <div className="p-8 text-center text-stone-400 italic">No hay muebles registrados en el sistema.</div>
              )}
            </div>

            {/* SUB-PANEL: VIEW DETAILS MODAL */}
            {selectedMuebleToView && (
              <div className="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200">
                  <h3 className="font-serif font-bold text-xl text-stone-900 mb-4 pb-2 border-b">Ficha Técnica Integral</h3>
                  
                  <div className="space-y-3 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Referencia:</span>
                      <span className="font-mono font-bold text-stone-900">{selectedMuebleToView.referencia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Nombre del Mueble:</span>
                      <span className="font-serif font-black text-stone-900">{selectedMuebleToView.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Tipo / Enfoque:</span>
                      <span>{selectedMuebleToView.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Material Base:</span>
                      <span>{selectedMuebleToView.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Dimensión oficial:</span>
                      <span className="font-mono text-zinc-500">{selectedMuebleToView.dimensiones}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Color / Terminado:</span>
                      <span>{selectedMuebleToView.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Peso en gramos:</span>
                      <span className="font-mono">{selectedMuebleToView.peso}g ({selectedMuebleToView.peso / 1000} kg)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Precio actual COP:</span>
                      <span className="font-mono text-amber-900 font-bold">{formatCOP(selectedMuebleToView.precio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Existencias físicas:</span>
                      <span className="font-mono">{selectedMuebleToView.stock} unidades</span>
                    </div>
                    <div className="pt-2">
                      <span className="font-semibold text-stone-400 block mb-1">Descripción corta:</span>
                      <p className="bg-stone-50 p-2.5 rounded-lg border italic leading-relaxed text-[11px]">{selectedMuebleToView.descripcion || 'Sin descripción.'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMuebleToView(null)}
                    className="mt-6 w-full bg-stone-850 hover:bg-stone-950 text-stone-50 text-xs font-semibold py-3 rounded-xl transition"
                  >
                    Entendido / Cerrar Ficha
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PANEL: CREATE MUEBLE FORM */}
            {isCreatingMueble && (
              <div className="bg-white border border-stone-200 p-6 rounded-2xl">
                <h3 className="font-serif font-bold text-lg text-amber-950 mb-4 border-b pb-2">Registrar Nuevo Mueble en el Catálogo</h3>
                
                {muebleError && <div className="p-3 mb-4 bg-red-100 text-red-850 text-xs rounded-xl border border-red-200">{muebleError}</div>}
                
                <form onSubmit={handleCreateMueble} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-stone-550 block mb-1">Referencia Cod (Único) (*)</label>
                    <input
                      type="text" required placeholder="Ej: MESONAT001"
                      value={newMueble.referencia}
                      onChange={(e) => setNewMueble({ ...newMueble, referencia: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Nombre Comercial (*)</label>
                    <input
                      type="text" required placeholder="Ej: Mesa Ovalada estilo griego"
                      value={newMueble.nombre}
                      onChange={(e) => setNewMueble({ ...newMueble, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Tipo de Mobiliario (*)</label>
                    <select
                      value={newMueble.tipo}
                      onChange={(e) => setNewMueble({ ...newMueble, tipo: e.target.value as 'Interior' | 'Exterior' })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-normal"
                    >
                      <option value="Interior">Interior</option>
                      <option value="Exterior">Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Material Predominante (*)</label>
                    <input
                      type="text" required placeholder="Ej: Madera"
                      value={newMueble.material}
                      onChange={(e) => setNewMueble({ ...newMueble, material: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Dimensiones oficiales (*)</label>
                    <input
                      type="text" required placeholder="Alto: 140 cm, Ancho: 40 cm, Profundidad: 55 cm"
                      value={newMueble.dimensiones}
                      onChange={(e) => setNewMueble({ ...newMueble, dimensiones: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Color / Tonalidad (*)</label>
                    <input
                      type="text" required placeholder="Ej: Natural, Caoba..."
                      value={newMueble.color}
                      onChange={(e) => setNewMueble({ ...newMueble, color: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Peso Neto (Gramos) (*)</label>
                    <input
                      type="number" required placeholder="30000"
                      value={newMueble.peso || ''}
                      onChange={(e) => setNewMueble({ ...newMueble, peso: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Precio Unitario Sugerido (COP) (*)</label>
                    <input
                      type="number" required placeholder="140000"
                      value={newMueble.precio || ''}
                      onChange={(e) => setNewMueble({ ...newMueble, precio: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Stock de Arranque (*)</label>
                    <input
                      type="number" required placeholder="2"
                      value={newMueble.stock}
                      onChange={(e) => setNewMueble({ ...newMueble, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3">
                    <label className="text-stone-550 block mb-1">Foto Enlace URL (Opcional - Reemplazado por Dummy si queda vacío)</label>
                    <input
                      type="text" placeholder="https://ejemplo.com/fotografía.jpg"
                      value={newMueble.foto}
                      onChange={(e) => setNewMueble({ ...newMueble, foto: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-light"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3">
                    <label className="text-stone-550 block mb-1">Descripción detallada</label>
                    <textarea
                      placeholder="Mesa ovalada de comedor..."
                      value={newMueble.descripcion}
                      onChange={(e) => setNewMueble({ ...newMueble, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal"
                      rows={3}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreatingMueble(false)}
                      className="bg-stone-150 text-stone-600 font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-850 hover:bg-amber-950 text-white font-black px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      Ingresar Mueble
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-PANEL: EDIT MUEBLE FORM */}
            {selectedMuebleToEdit && (
              <div className="bg-white border-2 border-amber-200/80 p-6 rounded-2xl">
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-4 border-b pb-2">Modificar Atributos del Mueble REF: {selectedMuebleToEdit.referencia}</h3>
                
                <form onSubmit={handleSaveMuebleEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-stone-550 block mb-1">Nombre Comercial (*)</label>
                    <input
                      type="text" required
                      value={selectedMuebleToEdit.nombre}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Tipo de Mobiliario (*)</label>
                    <select
                      value={selectedMuebleToEdit.tipo}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, tipo: e.target.value as 'Interior' | 'Exterior' })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-normal"
                    >
                      <option value="Interior">Interior</option>
                      <option value="Exterior">Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Material Base (*)</label>
                    <input
                      type="text" required
                      value={selectedMuebleToEdit.material}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, material: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Dimensiones oficiales (*)</label>
                    <input
                      type="text" required
                      value={selectedMuebleToEdit.dimensiones}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, dimensiones: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Color / Tonalidad (*)</label>
                    <input
                      type="text" required
                      value={selectedMuebleToEdit.color}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, color: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Peso Neto (Gramos) (*)</label>
                    <input
                      type="number" required
                      value={selectedMuebleToEdit.peso || ''}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, peso: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3">
                    <label className="text-stone-550 block mb-1">Descripción detallada</label>
                    <textarea
                      value={selectedMuebleToEdit.descripcion}
                      onChange={(e) => setSelectedMuebleToEdit({ ...selectedMuebleToEdit, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal"
                      rows={3}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedMuebleToEdit(null)}
                      className="bg-stone-150 text-stone-600 font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-850 hover:bg-amber-950 text-white font-black px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      Guardar Modificaciones
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            {showMuebleDeleteConfirm && (
              <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border">
                  <ShieldAlert size={40} className="mx-auto text-red-600 mb-3" />
                  <h3 className="font-serif font-bold text-base mb-2">¿Confirmar baja de catálogo?</h3>
                  <p className="text-xs text-stone-500 mb-6">Esta acción eliminará de forma irreversible el mueble REF: <strong>{showMuebleDeleteConfirm}</strong> de la base de datos de Muebles los Alpes.</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMuebleDeleteConfirm(null)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold py-2.5 rounded-xl transition"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => handleDeleteMueble(showMuebleDeleteConfirm)}
                      className="flex-1 bg-red-650 hover:bg-red-800 text-stone-50 text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      Sí, Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== TAB 2: CLIENTES (SEARCH / DELETE) ======================================================== */}
        {adminTab === 'clientes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-stone-400" size={17} />
                <input
                  type="text"
                  placeholder="Buscar cliente por documento, nombre, email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div className="text-right text-xs text-stone-405 font-mono">
                Total de clientes en depósito: <strong>{clientes.length}</strong>
              </div>
            </div>

            {/* CLIENTS DATA TABLE (Search lists as requested) */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                    <th className="py-3.5 px-6">Tipo Doc</th>
                    <th className="py-3.5 px-6">Nº Documento</th>
                    <th className="py-3.5 px-6">Nombre Completo</th>
                    <th className="py-3.5 px-6">Correo Electrónico</th>
                    <th className="py-3.5 px-6">Teléfono Fijo</th>
                    <th className="py-3.5 px-6 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredClientes.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/55 transition">
                      <td className="py-3.5 px-6">
                        <span className="bg-stone-150 text-stone-700 px-2 py-0.5 rounded text-[10px] font-mono">
                          {c.tipoDocumento === 'NIT' ? 'NIT' : 'CC/CE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-bold text-stone-800">{c.numeroDocumento}</td>
                      <td className="py-3.5 px-6 font-semibold text-stone-900 flex items-center gap-2">
                        {c.nombreCompleto}
                        {c.isJuridica && <span className="bg-amber-800 text-amber-50 text-[9px] px-1 rounded uppercase tracking-wider">Jurídica</span>}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-light text-stone-600">{c.email}</td>
                      <td className="py-3.5 px-6 font-mono text-stone-400">{c.telefonoResidencia}</td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <button
                          onClick={() => setSelectedClientToEdit(c)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition inline-flex items-center"
                          title="Modificar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setShowClientDeleteConfirm(c.id)}
                          className="text-red-500 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition inline-flex items-center"
                          title="Remover de Base de Datos"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredClientes.length === 0 && (
                <div className="p-8 text-center text-stone-404 italic">No se hallaron clientes con el filtro ingresado.</div>
              )}
            </div>

            {/* EDIT CLIENT PANEL */}
            {selectedClientToEdit && (
              <div className="bg-white border-2 border-amber-250 p-6 rounded-2xl">
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-4 border-b pb-2">Modificar Ficha Cliente: <strong>{selectedClientToEdit.nombreCompleto}</strong></h3>
                
                <form onSubmit={handleSaveClientEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-stone-550 block mb-1">Nombre Completo / Razón Social (*)</label>
                    <input
                      type="text" required
                      value={selectedClientToEdit.nombreCompleto}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, nombreCompleto: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Dirección de Despacho (*)</label>
                    <input
                      type="text" required
                      value={selectedClientToEdit.direccion}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, direccion: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Correo Electrónico (*)</label>
                    <input
                      type="email" required
                      value={selectedClientToEdit.email}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, email: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Teléfono Residencia (*)</label>
                    <input
                      type="text" required
                      value={selectedClientToEdit.telefonoResidencia}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, telefonoResidencia: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Teléfono Celular móvil</label>
                    <input
                      type="text"
                      value={selectedClientToEdit.telefonoCelular}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, telefonoCelular: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-stone-550 block mb-1">Ciudad Residencia</label>
                    <input
                      type="text"
                      value={selectedClientToEdit.ciudadResidencia}
                      onChange={(e) => setSelectedClientToEdit({ ...selectedClientToEdit, ciudadResidencia: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedClientToEdit(null)}
                      className="bg-stone-150 text-stone-605 font-bold px-4 py-2.5 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-850 hover:bg-amber-950 text-white font-black px-6 py-2.5 rounded-xl shadow-xs"
                    >
                      Confirmar Cambios
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CONFIRM DELETE CLIENT MODAL WITH PURCHASES CONSTRAINT */}
            {showClientDeleteConfirm && (
              <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border">
                  <ShieldAlert size={40} className="mx-auto text-red-600 mb-3" />
                  <h3 className="font-serif font-bold text-base mb-2">¿Dar de baja a este cliente?</h3>
                  
                  {clientHasPurchases(showClientDeleteConfirm) ? (
                    <div className="space-y-4">
                      <p className="text-xs text-red-650 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">RESTRICCIÓN: El cliente tiene pedidos/compras registradas históricas. Para salvaguardar la integridad relacional de la BD Alpes, <strong>NO es posible eliminarlo del sistema</strong>.</p>
                      <button
                        onClick={() => setShowClientDeleteConfirm(null)}
                        className="w-full bg-stone-850 text-stone-50 text-xs font-semibold py-2.5 rounded-xl transition"
                      >
                        Entendido / Volver
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-stone-500 mb-6">Esta acción borrará de manera definitiva el cliente de la base de datos Alpes.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowClientDeleteConfirm(null)}
                          className="flex-1 bg-stone-100 text-stone-600 text-xs font-semibold py-2.5 rounded-xl"
                        >
                          Retroceder
                        </button>
                        <button
                          onClick={() => handleDeleteClient(showClientDeleteConfirm)}
                          className="flex-1 bg-red-600 hover:bg-red-750 text-white text-xs font-bold py-2.5 rounded-xl"
                        >
                          Sí, Borrar Cliente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== TAB 3: REGISTROS DE PRECIOS Y STOCK (Page 5 SENA) ======================================================== */}
        {adminTab === 'precios' && (
          <div className="space-y-6">
            <div className="bg-amber-50/20 text-amber-900 border border-amber-800/10 p-5 rounded-2xl text-xs font-medium leading-relaxed">
              <Plus className="inline text-amber-850 mr-1" size={15} />
              <strong>Registros de Precios y Unidades:</strong> Edite de forma simultánea el valor unitario de venta (en pesos colombianos - COP) y la cantidad real de unidades disponibles físicamente (stock) para cada mueble. Los ajustes impactarán directamente la visualización del portal e-commerce.
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-xs p-6 space-y-6">
              <div className="space-y-4">
                {muebles.map((m) => {
                  const bVal = bulkPrices[m.referencia] || { precio: m.precio, stock: m.stock };
                  return (
                    <div 
                      key={m.referencia}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-stone-100 pb-4 last:border-0 last:pb-0 font-medium"
                    >
                      {/* Image + ref */}
                      <div className="md:col-span-5 flex items-center gap-3">
                        <img 
                          src={m.foto} 
                          alt={m.nombre} 
                          className="w-12 h-10 object-cover rounded-lg bg-stone-100 border shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest font-black">REF: {m.referencia}</p>
                          <p className="font-serif text-xs text-stone-900 font-bold">{m.nombre}</p>
                        </div>
                      </div>

                      {/* Selling price input */}
                      <div className="md:col-span-4 flex items-center gap-2">
                        <span className="text-stone-403 text-xs w-28 text-right font-light md:w-auto">Precio COP (*):</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2 text-stone-400 text-xs font-mono">$</span>
                          <input
                            type="number"
                            value={bVal.precio || ''}
                            onChange={(e) => setBulkPrices({ 
                              ...bulkPrices, 
                              [m.referencia]: { ...bVal, precio: Number(e.target.value) } 
                            })}
                            className="w-full pl-6 pr-3 py-2 bg-stone-50 border rounded-xl text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Stock input */}
                      <div className="md:col-span-3 flex items-center gap-2">
                        <span className="text-stone-403 text-xs w-28 text-right font-light md:w-auto">Existencia (*):</span>
                        <input
                          type="number"
                          value={bVal.stock ?? ''}
                          onChange={(e) => setBulkPrices({ 
                            ...bulkPrices, 
                            [m.referencia]: { ...bVal, stock: Number(e.target.value) } 
                          })}
                          className="w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t gap-2">
                <button
                  type="button"
                  onClick={() => setBulkPrices(
                    muebles.reduce((acc, curr) => ({ ...acc, [curr.referencia]: { precio: curr.precio, stock: curr.stock } }), {})
                  )}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-605 text-xs font-semibold px-5 py-3 rounded-xl transition"
                >
                  Restablecer Originales
                </button>
                <button
                  onClick={handleSaveBulkPrices}
                  className="bg-amber-850 hover:bg-amber-950 text-white text-xs font-black px-6 py-3 rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Save size={15} />
                  Guardar Precios y Existencias
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== TAB 4: REPORTS WITH GRAPHICAL METRICS (Page 8 & 9 SENA) ======================================================== */}
        {adminTab === 'reportes' && (
          <div className="space-y-6">
            
            {/* Report settings panel */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-serif font-bold text-[15px] mb-4 border-b pb-2 text-stone-850">Criterios de Generación del Reporte</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <label className="text-stone-550 block mb-1">Tipo de Reporte a Consultar:</label>
                  <select
                    value={repType}
                    onChange={(e) => setRepType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-normal"
                  >
                    <option value="ventas">Reporte Ventas Diarias (Exterior/Interior)</option>
                    <option value="mas_vendido">Reporte Producto Más Vendido por Ciudad</option>
                    <option value="historial">Historial de Compras por Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-550 block mb-1">Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={repStartDate}
                    onChange={(e) => setRepStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-stone-550 block mb-1">Fecha de Término:</label>
                  <input
                    type="date"
                    value={repEndDate}
                    onChange={(e) => setRepEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-zinc-500"
                  />
                </div>

                {/* Conditional select based on reports */}
                {repType !== 'historial' ? (
                  <div>
                    <label className="text-stone-550 block mb-1">Ciudad Filtro:</label>
                    <select
                      value={repCity}
                      onChange={(e) => setRepCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-normal"
                    >
                      {cities.map((city, idx) => (
                        <option key={idx} value={city}>{city === 'Todas' ? 'Todas las ciudades' : city}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-stone-550 block mb-1">Seleccionar Cliente Consultante:</label>
                    <select
                      value={repSelectedClient}
                      onChange={(e) => setRepSelectedClient(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-normal text-xs"
                    >
                      <option value="">-- Seleccionar cliente --</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombreCompleto} (Doc: {c.numeroDocumento})</option>
                      ))}
                    </select>
                  </div>
                )}

                {repType === 'mas_vendido' && (
                  <div className="col-span-1 md:col-span-4">
                    <label className="text-stone-550 block mb-1">Agrupación Tipo de Mueble:</label>
                    <div className="flex gap-4 font-normal mt-1">
                      {(['Todos', 'Interior', 'Exterior'] as const).map(t => (
                        <label key={t} className="inline-flex items-center text-xs">
                          <input
                            type="radio"
                            checked={repMuebleType === t}
                            onChange={() => setRepMuebleType(t)}
                            className="mr-1.5 focus:ring-amber-500 h-4 w-4"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GENERATED REPORT SHEET OUTPUT */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6" id="printed-report-receipt-box">
              {/* Report Document Header (Pages 8 and 9 structure) */}
              <div className="border-b-2 border-stone-900 pb-4 text-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 font-bold block mb-1">Muebles los Alpes S.A.S. — Reporte Oficial de Auditoria</span>
                <h2 className="font-serif text-xl font-black text-stone-900 uppercase">
                  {repType === 'ventas' && 'Reporte Diario De Ventas Consolidadas'}
                  {repType === 'mas_vendido' && 'Reporte Producto Más Vendido'}
                  {repType === 'historial' && 'Historial de Movimientos de Cliente'}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-[10px] font-mono text-stone-500 font-bold max-w-2xl mx-auto border border-stone-250 p-2.5 rounded-xl bg-stone-50">
                  <div>
                    <span>FECHA GENERACIÓN:</span>
                    <span className="block text-stone-900 mt-0.5">{generationDateString}</span>
                  </div>
                  <div>
                    <span>FECHA INICIO:</span>
                    <span className="block text-stone-900 mt-0.5">{repStartDate}</span>
                  </div>
                  <div>
                    <span>FECHA CORTES FIN:</span>
                    <span className="block text-stone-900 mt-0.5">{repEndDate}</span>
                  </div>
                  <div>
                    <span>SEGMENTO CIUDAD:</span>
                    <span className="block text-stone-900 uppercase mt-0.5">{repType === 'historial' ? 'N/A' : repCity}</span>
                  </div>
                </div>
              </div>

              {/* REPORT OUTPUT 1: VENTAS DIARIAS */}
              {repType === 'ventas' && (
                <div className="space-y-6">
                  {/* Summary Metric widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#fbfcfa] border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold mb-1">Ganancias Interior</span>
                      <span className="text-xl font-serif text-teal-850 font-bold">{formatCOP(salesReport.sumInterior)}</span>
                    </div>
                    <div className="bg-[#fbfcfa] border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold mb-1">Ganancias Exterior</span>
                      <span className="text-xl font-serif text-orange-900 font-bold">{formatCOP(salesReport.sumExterior)}</span>
                    </div>
                    <div className="bg-amber-900/5 border border-amber-900/10 p-4 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-amber-900 uppercase tracking-widest block font-bold mb-1">TOTAL CONSOLIDADO</span>
                      <span className="text-xl font-serif text-amber-900 font-black">{formatCOP(salesReport.grandTotal)}</span>
                    </div>
                  </div>

                  {/* Graphical bar comparison with pure stylish CSS (Ensures 100% compile fidelity without NPM load failures) */}
                  <div className="bg-stone-50 border p-5 rounded-2xl">
                    <h4 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-4 text-center">Distribución de Facturación (Interior vs Exterior)</h4>
                    {salesReport.grandTotal > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-stone-600 font-medium mb-1">
                            <span>Tipo de mueble INTERIOR</span>
                            <span className="font-mono font-bold text-stone-800">{formatCOP(salesReport.sumInterior)} ({(salesReport.sumInterior / salesReport.grandTotal * 100).toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-3.5 overflow-hidden">
                            <div 
                              className="bg-teal-700 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${(salesReport.sumInterior / salesReport.grandTotal * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-stone-600 font-medium mb-1">
                            <span>Tipo de mueble EXTERIOR</span>
                            <span className="font-mono font-bold text-stone-800">{formatCOP(salesReport.sumExterior)} ({(salesReport.sumExterior / salesReport.grandTotal * 100).toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-3.5 overflow-hidden">
                            <div 
                              className="bg-amber-800 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${(salesReport.sumExterior / salesReport.grandTotal * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-center text-stone-400 italic">No hay transacciones en este período para graficar.</p>
                    )}
                  </div>

                  {/* Partitioned tables as specified in Page 8 wireframe */}
                  <div>
                    <h3 className="font-serif font-black text-sm text-stone-900 border-b pb-1.5 mb-3 uppercase tracking-wide">Tipo de mueble INTERIOR</h3>
                    <div className="bg-white border text-xs rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-stone-50 border-b text-[10px] uppercase font-bold text-stone-400">
                            <th className="py-2.5 px-4">Nombre del Mueble</th>
                            <th className="py-2.5 px-4">Cod Ref</th>
                            <th className="py-2.5 px-4 text-center">Unidades Adquiridas</th>
                            <th className="py-2.5 px-4 text-right">Costo Unitario (COP)</th>
                            <th className="py-2.5 px-4 text-right">Costo Total (COP)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700 font-mono">
                          {salesReport.interiorList.map((it, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2.5 px-4 font-serif font-semibold text-stone-900">{it.name}</td>
                              <td className="py-2.5 px-4 text-stone-400 font-bold">{it.ref}</td>
                              <td className="py-2.5 px-4 text-center text-stone-900 font-bold">{it.qty}</td>
                              <td className="py-2.5 px-4 text-right">{formatCOP(it.unitCost)}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-amber-900">{formatCOP(it.totalCost)}</td>
                            </tr>
                          ))}
                          {salesReport.interiorList.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center italic text-stone-403">No se registran ventas para muebles de Interior en este rango.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-sm text-stone-900 border-b pb-1.5 mb-3 uppercase tracking-wide">Tipo de mueble EXTERIOR</h3>
                    <div className="bg-white border text-xs rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-stone-50 border-b text-[10px] uppercase font-bold text-stone-400">
                            <th className="py-2.5 px-4">Nombre del Mueble</th>
                            <th className="py-2.5 px-4">Cod Ref</th>
                            <th className="py-2.5 px-4 text-center">Unidades Adquiridas</th>
                            <th className="py-2.5 px-4 text-right">Costo Unitario (COP)</th>
                            <th className="py-2.5 px-4 text-right">Costo Total (COP)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700 font-mono">
                          {salesReport.exteriorList.map((it, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2.5 px-4 font-serif font-semibold text-stone-900">{it.name}</td>
                              <td className="py-2.5 px-4 text-stone-400 font-bold">{it.ref}</td>
                              <td className="py-2.5 px-4 text-center text-stone-900 font-bold">{it.qty}</td>
                              <td className="py-2.5 px-4 text-right">{formatCOP(it.unitCost)}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-amber-900">{formatCOP(it.totalCost)}</td>
                            </tr>
                          ))}
                          {salesReport.exteriorList.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center italic text-stone-403">No se registran ventas para muebles de Exterior en este rango.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t-2 border-stone-800 pt-4 text-right text-sm">
                    <span className="font-serif font-bold text-stone-900 uppercase">Total Entregado en Pesos: </span>
                    <span className="font-serif font-black text-lg text-amber-950 ml-2">{formatCOP(salesReport.grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* REPORT OUTPUT 2: BEST SELLER (Page 8 and 9) */}
              {repType === 'mas_vendido' && (
                <div className="space-y-6">
                  {bestSellers.length > 0 ? (
                    <div>
                      {/* Champion winner block */}
                      <div className="bg-amber-800/5 border-2 border-dashed border-amber-900/10 p-6 rounded-2xl text-center max-w-md mx-auto mb-6">
                        <span className="text-[10px] font-mono text-amber-900 uppercase tracking-widest block font-bold mb-1.5">★ PRODUCTO PREDILECTO DE VENTAS ★</span>
                        <h4 className="font-serif text-lg font-black text-stone-900">{bestSellers[0].name}</h4>
                        <p className="text-xs text-stone-400 font-mono mb-3">Ref: {bestSellers[0].ref} • {bestSellers[0].type}</p>
                        
                        <div className="bg-white border rounded-xl p-3 inline-block shadow-2xs">
                          <span className="text-xs text-stone-500 font-normal">Unidades Vendidas: </span>
                          <span className="font-mono text-base font-black text-amber-900 ml-1.5">{bestSellers[0].qty}</span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-sm text-stone-900 border-b pb-1.5 mb-3 uppercase tracking-wide">Clasificación General por Demanda</h3>
                      <div className="bg-white border text-xs rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-stone-50 border-b text-[10px] uppercase font-bold text-stone-400">
                              <th className="py-2.5 px-4">Puesto</th>
                              <th className="py-2.5 px-4">Código Referencia</th>
                              <th className="py-2.5 px-4">Nombre del Mueble</th>
                              <th className="py-2.5 px-4">Categoría de Mobiliario</th>
                              <th className="py-2.5 px-4 text-center">Lotes colocados</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-slate-700 font-mono">
                            {bestSellers.map((item, index) => (
                              <tr key={index} className="hover:bg-stone-50/50">
                                <td className="py-2.5 px-4 text-stone-400 font-bold">#{index + 1}</td>
                                <td className="py-2.5 px-4 font-bold text-stone-900">{item.ref}</td>
                                <td className="py-2.5 px-4 font-serif font-semibold text-stone-850">{item.name}</td>
                                <td className="py-2.5 px-4">{item.type}</td>
                                <td className="py-2.5 px-4 text-center text-amber-900 font-bold">{item.qty} u.</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-stone-400 italic">No se halló tráfico comercial en este espectro de tiempo/ciudad.</div>
                  )}
                </div>
              )}

              {/* REPORT OUTPUT 3: CUSTOMER HISTORY (Page 9) */}
              {repType === 'historial' && (
                <div className="space-y-6">
                  {repSelectedClient ? (
                    <div>
                      {customerHistory.length > 0 ? (
                        <div className="space-y-6">
                          <p className="text-xs text-stone-500 font-mono">Total de compras del cliente: <strong>{customerHistory.length}</strong> operaciones</p>
                          
                          <div className="space-y-4">
                            {customerHistory.map((order) => (
                              <div key={order.id} className="border rounded-2xl p-4 bg-stone-50/20 hover:border-amber-200 transition">
                                <div className="flex flex-wrap items-center justify-between border-b pb-2 mb-3 gap-2">
                                  <div className="font-mono text-xs">
                                    <span className="font-bold text-amber-900 text-sm">Cód Orden: {order.id}</span>
                                    <span className="text-stone-400 block mt-0.5">Fecha de Operación: {order.fecha}</span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="text-stone-400 text-[10px] block font-light">Pago: {order.formaPago}</span>
                                    <span className="font-serif font-bold text-stone-900">{formatCOP(order.valorTotal)}</span>
                                  </div>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <p className="font-serif font-bold text-stone-705 mb-1.5 ml-1">Muebles Adquiridos:</p>
                                  {order.items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between pl-4 border-l-2 border-stone-300 font-mono text-[11px]">
                                      <span>{it.cantidad}x {it.nombre} ({it.tipo})</span>
                                      <span className="font-bold text-stone-800">{formatCOP(it.total)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 text-center text-stone-404 italic font-serif">El cliente seleccionado no cuenta con faturación registrada en la base de datos de Muebles los Alpes.</div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-stone-400 italic">Por favor seleccione un cliente en el filtro superior para compilar su historial.</div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
