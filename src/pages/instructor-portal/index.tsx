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
import { MapPin, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getInstructorPrograms } from '../../api/portal.api';
import type { PortalInstructorProgramLocation } from '../../api/types';
import dayjs from 'dayjs';

export default function InstructorPortalPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<PortalInstructorProgramLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getInstructorPrograms()
      .then(setPrograms)
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

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: '0.5rem' }}>
        My Programs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Programs you teach — view students and update their skill progress.
      </Typography>

      {programs.length === 0 ? (
        <Alert severity="info">You are not assigned to any programs.</Alert>
      ) : (
        <Grid container spacing={2}>
          {programs.map((pl) => {
            const prog = pl.program;
            const scheduleText = pl.schedules
              .map((s) => `${s.dayOfWeek.slice(0, 3)} ${dayjs(s.startTime).format('HH:mm')}`)
              .join(', ');

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pl.id}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: '0.75rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3 }}>
                      {prog.name}
                    </Typography>

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
                      {scheduleText && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Clock size={14} style={{ opacity: 0.6 }} />
                          <Typography variant="body2" color="text.secondary">
                            {scheduleText}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Users size={14} style={{ opacity: 0.6 }} />
                        <Typography variant="body2" color="text.secondary">
                          {pl.studentPrograms.length} student{pl.studentPrograms.length !== 1 ? 's' : ''}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>

                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/instructor/tracker')}
                    >
                      Skill Tracker
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
