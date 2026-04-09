import api from './axiosInstance';
import type { Location, CreateLocationDto, UUID } from './types';

export const getAllLocations = (): Promise<Location[]> =>
  api.get('/locations').then((r) => r.data);

export const getLocationById = (id: UUID): Promise<Location> =>
  api.get(`/locations/${id}`).then((r) => r.data);

export const createLocation = (data: CreateLocationDto): Promise<Location> =>
  api.post('/locations', data).then((r) => r.data);

export const updateLocation = (
  id: UUID,
  data: Partial<CreateLocationDto>,
): Promise<Location> =>
  api.patch(`/locations/${id}`, data).then((r) => r.data);

export const softDeleteLocation = (id: UUID): Promise<Location> =>
  api.delete(`/locations/${id}`).then((r) => r.data);

export const hardDeleteLocation = (id: UUID): Promise<void> =>
  api.delete(`/locations/hard/${id}`).then((r) => r.data);
