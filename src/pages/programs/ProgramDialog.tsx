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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { Plus, Trash2, Pencil, MapPin, Check, X } from 'lucide-react';

import { getProgramById, updateProgram } from '../../api/programs.api';
import {
  deleteProgramLocation,
  updateProgramLocation,
  addBackupInstructor,
  removeBackupInstructor,
} from '../../api/programLocations.api';
import {
  createProgramSchedule,
  deleteProgramSchedule,
  updateProgramSchedule,
} from '../../api/programSchedules.api';
import { getAllClasses } from '../../api/classes.api';
import { getAllLocations } from '../../api/locations.api';
import { getAllInstructors } from '../../api/instructors.api';
import { createProgramStage, deleteProgramStage } from '../../api/programStages.api';

import { AddLocationForm, StageSkillCard, type WizardStage } from './ProgramWizardDialog';
import {
  displayTime,
  formatTime,
  DAY_OPTIONS,
  SESSION_TYPE_OPTIONS,
  type AddedLocation,
  type AddedSchedule,
} from './programShared';

import type {
  Program,
  Class,
  Location,
  Instructor,
  Gender,
  DayOfWeek,
  SessionType,
  ProgramSkill,
} from '../../api/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'BOYS', label: 'Boys' },
  { value: 'GIRLS', label: 'Girls' },
  { value: 'ALL_GENDER', label: 'All Genders' },
];

const STEPS = ['Program', 'Stages & Skills', 'Locations & Schedules'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditForm {
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
  isActive: boolean;
}

const defaultForm: EditForm = {
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
  isActive: true,
};

interface LocEditForm {
  price: string;
  capacity: string;
  instructorId: string;
  backupInstructorIds: string[];
}

interface SchedEditForm {
  dayOfWeek: DayOfWeek | '';
  type: SessionType | '';
  startTime: Dayjs | null;
  endTime: Dayjs | null;
}

// ─── SchedForm helper (shared by edit + add) ──────────────────────────────────

interface SchedFormProps {
  form: SchedEditForm;
  setForm: React.Dispatch<React.SetStateAction<SchedEditForm | null>>;
  submitting: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SchedForm: React.FC<SchedFormProps> = ({ form, setForm, submitting, onSave, onCancel }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Paper variant="outlined" sx={{ p: 1.5, mt: 1, borderRadius: '0.5rem' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Day"
          value={form.dayOfWeek}
          onChange={(e) => setForm((f) => f && ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))}
          size="small"
          sx={{ flex: '1 1 130px' }}
        >
          {DAY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          value={form.type}
          onChange={(e) => setForm((f) => f && ({ ...f, type: e.target.value as SessionType }))}
          size="small"
          sx={{ flex: '1 1 110px' }}
        >
          {SESSION_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <TimePicker
          label="Start Time"
          value={form.startTime}
          onChange={(v) => setForm((f) => f && ({ ...f, startTime: v }))}
          slotProps={{ textField: { size: 'small', sx: { flex: '1 1 130px' }, required: true } }}
        />
        <TimePicker
          label="End Time"
          value={form.endTime}
          onChange={(v) => setForm((f) => f && ({ ...f, endTime: v }))}
          slotProps={{ textField: { size: 'small', sx: { flex: '1 1 130px' }, required: true } }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button size="small" color="inherit" onClick={onCancel} disabled={submitting}>
          <X size={14} />
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={submitting || !form.startTime || !form.endTime || !form.dayOfWeek}
          startIcon={submitting ? <CircularProgress size={12} /> : <Check size={14} />}
        >
          Save
        </Button>
      </Box>
    </Paper>
  </LocalizationProvider>
);

// ─── Main Component ────────────────────────────────────────────────────────────

interface ProgramDialogProps {
  open: boolean;
  program: Program | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProgramDialog: React.FC<ProgramDialogProps> = ({ open, program, onClose, onSaved }) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<EditForm>(defaultForm);

  // Step 1 — stages & skills
  const [addedStages, setAddedStages] = useState<WizardStage[]>([]);
  const [stageInput, setStageInput] = useState('');
  const [stageDescInput, setStageDescInput] = useState('');
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  const [addedLocations, setAddedLocations] = useState<AddedLocation[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Reference data
  const [classes, setClasses] = useState<Class[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Location inline edit state
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locEditForm, setLocEditForm] = useState<LocEditForm | null>(null);
  const [locEditSubmitting, setLocEditSubmitting] = useState(false);

  // Schedule inline edit state
  const [editingSchedKey, setEditingSchedKey] = useState<{ locId: string; schedId: string } | null>(null);
  const [schedEditForm, setSchedEditForm] = useState<SchedEditForm | null>(null);
  const [schedEditSubmitting, setSchedEditSubmitting] = useState(false);

  // Schedule add state (per location)
  const [addingSchedLocId, setAddingSchedLocId] = useState<string | null>(null);
  const [schedAddForm, setSchedAddForm] = useState<SchedEditForm | null>(null);
  const [schedAddSubmitting, setSchedAddSubmitting] = useState(false);

  // Load reference data + full program on open
  useEffect(() => {
    if (!open || !program) return;

    // Optimistic pre-fill from shallow program object
    setForm((f) => ({
      ...f,
      name: program.name,
      startDate: dayjs(program.startDate),
      endDate: dayjs(program.endDate),
      gender: program.gender,
      minAge: String(program.minAge),
      maxAge: String(program.maxAge),
      level: program.level ?? '',
      requiredEquipment: program.requiredEquipment ?? [],
      isActive: program.isActive,
      classId: program.classId,
    }));

    getAllClasses().then(setClasses).catch(console.error);
    getAllLocations().then(setLocations).catch(console.error);
    getAllInstructors(1, 100).then((r) => setInstructors(r.data)).catch(console.error);

    setFetchLoading(true);
    getProgramById(program.id)
      .then((full) => {
        setForm({
          name: full.name,
          classId: full.classId,
          startDate: dayjs(full.startDate),
          endDate: dayjs(full.endDate),
          gender: full.gender,
          minAge: String(full.minAge),
          maxAge: String(full.maxAge),
          level: full.level ?? '',
          requiredEquipment: full.requiredEquipment ?? [],
          equipmentInput: '',
          isActive: full.isActive,
        });
        const mappedStages: WizardStage[] = (full.programStages ?? []).map((s) => ({
          ...s,
          skills: s.skills ?? [],
        }));
        setAddedStages(mappedStages);

        const mapped: AddedLocation[] = (full.programLocations ?? []).map((pl) => ({
          programLocationId: pl.id,
          locationId: pl.locationId,
          locationName: pl.location?.name ?? pl.locationId,
          price: pl.price,
          capacity: pl.capacity,
          instructorId: pl.instructorId,
          instructorName: pl.instructor
            ? `${pl.instructor.name} ${pl.instructor.surname}`
            : undefined,
          backupInstructorIds: pl.backupInstructors?.map((i) => i.id) ?? [],
          schedules: (pl.schedules ?? []).map((s) => ({
            scheduleId: s.id,
            dayOfWeek: s.dayOfWeek,
            startTime: displayTime(s.startTime),
            endTime: s.endTime ? displayTime(s.endTime) : undefined,
            duration: s.duration,
            type: s.type,
          })),
        }));
        setAddedLocations(mapped);
      })
      .catch(() => setError('Failed to load program data.'))
      .finally(() => setFetchLoading(false));
  }, [open, program]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(0);
      setForm(defaultForm);
      setAddedStages([]);
      setStageInput('');
      setStageDescInput('');
      setStageError(null);
      setAddedLocations([]);
      setShowLocationForm(false);
      setError(null);
      setSubmitting(false);
      setFetchLoading(false);
      setEditingLocId(null);
      setLocEditForm(null);
      setEditingSchedKey(null);
      setSchedEditForm(null);
      setAddingSchedLocId(null);
      setSchedAddForm(null);
    }
  }, [open]);

  // ── Step 1 ──────────────────────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Program name is required.';
    if (!form.classId) return 'Class is required.';
    if (!form.startDate) return 'Start date is required.';
    if (!form.endDate) return 'End date is required.';
    const minDate = dayjs().subtract(1, 'year');
    const maxDate = dayjs().add(2, 'year');
    if (form.startDate.isBefore(minDate)) return 'Start date cannot be more than 1 year in the past.';
    if (form.startDate.isAfter(maxDate)) return 'Start date cannot be more than 2 years in the future.';
    if (form.endDate.isBefore(minDate)) return 'End date cannot be more than 1 year in the past.';
    if (form.endDate.isAfter(maxDate)) return 'End date cannot be more than 2 years in the future.';
    if (!form.startDate.isBefore(form.endDate)) return 'Start date must be before end date.';
    if (!form.gender) return 'Gender is required.';
    if (form.minAge === '') return 'Min age is required.';
    if (form.maxAge === '') return 'Max age is required.';
    if (Number(form.minAge) > Number(form.maxAge)) return 'Min age must be ≤ max age.';
    return null;
  };

  const handleNext = async () => {
    const err = validateForm();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    try {
      await updateProgram(program!.id, {
        name: form.name.trim(),
        classId: form.classId,
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
        gender: form.gender as Gender,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        level: form.level.trim() || undefined,
        requiredEquipment: form.requiredEquipment,
        isActive: form.isActive,
      });
      setStep(1);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to update program.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stage management ─────────────────────────────────────────────────────────

  const handleAddStage = async () => {
    const name = stageInput.trim();
    if (!name || !program) return;
    setStageSubmitting(true);
    setStageError(null);
    try {
      const stage = await createProgramStage(program.id, {
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
    if (!program) return;
    try {
      await deleteProgramStage(program.id, stageId);
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

  const handleEquipmentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && form.equipmentInput.trim()) {
      e.preventDefault();
      const val = form.equipmentInput.trim();
      if (!form.requiredEquipment.includes(val)) {
        setForm((f) => ({ ...f, requiredEquipment: [...f.requiredEquipment, val], equipmentInput: '' }));
      }
    }
  };

  // ── Location management ──────────────────────────────────────────────────────

  const handleLocationAdded = (loc: AddedLocation) => {
    setAddedLocations((prev) => [...prev, loc]);
    setShowLocationForm(false);
  };

  const handleDeleteLocation = async (programLocationId: string) => {
    try {
      await deleteProgramLocation(programLocationId);
      setAddedLocations((prev) => prev.filter((l) => l.programLocationId !== programLocationId));
    } catch {
      setError('Failed to delete location.');
    }
  };

  const startEditLocation = (loc: AddedLocation) => {
    setEditingLocId(loc.programLocationId);
    setLocEditForm({
      price: String(loc.price),
      capacity: String(loc.capacity),
      instructorId: loc.instructorId ?? '',
      backupInstructorIds: loc.backupInstructorIds ?? [],
    });
  };

  const cancelEditLocation = () => {
    setEditingLocId(null);
    setLocEditForm(null);
  };

  const handleUpdateLocation = async (programLocationId: string) => {
    if (!locEditForm) return;
    const currentLoc = addedLocations.find((l) => l.programLocationId === programLocationId);
    const oldBackupIds = currentLoc?.backupInstructorIds ?? [];
    const newBackupIds = locEditForm.backupInstructorIds;
    const toAdd = newBackupIds.filter((id) => !oldBackupIds.includes(id));
    const toRemove = oldBackupIds.filter((id) => !newBackupIds.includes(id));

    setLocEditSubmitting(true);
    try {
      await updateProgramLocation(programLocationId, {
        price: Number(locEditForm.price),
        capacity: Number(locEditForm.capacity),
        instructorId: locEditForm.instructorId || undefined,
      });
      await Promise.all([
        ...toAdd.map((id) => addBackupInstructor(programLocationId, id)),
        ...toRemove.map((id) => removeBackupInstructor(programLocationId, id)),
      ]);
      const instructor = instructors.find((i) => i.id === locEditForm.instructorId);
      setAddedLocations((prev) =>
        prev.map((l) =>
          l.programLocationId === programLocationId
            ? {
                ...l,
                price: Number(locEditForm.price),
                capacity: Number(locEditForm.capacity),
                instructorId: locEditForm.instructorId || undefined,
                instructorName: instructor
                  ? `${instructor.name} ${instructor.surname}`
                  : undefined,
                backupInstructorIds: newBackupIds,
              }
            : l
        )
      );
      setEditingLocId(null);
      setLocEditForm(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to update location.');
    } finally {
      setLocEditSubmitting(false);
    }
  };

  // ── Schedule management ──────────────────────────────────────────────────────

  const handleDeleteSchedule = async (programLocationId: string, scheduleId: string) => {
    try {
      await deleteProgramSchedule(scheduleId);
      setAddedLocations((prev) =>
        prev.map((l) =>
          l.programLocationId === programLocationId
            ? { ...l, schedules: l.schedules.filter((s) => s.scheduleId !== scheduleId) }
            : l
        )
      );
    } catch {
      setError('Failed to delete schedule.');
    }
  };

  const parseDisplayTime = (t: string | undefined): Dayjs | null => {
    if (!t) return null;
    const [h, m] = t.split(':');
    return dayjs().hour(Number(h)).minute(Number(m)).second(0);
  };

  const emptySchedForm = (): SchedEditForm => ({
    dayOfWeek: '',
    type: 'CLASS',
    startTime: null,
    endTime: null,
  });

  const startEditSchedule = (locId: string, sched: AddedSchedule) => {
    setEditingSchedKey({ locId, schedId: sched.scheduleId });
    setSchedEditForm({
      dayOfWeek: sched.dayOfWeek,
      type: sched.type,
      startTime: parseDisplayTime(sched.startTime),
      endTime: parseDisplayTime(sched.endTime),
    });
    // Close add form for this location if open
    setAddingSchedLocId(null);
    setSchedAddForm(null);
  };

  const startAddSchedule = (locId: string) => {
    setAddingSchedLocId(locId);
    setSchedAddForm(emptySchedForm());
    // Close any open schedule edit
    setEditingSchedKey(null);
    setSchedEditForm(null);
  };

  const cancelAddSchedule = () => {
    setAddingSchedLocId(null);
    setSchedAddForm(null);
  };

  const handleAddSchedule = async (programLocationId: string) => {
    if (!schedAddForm || !schedAddForm.startTime || !schedAddForm.endTime) return;
    setSchedAddSubmitting(true);
    try {
      const duration = schedAddForm.endTime.diff(schedAddForm.startTime, 'minute');
      const created = await createProgramSchedule({
        programLocationId,
        dayOfWeek: schedAddForm.dayOfWeek as DayOfWeek,
        type: schedAddForm.type as SessionType,
        duration,
        startTime: formatTime(schedAddForm.startTime),
        endTime: formatTime(schedAddForm.endTime),
      });
      setAddedLocations((prev) =>
        prev.map((l) =>
          l.programLocationId === programLocationId
            ? {
                ...l,
                schedules: [
                  ...l.schedules,
                  {
                    scheduleId: created.id,
                    dayOfWeek: created.dayOfWeek,
                    startTime: displayTime(created.startTime),
                    endTime: created.endTime ? displayTime(created.endTime) : undefined,
                    duration: created.duration,
                    type: created.type,
                  },
                ],
              }
            : l
        )
      );
      setAddingSchedLocId(null);
      setSchedAddForm(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to add schedule.');
    } finally {
      setSchedAddSubmitting(false);
    }
  };

  const cancelEditSchedule = () => {
    setEditingSchedKey(null);
    setSchedEditForm(null);
  };

  const handleUpdateSchedule = async (locId: string, schedId: string) => {
    if (!schedEditForm || !schedEditForm.startTime || !schedEditForm.endTime) return;
    setSchedEditSubmitting(true);
    try {
      const duration = schedEditForm.endTime.diff(schedEditForm.startTime, 'minute');
      const updated = await updateProgramSchedule(schedId, {
        dayOfWeek: schedEditForm.dayOfWeek as DayOfWeek,
        type: schedEditForm.type as SessionType,
        duration,
        startTime: formatTime(schedEditForm.startTime),
        endTime: formatTime(schedEditForm.endTime),
      });
      setAddedLocations((prev) =>
        prev.map((l) =>
          l.programLocationId === locId
            ? {
                ...l,
                schedules: l.schedules.map((s) =>
                  s.scheduleId === schedId
                    ? {
                        ...s,
                        dayOfWeek: schedEditForm.dayOfWeek as DayOfWeek,
                        type: schedEditForm.type as SessionType,
                        duration: Number(schedEditForm.duration),
                        startTime: displayTime(updated.startTime),
                        endTime: updated.endTime ? displayTime(updated.endTime) : undefined,
                      }
                    : s
                ),
              }
            : l
        )
      );
      setEditingSchedKey(null);
      setSchedEditForm(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to update schedule.');
    } finally {
      setSchedEditSubmitting(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderLocationCard = (loc: AddedLocation) => {
    const isEditingLoc = editingLocId === loc.programLocationId;

    return (
      <Paper key={loc.programLocationId} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: '0.75rem' }}>
        {/* Location header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <MapPin size={15} />
              <Typography variant="body2" fontWeight={700}>{loc.locationName}</Typography>
            </Box>
            {!isEditingLoc && (
              <Typography variant="caption" color="text.secondary">
                ${loc.price} · Cap: {loc.capacity}
                {loc.instructorName ? ` · ${loc.instructorName}` : ''}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!isEditingLoc && (
              <IconButton size="small" onClick={() => startEditLocation(loc)} sx={{ color: 'primary.main' }}>
                <Pencil size={15} />
              </IconButton>
            )}
            <IconButton size="small" color="error" onClick={() => handleDeleteLocation(loc.programLocationId)}>
              <Trash2 size={15} />
            </IconButton>
          </Box>
        </Box>

        {/* Location inline edit form */}
        {isEditingLoc && locEditForm && (
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label="Price"
                type="number"
                value={locEditForm.price}
                onChange={(e) => setLocEditForm((f) => f && ({ ...f, price: e.target.value }))}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Capacity"
                type="number"
                value={locEditForm.capacity}
                onChange={(e) => setLocEditForm((f) => f && ({ ...f, capacity: e.target.value }))}
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Box>

            <TextField
              select
              label="Instructor"
              value={locEditForm.instructorId}
              onChange={(e) => setLocEditForm((f) => f && ({ ...f, instructorId: e.target.value }))}
              size="small"
              fullWidth
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
                value={locEditForm.backupInstructorIds}
                onChange={(e) =>
                  setLocEditForm((f) => f && ({ ...f, backupInstructorIds: e.target.value as string[] }))
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
                  .filter((i) => i.id !== locEditForm.instructorId)
                  .map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      <Checkbox checked={locEditForm.backupInstructorIds.includes(i.id)} size="small" />
                      <ListItemText primary={`${i.name} ${i.surname}`} />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" color="inherit" onClick={cancelEditLocation} disabled={locEditSubmitting}>
                <X size={14} />
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleUpdateLocation(loc.programLocationId)}
                disabled={locEditSubmitting}
                startIcon={locEditSubmitting ? <CircularProgress size={12} /> : <Check size={14} />}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}

        {/* Schedules — always rendered */}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>SCHEDULES</Typography>
          {addingSchedLocId !== loc.programLocationId && (
            <Button
              size="small"
              startIcon={<Plus size={12} />}
              onClick={() => startAddSchedule(loc.programLocationId)}
              sx={{ fontSize: '0.7rem', py: 0, px: 0.75 }}
            >
              Add
            </Button>
          )}
        </Box>

        {loc.schedules.length === 0 && addingSchedLocId !== loc.programLocationId && (
          <Typography variant="caption" color="text.disabled">No schedules.</Typography>
        )}

        {loc.schedules.map((s) => {
          const isEditingSched = editingSchedKey?.locId === loc.programLocationId && editingSchedKey.schedId === s.scheduleId;
          return (
            <Box key={s.scheduleId}>
              {!isEditingSched ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption">
                    {s.dayOfWeek} · {s.startTime}{s.endTime ? `–${s.endTime}` : ''} · {s.duration}min · {s.type}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <IconButton size="small" sx={{ p: 0.25, color: 'primary.main' }} onClick={() => startEditSchedule(loc.programLocationId, s)}>
                      <Pencil size={12} />
                    </IconButton>
                    <IconButton size="small" color="error" sx={{ p: 0.25 }} onClick={() => handleDeleteSchedule(loc.programLocationId, s.scheduleId)}>
                      <Trash2 size={12} />
                    </IconButton>
                  </Box>
                </Box>
              ) : schedEditForm && (
                <SchedForm
                  form={schedEditForm}
                  setForm={setSchedEditForm}
                  submitting={schedEditSubmitting}
                  onSave={() => handleUpdateSchedule(loc.programLocationId, s.scheduleId)}
                  onCancel={cancelEditSchedule}
                />
              )}
            </Box>
          );
        })}

        {/* Add schedule inline form */}
        {addingSchedLocId === loc.programLocationId && schedAddForm && (
          <SchedForm
            form={schedAddForm}
            setForm={setSchedAddForm}
            submitting={schedAddSubmitting}
            onSave={() => handleAddSchedule(loc.programLocationId)}
            onCancel={cancelAddSchedule}
          />
        )}
      </Paper>
    );
  };

  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="Program Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
        fullWidth
        size="small"
      />

      <TextField
        select
        label="Class"
        value={form.classId}
        onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
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
            value={form.startDate}
            onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
            minDate={dayjs().subtract(1, 'year')}
            maxDate={dayjs().add(2, 'year')}
            slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
          />
          <DatePicker
            label="End Date"
            value={form.endDate}
            onChange={(v) => setForm((f) => ({ ...f, endDate: v }))}
            minDate={form.startDate ? form.startDate.add(1, 'day') : dayjs().subtract(1, 'year')}
            maxDate={dayjs().add(2, 'year')}
            slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
          />
        </Box>
      </LocalizationProvider>

      <TextField
        select
        label="Gender"
        value={form.gender}
        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
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
          value={form.minAge}
          onChange={(e) => setForm((f) => ({ ...f, minAge: e.target.value }))}
          required
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
          error={form.minAge !== '' && form.maxAge !== '' && Number(form.minAge) > Number(form.maxAge)}
        />
        <TextField
          label="Max Age"
          type="number"
          value={form.maxAge}
          onChange={(e) => setForm((f) => ({ ...f, maxAge: e.target.value }))}
          required
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
          error={form.minAge !== '' && form.maxAge !== '' && Number(form.minAge) > Number(form.maxAge)}
          helperText={form.minAge !== '' && form.maxAge !== '' && Number(form.minAge) > Number(form.maxAge) ? 'Max age must be ≥ min age.' : undefined}
        />
      </Box>

      <TextField
        label="Level (optional)"
        value={form.level}
        onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
        fullWidth
        size="small"
        placeholder="e.g. Beginner"
      />

      <Box>
        <TextField
          label="Required Equipment"
          placeholder="Type and press Enter"
          value={form.equipmentInput}
          onChange={(e) => setForm((f) => ({ ...f, equipmentInput: e.target.value }))}
          onKeyDown={handleEquipmentKeyDown}
          fullWidth
          size="small"
          helperText="Press Enter or comma to add"
        />
        {form.requiredEquipment.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {form.requiredEquipment.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() =>
                  setForm((f) => ({ ...f, requiredEquipment: f.requiredEquipment.filter((e) => e !== item) }))
                }
              />
            ))}
          </Box>
        )}
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            size="small"
          />
        }
        label={<Typography variant="body2">Active</Typography>}
      />
    </Box>
  );

  const renderStagesStep = () => (
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

  const renderLocationsStep = () => (
    <Box sx={{ pt: 1 }}>
      {addedLocations.length === 0 && !showLocationForm && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No locations configured.
        </Typography>
      )}

      {addedLocations.map((loc) => renderLocationCard(loc))}

      {showLocationForm ? (
        <AddLocationForm
          programId={program!.id}
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
          disabled={editingLocId !== null || editingSchedKey !== null}
        >
          Add Location
        </Button>
      )}
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Program</DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {fetchLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!fetchLoading && step === 0 && renderStep1()}
        {!fetchLoading && step === 1 && renderStagesStep()}
        {!fetchLoading && step === 2 && renderLocationsStep()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {step === 1 && (
          <Button onClick={() => { setError(null); setStep(0); }} disabled={submitting}>
            Back
          </Button>
        )}
        {step === 2 && (
          <Button onClick={() => { setError(null); setStep(1); }} disabled={submitting}>
            Back
          </Button>
        )}
        {step === 0 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting || fetchLoading}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
            sx={{ borderRadius: '1rem', textTransform: 'none' }}
          >
            {submitting ? 'Saving...' : 'Next'}
          </Button>
        )}
        {step === 1 && (
          <Button
            variant="contained"
            onClick={() => { setError(null); setStep(2); }}
            disabled={stageSubmitting}
            sx={{ borderRadius: '1rem', textTransform: 'none' }}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            variant="contained"
            onClick={onSaved}
            disabled={showLocationForm || editingLocId !== null || editingSchedKey !== null}
            sx={{ borderRadius: '1rem', textTransform: 'none' }}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDialog;
