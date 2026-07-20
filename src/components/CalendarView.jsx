import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// --- 1. DATOS INICIALES ---
const INITIAL_APPOINTMENTS = [
  { id: '1', patient: 'Juan Pérez', treatment: 'Limpieza', dayIndex: 0, time: '09:15', duration: 45 },
  { id: '2', patient: 'Ana Gómez', treatment: 'Extracción', dayIndex: 1, time: '11:00', duration: 90 },
  { id: '3', patient: 'Carlos Ruiz', treatment: 'Revisión', dayIndex: 1, time: '14:30', duration: 30 },
  { id: '4', patient: 'María José', treatment: 'Ortodoncia', dayIndex: 3, time: '10:00', duration: 60 },
];

const PIXELS_PER_HOUR = 80;
const START_HOUR = 8;

// --- 2. FUNCIONES MATEMÁTICAS ---
const calculatePosition = (time, durationMinutes) => {
  const [hours, minutes] = time.split(':').map(Number);
  const topInHours = (hours - START_HOUR) + (minutes / 60);
  return {
    top: `${topInHours * PIXELS_PER_HOUR}px`,
    height: `${(durationMinutes / 60) * PIXELS_PER_HOUR}px`,
  };
};

const addMinutesToTime = (time, addedMins) => {
  const [h, m] = time.split(':').map(Number);
  let total = (h * 60) + m + addedMins;
  
  // Límites: No antes de las 8:00 AM ni después de las 6:00 PM
  if (total < 8 * 60) total = 8 * 60;
  if (total > 18 * 60) total = 18 * 60;
  
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};


// --- 3. COMPONENTE: Cita Arrastrable ---
function DraggableAppointment({ app }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: app,
  });

  const baseStyle = calculatePosition(app.time, app.duration);
  const style = {
    ...baseStyle,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute left-2 right-2 bg-indigo-50/90 border border-indigo-200 rounded-lg p-2 backdrop-blur-sm cursor-grab active:cursor-grabbing overflow-hidden group transition-shadow
        ${isDragging ? 'shadow-2xl opacity-90 scale-105 border-indigo-400' : 'shadow-sm hover:shadow-md hover:scale-[1.02]'}
      `}
    >
      <div className="w-1 absolute left-0 top-2 bottom-2 bg-indigo-500 rounded-r-md"></div>
      <p className="text-xs font-bold text-indigo-900 leading-tight truncate">{app.treatment}</p>
      <p className="text-[10px] text-indigo-600 font-medium truncate">{app.patient}</p>
      
      {app.duration >= 45 && (
        <p className="text-[9px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.time} ({app.duration}m)
        </p>
      )}
    </div>
  );
}

// --- 4. COMPONENTE: Columna de Día (Zona para Soltar) ---
function DroppableDay({ index, day, hours, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: index.toString(), // El ID es el índice del día (0, 1, 2...)
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 flex flex-col min-w-[120px] border-r border-slate-200/30 last:border-r-0 relative transition-colors
        ${isOver ? 'bg-indigo-50/30' : ''}
      `}
    >
      <div className="h-12 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day.split(' ')[0]}</span>
        <span className="text-lg font-black text-slate-700 leading-none mt-1">{day.split(' ')[1]}</span>
      </div>
      <div className="flex-1 relative">
        {hours.map((hour) => (
          <div key={hour} className="h-20 border-b border-slate-200/30">
            <div className="h-10 border-b border-slate-100 border-dashed"></div>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}


// --- 5. COMPONENTE PRINCIPAL ---
export function CalendarView() {
  const days = ['Lunes 20', 'Martes 21', 'Miércoles 22', 'Jueves 23', 'Viernes 24'];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); 
  
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);

  // Lógica principal al soltar una cita
  const handleDragEnd = (event) => {
    const { active, over, delta } = event;
    if (!over) return;

    // Calculamos el desplazamiento del ratón. 
    // Si PIXELS_PER_HOUR es 80, 20px son 15 minutos. Usamos esto para que "encaje" (snap) cada 15 min.
    const movedMinutes = Math.round(delta.y / 20) * 15;

    setAppointments((prev) => 
      prev.map((app) => {
        if (app.id === active.id) {
          return { 
            ...app, 
            dayIndex: parseInt(over.id, 10), // Nuevo día
            time: addMinutesToTime(app.time, movedMinutes) // Nueva hora
          };
        }
        return app;
      })
    );
  };

  return (
    <div className="flex flex-col h-[700px]">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Julio 2026</h2>
          <p className="text-sm text-indigo-500 font-medium">Semana 29</p>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 border border-white/50 rounded-2xl bg-white/40 shadow-inner overflow-y-auto relative">
          
          <div className="w-20 flex-shrink-0 border-r border-slate-200/50 bg-slate-50/50 backdrop-blur-sm sticky left-0 z-20">
            <div className="h-12 border-b border-slate-200/50"></div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-slate-200/50 relative">
                <span className="absolute -top-3 right-3 text-xs font-medium text-slate-400">{`${hour}:00`}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 flex min-w-[600px]">
            {days.map((day, index) => {
              const dayAppointments = appointments.filter(app => app.dayIndex === index);
              return (
                <DroppableDay key={index} index={index} day={day} hours={hours}>
                  {dayAppointments.map((app) => (
                    <DraggableAppointment key={app.id} app={app} />
                  ))}
                </DroppableDay>
              );
            })}
          </div>

        </div>
      </DndContext>
    </div>
  );
}