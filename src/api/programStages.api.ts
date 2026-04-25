import axiosInstance from './axiosInstance';
import type { ProgramStage, CreateProgramStageDto, UUID } from './types';

export const createProgramStage = (programId: UUID, data: CreateProgramStageDto): Promise<ProgramStage> =>
  axiosInstance.post(`/programs/${programId}/stages`, data).then((r) => r.data);

export const getProgramStages = (programId: UUID): Promise<ProgramStage[]> =>
  axiosInstance.get(`/programs/${programId}/stages`).then((r) => r.data);

export const updateProgramStage = (programId: UUID, id: UUID, data: CreateProgramStageDto): Promise<ProgramStage> =>
  axiosInstance.patch(`/programs/${programId}/stages/${id}`, data).then((r) => r.data);

export const deleteProgramStage = (programId: UUID, id: UUID): Promise<void> =>
  axiosInstance.delete(`/programs/${programId}/stages/${id}`).then((r) => r.data);
