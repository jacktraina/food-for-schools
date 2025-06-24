'use client';

import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { LoginResponse } from '@/types/auth';
import apiClient from '@/lib/api/client';

const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const login = async (
    email: string,
    password: string
  ): Promise<AxiosResponse<LoginResponse> | undefined> => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/users/login`, { email, password });
      return response;
    } catch (err) {
      console.log('error', err);
      if (err instanceof AxiosError) {
        setError(err?.response?.data.message || 'Something went wrong!');
      } else {
        setError('Something went wrong!');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    setError,
    error,
    login,
  };
};

export default useAuth;
