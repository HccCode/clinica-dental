import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';

export function PatientCard({ patient }) {
  const [secondsWaiting, setSecondsWaiting] = useState(0);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: patient.id,
  });

  // Efecto de Temporizador: Solo corre si el estado es 'waiting'
  useEffect(() => {
    let interval;
    if (patient.status === 'waiting') {
      interval = setInterval(() => {
        setSecondsWaiting((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsWaiting(0); // Reinicia el contador si sale de la sala de espera
    }
    return () => clearInterval(interval);
  }, [patient.status]);

  // Formateo del tiempo a MM:SS
  const mins = Math.floor(secondsWaiting / 60);
  const secs = secondsWaiting % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Lógica de alerta (Puesto a 10 segundos para pruebas. Cámbialo a 900 para 15 minutos)
  const isAlert = secondsWaiting > 10 && patient.status === 'waiting';

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto',
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative group bg-white/90 backdrop-blur p-5 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 border-2
        ${isDragging ? 'shadow-2xl scale-105 opacity-90' : 'shadow-md'} 
        ${isAlert ? 'border-red-400 shadow-red-100' : 'border-transparent'}
      `}
    >
      {/* Indicador de color lateral */}
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${isAlert ? 'bg-red-400' : 'bg-cyan-400'}`}></div>

      <div className="flex justify-between items-start mb-2 pl-2">
        <p className="font-bold text-slate-800 text-lg">{patient.name}</p>
        
        {/* Renderizado Condicional del Cronómetro */}
        {patient.status === 'waiting' && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-bold font-mono transition-colors
            ${isAlert ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}
          `}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeString}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center pl-2">
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100">
          {patient.treatment}
        </span>
      </div>
    </div>
  );
}