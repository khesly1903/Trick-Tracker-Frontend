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
  MenuItem,
  Typography,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { MuiTelInput } from "mui-tel-input";
import {
  createContact,
  updateContact,
  softDeleteContact,
} from "../../api/contacts.api";

const ContactDialog = ({
  open,
  onClose,
  onContactSaved,
  onContactDeleted,
  contact = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    whatsappPhoneNumber: "",
    roles: ["PARENT"],
    type: "PARENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [whatsappType, setWhatsappType] = useState("");

  const isEditMode = !!contact;

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        surname: contact.surname || "",
        email: contact.email || "",
        phoneNumber: contact.phoneNumber || "",
        secondaryPhoneNumber: contact.secondaryPhoneNumber || "",
        whatsappPhoneNumber: contact.whatsappPhoneNumber || "",
        roles: contact.roles || ["PARENT"],
        type: contact.type || "PARENT",
      });
      setWhatsappType("");
    } else {
      setFormData({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        secondaryPhoneNumber: "",
        whatsappPhoneNumber: "",
        roles: ["PARENT"],
        type: "PARENT",
      });
      setWhatsappType("");
    }
  }, [contact, open]);

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
        result = await updateContact(contact.id, formData);
      } else {
        result = await createContact(formData);
      }
      onContactSaved(result);
      onClose();
    } catch (err) {
      console.error("Failed to save contact:", err);
      const backendMessage = err.response?.data?.message;
      setError(
        backendMessage ||
          `An error occurred while ${isEditMode ? "updating" : "creating"} the contact. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;

    setLoading(true);
    try {
      await softDeleteContact(contact.id);
      onContactDeleted(contact.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setError("An error occurred while deleting the contact.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">
        {isEditMode ? "Contact Details" : "Add New Contact"}
      </DialogTitle>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item size={{ xs: 12 }}>
                <TextField
                  name="name"
                  label="First Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <TextField
                  name="surname"
                  label="Last Name"
                  fullWidth
                  required
                  value={formData.surname}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12 }}>
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
              
              <Grid item size={{ xs: 12 }}>
                <TextField
                  select
                  name="type"
                  label="Contact Type"
                  fullWidth
                  required
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="PARENT">Parent</MenuItem>
                  <MenuItem value="GUARDIAN">Guardian</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
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
                  : "Add Contact"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactDialog;
