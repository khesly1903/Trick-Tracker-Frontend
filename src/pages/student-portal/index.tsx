import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { MapPin, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentPortal } from '../../api/portal.api';
import type { PortalStudentData } from '../../api/types';
import dayjs from 'dayjs';

export default function StudentPortalPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortalStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentPortal()
      .then(setData)
      .catch(() => setError('Failed to load your programs.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '4rem' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const programs = data?.studentPrograms ?? [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: '0.5rem' }}>
        My Programs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Welcome back, {data?.name} {data?.surname}
      </Typography>

      {programs.length === 0 ? (
        <Alert severity="info">You are not enrolled in any programs yet.</Alert>
      ) : (
        <Grid container spacing={2}>
          {programs.map((sp) => {
            const pl = sp.programLocation;
            const prog = pl.program;
            const scheduleText = pl.schedules
              .map((s) => `${s.dayOfWeek.slice(0, 3)} ${dayjs(s.startTime).format('HH:mm')}`)
              .join(', ');

            const totalSkills = sp.studentProgramSkills.length;
            const masteredSkills = sp.studentProgramSkills.filter((s) => s.status >= 3).length;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sp.id}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: '0.75rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {prog.name}
                      </Typography>
                      <Chip
                        label={sp.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={sp.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Stack>

                    {prog.level && (
                      <Chip label={prog.level} size="small" variant="outlined" sx={{ mb: 1 }} />
                    )}

                    <Stack spacing={0.75} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MapPin size={14} style={{ opacity: 0.6 }} />
                        <Typography variant="body2" color="text.secondary">
                          {pl.location.name}
                        </Typography>
                      </Stack>

                      {pl.instructor && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <User size={14} style={{ opacity: 0.6 }} />
                          <Typography variant="body2" color="text.secondary">
                            {pl.instructor.name} {pl.instructor.surname}
                          </Typography>
                        </Stack>
                      )}

                      {scheduleText && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Clock size={14} style={{ opacity: 0.6 }} />
                          <Typography variant="body2" color="text.secondary">
                            {scheduleText}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {totalSkills > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Skills: {masteredSkills}/{totalSkills} mastered
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.5,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'action.hover',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: totalSkills ? `${(masteredSkills / totalSkills) * 100}%` : 0,
                              bgcolor: 'success.main',
                              borderRadius: 3,
                              transition: 'width 0.3s',
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/student/skills')}
                    >
                      View Skills
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
