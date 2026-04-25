import api from './axiosInstance';
import type { Program, CreateProgramDto, UUID } from './types';

export const getAllPrograms = (): Promise<Program[]> =>
  api.get('/programs').then((r) => r.data);

export const getProgramById = (id: UUID): Promise<Program> =>
  api.get(`/programs/${id}`).then((r) => r.data);

export const createProgram = (data: CreateProgramDto): Promise<Program> =>
  api.post('/programs', data).then((r) => r.data);

export const updateProgram = (
  id: UUID,
  data: Partial<CreateProgramDto>,
): Promise<Program> =>
  api.patch(`/programs/${id}`, data).then((r) => r.data);

export const softDeleteProgram = (id: UUID): Promise<Program> =>
  api.delete(`/programs/${id}`).then((r) => r.data);

export const hardDeleteProgram = (id: UUID): Promise<void> =>
  api.delete(`/programs/hard/${id}`).then((r) => r.data);
