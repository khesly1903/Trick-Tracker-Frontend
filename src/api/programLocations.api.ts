import api from './axiosInstance';
import type { ProgramLocation, CreateProgramLocationDto, UUID } from './types';

export const createProgramLocation = (
  data: CreateProgramLocationDto,
): Promise<ProgramLocation> =>
  api.post('/program-locations', data).then((r) => r.data);

export const updateProgramLocation = (
  id: UUID,
  data: Partial<Omit<CreateProgramLocationDto, 'programId'>>,
): Promise<ProgramLocation> =>
  api.patch(`/program-locations/${id}`, data).then((r) => r.data);

export const deleteProgramLocation = (id: UUID): Promise<void> =>
  api.delete(`/program-locations/${id}`).then((r) => r.data);

export const addBackupInstructor = (
  programLocationId: UUID,
  instructorId: UUID,
): Promise<ProgramLocation> =>
  api
    .post(`/program-locations/${programLocationId}/instructors/backup/${instructorId}`)
    .then((r) => r.data);

export const removeBackupInstructor = (
  programLocationId: UUID,
  instructorId: UUID,
): Promise<ProgramLocation> =>
  api
    .delete(`/program-locations/${programLocationId}/instructors/backup/${instructorId}`)
    .then((r) => r.data);
