import React, { useState } from 'react';

// Datos simulados iniciales (coinciden con los del calendario)
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

export function PatientManagement() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);

  // Filtrar pacientes por nombre
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[750px] overflow-hidden">
      
      {/* PANEL LATERAL: Lista de Pacientes */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50/30 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pacientes</h2>
          
          {/* Barra de Búsqueda */}
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

        {/* Lista Filtrada */}
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

      {/* ÁREA PRINCIPAL: Expediente del Paciente */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedPatient ? (
          <>
            {/* Cabecera del Perfil */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 flex gap-4">
                    <span>ID: #{String(selectedPatient.id).padStart(4, '0')}</span>
                    <span>•</span>
                    <span>Activo</span>
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-all">
                Editar Perfil
              </button>
            </div>

            {/* Contenido del Expediente */}
            <div className="p-8 flex-1 overflow-y-auto">
              
              {/* Sección: Información Personal */}
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

              {/* Sección: Historial Médico Básico */}
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

              {/* Sección: Notas Clínicas */}
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Notas Clínicas</h3>
              <div className="bg-yellow-50/50 p-5 rounded-xl border border-yellow-100 text-gray-700 text-sm leading-relaxed">
                {selectedPatient.notes}
              </div>

              {/* Botón de Acción Rápida (Conector para el odontograma futuro) */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all">
                  Abrir Odontograma
                </button>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecciona un paciente para ver su expediente
          </div>
        )}
      </div>
    </div>
  );
}