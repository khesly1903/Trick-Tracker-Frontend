import api from './axiosInstance';
import type { ProgramSession, CreateSessionDto, UUID } from './types';

export const getSessionsByProgramId = (
  programId: UUID,
): Promise<ProgramSession[]> =>
  api
    .get(`/program-sessions?programId=${programId}`)
    .then((r) => r.data);

export const getSessionsForWeek = (
  dateFrom: string,
  dateTo: string,
): Promise<ProgramSession[]> =>
  api
    .get(`/program-sessions?dateFrom=${dateFrom}&dateTo=${dateTo}`)
    .then((r) => r.data);

export const getSessionById = (id: UUID): Promise<ProgramSession> =>
  api.get(`/program-sessions/${id}`).then((r) => r.data);

export const createSession = (
  data: CreateSessionDto,
): Promise<ProgramSession> =>
  api.post('/program-sessions', data).then((r) => r.data);

export const updateSession = (
  id: UUID,
  data: Partial<CreateSessionDto>,
): Promise<ProgramSession> =>
  api.patch(`/program-sessions/${id}`, data).then((r) => r.data);

export const deleteSession = (id: UUID): Promise<void> =>
  api.delete(`/program-sessions/${id}`).then((r) => r.data);

export const bulkDeleteSessions = (ids: UUID[]): Promise<void> =>
  api
    .delete('/program-sessions/bulk', { data: { ids } })
    .then((r) => r.data);
