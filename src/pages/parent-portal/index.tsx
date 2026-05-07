import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getParentStudents } from '../../api/portal.api';
import type { PortalParentStudent } from '../../api/types';

export default function ParentPortalPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<PortalParentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getParentStudents()
      .then(setStudents)
      .catch(() => setError('Failed to load linked students.'))
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
        My Children
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Select a child to view their programs and skill progress.
      </Typography>

      {students.length === 0 ? (
        <Alert severity="info">No students are linked to your account.</Alert>
      ) : (
        <Grid container spacing={2}>
          {students.map((student) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.id}>
              <Card variant="outlined" sx={{ borderRadius: '0.75rem' }}>
                <CardActionArea onClick={() => navigate(`/parent/students/${student.id}`)}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                        {student.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {student.name} {student.surname}
                        </Typography>
                        {student.enrollmentId && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {student.enrollmentId}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={student.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={student.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Chip
                        label={`${student.programCount} program${student.programCount !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
