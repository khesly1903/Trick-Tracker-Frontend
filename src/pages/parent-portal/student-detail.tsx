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
  Divider,
  Button,
  Collapse,
  Tooltip,
} from '@mui/material';
import { MapPin, Clock, User, ChevronDown, ChevronUp, Star, HelpCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParentStudentPrograms, getParentStudents } from '../../api/portal.api';
import type { PortalStudentProgram, PortalParentStudent } from '../../api/types';
import dayjs from 'dayjs';

const STATUS_DOTS = [
  { value: 1, color: '#ef5350', label: 'Not there yet' },
  { value: 2, color: '#ffa726', label: 'Getting there' },
  { value: 3, color: '#66bb6a', label: 'Mastered' },
];

function StatusDot({ status }: { status: number }) {
  const dot = STATUS_DOTS.find((d) => d.value === status);
  return (
    <Tooltip title={dot?.label ?? 'Not started'} placement="top">
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: dot?.color ?? '#bdbdbd',
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}

function ProgramCard({ sp }: { sp: PortalStudentProgram }) {
  const [expanded, setExpanded] = useState(false);
  const pl = sp.programLocation;
  const prog = pl.program;
  const scheduleText = pl.schedules
    .map((s) => `${s.dayOfWeek.slice(0, 3)} ${dayjs(s.startTime).format('HH:mm')}`)
    .join(', ');

  const stages = prog.programStages ?? [];
  const skillMap = new Map(sp.studentProgramSkills.map((s) => [s.programSkillId, s]));
  const totalSkills = sp.studentProgramSkills.length;
  const masteredSkills = sp.studentProgramSkills.filter((s) => s.status >= 3).length;

  return (
    <Card variant="outlined" sx={{ borderRadius: '0.75rem' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>{prog.name}</Typography>
            {prog.level && <Chip label={prog.level} size="small" variant="outlined" sx={{ mt: 0.5 }} />}
          </Box>
          <Chip
            label={sp.isActive ? 'Active' : 'Inactive'}
            size="small"
            color={sp.isActive ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>

        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MapPin size={14} style={{ opacity: 0.6 }} />
            <Typography variant="body2" color="text.secondary">{pl.location.name}</Typography>
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
              <Typography variant="body2" color="text.secondary">{scheduleText}</Typography>
            </Stack>
          )}
        </Stack>

        {totalSkills > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Skills: {masteredSkills}/{totalSkills} mastered
            </Typography>
            <Box sx={{ mt: 0.5, height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${(masteredSkills / totalSkills) * 100}%`,
                  bgcolor: 'success.main',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        )}

        {stages.length > 0 && (
          <Button
            size="small"
            endIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            onClick={() => setExpanded((v) => !v)}
            sx={{ mt: 1.5, px: 0 }}
          >
            {expanded ? 'Hide Skills' : 'Show Skills'}
          </Button>
        )}

        <Collapse in={expanded}>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {stages.map((stage) => (
              <Box key={stage.id}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                  {stage.name}
                </Typography>
                <Divider sx={{ mb: 1, mt: 0.25 }} />
                <Stack spacing={0.75}>
                  {(stage.skills ?? []).map((skill) => {
                    const record = skillMap.get(skill.id);
                    const isTrick = skill.type === 'TRICK';
                    return (
                      <Box
                        key={skill.id}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}
                      >
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
                            ...(isTrick ? { borderColor: '#C9A84C', color: '#C9A84C' } : {}),
                          }}
                        />
                        {skill.description && (
                          <Tooltip title={skill.description} placement="top" arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'help', flexShrink: 0 }}>
                              <HelpCircle size={14} />
                            </Box>
                          </Tooltip>
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                          {skill.name}
                        </Typography>
                        <StatusDot status={record?.status ?? 0} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function ParentStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<PortalStudentProgram[]>([]);
  const [student, setStudent] = useState<PortalParentStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      getParentStudentPrograms(studentId),
      getParentStudents(),
    ])
      .then(([progs, students]) => {
        setPrograms(progs);
        setStudent(students.find((s) => s.id === studentId) ?? null);
      })
      .catch(() => setError('Failed to load student data.'))
      .finally(() => setLoading(false));
  }, [studentId]);

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
      <Button size="small" onClick={() => navigate('/parent')} sx={{ mb: 1, px: 0 }}>
        ← Back
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: '0.25rem' }}>
        {student ? `${student.name} ${student.surname}` : 'Student'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Programs and skill progress
      </Typography>

      {programs.length === 0 ? (
        <Alert severity="info">No active programs found for this student.</Alert>
      ) : (
        <Grid container spacing={2}>
          {programs.map((sp) => (
            <Grid size={{ xs: 12, md: 6 }} key={sp.id}>
              <ProgramCard sp={sp} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
