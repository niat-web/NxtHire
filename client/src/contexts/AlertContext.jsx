// client/src/contexts/AlertContext.jsx
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Show success toast
  const showSuccess = (message) => {
    toast.success(message);
  };

  // Show error toast
  const showError = (message) => {
    toast.error(message);
  };

  // Show info toast
  const showInfo = (message) => {
    toast.info(message);
  };

  // Show warning toast
  const showWarning = (message) => {
    toast.warning(message);
  };

  // Add alert to state (for persistent alerts)
  const addAlert = (type, message, timeout = 0) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = {
      id,
      type,
      message
    };

    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

    if (timeout > 0) {
      setTimeout(() => removeAlert(id), timeout);
    }

    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  const value = {
    alerts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    addAlert,
    removeAlert,
    clearAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};