import React, { useState } from 'react';
import { Odontogram } from './Odontogram.jsx';
import { MedicalHistory } from './MedicalHistory.jsx';

export function PatientProfile() {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState('historial');

  return (
    <div className="flex h-[800px] gap-6">
      
      {/* ==========================================
          BARRA LATERAL: Info estática del Paciente 
          ========================================== */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white/50 border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl p-6">
        
        {/* Foto y Nombre */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-white">
              JP
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mt-4">Juan Pérez</h2>
          <p className="text-sm text-slate-500 font-bold tracking-wide mt-1">ID: 0948-2026</p>
        </div>

        {/* Resumen Clínico Rápido */}
        <div className="space-y-4 flex-1">
          {/* Tarjeta de Alertas (Alergias) */}
          <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs font-black text-red-500 uppercase tracking-wider">Alerta Médica</p>
            </div>
            <p className="text-sm font-bold text-red-700">Alergia a Penicilina</p>
          </div>
          
          {/* Tarjeta de Contacto */}
          <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-sm font-semibold text-slate-700">+52 686 555 1234</p>
          </div>

          <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Última Visita</p>
            <p className="text-sm font-semibold text-slate-700">15 de Julio, 2026</p>
          </div>
        </div>

        {/* Acciones */}
        <button className="w-full py-3.5 bg-white hover:bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl shadow-sm border border-indigo-100 transition-colors">
          Editar Perfil
        </button>
      </div>

      {/* ==========================================
          ÁREA PRINCIPAL: Navegación y Pestañas 
          ========================================== */}
      <div className="flex-1 flex flex-col bg-white/50 border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-hidden relative">
        
        {/* Navegación de Pestañas (Tabs) */}
        <div className="flex px-6 pt-6 gap-2 border-b border-slate-200/50 relative z-10">
          
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-3.5 text-sm font-bold rounded-t-2xl transition-all ${
              activeTab === 'historial' 
                ? 'bg-white text-indigo-700 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-x border-white/80' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            Historial Médico
          </button>
          
          <button
            onClick={() => setActiveTab('odontograma')}
            className={`px-6 py-3.5 text-sm font-bold rounded-t-2xl transition-all ${
              activeTab === 'odontograma' 
                ? 'bg-white text-indigo-700 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-x border-white/80' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            Odontograma
          </button>
          
          <button
            onClick={() => setActiveTab('archivos')}
            className={`px-6 py-3.5 text-sm font-bold rounded-t-2xl transition-all ${
              activeTab === 'archivos' 
                ? 'bg-white text-indigo-700 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-x border-white/80' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            Radiografías y Archivos
          </button>
          
        </div>

        {/* Contenedor Dinámico (Renderiza según el Tab activo) */}
        <div className="flex-1 p-6 bg-white overflow-hidden rounded-b-3xl">
          {activeTab === 'historial' && <MedicalHistory />}
          {activeTab === 'odontograma' && <Odontogram />}
          {activeTab === 'archivos' && (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
              Aquí irá la galería de radiografías y archivos adjuntos del paciente.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}