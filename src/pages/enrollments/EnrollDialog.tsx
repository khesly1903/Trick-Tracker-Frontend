import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import { enrollStudent } from '../../api/studentPrograms.api';
import { getAllStudents } from '../../api/students.api';
import { getAllPrograms } from '../../api/programs.api';
import { getAllProgramLocations } from '../../api/programLocations.api';
import type { Student, Program, ProgramLocation } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onEnrolled: () => void;
}

const EnrollDialog: React.FC<Props> = ({ open, onClose, onEnrolled }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [locations, setLocations] = useState<ProgramLocation[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ProgramLocation | null>(null);

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
    if (!selectedProgram) return;
    getAllProgramLocations(selectedProgram.id).then(setLocations);
  }, [selectedProgram]);

  const handleClose = () => {
    setSelectedStudent(null);
    setSelectedProgram(null);
    setSelectedLocation(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedLocation) return;
    setLoading(true);
    setError(null);
    try {
      await enrollStudent({ studentId: selectedStudent.id, programLocationId: selectedLocation.id });
      onEnrolled();
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Enrollment failed.'));
    } finally {
      setLoading(false);
    }
  };

  const locationLabel = (loc: ProgramLocation) =>
    loc.location ? `${loc.location.name} — capacity ${loc.capacity}` : loc.id;

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
            getOptionLabel={locationLabel}
            value={selectedLocation}
            onChange={(_e, val) => setSelectedLocation(val)}
            disabled={!selectedProgram}
            renderInput={(params) => (
              <TextField {...params} label="Location" required helperText={!selectedProgram ? 'Select a program first' : ''} />
            )}
          />
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
