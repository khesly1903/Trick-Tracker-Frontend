import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid, 
  CircularProgress,
  Alert,
} from '@mui/material';
import { MapPinPlus } from 'lucide-react';
// @ts-ignore
import LocationsCard from './LocationsCard';
// @ts-ignore
import LocationDialog from './LocationDialog';
// @ts-ignore
import LocationsDetailDialog from './LocationsDetailDialog';
import { getAllLocations } from '../../api/locations.api';
import type { Location } from '../../api/types';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('An error occurred while loading locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAddDialog = () => {
    setSelectedLocation(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (location: Location) => {
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  const handleOpenDetailDialog = (location: Location) => {
    setSelectedLocation(location);
    setIsDetailOpen(true);
  };

  const handleLocationSaved = () => {
    // Refresh the list after save
    fetchLocations();
  };

  const handleLocationDeleted = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Academy Locations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your physical training centers and their addresses.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MapPinPlus size={20} />}
          onClick={handleOpenAddDialog}
          sx={{ borderRadius: 2 }}
        >
          Add Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {locations.map((location) => (
            <Grid key={location.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <LocationsCard 
                location={location} 
                onEdit={handleOpenEditDialog} 
                onSeePrograms={handleOpenDetailDialog}
              />
            </Grid>
          ))}
          {locations.length === 0 && !error && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography color="text.secondary">
                  No locations found. Click "Add Location" to create your first training center.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Details Dialog */}
      <LocationsDetailDialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        location={selectedLocation}
      />

      {/* Add/Edit Dialog */}
      <LocationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onLocationSaved={handleLocationSaved}
        onLocationDeleted={handleLocationDeleted}
        location={selectedLocation}
      />
    </Container>
  );
};

export default LocationsPage;
