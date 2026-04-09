import api from './axiosInstance';
import type { User, CreateUserDto, UUID } from './types';

export const getAllUsers = (): Promise<User[]> =>
  api.get('/users').then((r) => r.data);

export const getUserById = (id: UUID): Promise<User> =>
  api.get(`/users/${id}`).then((r) => r.data);

export const createUser = (data: CreateUserDto): Promise<User> =>
  api.post('/users', data).then((r) => r.data);

export const updateUser = (
  id: UUID,
  data: Partial<CreateUserDto>,
): Promise<User> => api.patch(`/users/${id}`, data).then((r) => r.data);

export const softDeleteUser = (id: UUID): Promise<User> =>
  api.delete(`/users/${id}`).then((r) => r.data);

export const hardDeleteUser = (id: UUID): Promise<void> =>
  api.delete(`/users/hard/${id}`).then((r) => r.data);
