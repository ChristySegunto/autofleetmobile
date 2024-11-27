import React, { createContext, useState, useContext } from 'react';

// Create a context to hold authentication state
const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to log in and set user
  const login = (userData) => {
    setUser(userData);
  };

  // Function to log out and clear user data
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
