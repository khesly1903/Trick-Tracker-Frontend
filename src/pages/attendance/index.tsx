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
import { Calendar, MapPin, Users, Building2 } from 'lucide-react';
import { getAllPrograms } from '../../api/programs.api';
import { getAllProgramLocations } from '../../api/programLocations.api';
import type { Program, ProgramLocation, Location } from '../../api/types';
import ProgramAttendanceDialog from './ProgramAttendanceDialog';
import LocationAttendanceDialog from './LocationAttendanceDialog';
import dayjs from 'dayjs';

type ViewMode = 'program' | 'location';

interface LocationGroup {
  location: Location;
  programLocations: ProgramLocation[];
}

const cardSx = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '0.5rem',
  border: '1px solid',
  borderColor: 'divider',
  cursor: 'pointer',
  background: (theme: any) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: (theme: any) =>
      theme.palette.mode === 'dark'
        ? '0 20px 40px -12px rgba(0,0,0,0.5)'
        : '0 20px 40px -12px rgba(0,0,0,0.1)',
    borderColor: 'primary.main',
  },
};

const AttendancePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('program');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === 'program') {
      setLoading(true);
      getAllPrograms()
        .then((data) => setPrograms(data.filter((p) => p.isActive)))
        .catch(() => setError('Failed to load programs.'))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getAllProgramLocations()
        .then((pls) => {
          const map = new Map<string, LocationGroup>();
          for (const pl of pls) {
            if (!pl.location) continue;
            const key = pl.locationId;
            if (!map.has(key)) map.set(key, { location: pl.location, programLocations: [] });
            map.get(key)!.programLocations.push(pl);
          }
          setLocationGroups(Array.from(map.values()));
        })
        .catch(() => setError('Failed to load locations.'))
        .finally(() => setLoading(false));
    }
  }, [viewMode]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.02em' }}>
        Attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {viewMode === 'program'
          ? 'Select a program to take attendance'
          : 'Select a location to browse programs'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Chip
          label="By Program"
          onClick={() => setViewMode('program')}
          color={viewMode === 'program' ? 'primary' : 'default'}
          variant={viewMode === 'program' ? 'filled' : 'outlined'}
          clickable
        />
        <Chip
          label="By Location"
          onClick={() => setViewMode('location')}
          color={viewMode === 'location' ? 'primary' : 'default'}
          variant={viewMode === 'location' ? 'filled' : 'outlined'}
          clickable
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '4rem' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : viewMode === 'program' ? (
        <Grid container spacing={2}>
          {programs.map((program) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={program.id}>
              <Card onClick={() => setSelectedProgram(program)} sx={cardSx}>
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
      ) : (
        <Grid container spacing={2}>
          {locationGroups.map((group) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={group.location.id}>
              <Card onClick={() => setSelectedGroup(group)} sx={cardSx}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <Building2 size={22} color="#fff" />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
                    {group.location.name}
                  </Typography>

                  {group.location.address && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2, lineHeight: 1.4 }}
                    >
                      {group.location.address}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: '2rem',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <MapPin size={12} />
                    <Typography variant="caption" fontWeight={700}>
                      {group.programLocations.length} program{group.programLocations.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {locationGroups.length === 0 && (
            <Grid size={12}>
              <Alert severity="info">No locations with programs found.</Alert>
            </Grid>
          )}
        </Grid>
      )}

      <ProgramAttendanceDialog
        open={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
      />

      <LocationAttendanceDialog
        open={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        location={selectedGroup?.location ?? null}
        programLocations={selectedGroup?.programLocations ?? []}
      />
    </Box>
  );
};

export default AttendancePage;
