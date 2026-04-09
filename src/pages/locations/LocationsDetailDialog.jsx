import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { BookOpen, MapPin, Users } from "lucide-react";

// Dummy data for programs at this location
const DUMMY_LOCATION_PROGRAMS = [
  {
    id: 1,
    name: "Advanced Gymnastics",
    instructor: "Julia Alexan",
    totalStudents: 20,
    time: "Mon/Wed 17:00",
  },
  {
    id: 2,
    name: "Parkour Fundamentals",
    instructor: "Marcus Thorne",
    totalStudents: 32,
    time: "Tue/Thu 16:30",
  },
  {
    id: 3,
    name: "Toddler Skillz",
    instructor: "Sarah Jenkins",
    totalStudents: 18,
    time: "Sat 10:00",
  },
];

const LocationsDetailDialog = ({ open, onClose, location }) => {
  if (!location) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold" textAlign="center">
        Programs at {location.name}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              mb: 1,
            }}
          >
            <MapPin
              size={20}
              color="#1976d2"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <Typography variant="subtitle1" fontWeight="medium">
              {location.address}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", mt: 2 }}
        >
          <BookOpen size={20} style={{ marginRight: 10, color: "#1976d2" }} />
          Current Programs
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List sx={{ pt: 0 }}>
          {DUMMY_LOCATION_PROGRAMS.map((program) => (
            <ListItem
              key={program.id}
              sx={{
                mb: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                flexDirection: "column",
                alignItems: "flex-start",
                "&:hover": { bgcolor: "action.hover" },
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {program.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    px: 1.5,
                    py: 0.3,
                    borderRadius: 1,
                    height: "fit-content",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {program.time}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 1 }}>
                <Users size={14} color="#666" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  {program.totalStudents} Students Enrolled
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Instructor: <strong>{program.instructor}</strong>
              </Typography>
            </ListItem>
          ))}
          {DUMMY_LOCATION_PROGRAMS.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 4 }}
            >
              No programs are currently scheduled at this location.
            </Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationsDetailDialog;
