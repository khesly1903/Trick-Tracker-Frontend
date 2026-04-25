import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Typography,
  Autocomplete,
  CircularProgress,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Trash2, Plus, X } from "lucide-react";
import { MuiTelInput } from "mui-tel-input";
import {
  createStudentWithContacts,
  updateStudent,
  softDeleteStudent,
} from "../../api/students.api";
import { filterContacts } from "../../api/contacts.api";

const STEPS = ["Student Info", "Contact & Guardian"];

const emptyContact = () => ({
  email: "",
  name: "",
  surname: "",
  phoneNumber: "",
  whatsappPhoneNumber: "",
  secondaryPhoneNumber: "",
  type: ["PARENT"],
  relation: "PARENT",
});

// ── Inline new-contact sub-form ──
const ContactSubForm = ({ contact, index, onChange, onRemove }) => {
  const toggleType = (t, checked) => {
    const next = checked
      ? [...contact.type, t]
      : contact.type.filter((x) => x !== t);
    onChange(index, { type: next.length ? next : ["PARENT"] });
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          New Contact {index + 1}
        </Typography>
        <IconButton size="small" onClick={() => onRemove(index)}>
          <X size={16} />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Name"
            required
            value={contact.name}
            onChange={(e) => onChange(index, { name: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Surname"
            required
            value={contact.surname}
            onChange={(e) => onChange(index, { surname: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            value={contact.email}
            onChange={(e) => onChange(index, { email: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="Primary Phone"
            required
            value={contact.phoneNumber}
            onChange={(v) => onChange(index, { phoneNumber: v })}
            defaultCountry="EG"
            fullWidth
          />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="WhatsApp Phone"
            required
            value={contact.whatsappPhoneNumber}
            onChange={(v) => onChange(index, { whatsappPhoneNumber: v })}
            defaultCountry="EG"
            fullWidth
          />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="Secondary Phone"
            value={contact.secondaryPhoneNumber}
            onChange={(v) => onChange(index, { secondaryPhoneNumber: v })}
            defaultCountry="EG"
            fullWidth
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Contact Type
        </Typography>
        <FormGroup row>
          {["PARENT", "GUARDIAN", "EMERGENCY"].map((t) => (
            <FormControlLabel
              key={t}
              control={
                <Checkbox
                  size="small"
                  checked={contact.type.includes(t)}
                  onChange={(e) => toggleType(t, e.target.checked)}
                />
              }
              label={
                <Box component="span" sx={{ fontSize: "0.85rem" }}>
                  {t}
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <TextField
        select
        label="Relation to Student"
        value={contact.relation}
        onChange={(e) => onChange(index, { relation: e.target.value })}
        fullWidth
        sx={{ mt: 1.5 }}
        size="small"
      >
        <MenuItem value="PARENT">Parent</MenuItem>
        <MenuItem value="GUARDIAN">Guardian</MenuItem>
        <MenuItem value="EMERGENCY">Emergency</MenuItem>
      </TextField>
    </Box>
  );
};

// ── Main Dialog ──
const StudentDialog = ({
  open,
  onClose,
  onStudentSaved,
  onStudentDeleted,
  student = null,
}) => {
  const isEditMode = !!student;

  // ── Create wizard state ──
  const [step, setStep] = useState(1);

  // Step 1
  const [s1Name, setS1Name] = useState("");
  const [s1Surname, setS1Surname] = useState("");
  const [s1Type, setS1Type] = useState("CHILD");
  const [s1Dob, setS1Dob] = useState(null);
  const [s1School, setS1School] = useState("");
  const [s1Injuries, setS1Injuries] = useState([]);
  const [s1Email, setS1Email] = useState("");
  const [s1Errors, setS1Errors] = useState({});

  // Step 2 — phones
  const [s2PhoneNumber, setS2PhoneNumber] = useState("");
  const [s2SecondaryPhone, setS2SecondaryPhone] = useState("");
  const [s2WhatsappPhone, setS2WhatsappPhone] = useState("");
  const [s2WhatsappType, setS2WhatsappType] = useState("");

  // Step 2 — existing contact search
  const [s2ContactSearchQuery, setS2ContactSearchQuery] = useState("");
  const [s2ContactSearchResults, setS2ContactSearchResults] = useState([]);
  const [s2SearchingContacts, setS2SearchingContacts] = useState(false);
  const [s2SelectedContacts, setS2SelectedContacts] = useState([]);

  // Step 2 — new inline contacts
  const [newContacts, setNewContacts] = useState([]);

  // ── Edit mode state ──
  const [editData, setEditData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    whatsappPhoneNumber: "",
    roles: ["STUDENT"],
    type: "CHILD",
    dob: null,
    school: "",
    injuries: "",
  });
  const [editSelectedContacts, setEditSelectedContacts] = useState([]);
  const [editContactSearchQuery, setEditContactSearchQuery] = useState("");
  const [editContactSearchResults, setEditContactSearchResults] = useState([]);
  const [editSearchingContacts, setEditSearchingContacts] = useState(false);
  const [editWhatsappType, setEditWhatsappType] = useState("");

  // ── Shared ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setError(null);
    setStep(1);
    setS1Errors({});

    if (student) {
      setEditData({
        name: student.name || "",
        surname: student.surname || "",
        email: student.email || "",
        phoneNumber: student.phoneNumber || "",
        secondaryPhoneNumber: student.secondaryPhoneNumber || "",
        whatsappPhoneNumber: student.whatsappPhoneNumber || "",
        roles: student.roles || ["STUDENT"],
        type: student.type || "CHILD",
        dob: student.dob ? dayjs(student.dob) : null,
        school: student.school || "",
        injuries: Array.isArray(student.injuries)
          ? student.injuries.join("\n")
          : "",
      });
      setEditSelectedContacts(student.contacts || []);
      setEditWhatsappType("");
      setEditContactSearchQuery("");
      setEditContactSearchResults([]);
    } else {
      setS1Name("");
      setS1Surname("");
      setS1Type("CHILD");
      setS1Dob(null);
      setS1School("");
      setS1Injuries([]);
      setS1Email("");
      setS2PhoneNumber("");
      setS2SecondaryPhone("");
      setS2WhatsappPhone("");
      setS2WhatsappType("");
      setS2ContactSearchQuery("");
      setS2ContactSearchResults([]);
      setS2SelectedContacts([]);
      setNewContacts([]);
    }
  }, [open, student]);

  // Contact search debounce — create mode step 2
  useEffect(() => {
    if (isEditMode) return;
    if (s2ContactSearchQuery.trim().length < 2) {
      setS2ContactSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setS2SearchingContacts(true);
      try {
        const res = await filterContacts(s2ContactSearchQuery.trim());
        setS2ContactSearchResults(res || []);
      } catch {
        /* ignore */
      } finally {
        setS2SearchingContacts(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [s2ContactSearchQuery, isEditMode]);

  // Contact search debounce — edit mode
  useEffect(() => {
    if (!isEditMode) return;
    if (editContactSearchQuery.trim().length < 2) {
      setEditContactSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setEditSearchingContacts(true);
      try {
        const res = await filterContacts(editContactSearchQuery.trim());
        setEditContactSearchResults(res || []);
      } catch {
        /* ignore */
      } finally {
        setEditSearchingContacts(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [editContactSearchQuery, isEditMode]);

  // ── Handlers ──

  const validateStep1 = () => {
    const errs = {};
    if (!s1Name.trim()) errs.name = "Required";
    if (!s1Surname.trim()) errs.surname = "Required";
    if (!s1Type) errs.type = "Required";
    if (!s1Dob) errs.dob = "Required";
    if (!s1Email.trim()) errs.email = "Required";
    setS1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2);
  };

  const handleS2WhatsappType = (wType) => {
    if (s2WhatsappType === wType) {
      setS2WhatsappType("");
    } else {
      setS2WhatsappType(wType);
      setS2WhatsappPhone(
        wType === "primary" ? s2PhoneNumber : s2SecondaryPhone,
      );
    }
  };

  const handleS2PhoneChange = (field, value) => {
    if (field === "phoneNumber") {
      setS2PhoneNumber(value);
      if (s2WhatsappType === "primary") setS2WhatsappPhone(value);
    } else if (field === "secondaryPhoneNumber") {
      setS2SecondaryPhone(value);
      if (s2WhatsappType === "secondary") setS2WhatsappPhone(value);
    } else {
      setS2WhatsappPhone(value);
      setS2WhatsappType("");
    }
  };

  const handleContactChange = useCallback((index, patch) => {
    setNewContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }, []);

  const handleContactRemove = useCallback((index) => {
    setNewContacts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: s1Name.trim(),
        surname: s1Surname.trim(),
        type: s1Type,
        dob: s1Dob ? s1Dob.format("YYYY-MM-DD") : "",
        email: s1Email.trim(),
        school: s1School.trim() || undefined,
        injuries: s1Injuries.length ? s1Injuries : undefined,
        phoneNumber: s2PhoneNumber || undefined,
        secondaryPhoneNumber: s2SecondaryPhone || undefined,
        whatsappPhoneNumber: s2WhatsappPhone || undefined,
        contactIds: s2SelectedContacts.map((c) => c.id),
        newContacts: newContacts.map((c) => ({
          email: c.email || undefined,
          name: c.name || undefined,
          surname: c.surname || undefined,
          phoneNumber: c.phoneNumber || undefined,
          whatsappPhoneNumber: c.whatsappPhoneNumber || undefined,
          secondaryPhoneNumber: c.secondaryPhoneNumber || undefined,
          type: c.type,
          relation: c.relation,
        })),
      };

      const result = await createStudentWithContacts(payload);
      onStudentSaved(result);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  // ── Edit handlers ──

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "phoneNumber" && editWhatsappType === "primary")
        next.whatsappPhoneNumber = value;
      if (name === "secondaryPhoneNumber" && editWhatsappType === "secondary")
        next.whatsappPhoneNumber = value;
      if (name === "whatsappPhoneNumber") setEditWhatsappType("");
      return next;
    });
  };

  const handleEditPhoneChange = (name, value) => {
    setEditData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "phoneNumber" && editWhatsappType === "primary")
        next.whatsappPhoneNumber = value;
      if (name === "secondaryPhoneNumber" && editWhatsappType === "secondary")
        next.whatsappPhoneNumber = value;
      if (name === "whatsappPhoneNumber") setEditWhatsappType("");
      return next;
    });
  };

  const handleEditWhatsappType = (wType) => {
    if (editWhatsappType === wType) {
      setEditWhatsappType("");
    } else {
      setEditWhatsappType(wType);
      setEditData((prev) => ({
        ...prev,
        whatsappPhoneNumber:
          wType === "primary" ? prev.phoneNumber : prev.secondaryPhoneNumber,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dataToSubmit = {
        ...editData,
        dob: editData.dob ? editData.dob.format("YYYY-MM-DD") : null,
        injuries: editData.injuries
          ? editData.injuries.split("\n").filter((i) => i.trim() !== "")
          : [],
        contactIds: editSelectedContacts.map((c) => c.id),
      };
      const result = await updateStudent(student.id, dataToSubmit);
      onStudentSaved(result);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Failed to update student.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setLoading(true);
    try {
      await softDeleteStudent(student.id);
      onStudentDeleted(student.id);
      onClose();
    } catch (err) {
      setError("Failed to delete student.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ──

  const renderStep1 = () => (
    <Grid container spacing={2.5}>
      <Grid item size={{ xs: 12, sm: 6 }}>
        <TextField
          label="First Name"
          required
          fullWidth
          value={s1Name}
          onChange={(e) => setS1Name(e.target.value)}
          error={!!s1Errors.name}
          helperText={s1Errors.name}
        />
      </Grid>
      <Grid item size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Last Name"
          required
          fullWidth
          value={s1Surname}
          onChange={(e) => setS1Surname(e.target.value)}
          error={!!s1Errors.surname}
          helperText={s1Errors.surname}
        />
      </Grid>
      <Grid item size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          label="Student Type"
          required
          fullWidth
          value={s1Type}
          onChange={(e) => setS1Type(e.target.value)}
          error={!!s1Errors.type}
          helperText={s1Errors.type}
        >
          <MenuItem value="CHILD">Child</MenuItem>
          <MenuItem value="ADULT">Adult</MenuItem>
        </TextField>
      </Grid>
      <Grid item size={{ xs: 12, sm: 6 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth"
            value={s1Dob}
            onChange={setS1Dob}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!s1Errors.dob,
                helperText: s1Errors.dob,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item size={{ xs: 12 }}>
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          value={s1Email}
          onChange={(e) => setS1Email(e.target.value)}
          error={!!s1Errors.email}
          helperText={s1Errors.email}
          slotProps={{ htmlInput: { autoComplete: "off" } }}
        />
      </Grid>
      <Grid item size={{ xs: 12 }}>
        <TextField
          label="School"
          fullWidth
          value={s1School}
          onChange={(e) => setS1School(e.target.value)}
        />
      </Grid>
      <Grid item size={{ xs: 12 }}>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={s1Injuries}
          onChange={(_, val) => setS1Injuries(val)}
          renderTags={(value, getTagProps) =>
            value.map((opt, i) => (
              <Chip label={opt} size="small" {...getTagProps({ index: i })} key={i} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Injuries"
              placeholder="Type and press Enter"
              helperText="Press Enter after each injury to add it as a tag"
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
        Phone Numbers
      </Typography>
      {s1Type === "CHILD" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          For child students, phone fields are optional — use the contact section below for parent communication.
        </Alert>
      )}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="Primary Phone Number"
            fullWidth
            defaultCountry="EG"
            value={s2PhoneNumber}
            onChange={(v) => handleS2PhoneChange("phoneNumber", v)}
          />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="Secondary Phone Number"
            fullWidth
            defaultCountry="EG"
            value={s2SecondaryPhone}
            onChange={(v) => handleS2PhoneChange("secondaryPhoneNumber", v)}
          />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <MuiTelInput
            label="WhatsApp Phone Number"
            fullWidth
            defaultCountry="EG"
            value={s2WhatsappPhone}
            onChange={(v) => handleS2PhoneChange("whatsappPhoneNumber", v)}
          />
          <FormGroup row sx={{ mt: 0.5, ml: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={s2WhatsappType === "primary"}
                  onChange={() => handleS2WhatsappType("primary")}
                />
              }
              label={
                <Box component="span" sx={{ fontSize: "0.85rem" }}>
                  Same as Primary
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={s2WhatsappType === "secondary"}
                  onChange={() => handleS2WhatsappType("secondary")}
                />
              }
              label={
                <Box component="span" sx={{ fontSize: "0.85rem" }}>
                  Same as Secondary
                </Box>
              }
            />
          </FormGroup>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2.5 }} />

      <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
        Parent / Guardian Contacts
      </Typography>

      {/* Search existing contacts */}
      <Autocomplete
        multiple
        options={s2ContactSearchResults}
        getOptionLabel={(opt) =>
          typeof opt === "string" ? opt : `${opt.name || ""} ${opt.surname || ""}`.trim()
        }
        filterOptions={(x) => x}
        loading={s2SearchingContacts}
        value={s2SelectedContacts}
        onInputChange={(_, v) => setS2ContactSearchQuery(v)}
        onChange={(_, v) => setS2SelectedContacts(v)}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search existing contacts"
            placeholder="Type name to search..."
            fullWidth
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {s2SearchingContacts ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              },
            }}
          />
        )}
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 2 }} />

      {/* New inline contacts */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            Add a new contact
          </Typography>
          <Typography variant="caption" color="text.secondary">
            If the contact is not in the system yet, fill in their details below.
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => setNewContacts((prev) => [...prev, emptyContact()])}
          variant="outlined"
          sx={{ flexShrink: 0, ml: 2 }}
        >
          Add Contact
        </Button>
      </Box>

      {newContacts.length > 0 && <Box sx={{ mt: 2 }}>
        {newContacts.map((c, i) => (
          <ContactSubForm
            key={i}
            contact={c}
            index={i}
            onChange={handleContactChange}
            onRemove={handleContactRemove}
          />
        ))}
      </Box>}
    </Box>
  );

  const renderEditForm = () => (
    <Box component="form" onSubmit={handleEditSubmit} autoComplete="off">
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12 }}>
              <TextField
                name="name"
                label="First Name"
                fullWidth
                required
                value={editData.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                name="surname"
                label="Last Name"
                fullWidth
                required
                value={editData.surname}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={editData.email}
                onChange={handleEditChange}
                slotProps={{ htmlInput: { autoComplete: "off" } }}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                select
                name="type"
                label="Student Type"
                fullWidth
                required
                value={editData.type}
                onChange={handleEditChange}
              >
                <MenuItem value="CHILD">Child</MenuItem>
                <MenuItem value="ADULT">Adult</MenuItem>
              </TextField>
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth"
                  value={editData.dob}
                  onChange={(v) => setEditData((p) => ({ ...p, dob: v }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                name="school"
                label="School"
                fullWidth
                value={editData.school}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                name="injuries"
                label="Injuries (one per line)"
                fullWidth
                multiline
                rows={4}
                value={editData.injuries}
                onChange={handleEditChange}
                placeholder="e.g. Broken left arm"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
            Contact Information
          </Typography>
          {editData.type === "CHILD" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              For child students, phone fields should be left blank. Assign a parent contact instead.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12 }}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                Assign Parent / Guardian
              </Typography>
              <Autocomplete
                multiple
                options={editContactSearchResults}
                getOptionLabel={(opt) =>
                  typeof opt === "string"
                    ? opt
                    : `${opt.name || ""} ${opt.surname || ""}`.trim()
                }
                filterOptions={(x) => x}
                loading={editSearchingContacts}
                value={editSelectedContacts}
                onInputChange={(_, v) => setEditContactSearchQuery(v)}
                onChange={(_, v) => setEditSelectedContacts(v)}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Contact"
                    placeholder="Type name to search..."
                    fullWidth
                    variant="standard"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {editSearchingContacts ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <MuiTelInput
                label="Primary Phone Number"
                fullWidth
                defaultCountry="EG"
                value={editData.phoneNumber}
                onChange={(v) => handleEditPhoneChange("phoneNumber", v)}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <MuiTelInput
                label="Secondary Phone Number"
                fullWidth
                defaultCountry="EG"
                value={editData.secondaryPhoneNumber}
                onChange={(v) => handleEditPhoneChange("secondaryPhoneNumber", v)}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <MuiTelInput
                label="WhatsApp Phone Number"
                fullWidth
                defaultCountry="EG"
                value={editData.whatsappPhoneNumber}
                onChange={(v) => handleEditPhoneChange("whatsappPhoneNumber", v)}
              />
              <FormGroup row sx={{ mt: 0.5, ml: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={editWhatsappType === "primary"}
                      onChange={() => handleEditWhatsappType("primary")}
                    />
                  }
                  label={
                    <Box component="span" sx={{ fontSize: "0.85rem" }}>
                      Same as Primary
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={editWhatsappType === "secondary"}
                      onChange={() => handleEditWhatsappType("secondary")}
                    />
                  }
                  label={
                    <Box component="span" sx={{ fontSize: "0.85rem" }}>
                      Same as Secondary
                    </Box>
                  }
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight="bold">
        {isEditMode ? "Student Details" : "Add New Student"}
      </DialogTitle>

      <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto" }} dividers>
        <Box sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isEditMode ? (
            renderEditForm()
          ) : (
            <>
              <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {step === 1 ? renderStep1() : renderStep2()}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2.5, justifyContent: isEditMode ? "space-between" : "flex-end" }}
      >
        {isEditMode ? (
          <>
            <Button
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
            <Box>
              <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button variant="contained" disabled={loading} onClick={handleEditSubmit}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {step === 2 && (
              <Button onClick={() => setStep(1)} disabled={loading}>
                ← Back
              </Button>
            )}
            {step === 1 ? (
              <Button variant="contained" onClick={handleStep1Next}>
                Next →
              </Button>
            ) : (
              <Button variant="contained" onClick={handleCreateSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentDialog;
