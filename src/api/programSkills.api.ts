import api from './axiosInstance';
import type { ProgramSkill, CreateProgramSkillDto, UUID } from './types';

/**
 * Fetches all skills defined for a specific program.
 */
export const getSkillsByProgramId = (
  programId: UUID,
): Promise<ProgramSkill[]> =>
  api.get(`/program-skills?programId=${programId}`).then((r) => r.data);

/**
 * Bulk adds skills to a program curriculum.
 */
export const addSkillsToProgram = (
  programId: UUID,
  skills: CreateProgramSkillDto[],
): Promise<ProgramSkill[]> =>
  api.post(`/program-skills/${programId}`, { skills }).then((r) => r.data);

/**
 * Updates a single skill in curriculum.
 */
export const updateProgramSkill = (
  id: UUID,
  data: Partial<CreateProgramSkillDto>,
): Promise<ProgramSkill> =>
  api.patch(`/program-skills/${id}`, data).then((r) => r.data);

/**
 * Permanently deletes a skill from curriculum.
 */
export const hardDeleteProgramSkill = (id: UUID): Promise<void> =>
  api.delete(`/program-skills/${id}`).then((r) => r.data);
