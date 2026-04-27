import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { ClipboardList } from 'lucide-react';
// @ts-ignore
import EnrollmentsDataGrid from './EnrollmentsDataGrid';
import EnrollDialog from './EnrollDialog';

const EnrollmentsPage: React.FC = () => {
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleEnrolled = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsEnrollDialogOpen(false);
  };

  const handleDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Enrollments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student enrollments across program locations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ClipboardList size={20} />}
          onClick={() => setIsEnrollDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Enroll Student
        </Button>
      </Box>

      <EnrollmentsDataGrid
        refreshTrigger={refreshTrigger}
        onDeleted={handleDeleted}
      />

      <EnrollDialog
        open={isEnrollDialogOpen}
        onClose={() => setIsEnrollDialogOpen(false)}
        onEnrolled={handleEnrolled}
      />
    </Container>
  );
};

export default EnrollmentsPage;
