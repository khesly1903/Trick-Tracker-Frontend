import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreVertical,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklySchedule: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Week calculation logic
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Formatting strings
  const monthYearStr = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Mock data for display

  const mockSchedules = [
    { id: 1, dayIdx: 0, time: '09:00', program: 'Morning Flow', instructor: 'Julia Alexan' },
    { id: 2, dayIdx: 1, time: '11:00', program: 'Advanced Parkour', instructor: 'Julia Alexan' },
    { id: 2, dayIdx: 1, time: '11:00', program: 'Advanced Parkour', instructor: 'Julia Alexan' },
    { id: 2, dayIdx: 1, time: '11:00', program: 'Advanced Parkour', instructor: 'Julia Alexan' },
    { id: 3, dayIdx: 2, time: '18:00', program: 'Strength & Conditioning', instructor: 'Julia Alexan' },
    { id: 3, dayIdx: 2, time: '18:00', program: 'Strength & Conditioning', instructor: 'Julia Alexan' },
    { id: 4, dayIdx: 4, time: '16:30', program: 'Junior Acrobatics', instructor: 'Julia Alexan' },
    { id: 4, dayIdx: 4, time: '16:30', program: 'Junior Acrobatics', instructor: 'Julia Alexan' },
    { id: 5, dayIdx: 5, time: '10:00', program: 'Open Gym', instructor: 'Julia Alexan' },
    { id: 5, dayIdx: 5, time: '10:00', program: 'Open Gym', instructor: 'Julia Alexan' },
    { id: 5, dayIdx: 5, time: '10:00', program: 'Open Gym', instructor: 'Julia Alexan' },
    { id: 5, dayIdx: 5, time: '10:00', program: 'Open Gym', instructor: 'Julia Alexan' },
  ];

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
      {/* Header Area */}
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
          const isToday =
            new Date().toDateString() === dateObj.toDateString();
          const daySchedule = mockSchedules.filter((s) => s.dayIdx === idx);

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
                {daySchedule.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: '0.75rem',
                      borderRadius: '0.5rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '0.25rem', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'text.secondary' }}>
                        <Clock size={10} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                          {item.time}
                        </Typography>
                      </Box>
                      <IconButton size="small" sx={{ p: 0, opacity: 0.5 }}>
                        <MoreVertical size={12} />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                        mb: '0.15rem',
                      }}
                    >
                      {item.program}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'primary.main', fontWeight: 600 }}>
                       {item.instructor}
                    </Typography>
                  </Box>
                ))}
                {daySchedule.length === 0 && (
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
