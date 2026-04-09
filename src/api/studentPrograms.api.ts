import api from './axiosInstance';
import type {
  StudentProgram,
  EnrollStudentDto,
  GetEnrollmentsParams,
  UUID,
} from './types';

/**
 * Fetches all active enrollments (StudentPrograms).
 * @param params - Optional student and/or program filter
 */
export const getEnrollments = (
  params: GetEnrollmentsParams = {},
): Promise<StudentProgram[]> =>
  api.get('/student-programs', { params }).then((r) => r.data);

/**
 * Enrolls a student into a program.
 */
export const enrollStudent = (
  data: EnrollStudentDto,
): Promise<StudentProgram> =>
  api.post('/student-programs', data).then((r) => r.data);

/**
 * Disenrolls a student (soft delete).
 */
export const softDisenroll = (id: UUID): Promise<StudentProgram> =>
  api.delete(`/student-programs/${id}`).then((r) => r.data);

/**
 * Deletes enrollment permanently (hard delete).
 */
export const hardDisenroll = (id: UUID): Promise<void> =>
  api.delete(`/student-programs/hard/${id}`).then((r) => r.data);
