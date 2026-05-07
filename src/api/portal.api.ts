import axiosInstance from './axiosInstance';
import type {
  PortalStudentData,
  PortalParentStudent,
  PortalStudentProgram,
  PortalInstructorProgramLocation,
  StudentProgramSkill,
  UpdateSkillDto,
} from './types';

export const getStudentPortal = (): Promise<PortalStudentData> =>
  axiosInstance.get('/portal/student/me').then((r) => r.data);

export const getParentStudents = (): Promise<PortalParentStudent[]> =>
  axiosInstance.get('/portal/parent/students').then((r) => r.data);

export const getParentStudentPrograms = (studentId: string): Promise<PortalStudentProgram[]> =>
  axiosInstance.get(`/portal/parent/students/${studentId}/programs`).then((r) => r.data);

export const getInstructorPrograms = (): Promise<PortalInstructorProgramLocation[]> =>
  axiosInstance.get('/portal/instructor/programs').then((r) => r.data);

export const updateInstructorSkill = (
  skillId: string,
  dto: UpdateSkillDto,
): Promise<StudentProgramSkill> =>
  axiosInstance.patch(`/portal/instructor/skills/${skillId}`, dto).then((r) => r.data);
