import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { MapPin, Clock } from 'lucide-react';
import { getAllProgramLocations } from '../../api/programLocations.api';
import type { Program, ProgramLocation } from '../../api/types';
import AttendanceGrid from './AttendanceGrid';
import dayjs from 'dayjs';

type View = 'locations' | 'grid';

interface Props {
  open: boolean;
  onClose: () => void;
  program: Program | null;
}

const ProgramAttendanceDialog: React.FC<Props> = ({ open, onClose, program }) => {
  const [view, setView] = useState<View>('locations');
  const [locations, setLocations] = useState<ProgramLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ProgramLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !program) return;
    setLoading(true);
    getAllProgramLocations(program.id)
      .then(setLocations)
      .catch(() => setError('Failed to load locations.'))
      .finally(() => setLoading(false));
  }, [open, program]);

  const handleClose = () => {
    setView('locations');
    setSelectedLocation(null);
    setError(null);
    onClose();
  };

  const handleSelectLocation = (pl: ProgramLocation) => {
    setSelectedLocation(pl);
    setView('grid');
  };

  const formatScheduleChip = (s: { dayOfWeek?: string; startTime?: string; duration: number }) => {
    if (s.dayOfWeek && s.startTime) {
      const day = s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase();
      const time = dayjs(s.startTime).format('HH:mm');
      return `${day} ${time} · ${s.duration}min`;
    }
    return `${s.duration}min`;
  };

  const dialogTitle = () => {
    if (view === 'locations') return `${program?.name ?? ''} — Select Location`;
    return `${program?.name ?? ''} · ${selectedLocation?.location?.name ?? ''}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={view === 'grid' ? 'lg' : 'md'} fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{dialogTitle()}</DialogTitle>

      <DialogContent sx={{ minHeight: '28rem' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20rem' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {view === 'locations' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {locations.length === 0 && (
                  <Alert severity="info">No locations configured for this program.</Alert>
                )}
                {locations.map((pl) => (
                  <Card
                    key={pl.id}
                    onClick={() => handleSelectLocation(pl)}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MapPin size={16} />
                          <Typography variant="subtitle1" fontWeight={700}>
                            {pl.location?.name ?? 'Unknown Location'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label={`₺${pl.price}`} size="small" color="primary" variant="outlined" />
                          <Chip
                            label={`${pl._count?.studentPrograms ?? 0}/${pl.capacity} enrolled`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      {pl.location?.address && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          {pl.location.address}
                        </Typography>
                      )}

                      {pl.instructor && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Instructor: {pl.instructor.name} {pl.instructor.surname}
                        </Typography>
                      )}

                      {pl.schedules && pl.schedules.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                          {pl.schedules.map((s) => (
                            <Chip
                              key={s.id}
                              icon={<Clock size={12} />}
                              label={formatScheduleChip(s)}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {view === 'grid' && selectedLocation && (
              <AttendanceGrid
                programLocationId={selectedLocation.id}
                programName={program?.name ?? ''}
                locationName={selectedLocation.location?.name ?? ''}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {view === 'locations' && <Button onClick={handleClose}>Close</Button>}
        {view === 'grid' && (
          <Button onClick={() => { setView('locations'); setError(null); }}>Back</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProgramAttendanceDialog;
