import api from './axiosInstance';
import type { Contact, CreateContactDto, UUID } from './types';

export const getAllContacts = (): Promise<Contact[]> =>
  api.get('/contacts').then((r) => r.data);

export const getContactById = (id: UUID): Promise<Contact> =>
  api.get(`/contacts/${id}`).then((r) => r.data);

export const createContact = (data: CreateContactDto): Promise<Contact> =>
  api.post('/contacts', data).then((r) => r.data);

export const updateContact = (
  id: UUID,
  data: Partial<CreateContactDto>,
): Promise<Contact> =>
  api.patch(`/contacts/${id}`, data).then((r) => r.data);

export const softDeleteContact = (id: UUID): Promise<Contact> =>
  api.delete(`/contacts/${id}`).then((r) => r.data);

export const hardDeleteContact = (id: UUID): Promise<void> =>
  api.delete(`/contacts/hard/${id}`).then((r) => r.data);
