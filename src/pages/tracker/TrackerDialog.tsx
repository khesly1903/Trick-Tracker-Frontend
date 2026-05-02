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
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Divider,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import { MapPin, Clock, Star, StickyNote, HelpCircle } from 'lucide-react';
import { getAllProgramLocations } from '../../api/programLocations.api';
import { getEnrollments } from '../../api/studentPrograms.api';
import { getSkillsForEnrollment, updateSkill } from '../../api/studentProgramSkills.api';
import type {
  Program,
  ProgramLocation,
  StudentProgram,
  StudentProgramSkill,
  UpdateStudentProgramSkillDto,
  ProgramStage,
  UUID,
} from '../../api/types';
import dayjs from 'dayjs';

type View = 'locations' | 'students' | 'skills';

interface SkillsByStage {
  stage: ProgramStage;
  skills: StudentProgramSkill[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  program: Program | null;
}

const TrackerDialog: React.FC<Props> = ({ open, onClose, program }) => {
  // const theme = useTheme();
  const [view, setView] = useState<View>('locations');
  const [locations, setLocations] = useState<ProgramLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ProgramLocation | null>(null);
  const [enrollments, setEnrollments] = useState<StudentProgram[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentProgram | null>(null);
  const [skillsByStage, setSkillsByStage] = useState<SkillsByStage[]>([]);
  const [changes, setChanges] = useState<Record<UUID, UpdateStudentProgramSkillDto>>({});
  const [openNotes, setOpenNotes] = useState<Set<UUID>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setSelectedEnrollment(null);
    setSkillsByStage([]);
    setChanges({});
    setOpenNotes(new Set());
    setError(null);
    onClose();
  };

  const handleSelectLocation = async (location: ProgramLocation) => {
    setSelectedLocation(location);
    setLoading(true);
    setError(null);
    try {
      const data = await getEnrollments({ programLocationId: location.id });
      setEnrollments(data);
      setView('students');
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (enrollment: StudentProgram) => {
    setSelectedEnrollment(enrollment);
    setLoading(true);
    setError(null);
    try {
      const skills = await getSkillsForEnrollment(enrollment.id);
      const stageMap = new Map<string, SkillsByStage>();
      for (const skill of skills) {
        const stage = skill.programSkill?.stage;
        if (!stage) continue;
        if (!stageMap.has(stage.id)) {
          stageMap.set(stage.id, { stage, skills: [] });
        }
        stageMap.get(stage.id)!.skills.push(skill);
      }
      setSkillsByStage(Array.from(stageMap.values()));
      setChanges({});
      setOpenNotes(new Set());
      setView('skills');
    } catch {
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (skillId: UUID, field: keyof UpdateStudentProgramSkillDto, value: unknown) => {
    setChanges((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        Object.entries(changes).map(([id, dto]) => updateSkill(id, dto))
      );
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to save changes.'));
    } finally {
      setSaving(false);
    }
  };

  const changeCount = Object.keys(changes).length;

  const dialogTitle = () => {
    if (view === 'locations') return `${program?.name ?? ''} — Locations`;
    if (view === 'students') return `${selectedLocation?.location?.name ?? ''} — Students`;
    const s = selectedEnrollment?.student;
    return s ? `${s.name} ${s.surname} — Skill Tracker` : 'Skill Tracker';
  };

  const formatScheduleChip = (s: { dayOfWeek: string; startTime: string; duration: number }) => {
    const day = s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase();
    const time = dayjs(s.startTime).format('HH:mm');
    return `${day} ${time} · ${s.duration}min`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{dialogTitle()}</DialogTitle>

      <DialogContent sx={{
        minHeight: '24rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ── View 0: Locations ── */}
            {view === 'locations' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {locations.length === 0 && (
                  <Alert severity="info">No locations configured for this program.</Alert>
                )}
                {locations.map((loc) => (
                  <Card
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
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
                            {loc.location?.name ?? 'Unknown Location'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label={`₺${loc.price}`} size="small" color="primary" variant="outlined" />
                          <Chip label={`Cap: ${loc.capacity}`} size="small" variant="outlined" />
                        </Box>
                      </Box>

                      {loc.location?.address && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          {loc.location.address}
                        </Typography>
                      )}

                      {loc.instructor && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Instructor: {loc.instructor.name} {loc.instructor.surname}
                        </Typography>
                      )}

                      {loc.schedules && loc.schedules.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                          {loc.schedules.map((s) => (
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

            {/* ── View 1: Students ── */}
            {view === 'students' && (
              <Box>
                <Stepper activeStep={0} sx={{ mb: 3 }}>
                  <Step><StepLabel>Select Student</StepLabel></Step>
                  <Step><StepLabel>Skill Tracker</StepLabel></Step>
                </Stepper>

                {enrollments.length === 0 ? (
                  <Alert severity="info">No enrolled students for this location.</Alert>
                ) : (
                  <List disablePadding>
                    {enrollments.map((enr) => (
                      <ListItem key={enr.id} disablePadding divider>
                        <ListItemButton onClick={() => handleSelectStudent(enr)} sx={{ borderRadius: '0.5rem' }}>
                          <ListItemText
                            primary={
                              enr.student
                                ? `${enr.student.name} ${enr.student.surname}`
                                : enr.studentId
                            }
                          />
                          <Chip
                            label={enr.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={enr.isActive ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* ── View 2: Skill Tracker ── */}
            {view === 'skills' && (
              <Box>
                <Stepper activeStep={1} sx={{ mb: 3 }}>
                  <Step><StepLabel>Select Student</StepLabel></Step>
                  <Step><StepLabel>Skill Tracker</StepLabel></Step>
                </Stepper>

                {skillsByStage.length === 0 ? (
                  <Alert severity="info">No skills found for this student&apos;s enrollment.</Alert>
                ) : (
                  <Stack spacing={2}>
                    {skillsByStage.map(({ stage, skills }) => (
                      <Card
                        key={stage.id}
                        variant="outlined"
                        sx={{
                          borderRadius: '0.75rem',
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography
                          variant="overline"
                          color="primary"
                          sx={{ fontWeight: 700, letterSpacing: '0.1em' }}
                        >
                          {stage.name}
                        </Typography>
                        {stage.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {stage.description}
                          </Typography>
                        )}
                        <Divider sx={{ mb: 1.5, mt: 0.5 }} />
                        <Stack spacing={1}>
                          {skills.map((skill) => {
                            const currentStatus = changes[skill.id]?.status ?? skill.status;
                            const currentNote = changes[skill.id]?.note ?? skill.note ?? '';
                            const isTrick = skill.programSkill?.type === 'TRICK';
                            return (
                              <Card
                                key={skill.id}
                                variant="outlined"
                                sx={{
                                  borderRadius: '0.5rem',
                                  borderColor: isTrick ? '#C9A84C' : undefined,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25 }}>
                                  {/* Left: chip + name side by side */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '14rem', flexShrink: 0, minWidth: 0 }}>
                                    <Chip
                                      label={skill.programSkill?.type ?? 'SKILL'}
                                      size="small"
                                      icon={isTrick ? <Star size={10} fill="#C9A84C" color="#C9A84C" /> : undefined}
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.65rem',
                                        flexShrink: 0,
                                        height: '22px',
                                        width: '4.5rem',
                                        '& .MuiChip-label': { px: 0.5 },
                                        ...(isTrick ? {
                                          borderColor: '#C9A84C',
                                          color: '#C9A84C',
                                          '& .MuiChip-icon': { color: '#C9A84C' },
                                        } : {}),
                                      }}
                                    />
                                    {skill.programSkill?.description && (
                                      <Tooltip title={skill.programSkill.description} placement="top" arrow>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'help', flexShrink: 0 }}>
                                          <HelpCircle size={14} />
                                        </Box>
                                      </Tooltip>
                                    )}
                                    <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                      {skill.programSkill?.name}
                                    </Typography>
                                  </Box>

                                  {/* Right: dots + note button grouped */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 5, ml: 'auto', flexShrink: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {[
                                        { value: 1, color: '#ef5350', label: 'Not there yet' },
                                        { value: 2, color: '#ffa726', label: 'Getting there' },
                                        { value: 3, color: '#66bb6a', label: 'Mastered' },
                                      ].map((opt) => (
                                        <Tooltip key={opt.value} title={opt.label} placement="top">
                                          <Box
                                            onClick={() => handleSkillChange(
                                              skill.id,
                                              'status',
                                              currentStatus === opt.value ? 0 : opt.value
                                            )}
                                            sx={{
                                              width: 26,
                                              height: 26,
                                              borderRadius: '50%',
                                              backgroundColor: opt.color,
                                              cursor: 'pointer',
                                              opacity: currentStatus === opt.value ? 1 : 0.25,
                                              transition: 'opacity 0.15s, transform 0.15s',
                                              '&:hover': { opacity: 0.85, transform: 'scale(1.15)' },
                                            }}
                                          />
                                        </Tooltip>
                                      ))}
                                    </Box>
                                    <Button
                                    size="small"
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<StickyNote size={13} />}
                                    onClick={() => setOpenNotes((prev) => {
                                      const next = new Set(prev);
                                      next.has(skill.id) ? next.delete(skill.id) : next.add(skill.id);
                                      return next;
                                    })}
                                    sx={{ flexShrink: 0, fontSize: '0.7rem', px: 1 }}
                                  >
                                    Note
                                  </Button>
                                  </Box>
                                </Box>
                                {openNotes.has(skill.id) && (
                                  <Box sx={{ px: 2, pb: 1.5 }}>
                                    <TextField
                                      size="small"
                                      placeholder="Add note..."
                                      multiline
                                      rows={2}
                                      fullWidth
                                      value={currentNote}
                                      inputProps={{ maxLength: 256 }}
                                      onChange={(e) => handleSkillChange(skill.id, 'note', e.target.value)}
                                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
                                    />
                                  </Box>
                                )}
                              </Card>
                            );
                          })}
                        </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {view === 'locations' && (
          <Button onClick={handleClose}>Close</Button>
        )}
        {view === 'students' && (
          <>
            <Button onClick={() => { setView('locations'); setError(null); }}>
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
          </>
        )}
        {view === 'skills' && (
          <>
            <Button onClick={() => { setView('students'); setChanges({}); setError(null); }}>
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || changeCount === 0}
            >
              {saving ? 'Saving...' : changeCount > 0 ? `Save (${changeCount} change${changeCount !== 1 ? 's' : ''})` : 'Save'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TrackerDialog;
