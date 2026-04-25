import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  Typography,
  Switch,
} from '@mui/material';
import { createClass, updateClass } from '../../api/classes.api';
import type { Class, CreateClassDto } from '../../api/types';

interface ClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (classItem: Class) => void;
  classItem?: Class | null;
}

const ClassDialog: React.FC<ClassDialogProps> = ({ open, onClose, onSaved, classItem }) => {
  const [formData, setFormData] = useState<CreateClassDto>({
    name: '',
    type: 'GROUP',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!classItem;

  useEffect(() => {
    if (classItem && open) {
      setFormData({
        name: classItem.name,
        type: classItem.type,
        isActive: classItem.isActive,
      });
    } else {
      setFormData({
        name: '',
        type: 'GROUP',
        isActive: true,
      });
    }
    setError(null);
  }, [classItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isEdit && classItem) {
        result = await updateClass(classItem.id, formData);
      } else {
        const createData = {
          name: formData.name,
          type: formData.type,
        };
        result = await createClass(createData as any);
      }
      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while saving the class.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: '0.5rem', p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em', pb: 1 }}>
        {isEdit ? 'Update Class' : 'Create New Class'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '0.5rem' }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Class Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Acrobatics Fundamentals"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
            />
            
            <TextField
              select
              label="Class Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              fullWidth
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
            >
              <MenuItem value="GROUP">Group</MenuItem>
              <MenuItem value="PRIVATE">Private</MenuItem>
              <MenuItem value="MAKEUP">Makeup</MenuItem>
              <MenuItem value="WORKSHOP">Workshop</MenuItem>
              <MenuItem value="EVENT">Event</MenuItem>
            </TextField>

            {isEdit && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  bgcolor: 'action.hover', 
                  borderRadius: '0.5rem',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>Status</Typography>
                  <Typography variant="caption" color="text.secondary">Make this class active or archived</Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  color="primary"
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={loading} 
            sx={{ 
              borderRadius: '1rem', 
              textTransform: 'none', 
              fontWeight: 700,
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              borderRadius: '1rem', 
              textTransform: 'none', 
              fontWeight: 900,
              boxShadow: 'none',
              px: 4,
              py: 1.2,
              '&:hover': { boxShadow: 'none' }
            }}
          >
            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Class')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClassDialog;
