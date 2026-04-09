import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { UserPlus } from 'lucide-react';
// @ts-ignore
import InstructorsDataGrid from './InstructorsDataGrid';
// @ts-ignore
import InstructorDialog from './InstructorDialog';
// @ts-ignore
import InstructorDetailDialog from './InstructorDetail';

const InstructorsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedInstructor, setSelectedInstructor] = React.useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleOpenAddDialog = () => {
    setSelectedInstructor(null);
    setIsDialogOpen(true);
  };

  const handleOpenDetailDialog = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsDetailOpen(true);
  };

  const handleOpenEditDialog = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsDialogOpen(true);
  };

  const handleInstructorSaved = (instructor: any) => {
    console.log('Instructor saved:', instructor);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleInstructorDeleted = (id: string) => {
    console.log('Instructor deleted:', id);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Instructors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your academy instructors and their contact info.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={20} />}
          onClick={handleOpenAddDialog}
          sx={{ borderRadius: 2 }}
        >
          Add Instructor
        </Button>
      </Box>
      <InstructorsDataGrid 
        refreshTrigger={refreshTrigger} 
        onSeeDetails={handleOpenDetailDialog}
        onEdit={handleOpenEditDialog}
      />
      
      {/* Detail View */}
      <InstructorDetailDialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        instructor={selectedInstructor}
      />

      {/* Add/Edit Form */}
      <InstructorDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onInstructorSaved={handleInstructorSaved}
        onInstructorDeleted={handleInstructorDeleted}
        instructor={selectedInstructor}
      />
    </Container>
  );
};

export default InstructorsPage;
