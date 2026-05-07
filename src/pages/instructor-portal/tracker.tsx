import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  TextField,
  Collapse,
} from '@mui/material';
import { Star, HelpCircle, StickyNote } from 'lucide-react';
import { getInstructorPrograms, updateInstructorSkill } from '../../api/portal.api';
import type {
  PortalInstructorProgramLocation,
  UpdateSkillDto,
} from '../../api/types';

const STATUS_OPTS = [
  { value: 1, color: '#ef5350', label: 'Not there yet' },
  { value: 2, color: '#ffa726', label: 'Getting there' },
  { value: 3, color: '#66bb6a', label: 'Mastered' },
];

type Changes = Record<string, { status?: number; note?: string }>;

export default function InstructorTrackerPage() {
  const [programs, setPrograms] = useState<PortalInstructorProgramLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedStudentEnrollmentId, setSelectedStudentEnrollmentId] = useState('');
  const [changes, setChanges] = useState<Changes>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    getInstructorPrograms()
      .then((data) => {
        setPrograms(data);
        if (data.length > 0) {
          setSelectedProgramId(data[0].id);
          if (data[0].studentPrograms.length > 0) {
            setSelectedStudentEnrollmentId(data[0].studentPrograms[0].id);
          }
        }
      })
      .catch(() => setError('Failed to load programs.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const selectedStudentProgram = selectedProgram?.studentPrograms.find(
    (sp) => sp.id === selectedStudentEnrollmentId
  );

  const stages = selectedProgram?.program.programStages ?? [];
  const skillMap = new Map(
    (selectedStudentProgram?.studentProgramSkills ?? []).map((s) => [s.programSkillId, s])
  );

  const handleStatusChange = (skillRecordId: string, value: number, currentStatus: number) => {
    setChanges((prev) => ({
      ...prev,
      [skillRecordId]: {
        ...prev[skillRecordId],
        status: currentStatus === value ? 0 : value,
      },
    }));
  };

  const handleNoteChange = (skillRecordId: string, note: string) => {
    setChanges((prev) => ({
      ...prev,
      [skillRecordId]: { ...prev[skillRecordId], note },
    }));
  };

  const toggleNote = (id: string) => {
    setOpenNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    const entries = Object.entries(changes);
    if (entries.length === 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await Promise.all(
        entries.map(([skillRecordId, dto]) =>
          updateInstructorSkill(skillRecordId, dto as UpdateSkillDto)
        )
      );
      // Refresh skills for selected student
      const freshPrograms = await getInstructorPrograms();
      setPrograms(freshPrograms);
      setChanges({});
    } catch {
      setSaveError('Failed to save some changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasPendingChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '4rem' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (programs.length === 0) return <Alert severity="info">No programs assigned.</Alert>;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: '0.5rem' }}>
        <Typography variant="h4" fontWeight={700}>
          Skill Tracker
        </Typography>
        {hasPendingChanges && (
          <Button
            variant="contained"
            size="small"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : `Save Changes (${Object.keys(changes).length})`}
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Update student skill progress.
      </Typography>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {programs.length > 1 && (
          <FormControl size="small" sx={{ minWidth: '16rem' }}>
            <InputLabel>Program</InputLabel>
            <Select
              value={selectedProgramId}
              label="Program"
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                const prog = programs.find((p) => p.id === e.target.value);
                setSelectedStudentEnrollmentId(prog?.studentPrograms[0]?.id ?? '');
                setChanges({});
              }}
            >
              {programs.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.program.name} — {p.location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {selectedProgram && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Student list */}
          <Card variant="outlined" sx={{ borderRadius: '0.75rem', width: { xs: '100%', md: '14rem' }, flexShrink: 0 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                Students ({selectedProgram.studentPrograms.length})
              </Typography>
              <List dense>
                {selectedProgram.studentPrograms.map((sp) => (
                  <ListItem key={sp.id} disablePadding>
                    <ListItemButton
                      selected={sp.id === selectedStudentEnrollmentId}
                      onClick={() => { setSelectedStudentEnrollmentId(sp.id); setChanges({}); }}
                      sx={{ borderRadius: '0.5rem' }}
                    >
                      <ListItemText
                        primary={`${sp.student.name} ${sp.student.surname}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: sp.id === selectedStudentEnrollmentId ? 700 : 400 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Skills */}
          <Box sx={{ flex: 1 }}>
            {!selectedStudentProgram ? (
              <Alert severity="info">Select a student.</Alert>
            ) : stages.length === 0 ? (
              <Alert severity="info">No stages/skills defined for this program.</Alert>
            ) : (
              <Stack spacing={2}>
                {stages.map((stage) => (
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
                        {(stage.skills ?? []).map((skill) => {
                          const record = skillMap.get(skill.id);
                          if (!record) return null;
                          const currentStatus = changes[record.id]?.status ?? record.status;
                          const currentNote = changes[record.id]?.note ?? record.note ?? '';
                          const isTrick = skill.type === 'TRICK';
                          const noteOpen = openNotes.has(record.id);

                          return (
                            <Card
                              key={skill.id}
                              variant="outlined"
                              sx={{ borderRadius: '0.5rem', borderColor: isTrick ? '#C9A84C' : undefined }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '14rem', flexShrink: 0, minWidth: 0 }}>
                                  <Chip
                                    label={skill.type}
                                    size="small"
                                    icon={isTrick ? <Star size={10} fill="#C9A84C" color="#C9A84C" /> : undefined}
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.65rem',
                                      flexShrink: 0,
                                      height: '22px',
                                      width: '4.5rem',
                                      '& .MuiChip-label': { px: 0.5 },
                                      ...(isTrick ? { borderColor: '#C9A84C', color: '#C9A84C', '& .MuiChip-icon': { color: '#C9A84C' } } : {}),
                                    }}
                                  />
                                  {skill.description && (
                                    <Tooltip title={skill.description} placement="top" arrow>
                                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'help', flexShrink: 0 }}>
                                        <HelpCircle size={14} />
                                      </Box>
                                    </Tooltip>
                                  )}
                                  <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                    {skill.name}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 'auto', flexShrink: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {STATUS_OPTS.map((opt) => (
                                      <Tooltip key={opt.value} title={opt.label} placement="top">
                                        <Box
                                          onClick={() => handleStatusChange(record.id, opt.value, currentStatus)}
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

                                  <Tooltip title="Add note">
                                    <Box
                                      onClick={() => toggleNote(record.id)}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        color: noteOpen || currentNote ? 'primary.main' : 'text.disabled',
                                      }}
                                    >
                                      <StickyNote size={18} />
                                    </Box>
                                  </Tooltip>
                                </Box>
                              </Box>

                              <Collapse in={noteOpen}>
                                <Box sx={{ px: 2, pb: 1.5 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Add a note…"
                                    value={currentNote}
                                    onChange={(e) => handleNoteChange(record.id, e.target.value)}
                                  />
                                </Box>
                              </Collapse>
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
        </Box>
      )}
    </Box>
  );
}
