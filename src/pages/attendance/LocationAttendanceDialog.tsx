import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { BookOpen } from "lucide-react";
import type { Location, ProgramLocation } from "../../api/types";
import AttendanceGrid from "./AttendanceGrid";

type View = "programs" | "grid";

interface Props {
  open: boolean;
  onClose: () => void;
  location: Location | null;
  programLocations: ProgramLocation[];
}

const LocationAttendanceDialog: React.FC<Props> = ({
  open,
  onClose,
  location,
  programLocations,
}) => {
  const [view, setView] = useState<View>("programs");
  const [selectedPL, setSelectedPL] = useState<ProgramLocation | null>(null);

  const handleClose = () => {
    setView("programs");
    setSelectedPL(null);
    onClose();
  };

  const handleSelectProgram = (pl: ProgramLocation) => {
    setSelectedPL(pl);
    setView("grid");
  };

  const dialogTitle = () => {
    if (view === "programs") return `${location?.name ?? ""} — Select Program`;
    return `${selectedPL?.program?.name ?? ""} · ${location?.name ?? ""}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={view === 'grid' ? 'lg' : 'md'} fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{dialogTitle()}</DialogTitle>

      <DialogContent sx={{ minHeight: "28rem" }}>
        <>
          {view === "programs" && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              {programLocations.length === 0 && (
                <Alert severity="info">No programs at this location.</Alert>
              )}
              {programLocations.map((pl) => (
                <Card
                  key={pl.id}
                  onClick={() => handleSelectProgram(pl)}
                  sx={{
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "0.5rem",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", boxShadow: 2 },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <BookOpen size={16} />
                        <Typography variant="subtitle1" fontWeight={700}>
                          {pl.program?.name ?? pl.programId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {pl.program?.inheritedClass && (
                          <Chip
                            label={pl.program.inheritedClass.name}
                            size="small"
                            color="primary"
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                            }}
                          />
                        )}
                        {pl.program?.level && (
                          <Chip
                            label={pl.program.level}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem" }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={`₺${pl.price}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${pl._count?.studentPrograms ?? 0}/${pl.capacity} enrolled`}
                        size="small"
                        variant="outlined"
                      />
                      {pl.schedules && pl.schedules.length > 0 && (
                        <Chip
                          label={`${pl.schedules.length} schedule${pl.schedules.length !== 1 ? "s" : ""}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {view === "grid" && selectedPL && (
            <AttendanceGrid
              programLocationId={selectedPL.id}
              programName={selectedPL.program?.name ?? ""}
              locationName={location?.name ?? ""}
            />
          )}
        </>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {view === "programs" && <Button onClick={handleClose}>Close</Button>}
        {view === "grid" && (
          <Button
            onClick={() => {
              setView("programs");
            }}
          >
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LocationAttendanceDialog;
