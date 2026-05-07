import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Phone, Mail, User, ShieldCheck } from "lucide-react";
import { getContactById } from "../../api/contacts.api";

const ContactDetailDialog = ({ open, onClose, contact }) => {
  const [fullContact, setFullContact] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && contact?.id) {
      setLoading(true);
      getContactById(contact.id)
        .then(setFullContact)
        .catch(() => setFullContact(null))
        .finally(() => setLoading(false));
    } else {
      setFullContact(null);
    }
  }, [open, contact?.id]);

  if (!contact) return null;
  const c = fullContact || contact;
  const linkedStudents = fullContact?.studentContacts || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Contact Profile
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: "primary.light", color: "primary.contrastText", border: (theme) => `3px solid ${theme.palette.primary.light}`, boxShadow: 2 }}>
                <User size={50} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">{c.name} {c.surname}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip label={Array.isArray(c.type) ? c.type[0] : c.type || "PARENT"} size="small" color="secondary" />
                <Chip label={c.isActive ? "Active" : "Inactive"} size="small" variant="outlined" color={c.isActive ? "success" : "default"} />
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Mail size={18} style={{ marginRight: 12, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                    <Typography variant="body2">{c.email || "Not provided"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Primary Phone</Typography>
                    <Typography variant="body2">{c.phoneNumber || "Not provided"}</Typography>
                  </Box>
                </Box>
                {c.secondaryPhoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Secondary Phone</Typography>
                      <Typography variant="body2">{c.secondaryPhoneNumber}</Typography>
                    </Box>
                  </Box>
                )}
                {c.whatsappPhoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: 18, height: 18, mr: 1.5, bgcolor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: "bold" }}>W</Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                      <Typography variant="body2">{c.whatsappPhoneNumber}</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <ShieldCheck size={20} style={{ marginRight: 10, color: "#1976d2" }} />
              Linked Students
            </Typography>

            {linkedStudents.length > 0 ? (
              <List dense>
                {linkedStudents.map((sc) => (
                  <ListItem key={sc.studentId} sx={{ mb: 1, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                    <ListItemText
                      primary={`${sc.student.name} ${sc.student.surname}`}
                      secondary={sc.relation}
                      primaryTypographyProps={{ fontWeight: "bold" }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No linked students.</Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailDialog;
