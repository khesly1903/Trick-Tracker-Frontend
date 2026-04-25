import api from './axiosInstance';
import type { ProgramSkill, CreateProgramSkillDto, UUID } from './types';

export const getSkillsByStageId = (stageId: UUID): Promise<ProgramSkill[]> =>
  api.get(`/program-skills/stage/${stageId}`).then((r) => r.data);

export const addSkillsToStage = (
  stageId: UUID,
  skills: CreateProgramSkillDto[],
): Promise<{ message: string; addedCount: number; skippedCount: number }> =>
  api.post(`/program-skills/stage/${stageId}`, { skills }).then((r) => r.data);

export const updateProgramSkill = (
  id: UUID,
  data: Partial<CreateProgramSkillDto>,
): Promise<ProgramSkill> =>
  api.patch(`/program-skills/${id}`, data).then((r) => r.data);

export const deleteProgramSkill = (id: UUID): Promise<void> =>
  api.delete(`/program-skills/${id}`).then((r) => r.data);
