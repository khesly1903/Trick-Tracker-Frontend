import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import StudentsDataGrid from './StudentsDataGrid';

const StudentsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Students
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your academy students and their profiles.
        </Typography>
      </Box>
      <StudentsDataGrid />
    </Container>
  );
};

export default StudentsPage;
