import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ----------------------------------------------------------------------
// FUNCIONES DE AYUDA PARA FECHAS Y HORARIOS
// ----------------------------------------------------------------------
const formatDateToISO = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplayDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let formatted = date.toLocaleDateString('es-MX', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Generador dinámico de bloques de 30 minutos según la hora de apertura y cierre
const generateTimeSlots = (startHour = '08:00', endHour = '16:00') => {
  const slots = [];
  let [currentH, currentM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);

  while (currentH < endH || (currentH === endH && currentM <= endM)) {
    const timeString = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    slots.push(timeString);
    
    currentM += 30;
    if (currentM >= 60) {
      currentM = 0;
      currentH += 1;
    }
  }
  return slots;
};

// ----------------------------------------------------------------------
// COMPONENTE: ZONA PARA SOLTAR
// ----------------------------------------------------------------------
function DroppableSlot({ time }) {
  const { isOver, setNodeRef } = useDroppable({ id: time });
  return (
    <div
      ref={setNodeRef}
      className={`h-16 border-b border-gray-100 transition-colors ${
        isOver ? 'bg-blue-50/70 border-blue-200' : ''
      }`}
    ></div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE: TARJETA DE CITA (Draggable)
// ----------------------------------------------------------------------
function DraggableAppointment({ appointment, top, height, onNotifyArrival, onAttendPatient, isPastDate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: appointment,
    disabled: isPastDate,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    top: `${top}px`,
    height: `${height}px`,
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.85 : (isPastDate ? 0.6 : 1),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isPastDate ? {} : listeners)}
      {...(attributes)}
      className={`absolute left-4 right-4 ${appointment.color} border-l-4 rounded-r-lg p-3 shadow-sm ${isPastDate ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:shadow-md'} transition-shadow select-none flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-sm flex items-center gap-2">
            {appointment.patient}
            {appointment.status === 'arrived' && (
              <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold tracking-wide">
                ⏳ EN ESPERA
              </span>
            )}
            {appointment.status === 'attending' && (
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold tracking-wide">
                🩺 EN CONSULTA
              </span>
            )}
          </h4>
          <p className="text-xs mt-1 font-medium opacity-90">{appointment.treatment}</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{appointment.doctor}</span>
          
          {appointment.status === 'pending' && !isPastDate && (
            <button
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => onNotifyArrival(appointment.id)}
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 text-sm font-bold py-2 px-3 rounded-lg shadow-md border border-gray-200 transition-all flex items-center gap-2 z-20"
            >
              <span className="text-base">🔔</span> Notificar Llegada
            </button>
          )}

          {appointment.status === 'arrived' && !isPastDate && (
            <button
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => onAttendPatient(appointment)}
              className="bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-bold py-2 px-3 rounded-lg shadow-md transition-all flex items-center gap-2 z-20"
            >
              <span className="text-base">👨‍⚕️</span> Atender
            </button>
          )}
        </div>
      </div>
      
      {height > 64 && (
        <p className="text-xs opacity-75 mt-auto">{appointment.time} ({appointment.duration * 30} min)</p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE: VISTA DE CALENDARIO (AGENDA) - AHORA EXPORTADO POR DEFECTO
// ----------------------------------------------------------------------
export default function CalendarView({ appointments, setAppointments, doctors, schedule }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newAppt, setNewAppt] = useState({
    patient: '',
    treatment: '',
    date: formatDateToISO(new Date()),
    time: '08:00',
    duration: 1,
    doctor: doctors[0] || 'Dr. Silva',
    status: 'pending'
  });

  const timeSlots = generateTimeSlots(schedule.start, schedule.end);

  const calculateTop = (time) => {
    const index = timeSlots.indexOf(time);
    return index !== -1 ? index * 64 : -100;
  };
  const calculateHeight = (duration) => duration * 64;

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    setAppointments((prev) =>
      prev.map((appt) => {
        if (appt.id === active.id) {
          return { ...appt, time: over.id };
        }
        return appt;
      })
    );
  };

  const handleNotifyArrival = (appointmentId) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === appointmentId ? { ...appt, status: 'arrived' } : appt
    ));
  };

  const handleAttendPatient = (appointment) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === appointment.id ? { ...appt, status: 'attending' } : appt
    ));
    alert(`📢 ATENCIÓN: El paciente ${appointment.patient} ya puede pasar al consultorio con ${appointment.doctor}.`);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newAppt.patient.trim() || !newAppt.treatment.trim()) return;

    const colors = [
      'bg-blue-100 border-blue-400 text-blue-800',
      'bg-green-100 border-green-400 text-green-800',
      'bg-purple-100 border-purple-400 text-purple-800',
      'bg-amber-100 border-amber-400 text-amber-800'
    ];

    const appointmentToAdd = {
      ...newAppt,
      id: Date.now(),
      duration: Number(newAppt.duration),
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setAppointments([...appointments, appointmentToAdd]);
    setIsModalOpen(false);
    
    setNewAppt({ patient: '', treatment: '', date: formatDateToISO(currentDate), time: timeSlots[0], duration: 1, doctor: doctors[0] || 'Dr. Silva', status: 'pending' });
  };

  const openModal = () => {
    setNewAppt(prev => ({ ...prev, date: formatDateToISO(currentDate), time: timeSlots[0] }));
    setIsModalOpen(true);
  };

  const currentIsoDate = formatDateToISO(currentDate);
  const todayIso = formatDateToISO(new Date());

  const filteredAppointments = appointments.filter(appt => {
    const matchesDate = appt.date === currentIsoDate;
    const matchesDoctor = selectedDoctor === 'Todos' || appt.doctor === selectedDoctor;
    return matchesDate && matchesDoctor;
  });

  return (
    <div className="flex w-full gap-6">
      <div className="w-1/2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[750px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Agenda Clínica</h2>
            <p className="text-blue-600 font-semibold text-sm mt-1">{formatDisplayDate(currentDate)}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button onClick={handlePrevDay} className="px-3 py-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded-md text-sm font-semibold transition-all">&larr;</button>
              <button onClick={handleToday} className="px-3 py-1.5 text-gray-800 hover:bg-white hover:shadow-sm rounded-md text-sm font-bold transition-all mx-1">Hoy</button>
              <button onClick={handleNextDay} className="px-3 py-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded-md text-sm font-semibold transition-all mr-2">&rarr;</button>
              
              <div className="relative border-l border-gray-300 pl-3 pr-1 flex items-center justify-center">
                <input
                  type="date"
                  value={formatDateToISO(currentDate)}
                  onChange={(e) => {
                    if (!e.target.value) return; 
                    const [year, month, day] = e.target.value.split('-');
                    setCurrentDate(new Date(year, month - 1, day));
                  }}
                  className="w-[24px] h-[24px] bg-transparent outline-none cursor-pointer text-transparent [&::-webkit-datetime-edit]:hidden [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  title="Seleccionar fecha específica"
                />
              </div>
            </div>

            <button
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>+</span> Nueva Cita
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 pb-4 border-b border-gray-100 overflow-x-auto">
          {['Todos', ...doctors].map((doc) => (
            <button
              key={doc}
              onClick={() => setSelectedDoctor(doc)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                selectedDoctor === doc
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {doc}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto relative rounded-xl border border-gray-100 bg-white">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-[80px_1fr] relative">
              <div className="flex flex-col border-r border-gray-200 bg-white z-20">
                {timeSlots.map((time) => (
                  <div key={time} className="h-16 border-b border-gray-100 flex items-start justify-center pt-2">
                    <span className="text-xs font-semibold text-gray-400">{time}</span>
                  </div>
                ))}
              </div>

              <div className="relative bg-gray-50/30">
                {timeSlots.map((time) => (
                  <DroppableSlot key={time} time={time} />
                ))}

                {filteredAppointments.map((appt) => {
                  const isPastDate = appt.date < todayIso; 
                  const topPos = calculateTop(appt.time);
                  if (topPos < 0) return null; 

                  return (
                    <DraggableAppointment
                      key={appt.id}
                      appointment={appt}
                      top={topPos}
                      height={calculateHeight(appt.duration)}
                      onNotifyArrival={handleNotifyArrival}
                      onAttendPatient={handleAttendPatient}
                      isPastDate={isPastDate} 
                    />
                  );
                })}
              </div>
            </div>
          </DndContext>
        </div>
      </div>

      <div className="w-1/2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 h-[750px]">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium text-gray-500">Detalles de la cita</p>
        <p className="text-sm mt-2">Selecciona una cita en la agenda para ver su información aquí.</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agendar Nueva Cita</h3>

            <form onSubmit={handleCreateAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Paciente</label>
                <input type="text" required value={newAppt.patient} onChange={(e) => setNewAppt({ ...newAppt, patient: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tratamiento o Motivo</label>
                <input type="text" required value={newAppt.treatment} onChange={(e) => setNewAppt({ ...newAppt, treatment: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                  <input type="date" required value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hora</label>
                  <select value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duración</label>
                  <select value={newAppt.duration} onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value={1}>30 minutos</option>
                    <option value={2}>1 hora</option>
                    <option value={3}>1.5 horas</option>
                    <option value={4}>2 horas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor</label>
                  <select value={newAppt.doctor} onChange={(e) => setNewAppt({ ...newAppt, doctor: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {doctors.map(doc => (<option key={doc} value={doc}>{doc}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">Guardar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE: VISTA DE AJUSTES (Usuarios y Horarios) - AHORA EXPORTADO
// ----------------------------------------------------------------------
export function SettingsView({ doctors, setDoctors, schedule, setSchedule }) {
  const [newDoctorName, setNewDoctorName] = useState('');

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoctorName.trim()) return;
    const formattedName = newDoctorName.startsWith('Dr.') || newDoctorName.startsWith('Dra.') 
      ? newDoctorName 
      : `Dr. ${newDoctorName}`;
      
    if (!doctors.includes(formattedName)) {
      setDoctors([...doctors, formattedName]);
      setNewDoctorName('');
      alert(`Usuario ${formattedName} registrado con éxito.`);
    } else {
      alert('Este usuario ya existe.');
    }
  };

  const handleRemoveDoctor = (docToRemove) => {
    if (doctors.length <= 1) {
      alert('Debe haber al menos un doctor registrado.');
      return;
    }
    setDoctors(doctors.filter(d => d !== docToRemove));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajustes del Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-100 p-6 rounded-xl bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👨‍⚕️</span> Gestión de Doctores / Usuarios
          </h3>
          
          <form onSubmit={handleAddDoctor} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Ej. Dr. Ramirez"
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all">
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personal Activo</p>
            {doctors.map((doc) => (
              <div key={doc} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="font-semibold text-sm text-gray-700">{doc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDoctor(doc)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition-all"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-100 p-6 rounded-xl bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⏰</span> Horario General de Atención
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora de Apertura</label>
              <input type="time" name="start" value={schedule.start} onChange={handleScheduleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora de Cierre</label>
              <input type="time" name="end" value={schedule.end} onChange={handleScheduleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              * Modificar estos horarios actualizará automáticamente los bloques de tiempo disponibles en la agenda clínica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}