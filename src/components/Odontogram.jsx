import React, { useState } from 'react';

// --- 1. Generación del Estado Inicial ---
const quadrants = {
  topRight: [18, 17, 16, 15, 14, 13, 12, 11],
  topLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  bottomLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  bottomRight: [48, 47, 46, 45, 44, 43, 42, 41]
};

// Crea un objeto con las 32 llaves inicializadas
const generateInitialTeethState = () => {
  const initialState = {};
  Object.values(quadrants).flat().forEach((num) => {
    initialState[num] = {
      isMissing: false,
      faces: { top: 'healthy', right: 'healthy', bottom: 'healthy', left: 'healthy', center: 'healthy' }
    };
  });
  return initialState;
};

// --- 2. Sub-componente: Diente Individual (Ahora es un componente "Tonto/Controlado") ---
function Tooth({ number, data, onUpdate }) {
  const { isMissing, faces } = data;

  const toggleFace = (faceName) => {
    if (isMissing) return;

    const states = ['healthy', 'caries', 'filled'];
    const currentState = faces[faceName];
    const nextState = states[(states.indexOf(currentState) + 1) % states.length];

    // Llamamos a la función del padre para actualizar solo esta cara
    onUpdate(number, {
      ...data,
      faces: { ...faces, [faceName]: nextState }
    });
  };

  const toggleMissing = () => {
    onUpdate(number, {
      ...data,
      isMissing: !isMissing
    });
  };

  const getFillColor = (state) => {
    switch (state) {
      case 'caries': return 'fill-red-500 hover:fill-red-400';
      case 'filled': return 'fill-blue-500 hover:fill-blue-400';
      default: return 'fill-white hover:fill-slate-100';
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 group">
      <button 
        onClick={toggleMissing}
        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
        title="Marcar como ausente"
      >
        {number}
      </button>

      <div className={`relative w-12 h-12 transition-all ${isMissing ? 'opacity-40 grayscale' : ''}`}>
        {isMissing && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-3xl font-black text-slate-800">✕</span>
          </div>
        )}

        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <polygon points="0,0 100,0 75,25 25,25" onClick={() => toggleFace('top')} className={`stroke-slate-300 stroke-[3px] cursor-pointer transition-colors duration-200 ${getFillColor(faces.top)}`} />
          <polygon points="100,0 100,100 75,75 75,25" onClick={() => toggleFace('right')} className={`stroke-slate-300 stroke-[3px] cursor-pointer transition-colors duration-200 ${getFillColor(faces.right)}`} />
          <polygon points="0,100 100,100 75,75 25,75" onClick={() => toggleFace('bottom')} className={`stroke-slate-300 stroke-[3px] cursor-pointer transition-colors duration-200 ${getFillColor(faces.bottom)}`} />
          <polygon points="0,0 0,100 25,75 25,25" onClick={() => toggleFace('left')} className={`stroke-slate-300 stroke-[3px] cursor-pointer transition-colors duration-200 ${getFillColor(faces.left)}`} />
          <rect x="25" y="25" width="50" height="50" onClick={() => toggleFace('center')} className={`stroke-slate-300 stroke-[3px] cursor-pointer transition-colors duration-200 ${getFillColor(faces.center)}`} />
        </svg>
      </div>
    </div>
  );
}

// --- 3. Componente Principal: Odontograma ---
export function Odontogram() {
  // El estado global de los 32 dientes vive aquí
  const [teethState, setTeethState] = useState(generateInitialTeethState());

  // Función que se le pasa a cada diente para que pueda actualizar su propia porción del estado
  const handleToothUpdate = (toothNumber, newToothData) => {
    setTeethState((prev) => ({
      ...prev,
      [toothNumber]: newToothData
    }));
  };

  // Función para simular el guardado en base de datos
  const handleSaveToDatabase = () => {
    const jsonToSave = JSON.stringify(teethState, null, 2);
    console.log("JSON listo para enviar al backend:", jsonToSave);
    alert("Revisa la consola del navegador para ver el JSON generado.");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      
      {/* Botón de Guardado */}
      <div className="absolute top-0 right-0">
        <button 
          onClick={handleSaveToDatabase}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
        >
          Guardar Odontograma
        </button>
      </div>

      <div className="bg-white/80 p-8 rounded-2xl shadow-sm border border-slate-200/50 mt-12">
        
        {/* Maxilar Superior */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 pr-4 border-r-2 border-slate-200">
            {quadrants.topRight.map(num => (
              <Tooth key={num} number={num} data={teethState[num]} onUpdate={handleToothUpdate} />
            ))}
          </div>
          <div className="flex gap-2 pl-4">
            {quadrants.topLeft.map(num => (
              <Tooth key={num} number={num} data={teethState[num]} onUpdate={handleToothUpdate} />
            ))}
          </div>
        </div>

        <div className="w-full h-[2px] bg-slate-200 my-4 rounded-full"></div>

        {/* Maxilar Inferior */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2 pr-4 border-r-2 border-slate-200">
            {quadrants.bottomRight.map(num => (
              <Tooth key={num} number={num} data={teethState[num]} onUpdate={handleToothUpdate} />
            ))}
          </div>
          <div className="flex gap-2 pl-4">
            {quadrants.bottomLeft.map(num => (
              <Tooth key={num} number={num} data={teethState[num]} onUpdate={handleToothUpdate} />
            ))}
          </div>
        </div>

      </div>

      {/* Leyenda de Estados */}
      <div className="mt-8 flex gap-6 text-sm font-medium text-slate-500">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-slate-300 rounded"></div> Sano</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded"></div> Caries</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div> Obturado</div>
        <div className="flex items-center gap-2 text-xl font-black text-slate-800 leading-none">✕ <span className="text-sm font-medium text-slate-500 ml-1">Ausente</span></div>
      </div>
    </div>
  );
}