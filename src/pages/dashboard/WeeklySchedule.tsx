import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { getSessionsForWeek } from '../../api/programSessions.api';
import type { ProgramSession } from '../../api/types';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const formatDisplayTime = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// getDay() returns 0=Sun,1=Mon,...,6=Sat → convert to Mon-based index
const dateToDayIdx = (isoString: string): number => {
  const d = new Date(isoString);
  return (d.getDay() + 6) % 7;
};

const WeeklySchedule: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [loading, setLoading] = useState(false);

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date(startOfWeek);
      from.setHours(0, 0, 0, 0);
      const to = new Date(startOfWeek);
      to.setDate(to.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      const data = await getSessionsForWeek(from.toISOString(), to.toISOString());
      setSessions(data.filter((s) => s.type !== 'CANCELLED'));
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOfWeek.toISOString()]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const monthYearStr = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Paper
      sx={{
        p: '1.5rem',
        height: '100%',
        minHeight: '30rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box
            sx={{
              p: '0.5rem',
              borderRadius: '0.5rem',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <CalendarIcon size={20} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Weekly Schedule
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: '0.5rem',
            p: '0.25rem',
          }}
        >
          <IconButton size="small" onClick={handlePrevWeek}>
            <ChevronLeft size={18} />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              px: '1rem',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            {monthYearStr}
          </Typography>
          <IconButton size="small" onClick={handleNextWeek}>
            <ChevronRight size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Days Grid */}
      <Grid container spacing={1} sx={{ flexGrow: 1 }}>
        {DAYS_OF_WEEK.map((day, idx) => {
          const dateObj = weekDates[idx];
          const isToday = new Date().toDateString() === dateObj.toDateString();
          const dayStr = dateObj.toDateString();
          const daySessions = sessions.filter(
            (s) => new Date(s.date).toDateString() === dayStr,
          );

          return (
            <Grid key={day} size={{ xs: 12, sm: 1.71 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: '1rem',
                  p: '0.5rem',
                  borderRadius: '0.5rem',
                  bgcolor: isToday ? 'primary.main' : 'transparent',
                  color: isToday ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8 }}>
                  {day}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900 }}>
                  {dateObj.getDate()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {daySessions.map((session) => {
                  const programName = session.programLocation?.program?.name ?? '—';
                  const instructor = session.programLocation?.instructor;
                  const instructorName = instructor
                    ? `${instructor.name} ${instructor.surname}`
                    : 'No instructor';
                  const locationName = session.programLocation?.location?.name;
                  const startTime = formatDisplayTime(session.startTime);

                  return (
                    <Tooltip
                      key={session.id}
                      title={
                        <Box>
                          <Typography variant="caption" display="block" fontWeight={700}>{programName}</Typography>
                          {locationName && <Typography variant="caption" display="block">{locationName}</Typography>}
                          <Typography variant="caption" display="block">{instructorName}</Typography>
                          <Typography variant="caption" display="block">{startTime} · {session.type}</Typography>
                        </Box>
                      }
                      placement="top"
                      arrow
                    >
                      <Box
                        sx={{
                          p: '0.75rem',
                          borderRadius: '0.5rem',
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          cursor: 'default',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'text.secondary', mb: '0.25rem' }}>
                          <Clock size={10} />
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                            {startTime}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                            mb: '0.15rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {programName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: 'primary.main',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {instructorName}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}

                {daySessions.length === 0 && !loading && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '80px',
                      borderRadius: '0.5rem',
                      border: '1px dashed',
                      borderColor: alpha(theme.palette.divider, 0.2),
                      opacity: 0.3,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>-</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default WeeklySchedule;
