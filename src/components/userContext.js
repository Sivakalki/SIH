import React, { createContext, useState, useEffect } from 'react';

// Create a context
const UserContext = createContext();

// Create a provider component
const UserProvider = ({ children }) => {
  // Retrieve token from localStorage if available
  const storedToken = localStorage.getItem('token');
  const [token, setToken] = useState(storedToken);

  // Update token and store in localStorage
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // Logout and remove token from localStorage
  const logout = () => {
    console.log("called logout function");
    setToken(null);
    localStorage.removeItem('token');
  };

  // Provide context values to children components
  return (
    <UserContext.Provider value={{ token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
