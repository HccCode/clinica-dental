import React, { createContext, useState, useContext } from 'react';

// Creamos el contexto
const AuthContext = createContext();

// Lista de usuarios simulados (Mock Database)
const mockUsers = [
  { id: 1, name: 'Recepcionista Ana', role: 'receptionist', email: 'admin@clinica.com', password: '123' },
  { id: 2, name: 'Dr. Silva', role: 'doctor', email: 'silva@clinica.com', password: '123' },
  { id: 3, name: 'Dra. Gómez', role: 'doctor', email: 'gomez@clinica.com', password: '123' }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true; // Login exitoso
    }
    return false; // Credenciales incorrectas
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);