import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Autocomplete, TextField, Alert, Stack, Box, Typography,
  RadioGroup, FormControlLabel, Radio, MenuItem, Chip, Divider,
} from '@mui/material';
import { enrollStudent } from '../../api/studentPrograms.api';
import { getAllStudents } from '../../api/students.api';
import { getAllPrograms } from '../../api/programs.api';
import { getAllProgramLocations } from '../../api/programLocations.api';
import { getDiscountOverrides } from '../../api/discountOverrides.api';
import type { Student, Program, ProgramLocation, PriceOption, DiscountOverride } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onEnrolled: () => void;
}

function computeFinalPrice(priceOption: PriceOption | null, override: DiscountOverride | null): number | null {
  if (!priceOption) return null;
  const base = priceOption.amount;
  if (!override || !override.isEnabled) return base;
  const val = override.valueOverride ?? override.discount?.value ?? 0;
  const type = override.typeOverride ?? override.discount?.type ?? 'FLAT';
  if (type === 'PERCENTAGE') return base * (1 - val / 100);
  return Math.max(0, base - val);
}

const EnrollDialog: React.FC<Props> = ({ open, onClose, onEnrolled }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [locations, setLocations] = useState<ProgramLocation[]>([]);
  const [discountOverrides, setDiscountOverrides] = useState<DiscountOverride[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ProgramLocation | null>(null);
  const [selectedPriceOptionId, setSelectedPriceOptionId] = useState<string>('');
  const [selectedDiscountOverrideId, setSelectedDiscountOverrideId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getAllStudents(1, 200).then((r) => setStudents(r.data));
    getAllPrograms().then(setPrograms);
  }, [open]);

  useEffect(() => {
    setSelectedLocation(null);
    setLocations([]);
    setSelectedPriceOptionId('');
    setSelectedDiscountOverrideId('');
    if (!selectedProgram) return;
    getAllProgramLocations(selectedProgram.id).then(setLocations);
  }, [selectedProgram]);

  useEffect(() => {
    setSelectedPriceOptionId('');
    setSelectedDiscountOverrideId('');
    setDiscountOverrides([]);
    if (!selectedLocation) return;
    const defaultOpt = selectedLocation.priceOptions?.find((p) => p.isDefault);
    if (defaultOpt) setSelectedPriceOptionId(defaultOpt.id);
    getDiscountOverrides(selectedLocation.id).then(setDiscountOverrides);
  }, [selectedLocation]);

  const handleClose = () => {
    setSelectedStudent(null);
    setSelectedProgram(null);
    setSelectedLocation(null);
    setSelectedPriceOptionId('');
    setSelectedDiscountOverrideId('');
    setDiscountOverrides([]);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedLocation) return;
    setLoading(true);
    setError(null);
    try {
      const override = discountOverrides.find((o) => o.id === selectedDiscountOverrideId);
      await enrollStudent({
        studentId: selectedStudent.id!,
        programLocationId: selectedLocation.id,
        priceOptionId: selectedPriceOptionId || undefined,
        discountId: override?.discountId || undefined,
      });
      onEnrolled();
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Enrollment failed.'));
    } finally {
      setLoading(false);
    }
  };

  const priceOptions = selectedLocation?.priceOptions ?? [];
  const enabledOverrides = discountOverrides.filter((o) => o.isEnabled);
  const selectedPriceOption = priceOptions.find((p) => p.id === selectedPriceOptionId) ?? null;
  const selectedOverride = enabledOverrides.find((o) => o.id === selectedDiscountOverrideId) ?? null;
  const finalPrice = computeFinalPrice(selectedPriceOption, selectedOverride);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enroll Student</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={students}
            getOptionLabel={(s) => `${s.name} ${s.surname}`}
            value={selectedStudent}
            onChange={(_e, val) => setSelectedStudent(val)}
            renderInput={(params) => <TextField {...params} label="Student" required />}
          />

          <Autocomplete
            options={programs}
            getOptionLabel={(p) => p.name}
            value={selectedProgram}
            onChange={(_e, val) => setSelectedProgram(val)}
            renderInput={(params) => <TextField {...params} label="Program" required />}
          />

          <Autocomplete
            options={locations}
            getOptionLabel={(loc) => loc.location?.name ?? loc.id}
            value={selectedLocation}
            onChange={(_e, val) => setSelectedLocation(val)}
            disabled={!selectedProgram}
            renderInput={(params) => (
              <TextField {...params} label="Location" required helperText={!selectedProgram ? 'Select a program first' : ''} />
            )}
          />

          {selectedLocation && priceOptions.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: '0.5rem' }}>Price Option</Typography>
                <RadioGroup
                  value={selectedPriceOptionId}
                  onChange={(e) => setSelectedPriceOptionId(e.target.value)}
                >
                  <FormControlLabel value="" control={<Radio size="small" />} label={<Typography variant="body2">No pricing</Typography>} />
                  {priceOptions.map((opt) => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.id}
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Typography variant="body2">{opt.name}</Typography>
                          <Chip label={`$${opt.amount}${opt.kind === 'MONTHLY' && opt.sessionsCovered ? `/${opt.sessionsCovered}sess` : ''}`} size="small" variant="outlined" />
                          {opt.isDefault && <Chip label="default" size="small" color="primary" variant="outlined" />}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </Box>
            </>
          )}

          {selectedPriceOptionId && enabledOverrides.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: '0.5rem' }}>Discount</Typography>
              <TextField
                select
                fullWidth
                value={selectedDiscountOverrideId}
                onChange={(e) => setSelectedDiscountOverrideId(e.target.value)}
                label="Apply discount (optional)"
                size="small"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {enabledOverrides.map((o) => {
                  const val = o.valueOverride ?? o.discount?.value ?? 0;
                  const type = o.typeOverride ?? o.discount?.type ?? 'FLAT';
                  const name = o.discount?.name ?? o.discountId;
                  return (
                    <MenuItem key={o.id} value={o.id}>
                      {name} — {type === 'PERCENTAGE' ? `${val}%` : `$${val}`}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>
          )}

          {finalPrice !== null && (
            <Box sx={{ p: '0.75rem', bgcolor: 'action.selected', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Final Price: <strong>${finalPrice.toFixed(2)}</strong>
                {selectedOverride && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>(discount applied)</Typography>}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Note: actual total is prorated by remaining sessions at enrollment time.
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedStudent || !selectedLocation}
        >
          Enroll
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollDialog;
