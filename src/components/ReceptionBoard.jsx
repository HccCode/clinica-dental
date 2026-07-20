import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { BoardColumn } from './BoardColumn';
import { PatientCard } from './PatientCard';

const INITIAL_PATIENTS = [
  { id: '1', name: 'Juan Pérez', treatment: 'Limpieza', status: 'waiting' },
  { id: '2', name: 'Ana Gómez', treatment: 'Extracción', status: 'waiting' },
];

export function ReceptionBoard() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setPatients((items) =>
        items.map((item) =>
          item.id === active.id ? { ...item, status: over.id } : item
        )
      );
    }
  };

  return (
    <div className="p-4">
      {/* El texto DEBE estar envuelto en una etiqueta, en este caso un <h1> */}
      <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
        Flujo Clínico de Pacientes
      </h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-wrap justify-center gap-6">
          <BoardColumn id="waiting" title="Sala de Espera">
            {patients.filter(p => p.status === 'waiting').map(p => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </BoardColumn>
          
          <BoardColumn id="in-treatment" title="En Tratamiento">
            {patients.filter(p => p.status === 'in-treatment').map(p => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </BoardColumn>

          <BoardColumn id="finished" title="Terminado">
            {patients.filter(p => p.status === 'finished').map(p => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </BoardColumn>
        </div>
      </DndContext>
    </div>
  );
}