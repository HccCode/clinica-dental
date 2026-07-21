import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ----------------------------------------------------------------------
// FUNCIONES DE AYUDA PARA FECHAS
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
function DraggableAppointment({ appointment, top, height, onNotifyArrival }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    top: `${top}px`,
    height: `${height}px`,
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute left-4 right-4 ${appointment.color} border-l-4 rounded-r-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex justify-between items-start">
        {/* Izquierda: Info del Paciente */}
        <div>
          <h4 className="font-bold text-sm flex items-center gap-2">
            {appointment.patient}
            {appointment.status === 'arrived' && (
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold tracking-wide">
                ✓ EN ESPERA
              </span>
            )}
          </h4>
          <p className="text-xs mt-1 font-medium opacity-90">{appointment.treatment}</p>
        </div>
        
        {/* Derecha: Info del Doctor y Botón */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{appointment.doctor}</span>
          
          {appointment.status === 'pending' && (
            <button
              // Detenemos la propagación para que al dar clic no se active el arrastre de la tarjeta
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => onNotifyArrival(appointment.id)}
              className="bg-white/60 hover:bg-white hover:scale-105 active:scale-95 text-gray-800 text-[10px] font-bold py-1 px-2.5 rounded shadow-sm border border-black/5 transition-all flex items-center gap-1"
            >
              🔔 Notificar
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
// COMPONENTE PRINCIPAL: CALENDARIO
// ----------------------------------------------------------------------
export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Añadimos la propiedad "status: 'pending'" al estado inicial
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: '2026-07-20',
      patient: 'Juan Pérez',
      treatment: 'Resina Pieza 14',
      time: '09:00',
      duration: 2,
      doctor: 'Dr. Silva',
      color: 'bg-blue-100 border-blue-400 text-blue-800',
      status: 'pending'
    },
    {
      id: 2,
      date: '2026-07-20',
      patient: 'María López',
      treatment: 'Limpieza General',
      time: '10:30',
      duration: 1,
      doctor: 'Dra. Gómez',
      color: 'bg-green-100 border-green-400 text-green-800',
      status: 'arrived' // Esta cita ya fue notificada como ejemplo
    },
    {
      id: 3,
      date: '2026-07-21', 
      patient: 'Roberto Carlos',
      treatment: 'Extracción Muela del Juicio',
      time: '13:00',
      duration: 3,
      doctor: 'Dr. Silva',
      color: 'bg-purple-100 border-purple-400 text-purple-800',
      status: 'pending'
    }
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newAppt, setNewAppt] = useState({
    patient: '',
    treatment: '',
    date: formatDateToISO(new Date()),
    time: '09:00',
    duration: 1,
    doctor: 'Dr. Silva',
    status: 'pending' // Las nuevas citas nacen como pendientes
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ];

  const calculateTop = (time) => timeSlots.indexOf(time) * 64;
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

  // Función que cambia el estado al dar clic en el botón
  const handleNotifyArrival = (appointmentId) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === appointmentId ? { ...appt, status: 'arrived' } : appt
    ));
    
    // Opcional: Aquí podrías enviar un Toast o una alerta visual general
    // alert("Se ha notificado al doctor.");
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
    
    setNewAppt({ patient: '', treatment: '', date: formatDateToISO(currentDate), time: '09:00', duration: 1, doctor: 'Dr. Silva', status: 'pending' });
  };

  const openModal = () => {
    setNewAppt(prev => ({ ...prev, date: formatDateToISO(currentDate) }));
    setIsModalOpen(true);
  };

  const currentIsoDate = formatDateToISO(currentDate);
  const filteredAppointments = appointments.filter(appt => {
    const matchesDate = appt.date === currentIsoDate;
    const matchesDoctor = selectedDoctor === 'Todos' || appt.doctor === selectedDoctor;
    return matchesDate && matchesDoctor;
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[750px]">
      
      {/* Cabecera del Calendario */}
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

      {/* Filtros por Doctor */}
      <div className="flex gap-2 mb-6 pb-4 border-b border-gray-100">
        {['Todos', 'Dr. Silva', 'Dra. Gómez'].map((doc) => (
          <button
            key={doc}
            onClick={() => setSelectedDoctor(doc)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              selectedDoctor === doc
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {doc}
          </button>
        ))}
      </div>

      {/* Cuadrícula del Calendario */}
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

              {filteredAppointments.map((appt) => (
                <DraggableAppointment
                  key={appt.id}
                  appointment={appt}
                  top={calculateTop(appt.time)}
                  height={calculateHeight(appt.duration)}
                  onNotifyArrival={handleNotifyArrival} // Pasamos la función a la tarjeta
                />
              ))}
            </div>

          </div>
        </DndContext>
      </div>

      {/* Modal para Nueva Cita */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agendar Nueva Cita</h3>

            <form onSubmit={handleCreateAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Paciente</label>
                <input
                  type="text"
                  required
                  value={newAppt.patient}
                  onChange={(e) => setNewAppt({ ...newAppt, patient: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tratamiento o Motivo</label>
                <input
                  type="text"
                  required
                  value={newAppt.treatment}
                  onChange={(e) => setNewAppt({ ...newAppt, treatment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hora</label>
                  <select
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duración</label>
                  <select
                    value={newAppt.duration}
                    onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>30 minutos</option>
                    <option value={2}>1 hora</option>
                    <option value={3}>1.5 horas</option>
                    <option value={4}>2 horas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor</label>
                  <select
                    value={newAppt.doctor}
                    onChange={(e) => setNewAppt({ ...newAppt, doctor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Dr. Silva">Dr. Silva</option>
                    <option value="Dra. Gómez">Dra. Gómez</option>
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