import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api'; 

export default function ReceptionBoard() {
  const [patients, setPatients] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]); // Ahora es un estado vacío
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar doctores desde tu base de datos
  const fetchDoctors = async () => {
    try {
      // Ajusta la ruta al endpoint donde obtienes los usuarios con rol de doctor
      const res = await fetch(`${API_URL}/doctors`); 
      if (!res.ok) throw new Error('Error cargando doctores');
      const data = await res.json();
      setAvailableDoctors(data);
    } catch (err) {
      console.error("Error cargando doctores:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`);
      if (!res.ok) throw new Error('Error de red');
      const data = await res.json();
      
      const formattedData = data.map(appt => ({
        id: appt.id.toString(),
        name: appt.patient_name,
        treatment: appt.treatment,
        status: appt.status || 'waiting',
        doctorId: appt.doctor_id
      }));
      setPatients(formattedData);
    } catch (err) {
      console.error("Error cargando pacientes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(); // Carga la lista de doctores al inicio
    fetchPatients(); // Carga la lista de pacientes
    
    // POLLING: Actualiza el tablero cada 5 segundos
    const interval = setInterval(fetchPatients, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleChangeDoctor = async (appointmentId, newDoctorId) => {
    setPatients(prev => prev.map(p => p.id === appointmentId ? { ...p, doctorId: parseInt(newDoctorId) } : p));
    
    try {
      await fetch(`${API_URL}/appointments/${appointmentId}/doctor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: newDoctorId })
      });
    } catch (error) {
      console.error("Error cambiando de doctor:", error);
      fetchPatients(); 
    }
  };

  const handleDragStart = (e, patientId) => {
    e.dataTransfer.setData('patientId', patientId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const patientId = e.dataTransfer.getData('patientId');
    
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));

    try {
      await fetch(`${API_URL}/appointments/${patientId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Error actualizando estado:", error);
      fetchPatients(); 
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderColumn = (title, statusKey, bgColor) => {
    const columnPatients = patients.filter(p => p.status === statusKey);
    return (
      <div 
        className={`flex-1 min-w-[300px] p-4 rounded-xl ${bgColor} shadow-sm border border-gray-200`}
        onDrop={(e) => handleDrop(e, statusKey)}
        onDragOver={handleDragOver}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title} ({columnPatients.length})</h2>
        <div className="space-y-3">
          {columnPatients.map(patient => (
            <div 
              key={patient.id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, patient.id)}
              className="bg-white p-4 rounded-lg shadow cursor-move hover:shadow-md transition-shadow border-l-4 border-blue-500"
            >
              <div className="font-semibold text-lg text-gray-800">{patient.name}</div>
              <div className="text-sm text-gray-600 mb-3">{patient.treatment}</div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Doctor Asignado:</label>
                <select 
                  value={patient.doctorId || ''} 
                  onChange={(e) => handleChangeDoctor(patient.id, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {availableDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {columnPatients.length === 0 && (
             <div className="text-gray-400 text-center italic py-6 border-2 border-dashed border-gray-300 rounded-lg">
                Sin pacientes
             </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando tablero...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">NexusFlow - Recepción</h1>
        <p className="text-gray-600 mt-1">Gestión de flujo de pacientes</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
        {renderColumn('Sala de Espera', 'waiting', 'bg-blue-50/50')}
        {renderColumn('En Tratamiento', 'in-treatment', 'bg-orange-50/50')}
        {renderColumn('Terminado', 'finished', 'bg-green-50/50')}
      </div>
    </div>
  );
}