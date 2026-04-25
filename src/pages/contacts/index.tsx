import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { UserPlus } from 'lucide-react';
// @ts-ignore
import ContactsDataGrid from './ContactsDataGrid';
// @ts-ignore
import ContactDialog from './ContactDialog';
// @ts-ignore
import ContactDetailDialog from './ContactDetail';

const ContactsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleOpenAddDialog = () => {
    setSelectedContact(null);
    setIsDialogOpen(true);
  };

  const handleOpenDetailDialog = (contact: any) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleOpenEditDialog = (contact: any) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleContactSaved = (contact: any) => {
    console.log('Contact saved:', contact);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleContactDeleted = (id: string) => {
    console.log('Contact deleted:', id);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Contacts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your academy contacts, parents, and guardians.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={20} />}
          onClick={handleOpenAddDialog}
          sx={{ borderRadius: 2 }}
        >
          Add Contact
        </Button>
      </Box>
      <ContactsDataGrid 
        refreshTrigger={refreshTrigger} 
        onSeeDetails={handleOpenDetailDialog}
        onEdit={handleOpenEditDialog}
      />
      
      {/* Detail View */}
      <ContactDetailDialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        contact={selectedContact}
      />

      {/* Add/Edit Form */}
      <ContactDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onContactSaved={handleContactSaved}
        onContactDeleted={handleContactDeleted}
        contact={selectedContact}
      />
    </Container>
  );
};

export default ContactsPage;
