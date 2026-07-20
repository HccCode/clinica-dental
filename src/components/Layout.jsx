import React from 'react';

export function Layout({ children }) {
  return (
    // Fondo moderno con gradiente sutil y animado
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 text-slate-800 font-sans relative overflow-hidden">
      
      {/* Elementos decorativos de fondo (Blobs) para dar profundidad y un toque tech */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-300/20 blur-3xl pointer-events-none"></div>

      {/* Barra Superior / Header Flotante (Glassmorphism) */}
      <header className="fixed top-4 inset-x-4 max-w-7xl mx-auto z-40">
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-sm shadow-indigo-100/50 rounded-2xl h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 hover:bg-white/80">
          
          {/* Logo Moderno (Icono de Rayo/Energía) */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-slate-700 leading-tight">
                NexusFlow
              </span>
              <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase leading-tight">
                Dental Core
              </span>
            </div>
          </div>

          {/* Controles de Vista tipo "Píldora" (Estilo macOS/iOS) */}
          <div className="hidden md:flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm">
            <button className="px-5 py-1.5 text-sm font-semibold bg-white rounded-lg shadow-sm text-indigo-700">Recepción</button>
            <button className="px-5 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Clínica</button>
            <button className="px-5 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Analítica</button>
          </div>

          {/* Usuario y Estado de Sincronización */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-full">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </div>
              <span className="text-xs font-semibold text-indigo-700">En línea</span>
            </div>
            
            {/* Avatar generado por API (puedes reemplazarlo por una imagen tuya) */}
            <div className="relative">
              <img 
                src="https://api.dicebear.com/9.x/notionists/svg?seed=Dentist&backgroundColor=e2e8f0" 
                alt="Avatar" 
                className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal (Ajustado con padding superior "pt-28" por el header flotante) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Tarjeta de cristal donde irá tu tablero */}
        <div className="bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-100/40 rounded-[2rem] p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}