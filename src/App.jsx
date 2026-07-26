import React, { useState, useEffect } from 'react';
import PatientProfile from './components/PatientProfile.jsx'; 
import CalendarView from './components/CalendarView.jsx'; 
import LoginView from './components/LoginView.jsx';
import AjustesView from './components/AjustesView.jsx'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('recepcion'); 
  
  // Estado para la marca del Header
  const [brandConfig, setBrandConfig] = useState({ nombre_negocio: 'NexusFlow', subtitulo_negocio: 'DENTAL CORE', logo: null });

  // ----------------------------------------------------
  // ESTADOS GLOBALES DE LA CLÍNICA
  // ----------------------------------------------------
  const [doctors, setDoctors] = useState(['Dr. Silva', 'Dra. Gómez']);
  const [schedule, setSchedule] = useState({ start: '08:00', end: '16:00' });
  const [appointments, setAppointments] = useState([
    { id: 1, date: '2026-07-21', patient: 'Juan Pérez', treatment: 'Resina Pieza 14', time: '09:00', duration: 2, doctor: 'Dr. Silva', color: 'bg-blue-100 border-blue-400 text-blue-800', status: 'pending' },
    { id: 2, date: '2026-07-21', patient: 'María López', treatment: 'Limpieza General', time: '10:30', duration: 1, doctor: 'Dra. Gómez', color: 'bg-green-100 border-green-400 text-green-800', status: 'arrived' },
    { id: 3, date: '2026-07-21', patient: 'Roberto Carlos', treatment: 'Extracción Muela del Juicio', time: '13:00', duration: 3, doctor: 'Dr. Silva', color: 'bg-purple-100 border-purple-400 text-purple-800', status: 'arrived' }
  ]);

  // Cargar configuración de la marca al iniciar (si está logueado)
  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:3001/api/config')
        .then(res => res.json())
        .then(data => {
          if (data && data.nombre_negocio) {
            setBrandConfig(data);
          }
        })
        .catch(err => console.error("Error cargando config de marca:", err));
    }
  }, [isAuthenticated]);

  // Función para manejar el botón "Atender"
  const handleAtenderPaciente = (citaId) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(cita => 
        cita.id === citaId 
          ? { ...cita, status: 'in_progress' } 
          : cita
      )
    );
    // Cambiar automáticamente a la vista de clínica al atender
    setCurrentView('clinica');
  };

  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={(usuario) => {
          setIsAuthenticated(true);
          setCurrentUser(usuario);
          
          // Redirigir a la primera vista permitida
          if (usuario?.permisos) {
            if (usuario.permisos.recepcion) setCurrentView('recepcion');
            else if (usuario.permisos.clinica) setCurrentView('clinica');
            else if (usuario.permisos.ajustes) setCurrentView('ajustes');
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-6">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER / BARRA DE NAVEGACIÓN SUPERIOR                */}
      {/* ---------------------------------------------------- */}
      <header className="bg-white rounded-2xl shadow-sm px-6 py-4 mb-6 flex justify-between items-center border border-white">
        
        <div className="flex items-center gap-3">
          {brandConfig.logo ? (
            <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden p-1">
              <img src={brandConfig.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          )}

          <div>
            <h1 className="text-xl font-extrabold text-gray-800 leading-tight tracking-tight">
              {brandConfig.nombre_negocio}
            </h1>
            <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">
              {brandConfig.subtitulo_negocio}
            </p>
          </div>
        </div>

        <div className="bg-[#F4F7FE] p-1 rounded-xl flex gap-1 border border-gray-100">
          
          {currentUser?.permisos?.recepcion && (
            <button 
              onClick={() => setCurrentView('recepcion')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                currentView === 'recepcion' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Recepción
            </button>
          )}
          
          {currentUser?.permisos?.clinica && (
            <button 
              onClick={() => setCurrentView('clinica')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                currentView === 'clinica' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Clínica
            </button>
          )}

          {currentUser?.permisos?.analitica && (
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed opacity-60" title="Próximamente">
              Analítica
            </button>
          )}

          {currentUser?.permisos?.ajustes && (
            <button 
              onClick={() => setCurrentView('ajustes')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                currentView === 'ajustes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              ⚙️ Ajustes
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-full">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
            <span className="text-xs font-bold text-blue-700">En línea</span>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 pr-4 rounded-full">
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')] bg-cover"></div>
            <span className="text-sm font-bold text-gray-700 hidden md:block">
              {currentUser?.nombre || 'Usuario'}
            </span>
          </div>
          
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setCurrentUser(null);
            }} 
            className="text-xs font-bold text-red-500 hover:text-red-700 ml-2"
          >
            Salir
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* ÁREA DE CONTENIDO PRINCIPAL                          */}
      {/* ---------------------------------------------------- */}
      <main className="transition-opacity duration-300">
        
        {/* NOTIFICACIONES DE PACIENTES EN ESPERA (SE OCULTARÁN AL ATENDER) */}
        {appointments.filter(cita => cita.status === 'arrived').map(cita => (
          <div key={cita.id} className="bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center mb-6 shadow-sm animate-fade-in">
            <div>
              <p className="text-green-800 font-bold">¡El paciente ha llegado!</p>
              <p className="text-green-700 text-sm">
                <span className="font-bold">{cita.patient}</span> está esperando ({cita.treatment}).
              </p>
            </div>
            <button 
              onClick={() => handleAtenderPaciente(cita.id)}
              className="bg-[#00A651] hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
            >
              Atender
            </button>
          </div>
        ))}

        {currentView === 'recepcion' && currentUser?.permisos?.recepcion && (
          <CalendarView 
            appointments={appointments} 
            setAppointments={setAppointments} 
            doctors={doctors} 
            schedule={schedule} 
          />
        )}
        
        {currentView === 'clinica' && currentUser?.permisos?.clinica && <PatientProfile />}
        
        {currentView === 'ajustes' && currentUser?.permisos?.ajustes && (
          <AjustesView 
            onConfigChange={(newConfig) => setBrandConfig(newConfig)}
          />
        )}

      </main>
      
    </div>
  );
}

export default App;