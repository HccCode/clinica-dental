import React, { useState, useEffect } from 'react';

export default function AjustesView({ onConfigChange }) {
  const [usuarios, setUsuarios] = useState([]);
  const [config, setConfig] = useState({ nombre_negocio: '', subtitulo_negocio: '', logo: null });
  
  // Estado para el formulario de usuarios
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ 
    nombre: '', 
    nip: '', 
    rol: 'doctor',
    permisos: { recepcion: true, clinica: true, analitica: false, ajustes: false, escritura: false }
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Cargar datos al iniciar
  useEffect(() => {
    fetchConfig();
    fetchUsuarios();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/config');
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error("Error al cargar config:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // --- MÉTODOS PARA MARCA COMERCIAL ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleConfigSave = async () => {
    try {
      await fetch('http://localhost:3001/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setMensaje({ texto: 'Marca comercial actualizada', tipo: 'success' });
      if (onConfigChange) onConfigChange(config);
    } catch (error) {
      setMensaje({ texto: 'Error al actualizar marca', tipo: 'error' });
    }
  };

  // --- MÉTODOS PARA USUARIOS ---
  const generarNIP = () => {
    const randomNIP = Math.floor(10000 + Math.random() * 90000).toString();
    setUserForm({ ...userForm, nip: randomNIP });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const url = editingUserId 
      ? `http://localhost:3001/api/usuarios/${editingUserId}` 
      : 'http://localhost:3001/api/usuarios';
    const method = editingUserId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMensaje({ texto: editingUserId ? 'Usuario actualizado' : 'Usuario agregado', tipo: 'success' });
      setUserForm({ 
        nombre: '', nip: '', rol: 'doctor', 
        permisos: { recepcion: true, clinica: true, analitica: false, ajustes: false, escritura: false }
      });
      setEditingUserId(null);
      fetchUsuarios();
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    }
  };

  const editarUsuario = (user) => {
    setEditingUserId(user.id);
    setUserForm({ 
      nombre: user.nombre, 
      nip: '', 
      rol: user.rol,
      permisos: user.permisos || { recepcion: true, clinica: true, analitica: false, ajustes: false, escritura: false }
    });
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await fetch(`http://localhost:3001/api/usuarios/${id}`, { method: 'DELETE' });
      fetchUsuarios();
      setMensaje({ texto: 'Usuario eliminado', tipo: 'success' });
    } catch (error) {
      setMensaje({ texto: 'Error al eliminar', tipo: 'error' });
    }
  };

  return (
    <div className="bg-transparent animate-fade-in space-y-6">
      
      {/* Alerta de Mensajes */}
      {mensaje.texto && (
        <div className={`p-4 rounded-xl font-bold text-center transition-all ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
      {/* TARJETA 1: MARCA COMERCIAL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             Marca Comercial
          </h3>
          <div className="space-y-4">
            
            {/* SECCIÓN DE LOGO */}
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {config.logo ? (
                  <img src={config.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Logo del Sistema</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre Principal</label>
              <input 
                type="text" 
                value={config.nombre_negocio}
                onChange={(e) => setConfig({...config, nombre_negocio: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold"
                placeholder="Ej. NexusFlow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Subtítulo / Especialidad</label>
              <input 
                type="text" 
                value={config.subtitulo_negocio}
                onChange={(e) => setConfig({...config, subtitulo_negocio: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold text-blue-600 uppercase"
                placeholder="Ej. DENTAL CORE"
              />
            </div>
            <button onClick={handleConfigSave} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl transition-all mt-2">
              Guardar Cambios de Marca
            </button>
          </div>
        </div>

        {/* TARJETA 2: GESTIÓN DE USUARIOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             Gestión de Personal
          </h3>
          
          <form onSubmit={handleUserSubmit} className="bg-[#F4F7FE] p-4 rounded-xl border border-gray-200 mb-6 space-y-4">
            <div>
              <input 
                type="text" required placeholder="Nombre del empleado (Ej. Dr. Ramírez)"
                value={userForm.nombre} onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                className="w-full border-2 border-white rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={userForm.rol} onChange={(e) => setUserForm({...userForm, rol: e.target.value})}
                className="w-1/3 border-2 border-white rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium bg-white cursor-pointer"
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="recepcion">Recepción</option>
              </select>
              <input 
                type="text" required placeholder="NIP 5 dígitos" maxLength={5} minLength={5}
                value={userForm.nip} onChange={(e) => setUserForm({...userForm, nip: e.target.value.replace(/\D/g, '')})}
                className="w-1/3 border-2 border-white rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold tracking-widest text-center bg-white"
              />
              <button type="button" onClick={generarNIP} className="w-1/3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Generar NIP
              </button>
            </div>

            {/* PANEL DE PERMISOS */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Permisos de Módulos</p>
              <div className="flex flex-wrap gap-4 mb-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={userForm.permisos.recepcion} onChange={(e) => setUserForm({...userForm, permisos: {...userForm.permisos, recepcion: e.target.checked}})} className="accent-blue-600 w-4 h-4" /> Recepción
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={userForm.permisos.clinica} onChange={(e) => setUserForm({...userForm, permisos: {...userForm.permisos, clinica: e.target.checked}})} className="accent-blue-600 w-4 h-4" /> Clínica
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={userForm.permisos.analitica} onChange={(e) => setUserForm({...userForm, permisos: {...userForm.permisos, analitica: e.target.checked}})} className="accent-blue-600 w-4 h-4" /> Analítica
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={userForm.permisos.ajustes} onChange={(e) => setUserForm({...userForm, permisos: {...userForm.permisos, ajustes: e.target.checked}})} className="accent-blue-600 w-4 h-4" /> Ajustes
                </label>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-blue-700 font-bold">
                  <input type="checkbox" checked={userForm.permisos.escritura} onChange={(e) => setUserForm({...userForm, permisos: {...userForm.permisos, escritura: e.target.checked}})} className="accent-blue-600 w-4 h-4" /> 
                  Permitir Escritura (Crear, Editar y Eliminar datos)
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all">
                {editingUserId ? 'Actualizar Usuario' : 'Agregar Usuario'}
              </button>
              {editingUserId && (
                <button type="button" onClick={() => {
                  setEditingUserId(null); 
                  setUserForm({nombre: '', nip: '', rol: 'doctor', permisos: { recepcion: true, clinica: true, analitica: false, ajustes: false, escritura: false }});
                }} className="px-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div>
            <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Personal Activo ({usuarios.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {usuarios.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 border-2 border-gray-100 rounded-xl hover:border-blue-100 transition-colors group">
                  <div>
                    <p className="font-bold text-gray-800">{user.nombre}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">{user.rol}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editarUsuario(user)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Editar</button>
                    <button onClick={() => eliminarUsuario(user.id)} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}