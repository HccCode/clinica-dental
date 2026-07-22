import React, { useState } from 'react';
import { Odontogram } from './Odontogram.jsx'; 

const mockPatients = [
  { 
    id: 1, 
    name: 'Juan Pérez', 
    phone: '686-555-0123', 
    email: 'juan.perez@email.com', 
    dob: '1985-04-12', 
    bloodType: 'O+', 
    allergies: 'Penicilina', 
    notes: 'Paciente presenta ansiedad moderada durante extracciones. Aplicar anestesia tópica extra antes de infiltrar.' 
  },
  { 
    id: 2, 
    name: 'María López', 
    phone: '686-555-0456', 
    email: 'maria.l@email.com', 
    dob: '1990-08-25', 
    bloodType: 'A+', 
    allergies: 'Ninguna', 
    notes: 'Requiere profilaxis cada 6 meses. Alta tendencia a acumulación de sarro en zona lingual inferior.' 
  },
  { 
    id: 3, 
    name: 'Roberto Carlos', 
    phone: '686-555-0789', 
    email: 'roberto.c@email.com', 
    dob: '1978-11-05', 
    bloodType: 'B-', 
    allergies: 'Látex', 
    notes: 'Tratamiento de ortodoncia finalizado en 2024. Usa retenedores nocturnos.' 
  }
];

export default function PatientProfile() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [isOdontogramOpen, setIsOdontogramOpen] = useState(false);

  // --- LÓGICA DE NOTIFICACIONES ---
  const [currentDoctor, setCurrentDoctor] = useState('Dr. Silva');

  const [arrivedPatients, setArrivedPatients] = useState([
    { id: 101, patientName: 'Roberto Carlos', doctor: 'Dr. Silva', time: '13:00', treatment: 'Extracción Muela del Juicio' },
    { id: 102, patientName: 'María López', doctor: 'Dra. Gómez', time: '14:30', treatment: 'Limpieza' }
  ]);

  const myNotifications = arrivedPatients.filter(appt => appt.doctor === currentDoctor);

  const dismissNotification = (id) => {
    setArrivedPatients(prev => prev.filter(appt => appt.id !== id));
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- NUEVA LÓGICA: Guardar Odontograma ---
  const handleSaveOdontogram = (patientId, dentalData) => {
    console.log(`Guardando datos para el paciente ID: ${patientId}`);
    console.log("Datos a enviar a la BD:", JSON.stringify(dentalData, null, 2));
    
    // Aquí es donde harás el fetch/axios a tu backend en el futuro
    
    alert(`¡Odontograma guardado con éxito para ${selectedPatient.name}!`);
    setIsOdontogramOpen(false); // Cierra el modal automáticamente
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[750px] overflow-hidden relative">
      
      {/* PANEL LATERAL: Lista de Pacientes */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50/30 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pacientes</h2>
            {/* Selector temporal para simular el inicio de sesión del doctor */}
            <select 
              value={currentDoctor} 
              onChange={(e) => setCurrentDoctor(e.target.value)}
              className="text-xs border border-gray-200 rounded p-1.5 bg-white text-gray-600 outline-none"
            >
              <option value="Dr. Silva">Ver como Dr. Silva</option>
              <option value="Dra. Gómez">Ver como Dra. Gómez</option>
            </select>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedPatient?.id === patient.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <h3 className={`font-bold ${selectedPatient?.id === patient.id ? 'text-blue-700' : 'text-gray-800'}`}>
                {patient.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{patient.phone}</p>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-10">No se encontraron pacientes.</p>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2">
            <span>+</span> Nuevo Paciente
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: Expediente del Paciente y Notificaciones */}
      <div className="w-2/3 flex flex-col bg-white overflow-y-auto relative">
        
        {/* --- BANNER DE NOTIFICACIONES --- */}
        {myNotifications.length > 0 && (
          <div className="m-6 mb-2">
            {myNotifications.map(notification => (
              <div key={notification.id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center shadow-sm mb-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 p-2 rounded-full text-xl animate-pulse">
                    🔔
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-sm">¡El paciente ha llegado!</h4>
                    <p className="text-green-700 text-sm mt-0.5">
                      <b>{notification.patientName}</b> está en la sala de espera para su cita de las <b>{notification.time}</b> ({notification.treatment}).
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => dismissNotification(notification.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  Atender Paciente
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- CONTENIDO DEL PACIENTE --- */}
        {selectedPatient ? (
          <>
            {/* CABECERA */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="text-[28px] font-bold text-[#1a2b4b] leading-tight">{selectedPatient.name}</h2>
                  <div className="flex items-center gap-2 text-[15px] text-slate-500 mt-1">
                    <span>ID: #{String(selectedPatient.id).padStart(4, '0')}</span>
                    <span className="text-slate-400 font-black flex items-center justify-center translate-y-[-2px]">.</span>
                    <span className="text-[#3b82f6] font-medium">Activo</span>
                  </div>
                  <button 
                    onClick={() => setIsOdontogramOpen(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Abrir Odontograma
                  </button>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-all">
                Editar Perfil
              </button>
            </div>

            <div className="p-8">
              
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Correo Electrónico</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Fecha de Nacimiento</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.dob}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Datos Médicos</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-xs text-red-400 mb-1 font-semibold">Alergias</p>
                  <p className="font-bold text-red-700">{selectedPatient.allergies}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-400 mb-1 font-semibold">Tipo de Sangre</p>
                  <p className="font-bold text-blue-700">{selectedPatient.bloodType}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Notas Clínicas</h3>
              <div className="bg-yellow-50/50 p-5 rounded-xl border border-yellow-100 text-gray-700 text-sm leading-relaxed">
                {selectedPatient.notes}
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecciona un paciente para ver su expediente
          </div>
        )}
      </div>

      {/* --- MODAL DEL ODONTOGRAMA ACTUALIZADO --- */}
      {isOdontogramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#F4F7FE] w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-200">
            <Odontogram 
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              onClose={() => setIsOdontogramOpen(false)} 
              onSave={handleSaveOdontogram}
            />
          </div>
        </div>
      )}

    </div>
  );
}