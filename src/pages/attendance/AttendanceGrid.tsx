import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import type { ProgramSession, SessionAttendanceEntry, UUID } from '../../api/types';
import { getSessionsByProgramLocation } from '../../api/programSessions.api';
import { getAttendanceListBySessionId, updateBulkAttendance } from '../../api/attendances.api';

interface Student {
  studentProgramId: UUID;
  studentName: string;
}

interface Props {
  programLocationId: UUID;
  programName: string;
  locationName: string;
}

const AttendanceGrid: React.FC<Props> = ({ programLocationId, programName, locationName }) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<UUID, SessionAttendanceEntry[]>>(new Map());
  const [students, setStudents] = useState<Student[]>([]);
  // key format: `${sessionId}|${studentProgramId}`
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChanges(new Map());
    try {
      const dateFrom = currentMonth.toISOString();
      const dateTo = currentMonth.endOf('month').toISOString();
      const fetchedSessions = await getSessionsByProgramLocation(programLocationId, dateFrom, dateTo);
      fetchedSessions.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
      setSessions(fetchedSessions);

      const attendanceResults = await Promise.all(
        fetchedSessions.map((s) => getAttendanceListBySessionId(s.id)),
      );

      const newMap = new Map<UUID, SessionAttendanceEntry[]>();
      const studentMap = new Map<UUID, string>();

      fetchedSessions.forEach((session, idx) => {
        const entries = attendanceResults[idx];
        newMap.set(session.id, entries);
        for (const e of entries) {
          if (!studentMap.has(e.studentProgramId)) {
            studentMap.set(e.studentProgramId, e.studentName);
          }
        }
      });

      setAttendanceMap(newMap);
      setStudents(
        Array.from(studentMap.entries())
          .map(([id, name]) => ({ studentProgramId: id, studentName: name }))
          .sort((a, b) => a.studentName.localeCompare(b.studentName)),
      );
    } catch {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, [programLocationId, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const makeKey = (sessionId: UUID, studentProgramId: UUID) => `${sessionId}|${studentProgramId}`;

  const getAttended = (sessionId: UUID, studentProgramId: UUID): boolean => {
    const key = makeKey(sessionId, studentProgramId);
    if (changes.has(key)) return changes.get(key)!;
    const entries = attendanceMap.get(sessionId) ?? [];
    return entries.find((e) => e.studentProgramId === studentProgramId)?.attended ?? false;
  };

  const handleCheckbox = (sessionId: UUID, studentProgramId: UUID, checked: boolean) => {
    const key = makeKey(sessionId, studentProgramId);
    setChanges((prev) => {
      const next = new Map(prev);
      const originalEntries = attendanceMap.get(sessionId) ?? [];
      const original = originalEntries.find((e) => e.studentProgramId === studentProgramId)?.attended ?? false;
      if (checked === original) {
        next.delete(key);
      } else {
        next.set(key, checked);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const bySession = new Map<UUID, { studentProgramId: UUID; attended: boolean }[]>();
      for (const [key, attended] of changes) {
        const pipeIdx = key.indexOf('|');
        const sessionId = key.slice(0, pipeIdx);
        const studentProgramId = key.slice(pipeIdx + 1);
        if (!bySession.has(sessionId)) bySession.set(sessionId, []);
        bySession.get(sessionId)!.push({ studentProgramId, attended });
      }
      await Promise.all(
        Array.from(bySession.entries()).map(([sessionId, records]) =>
          updateBulkAttendance({ programSessionId: sessionId, attendances: records }),
        ),
      );
      await loadData();
      setSnackbar('Attendance saved.');
    } catch {
      setError('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setChanges(new Map());

  const getSummary = (studentProgramId: UUID) => {
    let present = 0;
    let absent = 0;
    for (const session of sessions) {
      if (session.type === 'CANCELLED') continue;
      const attended = getAttended(session.id, studentProgramId);
      if (attended) present++;
      else absent++;
    }
    return { present, absent };
  };

  const changeCount = changes.size;

  const stickyCell = {
    position: 'sticky' as const,
    left: 0,
    bgcolor: 'background.paper',
    zIndex: 1,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{programName}</Typography>
          <Typography variant="body2" color="text.secondary">{locationName}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
            disabled={loading}
          >
            <ChevronLeft size={18} />
          </IconButton>
          <Typography variant="body1" fontWeight={600} sx={{ minWidth: '9rem', textAlign: 'center' }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
            disabled={loading}
          >
            <ChevronRight size={18} />
          </IconButton>
          {changeCount > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, ml: 1 }}>
              <Button size="small" variant="outlined" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : `Save (${changeCount})`}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '4rem' }}>
          <CircularProgress />
        </Box>
      ) : sessions.length === 0 ? (
        <Alert severity="info">No sessions found for {currentMonth.format('MMMM YYYY')}.</Alert>
      ) : students.length === 0 ? (
        <Alert severity="info">No enrolled students for this program location.</Alert>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: '0.5rem', overflowX: 'auto', border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: '11rem', ...stickyCell, zIndex: 2 }}>
                  Student
                </TableCell>
                {sessions.map((s) => (
                  <TableCell key={s.id} align="center" sx={{ minWidth: '4.5rem', px: 0.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" fontWeight={700}>
                        {dayjs(s.date).format('MM/DD')}
                      </Typography>
                      {s.type === 'CANCELLED' && (
                        <Chip
                          label="İptal"
                          size="small"
                          sx={{ height: '16px', fontSize: '0.6rem', bgcolor: 'action.disabledBackground' }}
                        />
                      )}
                      {s.type === 'MAKEUP' && (
                        <Chip
                          label="Telafi"
                          size="small"
                          color="warning"
                          sx={{ height: '16px', fontSize: '0.6rem' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ minWidth: '3.5rem' }}>
                  <Typography variant="caption" color="success.main" fontWeight={700}>Var</Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: '3.5rem' }}>
                  <Typography variant="caption" color="error.main" fontWeight={700}>Yok</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(({ studentProgramId, studentName }) => {
                const { present, absent } = getSummary(studentProgramId);
                return (
                  <TableRow key={studentProgramId} hover>
                    <TableCell sx={{ fontWeight: 600, ...stickyCell }}>{studentName}</TableCell>
                    {sessions.map((session) => {
                      const isCancelled = session.type === 'CANCELLED';
                      const checked = getAttended(session.id, studentProgramId);
                      return (
                        <TableCell key={session.id} align="center" sx={{ p: 0 }}>
                          <Checkbox
                            checked={checked}
                            disabled={isCancelled}
                            size="small"
                            onChange={(e) => handleCheckbox(session.id, studentProgramId, e.target.checked)}
                            sx={isCancelled ? { opacity: 0.25 } : {}}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      <Typography variant="body2" color="success.main" fontWeight={700}>{present}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="error.main" fontWeight={700}>{absent}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
};

export default AttendanceGrid;
