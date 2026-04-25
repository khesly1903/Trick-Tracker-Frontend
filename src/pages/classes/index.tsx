import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus, Layout } from 'lucide-react';
import { getAllClasses } from '../../api/classes.api';
import type { Class } from '../../api/types';
import ClassCard from './ClassCard';
import ClassDialog from './ClassDialog';

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Classes could not be loaded. Please check the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setSelectedClass(null);
    setDialogOpen(true);
  };

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    fetchData();
  };

  if (loading && classes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
              Academic Classes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Define and manage training categories, skill levels, and session types.
            </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} strokeWidth={2.5} />}
          onClick={handleCreate}
          sx={{ 
            borderRadius: '0.85rem', 
            textTransform: 'none', 
            fontWeight: 800, 
            px: 3, 
            py: 1.2,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none', transform: 'scale(1.02)' },
            transition: 'all 0.2s'
          }}
        >
          Add Class
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '1rem' }}>{error}</Alert>}

      {classes.length === 0 && !loading ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 12, 
            bgcolor: 'action.hover', 
            borderRadius: '2rem',
            border: '2px dashed',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box 
            sx={{ 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: 'background.paper', 
                mb: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}
          >
            <Layout size={48} style={{ opacity: 0.3, color: '#666' }} />
          </Box>
          <Typography variant="h5" color="text.primary" fontWeight={800} gutterBottom>
            No classes defined yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300 }}>
            Training classes help you organize your schedules and track student progress by category.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleCreate} 
            sx={{ borderRadius: '0.75rem', fontWeight: 800, px: 4 }}
          >
            Create Your First Class
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3.5}>
          {classes.map((classItem) => (
            <Grid key={classItem.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ClassCard classItem={classItem} onEdit={handleEdit} />
            </Grid>
          ))}
        </Grid>
      )}

      <ClassDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        classItem={selectedClass}
      />
    </Box>
  );
};

export default ClassesPage;
