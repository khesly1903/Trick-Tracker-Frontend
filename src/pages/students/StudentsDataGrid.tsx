import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Checkbox, Paper } from '@mui/material';

interface StudentRow {
  id: string;
  isActive: boolean;
  academyId: string;
  firstName: string;
  lastName: string;
  age: number;
  primaryContact: string;
}

const dummyData: StudentRow[] = [
  {
    id: '1',
    isActive: true,
    academyId: 'TT-0001',
    firstName: 'Berkay',
    lastName: 'Kaya',
    age: 25,
    primaryContact: 'berkay@example.com',
  },
  {
    id: '2',
    isActive: false,
    academyId: 'TT-0002',
    firstName: 'John',
    lastName: 'Doe',
    age: 12,
    primaryContact: 'parent@example.com',
  },
  {
    id: '3',
    isActive: true,
    academyId: 'TT-0003',
    firstName: 'Jane',
    lastName: 'Smith',
    age: 20,
    primaryContact: 'jane@example.com',
  },
];

const columns: GridColDef[] = [
  {
    field: 'isActive',
    headerName: 'Active',
    width: 80,
    renderCell: (params) => (
      <Checkbox
        checked={params.value}
        disabled
        size="small"
        sx={{
          color: 'primary.main',
          '&.Mui-disabled': {
            color: params.value ? 'primary.main' : 'action.disabled',
          },
        }}
      />
    ),
  },
  {
    field: 'academyId',
    headerName: 'Academy ID',
    width: 130,
  },
  {
    field: 'fullName',
    headerName: 'Full Name',
    width: 200,
    valueGetter: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 80,
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'primaryContact',
    headerName: 'Primary Contact',
    width: 250,
  },
];

export const StudentsDataGrid: React.FC = () => {
  return (
    <Paper sx={{ height: 400, width: '100%', border:'none'}}>
      <DataGrid
        rows={dummyData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        disableRowSelectionOnClick
      />
    </Paper>
  );
};

export default StudentsDataGrid;
