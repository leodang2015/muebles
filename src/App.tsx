/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Layers, Award, Clock } from 'lucide-react';
import { Cliente, Mueble, Pedido } from './types';
import { INICIAL_CLIENTES, INICIAL_MUEBLES, INICIAL_PEDIDOS } from './initialData';
import ClientPortal from './components/ClientPortal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Tab selector: 'cliente' (E-commerce shopfront) or 'admin' (SENA admin panel)
  const [activeRole, setActiveRole] = useState<'cliente' | 'admin'>('cliente');

  // Load state with localStorage fallback
  const [muebles, setMuebles] = useState<Mueble[]>(() => {
    try {
      const saved = localStorage.getItem('alpes_muebles');
      return saved ? JSON.parse(saved) : INICIAL_MUEBLES;
    } catch (e) {
      console.error("Error parsing alpes_muebles from localStorage:", e);
      return INICIAL_MUEBLES;
    }
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const saved = localStorage.getItem('alpes_clientes');
      return saved ? JSON.parse(saved) : INICIAL_CLIENTES;
    } catch (e) {
      console.error("Error parsing alpes_clientes from localStorage:", e);
      return INICIAL_CLIENTES;
    }
  });

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    try {
      const saved = localStorage.getItem('alpes_pedidos');
      return saved ? JSON.parse(saved) : INICIAL_PEDIDOS;
    } catch (e) {
      console.error("Error parsing alpes_pedidos from localStorage:", e);
      return INICIAL_PEDIDOS;
    }
  });

  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(() => {
    try {
      const saved = localStorage.getItem('alpes_current_cliente');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing alpes_current_cliente from localStorage:", e);
      return null;
    }
  });

  // Save states side effects
  useEffect(() => {
    localStorage.setItem('alpes_muebles', JSON.stringify(muebles));
    localStorage.setItem('alpes_clientes', JSON.stringify(clientes));
    localStorage.setItem('alpes_pedidos', JSON.stringify(pedidos));
    if (currentCliente) {
      localStorage.setItem('alpes_current_cliente', JSON.stringify(currentCliente));
    } else {
      localStorage.removeItem('alpes_current_cliente');
    }
  }, [muebles, clientes, pedidos, currentCliente]);

  const resetAllDataToDefault = () => {
    if (window.confirm('¿Desea restablecer todos los registros (clientes, muebles y pedidos) a sus valores de fábrica iniciales de SENA? Se borrarán datos ingresados recientemente.')) {
      setMuebles(INICIAL_MUEBLES);
      setClientes(INICIAL_CLIENTES);
      setPedidos(INICIAL_PEDIDOS);
      setCurrentCliente(null);
      alert('Toda la información del taller ha sido restaurada con éxito.');
    }
  };

  return (
    <div className="bg-[#fcfbf7] min-h-screen flex flex-col justify-between" id="app-wrapper">
      
      {/* GLOBAL SYSTEM HEADER */}
      <header className="bg-stone-900 border-b border-stone-800 text-stone-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Brand Accent */}
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-800 p-2 rounded-xl text-amber-50">
              <Layers size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif font-black text-lg text-white leading-none tracking-wide">Muebles los Alpes</h1>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold">PORTAL CORPORATIVO SENA</span>
            </div>
          </div>

          {/* Navigation Role Switches */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800/80">
            <button
              onClick={() => setActiveRole('cliente')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition ${
                activeRole === 'cliente'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag size={14} />
              Portal de Clientes (E-commerce)
            </button>
            <button
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition ${
                activeRole === 'admin'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Users size={14} />
              Panel de Administración (SENA)
            </button>
          </div>

          {/* Settings Utility */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetAllDataToDefault}
              className="text-[10px] font-mono bg-stone-800 hover:bg-stone-700 text-amber-100 hover:text-amber-50 font-bold px-3 py-1.5 rounded-lg border border-stone-700 transition"
              title="Restablecer Datos del Taller"
            >
              Restaurar Datos
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK STAGE */}
      <main className="flex-1">
        {activeRole === 'cliente' ? (
          <ClientPortal
            muebles={muebles}
            setMuebles={setMuebles}
            clientes={clientes}
            setClientes={setClientes}
            pedidos={pedidos}
            setPedidos={setPedidos}
            currentCliente={currentCliente}
            setCurrentCliente={setCurrentCliente}
          />
        ) : (
          <AdminPanel
            muebles={muebles}
            setMuebles={setMuebles}
            clientes={clientes}
            setClientes={setClientes}
            pedidos={pedidos}
            setPedidos={setPedidos}
            setCurrentCliente={setCurrentCliente}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-500 text-xs py-6 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber-700" />
            <span>Taller Práctico de Base de Datos y Portales de Internet — SENA</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
            <Clock size={12} />
            <span>Local Audit Time: 2026-06-18 05:38:56</span>
          </div>
          <div>
            <span>&copy; Muebles los Alpes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
