import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './Login';
// Importa tus componentes principales aquí
// import { CalendarView } from './CalendarView';
// import PatientProfile from './PatientProfile';

function MainApp() {
  const { currentUser, logout } = useAuth();

  // Si no hay usuario, mostramos el login
  if (!currentUser) {
    return <Login />;
  }

  // Si hay usuario, mostramos la aplicación
  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 flex flex-col gap-4">
      {/* Barra de navegación superior rápida */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦷</span>
          <h1 className="font-bold text-gray-800">Clínica Dental</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser.role === 'receptionist' ? 'Recepción' : 'Médico'}</p>
          </div>
          <button 
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* 
        AQUÍ VA TU RUTEADOR O RENDERIZADO CONDICIONAL. 
        Por ejemplo, podrías mostrar componentes diferentes según el rol.
      */}
      <div className="flex gap-4">
         {/* <CalendarView /> */}
         {/* <PatientProfile /> */}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}