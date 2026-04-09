import api from './axiosInstance';
import type { AttendanceEntry, BulkAttendanceDto, UUID } from './types';

/**
 * Fetches attendance list for a specific session.
 */
export const getAttendanceListBySessionId = (
  sessionId: UUID,
): Promise<AttendanceEntry[]> =>
  api.get(`/attendances/session/${sessionId}`).then((r) => r.data);

/**
 * Bulk updates attendance for a session.
 */
export const updateBulkAttendance = (
  data: BulkAttendanceDto,
): Promise<AttendanceEntry[]> =>
  api.post('/attendances/bulk', data).then((r) => r.data);
