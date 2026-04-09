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
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { createLocation, updateLocation, softDeleteLocation } from "../../api/locations.api";

const LocationDialog = ({ open, onClose, onLocationSaved, onLocationDeleted, location = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!location;

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        address: location.address || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
      });
    }
    setError(null);
  }, [location, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isEditMode) {
        result = await updateLocation(location.id, formData);
      } else {
        result = await createLocation(formData);
      }
      onLocationSaved(result);
      onClose();
    } catch (err) {
      console.error("Failed to save location:", err);
      const backendMessage = err.response?.data?.message;
      setError(
        backendMessage || `An error occurred while ${isEditMode ? 'updating' : 'creating'} the location.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    
    setLoading(true);
    try {
      await softDeleteLocation(location.id);
      onLocationDeleted(location.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete location:", err);
      setError("An error occurred while deleting the location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">
        {isEditMode ? "Edit Location" : "Add New Location"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item size={{xs:12}}>
              <TextField
                name="name"
                label="Location Name"
                variant="filled"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Central Gymnastics Center"
              />
            </Grid>
            <Grid item  size={{xs:12}}>
              <TextField
                name="address"
                label="Address"
                variant="standard"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address of the location"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, justifyContent: isEditMode ? 'space-between' : 'flex-end' }}>
          {isEditMode && (
            <Button 
              color="error" 
              startIcon={<Trash2 size={18} />} 
              onClick={handleDelete}
              disabled={loading}
              variant="outlined"
            >
              Delete
            </Button>
          )}
          <Box>
            <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : (isEditMode ? "Save Changes" : "Add Location")}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LocationDialog;
