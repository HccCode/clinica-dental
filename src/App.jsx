import React, { useState } from 'react';
// Nota: Si usaste la Opción 1 de importación sin llaves antes, asegúrate de mantenerlo igual aquí
import PatientProfile  from './components/PatientProfile.jsx'; 
import { CalendarView } from './components/CalendarView.jsx';

function App() {
  // Estado para controlar qué pantalla vemos (por defecto abrimos 'clinica')
  const [currentView, setCurrentView] = useState('clinica');

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-6">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER / BARRA DE NAVEGACIÓN SUPERIOR                */}
      {/* ---------------------------------------------------- */}
      <header className="bg-white rounded-2xl shadow-sm px-6 py-4 mb-6 flex justify-between items-center border border-white">
        
        {/* Lado Izquierdo: Logo y Marca */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200">
            {/* Icono de Rayo simulando el de tu diseño */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 leading-tight tracking-tight">NexusFlow</h1>
            <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">Dental Core</p>
          </div>
        </div>

        {/* Centro: Botones de Navegación */}
        <div className="bg-[#F4F7FE] p-1 rounded-xl flex gap-1 border border-gray-100">
          <button 
            onClick={() => setCurrentView('recepcion')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              currentView === 'recepcion' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            Recepción
          </button>
          
          <button 
            onClick={() => setCurrentView('clinica')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              currentView === 'clinica' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            Clínica
          </button>

          <button 
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed opacity-60"
            title="Próximamente"
          >
            Analítica
          </button>
        </div>

        {/* Lado Derecho: Status y Perfil de Usuario */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-full">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
            <span className="text-xs font-bold text-blue-700">En línea</span>
          </div>
          
          <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')] bg-cover">
            {/* Avatar generado aleatoriamente para simular el tuyo */}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* ÁREA DE CONTENIDO PRINCIPAL                          */}
      {/* ---------------------------------------------------- */}
      <main className="transition-opacity duration-300">
        {currentView === 'recepcion' ? <CalendarView /> : <PatientProfile />}
      </main>
      
    </div>
  );
}

export default App;