import React, { useState, useEffect, useRef } from 'react';

export default function LoginView({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencia para hacer auto-focus en el input al cargar la pantalla
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePinChange = async (e) => {
    // 1. Limpiar la entrada: Permitir única y exclusivamente números
    const value = e.target.value.replace(/\D/g, '');
    
    // 2. Actualizar el estado si no excede los 5 dígitos
    if (value.length <= 5) {
      setPin(value);
      setError(''); // Limpiamos errores previos al escribir
    }

    // 3. AUTO-ENTER: Si llega exactamente a 5 dígitos, disparamos la validación
    if (value.length === 5) {
      await authenticateUser(value);
    }
  };

  const authenticateUser = async (pinCode) => {
    setIsLoading(true);
    
    try {
      // Petición POST al backend (puerto 3001 como indica tu server.js)
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip: pinCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.usuario) {
        // Entra al sistema y pasamos los datos del usuario (id, nombre, rol)
        onLogin(data.usuario); 
      } else {
        // Mostramos el mensaje de error que viene del backend (ej. "NIP incorrecto...")
        setError(data.message || 'NIP incorrecto. Acceso denegado.');
        setPin(''); // Limpiamos el input
        if (inputRef.current) inputRef.current.focus(); // Regresar el cursor
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError('Error al conectar con la base de datos.');
      setPin('');
      if (inputRef.current) inputRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center transition-all">
        
        <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">NexusFlow</h2>
        <p className="text-sm font-medium text-gray-500 mb-8">Ingresa tu NIP de 5 dígitos</p>
        
        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={5}
            value={pin}
            onChange={handlePinChange}
            disabled={isLoading}
            placeholder="•••••"
            className={`w-full text-center text-4xl tracking-[0.5em] font-bold py-4 rounded-xl outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 ${
              error 
                ? 'border-2 border-red-400 bg-red-50 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                : 'border-2 border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
            }`}
          />
        </div>

        {/* Mensaje de Error */}
        <div className="h-6 mb-4">
          {error && (
            <p className="text-sm font-bold text-red-500 animate-pulse">{error}</p>
          )}
        </div>

        {/* Indicador de Carga */}
        <button 
          disabled={true}
          className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 ${
            isLoading 
              ? 'bg-blue-100 text-blue-600 cursor-wait' 
              : 'bg-gray-50 text-gray-400 opacity-0' // Se oculta cuando no está cargando
          }`}
        >
          {isLoading && (
            <>
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </>
          )}
        </button>

      </div>
    </div>
  );
}