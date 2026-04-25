import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Checkbox,
} from "@mui/material";
import { Search, Pencil, Eye } from "lucide-react";
import { getAllPrograms } from "../../api/programs.api";
import type { Program } from "../../api/types";

interface ProgramsDataGridProps {
  refreshTrigger: number;
  onEdit: (program: Program) => void;
  onSeeDetails: (program: Program) => void;
}

export const ProgramsDataGrid: React.FC<ProgramsDataGridProps> = ({ 
  refreshTrigger, 
  onEdit, 
  onSeeDetails 
}) => {
  const [rows, setRows] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPrograms();
      setRows(data || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const filteredRows = rows.filter((row) =>
    row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.inheritedClass?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: "isActive",
      headerName: "Active",
      width: 70,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params: any) => (
        <Checkbox
          checked={params.value}
          disabled
          size="small"
          sx={{
            color: "primary.main",
            "&.Mui-disabled": {
              color: params.value ? "primary.main" : "action.disabled",
            },
          }}
        />
      ),
    },
    {
      field: "id",
      headerName: "ID",
      width: 100,
      valueGetter: (value: string) =>
        value ? `TT-P-${value.substring(0, 4).toUpperCase()}` : "",
    },
    {
      field: "name",
      headerName: "Program Name",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: any) => (
        <Box sx={{ fontWeight: 600, color: 'primary.main' }}>
          {params.value}
        </Box>
      )
    },
    {
      field: "class",
      headerName: "Class",
      flex: 1,
      minWidth: 120,
      valueGetter: (_: any, row: Program) => row.inheritedClass?.name || 'N/A',
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 110,
      valueFormatter: (value: string) => {
        const map: Record<string, string> = { BOYS: 'Boys', GIRLS: 'Girls', ALL_GENDER: 'All' };
        return map[value] ?? value;
      },
    },
    {
      field: "ageRange",
      headerName: "Age",
      width: 90,
      valueGetter: (_: any, row: Program) =>
        row.minAge != null && row.maxAge != null ? `${row.minAge}–${row.maxAge}` : '-',
    },
    {
      field: "locations",
      headerName: "Locations",
      width: 80,
      align: 'center' as const,
      headerAlign: 'center' as const,
      valueGetter: (_: any, row: Program) =>
        row._count?.programLocations ?? row.programLocations?.length ?? 0,
    },
    {
      field: "dates",
      headerName: "Date Range",
      width: 180,
      valueGetter: (_: any, row: Program) => {
          if (!row.startDate || !row.endDate) return '-';
          const start = new Date(row.startDate).toLocaleDateString();
          const end = new Date(row.endDate).toLocaleDateString();
          return `${start} - ${end}`;
      }
    },
    {
      field: "seeDetails",
      headerName: "Details",
      width: 80,
      align: "center" as const,
      headerAlign: "center" as const,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title="See Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onSeeDetails(params.row)}
          >
            <Eye size={20} />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "editProgram",
      headerName: "Edit",
      width: 80,
      align: "center" as const,
      headerAlign: "center" as const,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title="Edit Program">
          <IconButton
            size="small"
            color="secondary"
            onClick={() => onEdit(params.row)}
          >
            <Pencil size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Paper sx={{ width: "100%", border: "none", overflow: "hidden" }}>
      <Box sx={{ p: 2, display: "flex", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          loading={loading}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
          }}
        />
      </Box>
    </Paper>
  );
};

export default ProgramsDataGrid;
