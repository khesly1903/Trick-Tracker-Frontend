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
import { BookOpen, Phone, Mail, User, Calendar, School, AlertTriangle, Users } from "lucide-react";
import { getStudentById } from "../../api/students.api";

const StudentDetailDialog = ({ open, onClose, student }) => {
  const [fullStudent, setFullStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && student?.id) {
      setLoading(true);
      getStudentById(student.id)
        .then(setFullStudent)
        .catch(() => setFullStudent(null))
        .finally(() => setLoading(false));
    } else {
      setFullStudent(null);
    }
  }, [open, student?.id]);

  if (!student) return null;
  const s = fullStudent || student;

  const contacts = fullStudent?.studentContacts || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Student Profile
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
        <Grid container spacing={4} sx={{ justifyContent: "space-between", alignItems: "stretch" }}>
          {/* Left Column: Profile & Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: "secondary.light",
                  color: "secondary.contrastText",
                  border: (theme) => `4px solid ${theme.palette.secondary.light}`,
                  boxShadow: 3,
                }}
              >
                <User size={60} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {s.name} {s.surname}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip label={s.type || "STUDENT"} size="small" color={s.type === "CHILD" ? "primary" : "secondary"} />
                <Chip label={s.isActive ? "Active" : "Inactive"} size="small" variant="outlined" color={s.isActive ? "success" : "default"} />
              </Box>
            </Box>

            <Box sx={{ width: "100%", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Mail size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body2">{s.email || "Not provided"}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Primary Phone</Typography>
                  <Typography variant="body2">{s.phoneNumber || "Not provided"}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Calendar size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body2">{s.dob ? new Date(s.dob).toLocaleDateString() : "Not provided"}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">School</Typography>
                  <Typography variant="body2">{s.school || "Not provided"}</Typography>
                </Box>
              </Box>

              {s.whatsappPhoneNumber && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: 18, height: 18, mr: 1.5, bgcolor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: "bold" }}>
                    W
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                    <Typography variant="body2">{s.whatsappPhoneNumber}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column: Injuries & Contacts */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", color: "error.main" }}>
                <AlertTriangle size={20} style={{ marginRight: 10 }} />
                Health & Injuries
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {s.injuries && s.injuries.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {s.injuries.map((injury, idx) => (
                    <Chip key={idx} label={injury} color="error" variant="outlined" size="small" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No injuries reported.</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <Users size={20} style={{ marginRight: 10, color: "#1976d2" }} />
                Contacts
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {contacts.length > 0 ? (
                <List disablePadding>
                  {contacts.map((sc) => {
                    const c = sc.contact;
                    return (
                      <ListItem key={sc.contactId} sx={{ mb: 1.5, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider", alignItems: "flex-start", px: 2, py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography fontWeight="bold" variant="body2">{c.name} {c.surname}</Typography>
                              <Chip label={sc.relation} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 18 }} />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              {c.phoneNumber && <Typography variant="caption" display="block" color="text.secondary">{c.phoneNumber}</Typography>}
                              {c.user?.email && <Typography variant="caption" display="block" color="text.secondary">{c.user.email}</Typography>}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No contacts linked.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailDialog;
