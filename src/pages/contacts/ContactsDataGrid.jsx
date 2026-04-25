import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Paper,
  Checkbox,
  IconButton,
  Link,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import { MessageCircle, Search, Eye, Pencil } from "lucide-react";
import { getAllContacts, filterContacts } from "../../api/contacts.api";

export const ContactsDataGrid = ({ refreshTrigger, onSeeDetails, onEdit }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const columns = [
    {
      field: "isActive",
      headerName: "Active",
      width: 70,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
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
      valueGetter: (value) =>
        value ? `TT-C-${value.substring(0, 4).toUpperCase()}` : "",
    },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1.5,
      minWidth: 150,
      valueGetter: (value, row) => `${row.name || ""} ${row.surname || ""}`,
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "whatsapp",
      headerName: "WA",
      width: 60,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        const phone = (
          params.row.whatsappPhoneNumber ||
          params.row.phoneNumber ||
          ""
        ).replace(/\D/g, "");
        if (!phone) return null;
        const whatsappUrl = `https://wa.me/${phone}`;
        return (
          <Tooltip title="Send WhatsApp Message">
            <IconButton
              component={Link}
              href={whatsappUrl}
              target="_blank"
              size="small"
              sx={{ color: "#25D366" }}
            >
              <MessageCircle size={20} />
            </IconButton>
          </Tooltip>
        );
      },
    },
    {
      field: "seeDetails",
      headerName: "Details",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
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
      field: "editContact",
      headerName: "Edit",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Edit Contact">
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

  // Handle debounce and reset page on search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;

      if (debouncedSearchTerm.trim()) {
        // Search returns a plain array of contacts (no pagination)
        response = await filterContacts(debouncedSearchTerm.trim());
        setRows(response || []);
        setRowCount((response && response.length) || 0);
      } else {
        // Regular paginated fetch
        response = await getAllContacts(page, limit);
        setRows(response.data || []);
        setRowCount(response.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, debouncedSearchTerm, paginationModel]);

  return (
    <Paper sx={{ width: "100%", border: "none", overflow: "hidden" }}>
      <Box sx={{ p: 2, display: "flex", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search contacts..."
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
          rows={rows}
          loading={loading}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 15, 25]}
          autoHeight
          disableRowSelectionOnClick
        />
      </Box>
    </Paper>
  );
};

export default ContactsDataGrid;
