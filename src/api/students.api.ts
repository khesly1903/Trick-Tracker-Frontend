import api from './axiosInstance';
import type { Student, CreateStudentDto, CreateStudentWithContactsDto, UUID, PaginatedResponse } from './types';

/**
 * Fetches all active students with pagination.
 */
export const getAllStudents = (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Student>> =>
  api.get('/students', { params: { page, limit } }).then((r) => r.data);

/**
 * Filters students by fullname with pagination.
 */
export const filterStudents = (
  fullname: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Student>> =>
  api
    .get('/students/filter', { params: { fullname, page, limit } })
    .then((r) => r.data);

/**
 * Fetches a single student by Student ID or User ID.
 */
export const getStudentById = (id: UUID): Promise<Student> =>
  api.get(`/students/${id}`).then((r) => r.data);

/**
 * Creates a new student profile linked to a User ID.
 */
export const createStudent = (data: CreateStudentDto): Promise<Student> =>
  api.post('/students', data).then((r) => r.data);

/**
 * Creates a new student with inline new contacts.
 */
export const createStudentWithContacts = (data: CreateStudentWithContactsDto): Promise<Student> =>
  api.post('/students', data).then((r) => r.data);

/**
 * Updates a student profile record.
 */
export const updateStudent = (
  id: UUID,
  data: Partial<CreateStudentDto>,
): Promise<Student> => api.patch(`/students/${id}`, data).then((r) => r.data);

/**
 * Links a contact to a student.
 */
export const linkStudentContact = (
  studentId: UUID,
  contactId: UUID,
): Promise<unknown> =>
  api.post(`/students/${studentId}/contact/${contactId}`).then((r) => r.data);

/**
 * Soft-deletes a student (sets isActive to false).
 */
export const softDeleteStudent = (id: UUID): Promise<Student> =>
  api.delete(`/students/${id}`).then((r) => r.data);

/**
 * Permanently deletes a student from the database.
 */
export const hardDeleteStudent = (id: UUID): Promise<void> =>
  api.delete(`/students/hard/${id}`).then((r) => r.data);
