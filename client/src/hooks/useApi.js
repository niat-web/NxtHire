// client/src/hooks/useApi.js
import { useState, useCallback } from 'react';
import api from '../api/axios';
import { useAlert } from './useAlert';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { showError } = useAlert();

  const request = useCallback(async (
    method, 
    url, 
    body = null, 
    config = {}, 
    showErrorToast = true
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api[method](url, body, config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        'An error occurred. Please try again.';
      
      setError(errorMessage);
      
      if (showErrorToast) {
        showError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const get = useCallback((url, config, showErrorToast = true) => 
    request('get', url, null, config, showErrorToast), [request]);

  const post = useCallback((url, body, config, showErrorToast = true) => 
    request('post', url, body, config, showErrorToast), [request]);

  const put = useCallback((url, body, config, showErrorToast = true) => 
    request('put', url, body, config, showErrorToast), [request]);

  const del = useCallback((url, config, showErrorToast = true) => 
    request('delete', url, null, config, showErrorToast), [request]);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    del
  };
};