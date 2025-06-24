import apiClient from './client';
import {
  CreateDistrictPayload,
  CreateDistrictResponse,
} from '@/types/district';

export const createDistrict = async (
  districtData: CreateDistrictPayload
): Promise<CreateDistrictResponse> => {
  const response = await apiClient.post('/api/district', districtData);
  return response.data;
};

export const deactivateDistrict = async (
  districtId: number
): Promise<{ message: string }> => {
  const response = await apiClient.put(
    `/api/district/${districtId}/deactivate`
  );
  return response.data;
};

export const deleteDistrict = async (
  districtId: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/district/${districtId}`);
  return response.data;
};
