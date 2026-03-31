import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SiteContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [onlineServices, setOnlineServices] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, servicesRes, onlineServicesRes, municipalitiesRes] = await Promise.all([
        axios.get(`${API_URL}/api/public/settings`),
        axios.get(`${API_URL}/api/public/services`),
        axios.get(`${API_URL}/api/public/online-services`),
        axios.get(`${API_URL}/api/public/municipalities`)
      ]);
      
      setSettings(settingsRes.data);
      setServices(servicesRes.data);
      setOnlineServices(onlineServicesRes.data);
      setMunicipalities(municipalitiesRes.data);
    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    fetchData();
  };

  return (
    <SiteContext.Provider value={{ 
      settings, 
      services, 
      onlineServices, 
      municipalities, 
      loading,
      refreshData 
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
