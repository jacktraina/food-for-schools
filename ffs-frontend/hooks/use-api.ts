import apiClient from '@/lib/api/client';
import { Meta } from '@/types/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export function useApiQuery<T>(
  endpoint: string,
  queryKey: string[],
  options = {}
) {
  return useQuery<T, AxiosError<Meta>>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    },
    ...options,
  });
}

export function usePostMutation<T, R>(endpoint: string, options = {}) {
  return useMutation<R, AxiosError<Meta>, T>({
    mutationFn: async (data: T) => {
      const response = await apiClient.post<R>(endpoint, data);
      return response.data;
    },
    ...options,
  });
}

export function usePutMutation<T, R>(endpoint: string, options = {}) {
  return useMutation<R, AxiosError<Meta>, { id: string; data: T }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<R>(`${endpoint}/${id}`, data);
      return response.data;
    },
    ...options,
  });
}

export function usePatchMutation<T, R>(endpoint: string, options = {}) {
  return useMutation<R, AxiosError<Meta>, { id: string; data: T }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<R>(`${endpoint}/${id}`, data);
      return response.data;
    },
    ...options,
  });
}

export function useDeleteMutation<R>(endpoint: string, options = {}) {
  return useMutation<R, AxiosError<Meta>, string>({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<R>(`${endpoint}/${id}`);
      return response.data;
    },
    ...options,
  });
}
