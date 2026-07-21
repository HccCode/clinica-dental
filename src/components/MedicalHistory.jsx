import React, { useState } from 'react';

const MedicalHistory = () => {
  // 1. Estado inicial con los datos preexistentes de tu diseño
  const [notes, setNotes] = useState([
    {
      id: 1,
      date: '15 de Julio, 2026',
      title: 'Consulta General y Limpieza',
      description: 'Paciente acude a revisión de rutina. Se realiza profilaxis. No se detectan caries nuevas. Encías presentan ligera inflamación en el cuadrante inferior izquierdo, se recomienda mejorar técnica de cepillado.'
    },
    {
      id: 2,
      date: '10 de Enero, 2026',
      title: 'Apertura de Expediente',
      description: 'Registro inicial del paciente. Se toman radiografías panorámicas (ver pestaña de archivos). Se reporta sensibilidad al frío en piezas 14 y 15.'
    }
  ]);

  // 2. Estados para controlar el Modal y el nuevo input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', description: '' });

  // 3. Función para procesar y guardar la nueva nota
  const handleSaveNote = (e) => {
    e.preventDefault();
    
    // Validación básica para evitar notas vacías
    if (!newNote.title.trim() || !newNote.description.trim()) return;

    // Generar la fecha actual con un formato amigable
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const currentDate = new Date().toLocaleDateString('es-MX', options);

    const noteToAdd = {
      id: Date.now(), // ID único temporal basado en la fecha exacta
      date: currentDate,
      title: newNote.title,
      description: newNote.description
    };

    // Agregar la nueva nota al inicio del arreglo para que aparezca arriba en la línea de tiempo
    setNotes([noteToAdd, ...notes]);

    // Limpiar el formulario y cerrar el modal
    setNewNote({ title: '', description: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial Clínico</h2>
          <p className="text-gray-500 text-sm mt-1">Registro de consultas y evolución del paciente.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <span>+</span> Nueva Nota
        </button>
      </div>

      {/* Línea de tiempo renderizada dinámicamente */}
      <div className="relative border-l-2 border-blue-200 ml-3">
        {notes.map((note, index) => (
          <div key={note.id} className="mb-10 ml-6 relative">
            {/* Punto indicador en la línea */}
            <span 
              className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-white ${
                index === 0 ? 'bg-blue-500' : 'bg-gray-400'
              }`}
            ></span>

            <h3 className="text-sm font-bold text-blue-600 mb-2">{note.date}</h3>
            
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{note.title}</h4>
              <p className="text-gray-600 leading-relaxed text-sm">{note.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay con efecto "Glassmorphism" suave */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4 transform transition-all">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agregar Nueva Nota</h3>

            <form onSubmit={handleSaveNote}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Motivo de Consulta / Tratamiento
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. Resina en pieza 14"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción y Evolución
                </label>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-y"
                  placeholder="Detalles clínicos del procedimiento, observaciones, etc."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;