import api from './axiosInstance';
import type { Program, CreateProgramDto, UUID } from './types';

/**
 * Fetches all active programs.
 */
export const getAllPrograms = (): Promise<Program[]> =>
  api.get('/programs').then((r) => r.data);

/**
 * Fetches a single program by ID.
 */
export const getProgramById = (id: UUID): Promise<Program> =>
  api.get(`/programs/${id}`).then((r) => r.data);

/**
 * Creates a program with schedules.
 */
export const createProgram = (data: CreateProgramDto): Promise<Program> =>
  api.post('/programs', data).then((r) => r.data);

/**
 * Updates a program's details.
 */
export const updateProgram = (
  id: UUID,
  data: Partial<CreateProgramDto>,
): Promise<Program> => api.patch(`/programs/${id}`, data).then((r) => r.data);

/**
 * Soft deletes a program.
 */
export const softDeleteProgram = (id: UUID): Promise<Program> =>
  api.delete(`/programs/${id}`).then((r) => r.data);

/**
 * Permanently deletes a program.
 */
export const hardDeleteProgram = (id: UUID): Promise<void> =>
  api.delete(`/programs/hard/${id}`).then((r) => r.data);
