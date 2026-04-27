import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Calendar, MapPin, Users } from 'lucide-react';
import { getAllPrograms } from '../../api/programs.api';
import type { Program } from '../../api/types';
import TrackerDialog from './TrackerDialog';
import dayjs from 'dayjs';

const TrackerPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    getAllPrograms()
      .then((data: Program[]) => setPrograms(data.filter((p: Program) => p.isActive)))
      .catch(() => setError('Failed to load programs.'))
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
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.02em' }}>
        Tracker
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a program to track student skills
      </Typography>

      <Grid container spacing={2}>
        {programs.map((program) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={program.id}>
            <Card
              onClick={() => setSelectedProgram(program)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 20px 40px -12px rgba(0,0,0,0.5)'
                      : '0 20px 40px -12px rgba(0,0,0,0.1)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {program.inheritedClass && (
                    <Chip
                      label={program.inheritedClass.name}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', px: 0.5 }}
                    />
                  )}
                  {program.level && (
                    <Chip
                      label={program.level}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.02em' }}>
                  {program.name}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={14} color="var(--mui-palette-text-secondary)" />
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(program.startDate).format('MMM D')} – {dayjs(program.endDate).format('MMM D, YYYY')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={14} color="var(--mui-palette-text-secondary)" />
                    <Typography variant="caption" color="text.secondary">
                      Ages {program.minAge}–{program.maxAge}
                    </Typography>
                  </Box>

                  {program._count !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={14} color="var(--mui-palette-text-secondary)" />
                      <Typography variant="caption" color="text.secondary">
                        {program._count.programLocations} location{program._count.programLocations !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {programs.length === 0 && (
          <Grid size={12}>
            <Alert severity="info">No active programs found.</Alert>
          </Grid>
        )}
      </Grid>

      <TrackerDialog
        open={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
      />
    </Box>
  );
};

export default TrackerPage;
