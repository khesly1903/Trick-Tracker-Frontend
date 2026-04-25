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
import { BookOpen, Phone, Mail, User, Calendar, School, AlertTriangle } from "lucide-react";

// Placeholder for future implementation
const DUMMY_ENROLLMENTS = [
  { id: 1, name: "Junior Trickstars", schedule: "Mon/Wed 15:00" },
  { id: 2, name: "After School Acrobatics", schedule: "Fri 17:00" },
];

const StudentDetailDialog = ({ open, onClose, student }) => {
  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Student Profile
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={4}
          sx={{
            justifyContent: "space-between",
            alignItems: "stretch",
          }}
        >
          {/* Left Column: Profile & Info */}
          <Grid item xs={12} md={6}>
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
                {student.name} {student.surname}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip 
                  label={student.type || "STUDENT"} 
                  size="small" 
                  color={student.type === "CHILD" ? "primary" : "secondary"}
                />
                <Chip 
                  label={student.isActive ? "Active" : "Inactive"} 
                  size="small" 
                  variant="outlined" 
                  color={student.isActive ? "success" : "default"}
                />
              </Box>
            </Box>

            <Box sx={{ width: "100%", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Mail size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body2">
                    {student.email || "Not provided"}
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
                    {student.phoneNumber || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Calendar size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2">
                    {student.dob ? new Date(student.dob).toLocaleDateString() : "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    School
                  </Typography>
                  <Typography variant="body2">
                    {student.school || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              {student.whatsappPhoneNumber && (
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
                      {student.whatsappPhoneNumber}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column: Injuries & Enrollments */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", color: "error.main" }}
              >
                <AlertTriangle
                  size={20}
                  style={{ marginRight: 10 }}
                />
                Health & Injuries
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {student.injuries && student.injuries.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {student.injuries.map((injury, idx) => (
                    <Chip key={idx} label={injury} color="error" variant="outlined" size="small" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No injuries reported.
                </Typography>
              )}
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <BookOpen
                  size={20}
                  style={{ marginRight: 10, color: "#1976d2" }}
                />
                Enrolled Programs
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {DUMMY_ENROLLMENTS.map((enrollment) => (
                  <ListItem
                    key={enrollment.id}
                    sx={{
                      mb: 1.5,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ListItemText
                      primary={enrollment.name}
                      secondary={enrollment.schedule}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                      secondaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>

              {DUMMY_ENROLLMENTS.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 4 }}
                >
                  This student is not currently enrolled in any programs.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailDialog;
