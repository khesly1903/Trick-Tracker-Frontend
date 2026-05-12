import api from './axiosInstance';
import type { SessionAttendanceEntry, BulkAttendanceDto, UUID } from './types';

/**
 * Fetches attendance list for a specific session (includes student names and marked status).
 */
export const getAttendanceListBySessionId = (
  sessionId: UUID,
): Promise<SessionAttendanceEntry[]> =>
  api.get(`/attendances/session/${sessionId}`).then((r) => r.data);

/**
 * Bulk updates attendance for a session.
 */
export const updateBulkAttendance = (
  data: BulkAttendanceDto,
): Promise<SessionAttendanceEntry[]> =>
  api.post('/attendances/bulk', data).then((r) => r.data);
