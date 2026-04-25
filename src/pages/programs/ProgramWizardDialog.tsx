import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Trash2, Plus, MapPin, Pencil, Check, X } from 'lucide-react';

import { getAllClasses } from '../../api/classes.api';
import { createProgram, softDeleteProgram } from '../../api/programs.api';
import {
  createProgramLocation,
  deleteProgramLocation,
} from '../../api/programLocations.api';
import {
  createProgramSchedule,
  deleteProgramSchedule,
} from '../../api/programSchedules.api';
import { createProgramStage, deleteProgramStage, updateProgramStage } from '../../api/programStages.api';
import { addSkillsToStage, getSkillsByStageId, deleteProgramSkill, updateProgramSkill } from '../../api/programSkills.api';
import { getAllInstructors } from '../../api/instructors.api';
import { getAllLocations } from '../../api/locations.api';

import type {
  Class,
  Location,
  Instructor,
  Gender,
  ProgramStage,
  ProgramSkill,
  SkillType,
} from '../../api/types';

import {
  DAY_OPTIONS,
  SESSION_TYPE_OPTIONS,
  formatTime,
  displayTime,
  emptyScheduleRow,
  type ScheduleFormRow,
  type AddedSchedule,
  type AddedLocation,
} from './programShared';

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'BOYS', label: 'Boys' },
  { value: 'GIRLS', label: 'Girls' },
  { value: 'ALL_GENDER', label: 'All Genders' },
];

const STEPS = ['Program', 'Stages & Skills', 'Locations & Schedules'];

// ─── Step 1 Form ─────────────────────────────────────────────────────────────

interface Step1Form {
  name: string;
  classId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  gender: Gender | '';
  minAge: string;
  maxAge: string;
  level: string;
  requiredEquipment: string[];
  equipmentInput: string;
}

const defaultStep1: Step1Form = {
  name: '',
  classId: '',
  startDate: null,
  endDate: null,
  gender: '',
  minAge: '',
  maxAge: '',
  level: '',
  requiredEquipment: [],
  equipmentInput: '',
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type WizardStage = ProgramStage & { skills: ProgramSkill[] };

// ─── StageSkillCard ───────────────────────────────────────────────────────────

interface StageSkillCardProps {
  stage: WizardStage;
  onDeleteStage: (id: string) => void;
  onStageUpdated: (stageId: string, patch: { name: string; description?: string }) => void;
  onSkillsUpdated: (stageId: string, skills: ProgramSkill[]) => void;
  onSkillUpdated: (stageId: string, skill: ProgramSkill) => void;
  onDeleteSkill: (stageId: string, skillId: string) => void;
}

export const StageSkillCard: React.FC<StageSkillCardProps> = ({
  stage,
  onDeleteStage,
  onStageUpdated,
  onSkillsUpdated,
  onSkillUpdated,
  onDeleteSkill,
}) => {
  // Add skill state
  const [skillName, setSkillName] = useState('');
  const [skillType, setSkillType] = useState<SkillType>('SKILL');
  const [skillDesc, setSkillDesc] = useState('');
  const [adding, setAdding] = useState(false);

  // Stage edit state
  const [editingStage, setEditingStage] = useState(false);
  const [editStageName, setEditStageName] = useState('');
  const [editStageDesc, setEditStageDesc] = useState('');
  const [stageEditSubmitting, setStageEditSubmitting] = useState(false);

  // Skill edit state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillType, setEditSkillType] = useState<SkillType>('SKILL');
  const [editSkillDesc, setEditSkillDesc] = useState('');
  const [skillEditSubmitting, setSkillEditSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ── Stage edit ──────────────────────────────────────────────────────────────

  const startEditStage = () => {
    setEditStageName(stage.name);
    setEditStageDesc(stage.description ?? '');
    setEditingStage(true);
    setEditingSkillId(null);
  };

  const handleUpdateStage = async () => {
    const name = editStageName.trim();
    if (!name) return;
    setStageEditSubmitting(true);
    setError(null);
    try {
      await updateProgramStage(stage.programId, stage.id, { name, description: editStageDesc.trim() || undefined });
      onStageUpdated(stage.id, { name, description: editStageDesc.trim() || undefined });
      setEditingStage(false);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        setError(`Stage "${name}" already exists.`);
      } else {
        setError(err?.response?.data?.message ?? 'Failed to update stage.');
      }
    } finally {
      setStageEditSubmitting(false);
    }
  };

  // ── Skill edit ──────────────────────────────────────────────────────────────

  const startEditSkill = (skill: ProgramSkill) => {
    setEditingSkillId(skill.id);
    setEditSkillName(skill.name);
    setEditSkillType(skill.type);
    setEditSkillDesc(skill.description ?? '');
    setEditingStage(false);
  };

  const handleUpdateSkill = async () => {
    if (!editingSkillId) return;
    const name = editSkillName.trim();
    if (!name) return;
    setSkillEditSubmitting(true);
    setError(null);
    try {
      const updated = await updateProgramSkill(editingSkillId, {
        name,
        type: editSkillType,
        description: editSkillDesc.trim() || undefined,
      });
      onSkillUpdated(stage.id, updated);
      setEditingSkillId(null);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        setError(`"${name}" already exists in this stage.`);
      } else {
        setError(err?.response?.data?.message ?? 'Failed to update skill.');
      }
    } finally {
      setSkillEditSubmitting(false);
    }
  };

  // ── Add skill ───────────────────────────────────────────────────────────────

  const handleAddSkill = async () => {
    const name = skillName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      await addSkillsToStage(stage.id, [
        { name, type: skillType, description: skillDesc.trim() || undefined },
      ]);
      const updated = await getSkillsByStageId(stage.id);
      onSkillsUpdated(stage.id, updated);
      setSkillName('');
      setSkillType('SKILL');
      setSkillDesc('');
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        setError(`"${name}" already exists in this stage.`);
      } else {
        setError(err?.response?.data?.message ?? 'Failed to add skill.');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await deleteProgramSkill(skillId);
      onDeleteSkill(stage.id, skillId);
    } catch {
      setError('Failed to delete skill.');
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: '0.75rem' }}>

      {/* ── Stage header ── */}
      {editingStage ? (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <TextField
              label="Stage name"
              value={editStageName}
              onChange={(e) => setEditStageName(e.target.value)}
              size="small"
              sx={{ flex: '2 1 130px' }}
              required
              autoFocus
            />
            <TextField
              label="Description (optional)"
              value={editStageDesc}
              onChange={(e) => setEditStageDesc(e.target.value)}
              size="small"
              sx={{ flex: '3 1 180px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setEditingStage(false)} disabled={stageEditSubmitting}>
              <X size={14} />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={handleUpdateStage}
              disabled={!editStageName.trim() || stageEditSubmitting}
            >
              {stageEditSubmitting ? <CircularProgress size={14} /> : <Check size={14} />}
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight={700}>{stage.name}</Typography>
            {stage.description && (
              <Typography variant="caption" color="text.secondary">{stage.description}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <IconButton size="small" sx={{ p: 0.25, color: 'primary.main' }} onClick={startEditStage}>
              <Pencil size={13} />
            </IconButton>
            <IconButton size="small" color="error" sx={{ p: 0.25 }} onClick={() => onDeleteStage(stage.id)}>
              <Trash2 size={13} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* ── Skills list ── */}
      {stage.skills.length > 0 && (
        <>
          {stage.skills.map((skill) => (
            <Box key={skill.id}>
              {editingSkillId === skill.id ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap', py: 0.5 }}>
                  <TextField
                    label="Name"
                    value={editSkillName}
                    onChange={(e) => setEditSkillName(e.target.value)}
                    size="small"
                    sx={{ flex: '2 1 120px' }}
                    autoFocus
                  />
                  <TextField
                    select
                    label="Type"
                    value={editSkillType}
                    onChange={(e) => setEditSkillType(e.target.value as SkillType)}
                    size="small"
                    sx={{ flex: '0 0 90px' }}
                  >
                    <MenuItem value="SKILL">Skill</MenuItem>
                    <MenuItem value="TRICK">Trick</MenuItem>
                  </TextField>
                  <TextField
                    label="Description"
                    value={editSkillDesc}
                    onChange={(e) => setEditSkillDesc(e.target.value)}
                    size="small"
                    sx={{ flex: '3 1 150px' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setEditingSkillId(null)} disabled={skillEditSubmitting}>
                      <X size={13} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleUpdateSkill}
                      disabled={!editSkillName.trim() || skillEditSubmitting}
                    >
                      {skillEditSubmitting ? <CircularProgress size={13} /> : <Check size={13} />}
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
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
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <IconButton size="small" sx={{ p: 0.25, color: 'primary.main' }} onClick={() => startEditSkill(skill)}>
                      <Pencil size={12} />
                    </IconButton>
                    <IconButton size="small" color="error" sx={{ p: 0.25 }} onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 size={12} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Add skill row ── */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <TextField
          label="Skill name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
          size="small"
          sx={{ flex: '2 1 130px' }}
          placeholder="e.g. Backstroke"
        />
        <TextField
          select
          label="Type"
          value={skillType}
          onChange={(e) => setSkillType(e.target.value as SkillType)}
          size="small"
          sx={{ flex: '0 0 100px' }}
        >
          <MenuItem value="SKILL">Skill</MenuItem>
          <MenuItem value="TRICK">Trick</MenuItem>
        </TextField>
        <TextField
          label="Description (optional)"
          value={skillDesc}
          onChange={(e) => setSkillDesc(e.target.value)}
          size="small"
          sx={{ flex: '3 1 160px' }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={adding ? <CircularProgress size={12} /> : <Plus size={13} />}
          onClick={handleAddSkill}
          disabled={!skillName.trim() || adding}
          sx={{ height: '2.5rem', whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      </Box>
    </Paper>
  );
};

// ─── LocationCard ─────────────────────────────────────────────────────────────

export interface LocationCardProps {
  loc: AddedLocation;
  onDeleteLocation: (programLocationId: string) => void;
  onDeleteSchedule: (programLocationId: string, scheduleId: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  loc,
  onDeleteLocation,
  onDeleteSchedule,
}) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, mb: 1.5, borderRadius: '0.75rem' }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <MapPin size={15} />
          <Typography variant="body2" fontWeight={700}>
            {loc.locationName}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ${loc.price} · Cap: {loc.capacity}
          {loc.instructorName ? ` · ${loc.instructorName}` : ''}
        </Typography>
      </Box>
      <IconButton
        size="small"
        color="error"
        onClick={() => onDeleteLocation(loc.programLocationId)}
      >
        <Trash2 size={16} />
      </IconButton>
    </Box>

    {loc.schedules.length > 0 && (
      <>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          SCHEDULES
        </Typography>
        {loc.schedules.map((s) => (
          <Box
            key={s.scheduleId}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
            }}
          >
            <Typography variant="caption">
              {s.dayOfWeek} {s.startTime} · {s.duration}min · {s.type}
            </Typography>
            <IconButton
              size="small"
              color="error"
              sx={{ p: 0.25 }}
              onClick={() => onDeleteSchedule(loc.programLocationId, s.scheduleId)}
            >
              <Trash2 size={13} />
            </IconButton>
          </Box>
        ))}
      </>
    )}
  </Paper>
);

// ─── AddLocationForm ──────────────────────────────────────────────────────────

export interface AddLocationFormProps {
  programId: string;
  locations: Location[];
  instructors: Instructor[];
  onAdded: (loc: AddedLocation) => void;
  onCancel: () => void;
}

export const AddLocationForm: React.FC<AddLocationFormProps> = ({
  programId,
  locations,
  instructors,
  onAdded,
  onCancel,
}) => {
  const [locationId, setLocationId] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [backupInstructorIds, setBackupInstructorIds] = useState<string[]>([]);
  const [scheduleRows, setScheduleRows] = useState<ScheduleFormRow[]>([
    emptyScheduleRow(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateRow = (localId: string, patch: Partial<ScheduleFormRow>) =>
    setScheduleRows((rows) =>
      rows.map((r) => (r.localId === localId ? { ...r, ...patch } : r))
    );

  const removeRow = (localId: string) =>
    setScheduleRows((rows) => rows.filter((r) => r.localId !== localId));

  const validate = (): string | null => {
    if (!locationId) return 'Location is required.';
    if (price === '') return 'Price is required.';
    if (Number(price) < 0) return 'Price must be ≥ 0.';
    if (capacity === '') return 'Capacity is required.';
    if (Number(capacity) < 1) return 'Capacity must be ≥ 1.';
    for (const row of scheduleRows) {
      if (!row.dayOfWeek) return 'Day of week is required for all schedules.';
      if (!row.startTime) return 'Start time is required for all schedules.';
      if (!row.endTime) return 'End time is required for all schedules.';
      if (!row.endTime.isAfter(row.startTime)) return 'End time must be after start time.';
      if (!row.type) return 'Session type is required for all schedules.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);

    try {
      const loc = await createProgramLocation({
        programId,
        locationId,
        price: Number(price),
        capacity: Number(capacity),
        instructorId: instructorId || undefined,
        backupInstructorIds:
          backupInstructorIds.length > 0 ? backupInstructorIds : undefined,
      });

      const createdSchedules: AddedSchedule[] = [];
      for (const row of scheduleRows) {
        const duration = row.endTime!.diff(row.startTime!, 'minute');
        const sched = await createProgramSchedule({
          programLocationId: loc.id,
          dayOfWeek: row.dayOfWeek as import('../../api/types').DayOfWeek,
          startTime: formatTime(row.startTime!),
          endTime: formatTime(row.endTime!),
          duration,
          type: row.type as import('../../api/types').SessionType,
        });
        createdSchedules.push({
          scheduleId: sched.id,
          dayOfWeek: row.dayOfWeek as import('../../api/types').DayOfWeek,
          startTime: displayTime(sched.startTime),
          endTime: sched.endTime ? displayTime(sched.endTime) : undefined,
          duration: sched.duration,
          type: sched.type,
        });
      }

      const instructor = instructors.find((i) => i.id === instructorId);
      const location = locations.find((l) => l.id === locationId);

      onAdded({
        programLocationId: loc.id,
        locationId,
        locationName: location?.name ?? locationId,
        price: Number(price),
        capacity: Number(capacity),
        instructorId: instructorId || undefined,
        instructorName: instructor
          ? `${instructor.name} ${instructor.surname}`
          : undefined,
        backupInstructorIds: backupInstructorIds.length > 0 ? backupInstructorIds : undefined,
        schedules: createdSchedules,
      });
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        setError('This location is already added to this program.');
      } else {
        setError(err?.response?.data?.message ?? 'Failed to add location.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: '0.75rem',
        borderStyle: 'dashed',
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
        New Location
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          select
          label="Location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          required
          fullWidth
          size="small"
        >
          {locations.map((l) => (
            <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
        </Box>

        <TextField
          select
          label="Instructor"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          fullWidth
          size="small"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {instructors.map((i) => (
            <MenuItem key={i.id} value={i.id}>{i.name} {i.surname}</MenuItem>
          ))}
        </TextField>

        <FormControl fullWidth size="small">
          <InputLabel>Backup Instructors</InputLabel>
          <Select
            multiple
            value={backupInstructorIds}
            onChange={(e) =>
              setBackupInstructorIds(e.target.value as string[])
            }
            input={<OutlinedInput label="Backup Instructors" />}
            renderValue={(selected) =>
              (selected as string[])
                .map((id) => {
                  const inst = instructors.find((i) => i.id === id);
                  return inst ? `${inst.name} ${inst.surname}` : id;
                })
                .join(', ')
            }
          >
            {instructors
              .filter((i) => i.id !== instructorId)
              .map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  <Checkbox
                    checked={backupInstructorIds.includes(i.id)}
                    size="small"
                  />
                  <ListItemText primary={`${i.name} ${i.surname}`} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Schedule rows */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            SCHEDULES
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {scheduleRows.map((row, idx) => (
              <Paper
                key={row.localId}
                variant="outlined"
                sx={{ p: 1.5, mt: 1, borderRadius: '0.5rem' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Schedule {idx + 1}
                  </Typography>
                  {scheduleRows.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ p: 0.25 }}
                      onClick={() => removeRow(row.localId)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <TextField
                    select
                    label="Day"
                    value={row.dayOfWeek}
                    onChange={(e) =>
                      updateRow(row.localId, {
                        dayOfWeek: e.target.value as import('../../api/types').DayOfWeek,
                      })
                    }
                    size="small"
                    sx={{ flex: '1 1 130px' }}
                    required
                  >
                    {DAY_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Type"
                    value={row.type}
                    onChange={(e) =>
                      updateRow(row.localId, {
                        type: e.target.value as import('../../api/types').SessionType,
                      })
                    }
                    size="small"
                    sx={{ flex: '1 1 110px' }}
                    required
                  >
                    {SESSION_TYPE_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TimePicker
                    label="Start Time"
                    value={row.startTime}
                    onChange={(v) => updateRow(row.localId, { startTime: v })}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { flex: '1 1 130px' },
                        required: true,
                      },
                    }}
                  />
                  <TimePicker
                    label="End Time"
                    value={row.endTime}
                    onChange={(v) => updateRow(row.localId, { endTime: v })}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { flex: '1 1 130px' },
                        required: true,
                      },
                    }}
                  />
                </Box>
              </Paper>
            ))}
          </LocalizationProvider>

          <Button
            size="small"
            startIcon={<Plus size={14} />}
            onClick={() =>
              setScheduleRows((rows) => [...rows, emptyScheduleRow()])
            }
            sx={{ mt: 1 }}
          >
            Add Another Schedule
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button size="small" color="inherit" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={14} /> : undefined}
        >
          {submitting ? 'Saving...' : 'Add Location →'}
        </Button>
      </Box>
    </Paper>
  );
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProgramWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ProgramWizardDialog: React.FC<ProgramWizardDialogProps> = ({
  open,
  onClose,
  onCompleted,
}) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [programId, setProgramId] = useState<string | null>(null);

  const [form1, setForm1] = useState<Step1Form>(defaultStep1);

  // Step 2 — stages
  const [addedStages, setAddedStages] = useState<WizardStage[]>([]);
  const [stageInput, setStageInput] = useState('');
  const [stageDescInput, setStageDescInput] = useState('');
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  // Step 3 — locations
  const [addedLocations, setAddedLocations] = useState<AddedLocation[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reference data
  const [classes, setClasses] = useState<Class[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    if (!open) return;
    getAllClasses().then(setClasses).catch(console.error);
    getAllLocations().then(setLocations).catch(console.error);
    getAllInstructors(1, 100).then((r) => setInstructors(r.data)).catch(console.error);
  }, [open]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setProgramId(null);
      setForm1(defaultStep1);
      setAddedStages([]);
      setStageInput('');
      setStageDescInput('');
      setStageError(null);
      setAddedLocations([]);
      setShowLocationForm(false);
      setError(null);
    }
  }, [open]);

  // ── Cancel ──────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (programId && step > 0) {
      try {
        await softDeleteProgram(programId);
      } catch {
        // best-effort
      }
    }
    onClose();
  };

  // ── Step 1 validation & submit ──────────────────────────────────────────────

  const validateStep1 = (): string | null => {
    if (!form1.name.trim()) return 'Program name is required.';
    if (!form1.classId) return 'Class is required.';
    if (!form1.startDate) return 'Start date is required.';
    if (!form1.endDate) return 'End date is required.';
    const minDate = dayjs().subtract(1, 'year');
    const maxDate = dayjs().add(2, 'year');
    if (form1.startDate.isBefore(minDate)) return 'Start date cannot be more than 1 year in the past.';
    if (form1.startDate.isAfter(maxDate)) return 'Start date cannot be more than 2 years in the future.';
    if (form1.endDate.isBefore(minDate)) return 'End date cannot be more than 1 year in the past.';
    if (form1.endDate.isAfter(maxDate)) return 'End date cannot be more than 2 years in the future.';
    if (!form1.startDate.isBefore(form1.endDate))
      return 'Start date must be before end date.';
    if (!form1.gender) return 'Gender is required.';
    if (form1.minAge === '') return 'Min age is required.';
    if (form1.maxAge === '') return 'Max age is required.';
    if (Number(form1.minAge) > Number(form1.maxAge))
      return 'Min age must be ≤ max age.';
    return null;
  };

  const handleNextStep1 = async () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);

    // If program already created (e.g. user went Back), skip API call
    if (programId) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const program = await createProgram({
        name: form1.name.trim(),
        classId: form1.classId,
        startDate: form1.startDate!.toISOString(),
        endDate: form1.endDate!.toISOString(),
        gender: form1.gender as Gender,
        minAge: Number(form1.minAge),
        maxAge: Number(form1.maxAge),
        requiredEquipment: form1.requiredEquipment,
        level: form1.level.trim() || undefined,
      });
      setProgramId(program.id!);
      setStep(1);
    } catch (e: unknown) {
      const msg = (
        e as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setError(msg ?? 'Failed to create program.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2 — stage management ────────────────────────────────────────────────

  const handleAddStage = async () => {
    const name = stageInput.trim();
    if (!name || !programId) return;
    setStageSubmitting(true);
    setStageError(null);
    try {
      const stage = await createProgramStage(programId, {
        name,
        description: stageDescInput.trim() || undefined,
      });
      setAddedStages((prev) => [...prev, { ...stage, skills: stage.skills ?? [] }]);
      setStageInput('');
      setStageDescInput('');
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        setStageError('A stage with this name already exists.');
      } else {
        setStageError(err?.response?.data?.message ?? 'Failed to add stage.');
      }
    } finally {
      setStageSubmitting(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!programId) return;
    try {
      await deleteProgramStage(programId, stageId);
      setAddedStages((prev) => prev.filter((s) => s.id !== stageId));
    } catch {
      setStageError('Failed to delete stage.');
    }
  };

  const handleSkillsUpdated = (stageId: string, skills: ProgramSkill[]) => {
    setAddedStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, skills } : s))
    );
  };

  const handleSkillUpdated = (stageId: string, skill: ProgramSkill) => {
    setAddedStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, skills: s.skills.map((sk) => (sk.id === skill.id ? skill : sk)) }
          : s
      )
    );
  };

  const handleStageUpdated = (stageId: string, patch: { name: string; description?: string }) => {
    setAddedStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, ...patch } : s))
    );
  };

  const handleDeleteSkill = (stageId: string, skillId: string) => {
    setAddedStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, skills: s.skills.filter((sk) => sk.id !== skillId) }
          : s
      )
    );
  };

  const handleNextStep2 = () => {
    setError(null);
    setStep(2);
  };

  // ── Location management ──────────────────────────────────────────────────────

  const handleLocationAdded = (loc: AddedLocation) => {
    setAddedLocations((prev) => [...prev, loc]);
    setShowLocationForm(false);
  };

  const handleDeleteLocation = async (programLocationId: string) => {
    try {
      await deleteProgramLocation(programLocationId);
      setAddedLocations((prev) =>
        prev.filter((l) => l.programLocationId !== programLocationId)
      );
    } catch {
      setError('Failed to delete location.');
    }
  };

  const handleDeleteSchedule = async (
    programLocationId: string,
    scheduleId: string
  ) => {
    try {
      await deleteProgramSchedule(scheduleId);
      setAddedLocations((prev) =>
        prev.map((l) =>
          l.programLocationId === programLocationId
            ? {
                ...l,
                schedules: l.schedules.filter((s) => s.scheduleId !== scheduleId),
              }
            : l
        )
      );
    } catch {
      setError('Failed to delete schedule.');
    }
  };

  // ── Finish ───────────────────────────────────────────────────────────────────

  const handleFinish = () => {
    if (addedLocations.length === 0) {
      setError('Add at least one location before finishing.');
      return;
    }
    onCompleted();
  };

  // ── Equipment tag input ──────────────────────────────────────────────────────

  const handleEquipmentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && form1.equipmentInput.trim()) {
      e.preventDefault();
      const val = form1.equipmentInput.trim();
      if (!form1.requiredEquipment.includes(val)) {
        setForm1((f) => ({
          ...f,
          requiredEquipment: [...f.requiredEquipment, val],
          equipmentInput: '',
        }));
      }
    }
  };

  const removeEquipment = (item: string) =>
    setForm1((f) => ({
      ...f,
      requiredEquipment: f.requiredEquipment.filter((e) => e !== item),
    }));

  // ── Step renders ─────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="Program Name"
        value={form1.name}
        onChange={(e) => setForm1((f) => ({ ...f, name: e.target.value }))}
        required
        fullWidth
        size="small"
      />

      <TextField
        select
        label="Class"
        value={form1.classId}
        onChange={(e) => setForm1((f) => ({ ...f, classId: e.target.value }))}
        required
        fullWidth
        size="small"
      >
        {classes.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Start Date"
            value={form1.startDate}
            onChange={(v) => setForm1((f) => ({ ...f, startDate: v }))}
            minDate={dayjs().subtract(1, 'year')}
            maxDate={dayjs().add(2, 'year')}
            slotProps={{
              textField: { size: 'small', fullWidth: true, required: true },
            }}
          />
          <DatePicker
            label="End Date"
            value={form1.endDate}
            onChange={(v) => setForm1((f) => ({ ...f, endDate: v }))}
            minDate={form1.startDate ? form1.startDate.add(1, 'day') : dayjs().subtract(1, 'year')}
            maxDate={dayjs().add(2, 'year')}
            slotProps={{
              textField: { size: 'small', fullWidth: true, required: true },
            }}
          />
        </Box>
      </LocalizationProvider>

      <TextField
        select
        label="Gender"
        value={form1.gender}
        onChange={(e) =>
          setForm1((f) => ({ ...f, gender: e.target.value as Gender }))
        }
        required
        fullWidth
        size="small"
      >
        {GENDER_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Min Age"
          type="number"
          value={form1.minAge}
          onChange={(e) => setForm1((f) => ({ ...f, minAge: e.target.value }))}
          required
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
          error={form1.minAge !== '' && form1.maxAge !== '' && Number(form1.minAge) > Number(form1.maxAge)}
        />
        <TextField
          label="Max Age"
          type="number"
          value={form1.maxAge}
          onChange={(e) => setForm1((f) => ({ ...f, maxAge: e.target.value }))}
          required
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
          error={form1.minAge !== '' && form1.maxAge !== '' && Number(form1.minAge) > Number(form1.maxAge)}
          helperText={form1.minAge !== '' && form1.maxAge !== '' && Number(form1.minAge) > Number(form1.maxAge) ? 'Max age must be ≥ min age.' : undefined}
        />
      </Box>

      <TextField
        label="Level (optional)"
        value={form1.level}
        onChange={(e) => setForm1((f) => ({ ...f, level: e.target.value }))}
        fullWidth
        size="small"
        placeholder="e.g. Beginner"
      />

      <Box>
        <TextField
          label="Required Equipment"
          placeholder="Type and press Enter"
          value={form1.equipmentInput}
          onChange={(e) =>
            setForm1((f) => ({ ...f, equipmentInput: e.target.value }))
          }
          onKeyDown={handleEquipmentKeyDown}
          fullWidth
          size="small"
          helperText="Press Enter or comma to add"
        />
        {form1.requiredEquipment.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {form1.requiredEquipment.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => removeEquipment(item)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ pt: 1 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Stages & Skills
      </Typography>

      {stageError && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setStageError(null)}>
          {stageError}
        </Alert>
      )}

      {addedStages.map((stage) => (
        <StageSkillCard
          key={stage.id}
          stage={stage}
          onDeleteStage={handleDeleteStage}
          onStageUpdated={handleStageUpdated}
          onSkillsUpdated={handleSkillsUpdated}
          onSkillUpdated={handleSkillUpdated}
          onDeleteSkill={handleDeleteSkill}
        />
      ))}

      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: '0.75rem', borderStyle: 'dashed', borderColor: 'divider' }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
          ADD STAGE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            label="Stage name"
            value={stageInput}
            onChange={(e) => setStageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStage(); } }}
            size="small"
            sx={{ flex: '2 1 130px' }}
            placeholder="e.g. Beginner"
            required
          />
          <TextField
            label="Description (optional)"
            value={stageDescInput}
            onChange={(e) => setStageDescInput(e.target.value)}
            size="small"
            sx={{ flex: '3 1 180px' }}
            placeholder="e.g. Introduction to water safety"
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={stageSubmitting ? <CircularProgress size={14} /> : <Plus size={14} />}
            onClick={handleAddStage}
            disabled={!stageInput.trim() || stageSubmitting}
            sx={{ height: '2.5rem', whiteSpace: 'nowrap' }}
          >
            Add Stage
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ pt: 1 }}>
      {addedLocations.length === 0 && !showLocationForm && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No locations added yet. Add at least one location to finish.
        </Typography>
      )}

      {addedLocations.map((loc) => (
        <LocationCard
          key={loc.programLocationId}
          loc={loc}
          onDeleteLocation={handleDeleteLocation}
          onDeleteSchedule={handleDeleteSchedule}
        />
      ))}

      {showLocationForm ? (
        <AddLocationForm
          programId={programId!}
          locations={locations}
          instructors={instructors}
          onAdded={handleLocationAdded}
          onCancel={() => setShowLocationForm(false)}
        />
      ) : (
        <Button
          variant="outlined"
          startIcon={<Plus size={16} />}
          onClick={() => setShowLocationForm(true)}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Location
        </Button>
      )}
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle>New Program</DialogTitle>

      <DialogContent sx={{ maxHeight: '65vh', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {step === 0 && renderStep1()}
        {step === 1 && renderStep2()}
        {step === 2 && renderStep3()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />

        {step === 1 && (
          <Button
            onClick={() => { setError(null); setStep(0); }}
            disabled={submitting}
          >
            Back
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={() => { setError(null); setStep(1); }}
            disabled={submitting}
          >
            Back
          </Button>
        )}

        {step === 0 && (
          <Button
            variant="contained"
            onClick={handleNextStep1}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Saving...' : 'Next'}
          </Button>
        )}
        {step === 1 && (
          <Button
            variant="contained"
            onClick={handleNextStep2}
            disabled={stageSubmitting}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            variant="contained"
            onClick={handleFinish}
            disabled={addedLocations.length === 0 || showLocationForm}
          >
            Finish
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProgramWizardDialog;
