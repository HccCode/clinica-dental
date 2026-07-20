import { useDroppable } from '@dnd-kit/core';

export function BoardColumn({ id, title, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Si arrastramos una tarjeta encima, la columna brilla un poco más
  const overStyles = isOver 
    ? 'bg-indigo-50/50 border-indigo-200/60 shadow-inner' 
    : 'bg-slate-50/30 border-white/40 shadow-sm';

  return (
    <div className={`flex flex-col rounded-3xl p-4 min-w-[300px] min-h-[500px] border backdrop-blur-sm transition-all duration-300 ${overStyles}`}>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-lg font-bold text-slate-700">{title}</h2>
        <div className="bg-white/80 px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
          {children.length}
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-4 p-1"
      >
        {children}
      </div>
    </div>
  );
}