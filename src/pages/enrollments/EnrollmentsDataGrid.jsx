import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Paper,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { ArchiveX, Trash2 } from "lucide-react";
import { getEnrollments, softDisenroll, hardDisenroll } from "../../api/studentPrograms.api";

export const EnrollmentsDataGrid = ({ refreshTrigger, onDeleted }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmHard, setConfirmHard] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getEnrollments();
      setRows(data);
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleSoftDisenroll = async (row) => {
    try {
      await softDisenroll(row.id);
      onDeleted();
    } catch (error) {
      console.error("Failed to disenroll:", error);
    }
  };

  const handleHardDelete = async () => {
    if (!confirmHard) return;
    try {
      await hardDisenroll(confirmHard.id);
      setConfirmHard(null);
      onDeleted();
    } catch (error) {
      console.error("Failed to delete enrollment:", error);
    }
  };

  const columns = [
    {
      field: "student",
      headerName: "Student",
      flex: 1.5,
      minWidth: 150,
      valueGetter: (value, row) =>
        row.student ? `${row.student.name} ${row.student.surname}` : row.studentId,
    },
    {
      field: "program",
      headerName: "Program",
      flex: 1.5,
      minWidth: 150,
      valueGetter: (_value, row) => row.programLocation?.program?.name ?? "—",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 120,
      valueGetter: (_value, row) => row.programLocation?.location?.name ?? "—",
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          color={params.value ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "disenroll",
      headerName: "Disenroll",
      width: 90,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Disenroll (soft)">
          <span>
            <IconButton
              size="small"
              onClick={() => handleSoftDisenroll(params.row)}
              disabled={!params.row.isActive}
            >
              <ArchiveX size={18} />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Delete permanently">
          <IconButton
            size="small"
            color="error"
            onClick={() => setConfirmHard(params.row)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Paper sx={{ width: "100%", border: "none", overflow: "hidden" }}>
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={!!confirmHard} onClose={() => setConfirmHard(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Enrollment</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete this enrollment and all associated skill records? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmHard(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleHardDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnrollmentsDataGrid;
