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
} from '@mui/material';
import { Star, HelpCircle } from 'lucide-react';
import { getStudentPortal } from '../../api/portal.api';
import type { PortalStudentData, PortalStudentProgram, StudentProgramSkill } from '../../api/types';

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

function SkillRow({ skill }: { skill: StudentProgramSkill & { programSkill: any } }) {
  const isTrick = skill.programSkill?.type === 'TRICK';
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.5rem',
        borderColor: isTrick ? '#C9A84C' : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
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

        <Typography variant="body2" fontWeight={700} sx={{ flex: 1, wordBreak: 'break-word' }}>
          {skill.programSkill?.name}
        </Typography>

        <StatusDot status={skill.status} />
      </Box>
    </Card>
  );
}

export default function StudentSkillsPage() {
  const [data, setData] = useState<PortalStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  useEffect(() => {
    getStudentPortal()
      .then((d) => {
        setData(d);
        if (d.studentPrograms.length > 0) {
          setSelectedProgramId(d.studentPrograms[0].id);
        }
      })
      .catch(() => setError('Failed to load skills.'))
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

  const programs = data?.studentPrograms ?? [];
  const selected: PortalStudentProgram | undefined = programs.find((p) => p.id === selectedProgramId);

  const stages = selected?.programLocation.program.programStages ?? [];
  const skillMap = new Map(
    (selected?.studentProgramSkills ?? []).map((s) => [s.programSkillId, s])
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: '0.5rem' }}>
        Skill Tracker
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
        Your skill progress — read only.
      </Typography>

      {programs.length === 0 ? (
        <Alert severity="info">No programs found.</Alert>
      ) : (
        <>
          {programs.length > 1 && (
            <FormControl size="small" sx={{ mb: 2, minWidth: '16rem' }}>
              <InputLabel>Program</InputLabel>
              <Select
                value={selectedProgramId}
                label="Program"
                onChange={(e) => setSelectedProgramId(e.target.value)}
              >
                {programs.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.programLocation.program.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {stages.length === 0 ? (
            <Alert severity="info">No stages/skills defined for this program yet.</Alert>
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
                      {(stage.skills ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No skills in this stage.</Typography>
                      ) : (
                        (stage.skills ?? []).map((skill) => {
                          const record = skillMap.get(skill.id);
                          const fakeRecord = {
                            ...skill,
                            id: record?.id ?? '',
                            studentProgramId: selected?.id ?? '',
                            programSkillId: skill.id,
                            status: record?.status ?? 0,
                            programSkill: skill,
                          };
                          return <SkillRow key={skill.id} skill={fakeRecord as any} />;
                        })
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
