import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api'; 

export default function PatientProfile() {
  // Estados para Sala de Espera y Expediente actual
  const [arrivedPatients, setArrivedPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  
  // Estados para Búsqueda y Formulario de Pacientes
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', phone: '', email: '', notes: '' });

  // ID del doctor logueado (Ejemplo)
  const currentDoctorId = 1; 

  // 1. Cargar pacientes en sala de espera (Polling)
  const fetchWaitingPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`);
      if (!res.ok) return;
      const data = await res.json();
      
      const waitingForMe = data.filter(appt => 
        (appt.status === 'waiting' || !appt.status) && appt.doctor_id === currentDoctorId
      );
      
      setArrivedPatients(waitingForMe.map(appt => ({
        id: appt.id.toString(), // ID de la cita
        patient_id: appt.patient_id, // ID del paciente en la BD
        name: appt.patient_name,
        treatment: appt.treatment,
        isAppointment: true // Bandera para saber que viene de una cita
      })));
    } catch (err) {
      console.error("Error buscando pacientes en espera:", err);
    }
  };

  useEffect(() => {
    fetchWaitingPatients();
    const interval = setInterval(fetchWaitingPatients, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Buscar pacientes en toda la base de datos
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/patients/search?q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error en búsqueda:", err);
      }
    };
    
    // Pequeño retraso (debounce) para no saturar el servidor en cada tecla
    const delayDebounce = setTimeout(() => { searchPatients(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 3. Acciones de Atención y Selección
  const handleAtender = async (appointmentId) => {
    const appt = arrivedPatients.find(p => p.id === appointmentId);
    
    // Obtenemos los datos completos del paciente desde su ID
    try {
      const res = await fetch(`${API_URL}/patients/${appt.patient_id}`);
      if (res.ok) {
        const patientData = await res.json();
        setCurrentPatient({ ...patientData, currentTreatment: appt.treatment });
      } else {
        // Fallback si no hay endpoint de detalle de paciente aún
        setCurrentPatient({ id: appt.patient_id, name: appt.name, currentTreatment: appt.treatment });
      }

      // Actualizamos estado de la cita
      await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-treatment' })
      });
      setArrivedPatients(prev => prev.filter(a => a.id !== appointmentId));
    } catch (err) {
      console.error("Error al iniciar atención:", err);
    }
  };

  const handleSelectSearchedPatient = (patient) => {
    setCurrentPatient(patient);
    setIsFormOpen(false);
  };

  // 4. Lógica de Formulario (Crear / Editar)
  const handleOpenCreateForm = () => {
    setFormData({ id: null, name: '', phone: '', email: '', notes: '' });
    setCurrentPatient(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = () => {
    setFormData({
      id: currentPatient.id,
      name: currentPatient.name || '',
      phone: currentPatient.phone || '',
      email: currentPatient.email || '',
      notes: currentPatient.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    const isEditing = formData.id !== null;
    const url = isEditing ? `${API_URL}/patients/${formData.id}` : `${API_URL}/patients`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const savedPatient = await res.json();
        setCurrentPatient(savedPatient);
        setIsFormOpen(false);
        // Si estábamos buscando, limpiamos la búsqueda
        if (!isEditing) setSearchQuery(''); 
      }
    } catch (err) {
      console.error("Error guardando paciente:", err);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Panel lateral: Notificaciones y Búsqueda */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <input
            type="text"
            placeholder="Buscar paciente (Ej. Juan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 rounded-lg p-2 text-sm"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Si hay texto en el buscador, mostramos resultados */}
          {searchQuery.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resultados de búsqueda</h3>
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron pacientes.</p>
              ) : (
                searchResults.map(patient => (
                  <div 
                    key={patient.id} 
                    onClick={() => handleSelectSearchedPatient(patient)}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-gray-800">{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.phone || 'Sin teléfono'}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Si no hay búsqueda, mostramos Sala de Espera */
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>En Sala de Espera</span>
                <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">{arrivedPatients.length}</span>
              </h3>
              
              {arrivedPatients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-6">Nadie en espera por el momento.</p>
              ) : (
                arrivedPatients.map(appt => (
                  <div key={appt.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-teal-500 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                      <h3 className="font-semibold text-gray-800 truncate">{appt.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{appt.treatment}</p>
                    <button 
                      onClick={() => handleAtender(appt.id)} 
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Atender Ahora
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Área principal: Expediente Clínico o Formulario */}
      <div className="flex-1 flex flex-col">
        <header className="p-6 border-b bg-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Directorio Clínico</h1>
            <p className="text-gray-500 text-sm">Módulo Médico - NexusFlow Core</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenCreateForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + Nuevo Paciente
            </button>
            <div className="text-sm font-medium bg-gray-100 px-4 py-2 rounded-full text-gray-700">
              Dr. Asignado
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {/* VISTA DE FORMULARIO (Crear/Editar) */}
          {isFormOpen ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {formData.id ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
              </h2>
              <form onSubmit={handleSavePatient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas Médicas Generales</label>
                  <textarea name="notes" rows="3" value={formData.notes} onChange={handleFormChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                    Guardar Paciente
                  </button>
                </div>
              </form>
            </div>
          ) : currentPatient ? (
            /* VISTA DE EXPEDIENTE DEL PACIENTE */
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6 border-b pb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{currentPatient.name}</h2>
                  <div className="text-gray-500 flex gap-4 mt-1 text-sm">
                    {currentPatient.phone && <span>📞 {currentPatient.phone}</span>}
                    {currentPatient.email && <span>✉️ {currentPatient.email}</span>}
                  </div>
                  {currentPatient.currentTreatment && (
                    <p className="mt-3 text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded">
                      Motivo actual: {currentPatient.currentTreatment}
                    </p>
                  )}
                </div>
                <button 
                  onClick={handleOpenEditForm}
                  className="text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                  ✎ Editar Datos
                </button>
              </div>
              
              {currentPatient.notes && (
                <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <h4 className="text-sm font-bold text-yellow-800 mb-1">Notas / Antecedentes</h4>
                  <p className="text-sm text-yellow-900">{currentPatient.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                  [ Módulo Odontograma ]
                </div>
                <div className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                  [ Notas de Evolución / Tratamientos ]
                </div>
              </div>
            </div>
          ) : (
            /* ESTADO VACÍO (Ningún paciente seleccionado) */
            <div className="h-full flex items-center justify-center flex-col text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-500">Selecciona o busca un paciente para ver su expediente.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}