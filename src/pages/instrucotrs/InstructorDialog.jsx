import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { MuiTelInput } from "mui-tel-input";
import {
  createInstructor,
  updateInstructor,
  softDeleteInstructor,
} from "../../api/instructors.api";

const InstructorDialog = ({
  open,
  onClose,
  onInstructorSaved,
  onInstructorDeleted,
  instructor = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    whatsappPhoneNumber: "",
    roles: ["INSTRUCTOR"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [whatsappType, setWhatsappType] = useState("");

  const isEditMode = !!instructor;

  useEffect(() => {
    if (instructor) {
      setFormData({
        name: instructor.name || "",
        surname: instructor.surname || "",
        email: instructor.email || "",
        password: "",
        phoneNumber: instructor.phoneNumber || "",
        secondaryPhoneNumber: instructor.secondaryPhoneNumber || "",
        whatsappPhoneNumber: instructor.whatsappPhoneNumber || "",
        roles: instructor.roles || ["INSTRUCTOR"],
      });
      setWhatsappType("");
    } else {
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        phoneNumber: "",
        secondaryPhoneNumber: "",
        whatsappPhoneNumber: "",
        roles: ["INSTRUCTOR"],
      });
      setWhatsappType("");
    }
  }, [instructor, open]);

  const handleWhatsappTypeChange = (type) => {
    if (whatsappType === type) {
      setWhatsappType("");
    } else {
      setWhatsappType(type);
      const sourceField =
        type === "primary" ? "phoneNumber" : "secondaryPhoneNumber";
      setFormData((prev) => ({
        ...prev,
        whatsappPhoneNumber: prev[sourceField],
      }));
    }
  };

  const handlePhoneChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "phoneNumber" && whatsappType === "primary") {
        next.whatsappPhoneNumber = value;
      } else if (
        name === "secondaryPhoneNumber" &&
        whatsappType === "secondary"
      ) {
        next.whatsappPhoneNumber = value;
      }

      if (name === "whatsappPhoneNumber") {
        setWhatsappType("");
      }

      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "phoneNumber" && whatsappType === "primary") {
        next.whatsappPhoneNumber = value;
      } else if (
        name === "secondaryPhoneNumber" &&
        whatsappType === "secondary"
      ) {
        next.whatsappPhoneNumber = value;
      }

      if (name === "whatsappPhoneNumber") {
        setWhatsappType("");
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isEditMode) {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;

        result = await updateInstructor(instructor.id, dataToUpdate);
      } else {
        result = await createInstructor(formData);
      }
      onInstructorSaved(result);
      onClose();
    } catch (err) {
      console.error("Failed to save instructor:", err);
      const backendMessage = err.response?.data?.message;
      setError(
        backendMessage || `An error occurred while ${isEditMode ? "updating" : "creating"} the instructor. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this instructor?"))
      return;

    setLoading(true);
    try {
      await softDeleteInstructor(instructor.id);
      onInstructorDeleted(instructor.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete instructor:", err);
      setError("An error occurred while deleting the instructor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">
        {isEditMode ? "Instructor Details" : "Add New Instructor"}
      </DialogTitle>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item size={{ xs: 12 }} width={"100%"}>
                  <TextField
                    name="name"
                    label="First Name"
                    fullWidth
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item size={{ xs: 12 }} width={"100%"}>
                  <TextField
                    name="surname"
                    label="Last Name"
                    fullWidth
                    required
                    value={formData.surname}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item size={{ xs: 12 }} width={"100%"}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={formData.email}
                    onChange={handleChange}
                    inputProps={{ autoComplete: "off" }}
                  />
                </Grid>
                <Grid item size={{ xs: 12 }} width={"100%"}>
                  <TextField
                    name="password"
                    label={
                      isEditMode
                        ? "Change Password (Leave empty to keep)"
                        : "Initial Password"
                    }
                    type="password"
                    fullWidth
                    // required={!isEditMode}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                  <MuiTelInput
                    label="Primary Phone Number"
                    fullWidth
                    defaultCountry="EG"
                    value={formData.phoneNumber}
                    onChange={(val) => handlePhoneChange("phoneNumber", val)}
                  />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                  <MuiTelInput
                    label="Secondary Phone Number"
                    fullWidth
                    defaultCountry="EG"
                    value={formData.secondaryPhoneNumber}
                    onChange={(val) =>
                      handlePhoneChange("secondaryPhoneNumber", val)
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                  <MuiTelInput
                    label="WhatsApp Phone Number"
                    fullWidth
                    defaultCountry="EG"
                    focusOnSelectCountry
                    value={formData.whatsappPhoneNumber}
                    onChange={(val) =>
                      handlePhoneChange("whatsappPhoneNumber", val)
                    }
                  />
                  <FormGroup row sx={{ mt: 1, ml: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="medium"
                          checked={whatsappType === "primary"}
                          onChange={() => handleWhatsappTypeChange("primary")}
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
                          size="medium"
                          checked={whatsappType === "secondary"}
                          onChange={() => handleWhatsappTypeChange("secondary")}
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
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            justifyContent: isEditMode ? "space-between" : "flex-end",
          }}
        >
          {isEditMode && (
            <Button
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={handleDelete}
              disabled={loading}
              sx={{ mr: "auto" }}
            >
              Delete
            </Button>
          )}
          <Box>
            <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Instructor"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InstructorDialog;
