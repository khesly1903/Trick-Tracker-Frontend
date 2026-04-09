import api from './axiosInstance';
import type { StudentProgramSkill, SkillStatus, UUID } from './types';

/**
 * Fetches all skill progress records for an enrollment.
 */
export const getSkillsForEnrollment = (
  studentProgramId: UUID,
): Promise<StudentProgramSkill[]> =>
  api
    .get(`/student-program-skills/enrollment/${studentProgramId}`)
    .then((r) => r.data);

/**
 * Re-sync operation to populate newly added program skills to current enrollment.
 */
export const populateEnrollmentSkills = (
  studentProgramId: UUID,
): Promise<StudentProgramSkill[]> =>
  api
    .post(`/student-program-skills/populate/${studentProgramId}`)
    .then((r) => r.data);

/**
 * Updates a student's progress on a single skill (e.g. status: 'MASTERED').
 */
export const updateSkillStatus = (
  id: UUID,
  status: SkillStatus,
): Promise<StudentProgramSkill> =>
  api
    .patch(`/student-program-skills/${id}`, { status })
    .then((r) => r.data);

/**
 * Removes a skill progress record.
 */
export const removeEnrollmentSkill = (id: UUID): Promise<void> =>
  api.delete(`/student-program-skills/${id}`).then((r) => r.data);
