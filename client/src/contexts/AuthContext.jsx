import React, { createContext, useState, useContext } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { useVehicles } from '../store/useVehicles'; // Import the store

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const fetchUserFavorites = useVehicles(state => state.fetchUserFavorites);
  const clearFavorites = useVehicles(state => state.clearFavorites);

  const login = async (username, password) => {
    const response = await vehicleApi.login(username, password);
    setUser(response.user);
    // Fetch favorites for the logged-in user
    fetchUserFavorites(response.user.id);
  };

  const signup = async (username, password) => {
    await vehicleApi.signup(username, password);
  };

  const logout = () => {
    setUser(null);
    // Clear favorites on logout
    clearFavorites();
  };

  const value = {
    user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};