import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { MapPin, Calendar, Users, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { getProgramById } from '../../api/programs.api';
import { displayTime } from './programShared';
import dayjs from 'dayjs';

const GENDER_LABELS = { BOYS: 'Boys', GIRLS: 'Girls', ALL_GENDER: 'All Genders' };
const DAY_SHORT = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

const InfoRow = ({ label, children }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </Typography>
    <Box sx={{ mt: 0.5 }}>{children}</Box>
  </Box>
);

const ProgramDetail = ({ open, programId, onClose }) => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !programId) return;
    setLoading(true);
    setError(null);
    getProgramById(programId)
      .then(setProgram)
      .catch(() => setError('Failed to load program.'))
      .finally(() => setLoading(false));
  }, [open, programId]);

  useEffect(() => {
    if (!open) { setProgram(null); setError(null); }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {program ? program.name : 'Program Details'}
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {program && !loading && (
          <Grid container spacing={3}>
            {/* Left column — program meta */}
            <Grid size={{ xs: 12, md: 5 }}>
              <InfoRow label="Status">
                <Chip
                  label={program.isActive ? 'Active' : 'Inactive'}
                  color={program.isActive ? 'success' : 'default'}
                  size="small"
                />
              </InfoRow>

              <InfoRow label="Class">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <BookOpen size={15} />
                  <Typography variant="body2">{program.inheritedClass?.name ?? program.classId}</Typography>
                </Box>
              </InfoRow>

              <InfoRow label="Gender">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Users size={15} />
                  <Typography variant="body2">{GENDER_LABELS[program.gender] ?? program.gender}</Typography>
                </Box>
              </InfoRow>

              <InfoRow label="Age Range">
                <Typography variant="body2">{program.minAge} – {program.maxAge} yrs</Typography>
              </InfoRow>

              {program.level && (
                <InfoRow label="Level">
                  <Typography variant="body2">{program.level}</Typography>
                </InfoRow>
              )}

              <InfoRow label="Dates">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Calendar size={15} />
                  <Typography variant="body2">
                    {dayjs(program.startDate).format('DD MMM YYYY')} → {dayjs(program.endDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </InfoRow>

              {program.requiredEquipment?.length > 0 && (
                <InfoRow label="Required Equipment">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {program.requiredEquipment.map((e) => (
                      <Chip key={e} label={e} size="small" />
                    ))}
                  </Box>
                </InfoRow>
              )}
            </Grid>

            {/* Right column — locations & schedules */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <Layers size={15} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Locations & Schedules
                </Typography>
              </Box>

              {(!program.programLocations || program.programLocations.length === 0) ? (
                <Typography variant="body2" color="text.secondary">No locations configured.</Typography>
              ) : (
                program.programLocations.map((pl) => (
                  <Paper key={pl.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: '0.75rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <MapPin size={14} />
                      <Typography variant="body2" fontWeight={700}>
                        {pl.location?.name ?? pl.locationId}
                      </Typography>
                      {pl._count?.sessions > 0 && (
                        <Chip label={`${pl._count.sessions} sessions`} size="small" color="info" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      ${pl.price} · Cap: {pl.capacity}
                      {pl.instructor ? ` · ${pl.instructor.name} ${pl.instructor.surname}` : ''}
                    </Typography>

                    {pl.backupInstructors?.length > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Backup: {pl.backupInstructors.map((i) => `${i.name} ${i.surname}`).join(', ')}
                      </Typography>
                    )}

                    {pl.schedules?.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>SCHEDULES</Typography>
                        {pl.schedules.map((s) => (
                          <Box key={s.id} sx={{ mt: 0.5 }}>
                            <Typography variant="caption">
                              {DAY_SHORT[s.dayOfWeek] ?? s.dayOfWeek} · {displayTime(s.startTime)} · {s.duration}min · {s.type}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Paper>
                ))
              )}
            </Grid>

            {/* Bottom row — stages & skills */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <GraduationCap size={15} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stages & Skills
                </Typography>
              </Box>

              {(!program.programStages || program.programStages.length === 0) ? (
                <Typography variant="body2" color="text.secondary">No stages defined.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {program.programStages.map((stage) => (
                    <Paper key={stage.id} variant="outlined" sx={{ p: 1.5, borderRadius: '0.75rem', flex: '1 1 260px' }}>
                      <Typography variant="body2" fontWeight={700}>{stage.name}</Typography>
                      {stage.description && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                          {stage.description}
                        </Typography>
                      )}
                      {stage.skills?.length > 0 ? (
                        <Box sx={{ mt: 0.75 }}>
                          {stage.skills.map((skill) => (
                            <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.35 }}>
                              <Chip
                                label={skill.type}
                                size="small"
                                color={skill.type === 'TRICK' ? 'secondary' : 'primary'}
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: '1.2rem', minWidth: '3rem' }}
                              />
                              <Typography variant="caption" sx={{ flex: 1 }}>{skill.name}</Typography>
                              {skill.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ flex: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {skill.description}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">No skills added.</Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: '1rem', textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDetail;
