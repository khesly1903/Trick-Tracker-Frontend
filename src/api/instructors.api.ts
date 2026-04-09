import api from './axiosInstance';
import type {
  Instructor,
  CreateInstructorDto,
  UUID,
  PaginatedResponse,
} from './types';

export const getAllInstructors = (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Instructor>> =>
  api.get('/instructors', { params: { page, limit } }).then((r) => r.data);

export const getInstructorById = (id: UUID): Promise<Instructor> =>
  api.get(`/instructors/${id}`).then((r) => r.data);

export const createInstructor = (
  data: CreateInstructorDto,
): Promise<Instructor> => api.post('/instructors', data).then((r) => r.data);

export const updateInstructor = (
  id: UUID,
  data: Partial<CreateInstructorDto>,
): Promise<Instructor> =>
  api.patch(`/instructors/${id}`, data).then((r) => r.data);

export const softDeleteInstructor = (id: UUID): Promise<Instructor> =>
  api.delete(`/instructors/${id}`).then((r) => r.data);

export const hardDeleteInstructor = (id: UUID): Promise<void> =>
  api.delete(`/instructors/hard/${id}`).then((r) => r.data);

export const filterInstructors = (
  fullname: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Instructor>> =>
  api
    .get('/instructors/filter', { params: { fullname, page, limit } })
    .then((r) => r.data);
