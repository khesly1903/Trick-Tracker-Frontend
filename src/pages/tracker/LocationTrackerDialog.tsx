import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import { MapPin, Clock, Star, StickyNote, HelpCircle, BookOpen } from 'lucide-react';
import { getEnrollments } from '../../api/studentPrograms.api';
import { getSkillsForEnrollment, updateSkill } from '../../api/studentProgramSkills.api';
import type {
  Location,
  ProgramLocation,
  ProgramSchedule,
  StudentProgram,
  StudentProgramSkill,
  UpdateStudentProgramSkillDto,
  ProgramStage,
  UUID,
} from '../../api/types';
import dayjs from 'dayjs';

type View = 'programs' | 'schedules' | 'students' | 'skills';

interface SkillsByStage {
  stage: ProgramStage;
  skills: StudentProgramSkill[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  location: Location | null;
  programLocations: ProgramLocation[];
}

const LocationTrackerDialog: React.FC<Props> = ({ open, onClose, location, programLocations }) => {
  const [view, setView] = useState<View>('programs');
  const [selectedPL, setSelectedPL] = useState<ProgramLocation | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ProgramSchedule | null>(null);
  const [enrollments, setEnrollments] = useState<StudentProgram[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentProgram | null>(null);
  const [skillsByStage, setSkillsByStage] = useState<SkillsByStage[]>([]);
  const [changes, setChanges] = useState<Record<UUID, UpdateStudentProgramSkillDto>>({});
  const [openNotes, setOpenNotes] = useState<Set<UUID>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setView('programs');
    setSelectedPL(null);
    setSelectedSchedule(null);
    setEnrollments([]);
    setSelectedEnrollment(null);
    setSkillsByStage([]);
    setChanges({});
    setOpenNotes(new Set());
    setError(null);
    onClose();
  };

  const handleSelectProgram = (pl: ProgramLocation) => {
    setSelectedPL(pl);
    setError(null);
    setView('schedules');
  };

  const handleSelectSchedule = async (schedule: ProgramSchedule) => {
    setSelectedSchedule(schedule);
    setLoading(true);
    setError(null);
    try {
      const data = await getEnrollments({ programLocationId: selectedPL!.id });
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
        if (!stageMap.has(stage.id)) stageMap.set(stage.id, { stage, skills: [] });
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
    setChanges((prev) => ({ ...prev, [skillId]: { ...prev[skillId], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(Object.entries(changes).map(([id, dto]) => updateSkill(id, dto)));
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to save changes.'));
    } finally {
      setSaving(false);
    }
  };

  const formatSchedule = (s: ProgramSchedule) => {
    if (s.dayOfWeek && s.startTime) {
      const day = s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase();
      const time = dayjs(s.startTime).format('HH:mm');
      return `${day} · ${time} · ${s.duration}min`;
    }
    if (s.date) return `${dayjs(s.date).format('DD MMM YYYY')} · ${s.type}`;
    return s.type;
  };

  const changeCount = Object.keys(changes).length;

  const dialogTitle = () => {
    if (view === 'programs') return `${location?.name ?? ''} — Programs`;
    if (view === 'schedules') return `${selectedPL?.program?.name ?? ''} — Schedules`;
    if (view === 'students') return `${selectedPL?.program?.name ?? ''} — Students`;
    const s = selectedEnrollment?.student;
    return s ? `${s.name} ${s.surname} — Skill Tracker` : 'Skill Tracker';
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
            {/* ── Programs ── */}
            {view === 'programs' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {programLocations.length === 0 && (
                  <Alert severity="info">No programs at this location.</Alert>
                )}
                {programLocations.map((pl) => (
                  <Card
                    key={pl.id}
                    onClick={() => handleSelectProgram(pl)}
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
                          <BookOpen size={16} />
                          <Typography variant="subtitle1" fontWeight={700}>
                            {pl.program?.name ?? pl.programId}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {pl.program?.inheritedClass && (
                            <Chip
                              label={pl.program.inheritedClass.name}
                              size="small"
                              color="primary"
                              sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
                            />
                          )}
                          {pl.program?.level && (
                            <Chip label={pl.program.level} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`₺${pl.price}`} size="small" color="primary" variant="outlined" />
                        <Chip
                          label={`${pl._count?.studentPrograms ?? 0}/${pl.capacity} enrolled`}
                          size="small"
                          variant="outlined"
                        />
                        {pl.schedules && pl.schedules.length > 0 && (
                          <Chip
                            label={`${pl.schedules.length} schedule${pl.schedules.length !== 1 ? 's' : ''}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* ── Schedules ── */}
            {view === 'schedules' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(!selectedPL?.schedules || selectedPL.schedules.length === 0) && (
                  <Alert severity="info">No schedules for this program at this location.</Alert>
                )}
                {selectedPL?.schedules?.map((s) => (
                  <Card
                    key={s.id}
                    onClick={() => handleSelectSchedule(s)}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Clock size={18} />
                        <Typography variant="subtitle1" fontWeight={700}>
                          {formatSchedule(s)}
                        </Typography>
                        <Chip
                          label={s.type}
                          size="small"
                          color={s.type === 'CLASS' ? 'primary' : 'default'}
                          variant="outlined"
                          sx={{ ml: 'auto', fontSize: '0.65rem' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* ── Students ── */}
            {view === 'students' && (
              <Box>
                {enrollments.length === 0 ? (
                  <Alert severity="info">No enrolled students.</Alert>
                ) : (
                  <List disablePadding>
                    {enrollments.map((enr) => (
                      <ListItem key={enr.id} disablePadding divider>
                        <ListItemButton onClick={() => handleSelectStudent(enr)} sx={{ borderRadius: '0.5rem' }}>
                          <ListItemText
                            primary={enr.student ? `${enr.student.name} ${enr.student.surname}` : enr.studentId}
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

            {/* ── Skills ── */}
            {view === 'skills' && (
              <Box>
                {skillsByStage.length === 0 ? (
                  <Alert severity="info">No skills found for this enrollment.</Alert>
                ) : (
                  <Stack spacing={2}>
                    {skillsByStage.map(({ stage, skills }) => (
                      <Card key={stage.id} variant="outlined" sx={{ borderRadius: '0.75rem' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
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
                                  sx={{ borderRadius: '0.5rem', borderColor: isTrick ? '#C9A84C' : undefined }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25 }}>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 5, ml: 'auto', flexShrink: 0 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {[
                                          { value: 1, color: '#ef5350', label: 'Not there yet' },
                                          { value: 2, color: '#ffa726', label: 'Getting there' },
                                          { value: 3, color: '#66bb6a', label: 'Mastered' },
                                        ].map((opt) => (
                                          <Tooltip key={opt.value} title={opt.label} placement="top">
                                            <Box
                                              onClick={() => handleSkillChange(skill.id, 'status', currentStatus === opt.value ? 0 : opt.value)}
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
        {view === 'programs' && <Button onClick={handleClose}>Close</Button>}
        {view === 'schedules' && (
          <>
            <Button onClick={() => { setSelectedPL(null); setView('programs'); setError(null); }}>Back</Button>
            <Box sx={{ flex: 1 }} />
          </>
        )}
        {view === 'students' && (
          <>
            <Button onClick={() => { setSelectedSchedule(null); setView('schedules'); setError(null); }}>Back</Button>
            <Box sx={{ flex: 1 }} />
          </>
        )}
        {view === 'skills' && (
          <>
            <Button onClick={() => { setView('students'); setChanges({}); setError(null); }}>Back</Button>
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

export default LocationTrackerDialog;
