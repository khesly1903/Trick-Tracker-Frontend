import api from './axiosInstance';
import type { Class, CreateClassDto, UUID } from './types';

export const getAllClasses = (): Promise<Class[]> =>
  api.get('/classes').then((r) => r.data);

export const getClassById = (id: UUID): Promise<Class> =>
  api.get(`/classes/${id}`).then((r) => r.data);

export const createClass = (data: CreateClassDto): Promise<Class> =>
  api.post('/classes', data).then((r) => r.data);

export const updateClass = (
  id: UUID,
  data: Partial<CreateClassDto>,
): Promise<Class> =>
  api.patch(`/classes/${id}`, data).then((r) => r.data);

export const softDeleteClass = (id: UUID): Promise<Class> =>
  api.delete(`/classes/${id}`).then((r) => r.data);

export const hardDeleteClass = (id: UUID): Promise<void> =>
  api.delete(`/classes/hard/${id}`).then((r) => r.data);
