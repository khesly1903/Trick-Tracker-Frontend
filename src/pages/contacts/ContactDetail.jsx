import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { Phone, Mail, User, ShieldCheck } from "lucide-react";

// Placeholder for linked students
const DUMMY_STUDENTS = [
  { id: 1, name: "Berkay Kaya", relationship: "Child" },
  { id: 2, name: "Irem Kaya", relationship: "Child" },
];

const ContactDetailDialog = ({ open, onClose, contact }) => {
  if (!contact) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Contact Profile
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              bgcolor: "primary.light",
              color: "primary.contrastText",
              border: (theme) => `3px solid ${theme.palette.primary.light}`,
              boxShadow: 2,
            }}
          >
            <User size={50} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            {contact.name} {contact.surname}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip 
              label={contact.type || "PARENT"} 
              size="small" 
              color="secondary"
            />
            <Chip 
              label={contact.isActive ? "Active" : "Inactive"} 
              size="small" 
              variant="outlined" 
              color={contact.isActive ? "success" : "default"}
            />
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Mail size={18} style={{ marginRight: 12, color: "#666" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body2">
                  {contact.email || "Not provided"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Primary Phone
                </Typography>
                <Typography variant="body2">
                  {contact.phoneNumber || "Not provided"}
                </Typography>
              </Box>
            </Box>

            {contact.secondaryPhoneNumber && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Secondary Phone
                  </Typography>
                  <Typography variant="body2">
                    {contact.secondaryPhoneNumber}
                  </Typography>
                </Box>
              </Box>
            )}

            {contact.whatsappPhoneNumber && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    mr: 1.5,
                    bgcolor: "#25D366",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  W
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    WhatsApp
                  </Typography>
                  <Typography variant="body2">
                    {contact.whatsappPhoneNumber}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />
        
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ShieldCheck
            size={20}
            style={{ marginRight: 10, color: "#1976d2" }}
          />
          Linked Students
        </Typography>

        <List dense>
          {DUMMY_STUDENTS.map((student) => (
            <ListItem
              key={student.id}
              sx={{
                mb: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <ListItemText
                primary={student.name}
                secondary={student.relationship}
                primaryTypographyProps={{
                  fontWeight: "bold",
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailDialog;
