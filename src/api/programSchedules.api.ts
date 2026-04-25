import api from './axiosInstance';
import type { ProgramSchedule, CreateProgramScheduleDto, UUID } from './types';

export const createProgramSchedule = (
  data: CreateProgramScheduleDto,
): Promise<ProgramSchedule> =>
  api.post('/program-schedules', data).then((r) => r.data);

export const updateProgramSchedule = (
  id: UUID,
  data: Partial<Omit<CreateProgramScheduleDto, 'programLocationId'>>,
): Promise<ProgramSchedule> =>
  api.patch(`/program-schedules/${id}`, data).then((r) => r.data);

export const deleteProgramSchedule = (id: UUID): Promise<void> =>
  api.delete(`/program-schedules/${id}`).then((r) => r.data);
