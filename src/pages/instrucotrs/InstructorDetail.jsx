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
} from "@mui/material";
import { BookOpen, Phone, Mail, User } from "lucide-react";

const DUMMY_PROGRAMS = [
  { id: 1, name: "Beginner Gymnastics", schedule: "Mon/Wed 16:00" },
  { id: 2, name: "Advanced Parkour", schedule: "Tue/Thu 18:00" },
  { id: 3, name: "Kids Weekend Workshop", schedule: "Sat 10:00" },
];

const InstructorDetailDialog = ({ open, onClose, instructor }) => {
  if (!instructor) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Instructor Profile
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
          <Grid size={{ xs: 12, md: 6 }} >
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
                  width: 150,
                  height: 150,
                  mb: 2,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  border: (theme) => `4px solid ${theme.palette.primary.light}`,
                  boxShadow: 3,
                }}
              >
                <User size={80} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {instructor.name} {instructor.surname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Academy Instructor
              </Typography>
            </Box>

            <Box sx={{ width: "100%", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Mail size={18} style={{ marginRight: 12, color: "#666" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body2">
                    {instructor.email || "Not provided"}
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
                    {instructor.phoneNumber || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              {instructor.secondaryPhoneNumber && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Phone size={18} style={{ marginRight: 12, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Secondary Phone
                    </Typography>
                    <Typography variant="body2">
                      {instructor.secondaryPhoneNumber}
                    </Typography>
                  </Box>
                </Box>
              )}

              {instructor.whatsappPhoneNumber && (
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
                      {instructor.whatsappPhoneNumber}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column: Teaching Programs */}
          <Grid size={{ xs: 12, md: 6 }}>
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
                Teaching Programs
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {DUMMY_PROGRAMS.map((program) => (
                  <ListItem
                    key={program.id}
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
                      primary={program.name}
                      secondary={program.schedule}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                      secondaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>

              {DUMMY_PROGRAMS.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 4 }}
                >
                  This instructor is not currently assigned to any programs.
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

export default InstructorDetailDialog;
