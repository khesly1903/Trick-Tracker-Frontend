import api from './axiosInstance';
import type { StudentProgramSkill, UpdateStudentProgramSkillDto, UUID } from './types';

export const getSkillsForEnrollment = (
  studentProgramId: UUID,
): Promise<StudentProgramSkill[]> =>
  api
    .get(`/student-program-skills/enrollment/${studentProgramId}`)
    .then((r) => r.data);

export const populateEnrollmentSkills = (
  studentProgramId: UUID,
): Promise<{ message: string; count: number }> =>
  api
    .post(`/student-program-skills/populate/${studentProgramId}`)
    .then((r) => r.data);

export const updateSkill = (
  id: UUID,
  data: UpdateStudentProgramSkillDto,
): Promise<StudentProgramSkill> =>
  api.patch(`/student-program-skills/${id}`, data).then((r) => r.data);

export const removeEnrollmentSkill = (id: UUID): Promise<void> =>
  api.delete(`/student-program-skills/${id}`).then((r) => r.data);
