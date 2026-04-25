import api from './axiosInstance';
import type { Contact, CreateContactDto, UUID, PaginatedResponse } from './types';

/**
 * Fetches all active contacts with pagination.
 */
export const getAllContacts = (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Contact>> =>
  api.get('/contacts', { params: { page, limit } }).then((r) => r.data);

/**
 * Filters contacts by fullname with pagination.
 */
export const filterContacts = (
  fullname: string,
): Promise<Contact[]> =>
  api
    .get('/contacts/filter', { params: { fullname } })
    .then((r) => r.data);

export const filterContactsByEmail = (
  email: string,
): Promise<Contact[]> =>
  api
    .get('/contacts/filter', { params: { email } })
    .then((r) => r.data);

export const getContactById = (id: UUID): Promise<Contact> =>
  api.get(`/contacts/${id}`).then((r) => r.data);

export const createContact = (data: CreateContactDto): Promise<Contact> =>
  api.post('/contacts', data).then((r) => r.data);

export const updateContact = (
  id: UUID,
  data: Partial<CreateContactDto>,
): Promise<Contact> => api.patch(`/contacts/${id}`, data).then((r) => r.data);

export const softDeleteContact = (id: UUID): Promise<Contact> =>
  api.delete(`/contacts/${id}`).then((r) => r.data);

export const hardDeleteContact = (id: UUID): Promise<void> =>
  api.delete(`/contacts/hard/${id}`).then((r) => r.data);
