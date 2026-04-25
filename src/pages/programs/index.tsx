import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Plus } from 'lucide-react';
import ProgramsDataGrid from './ProgramsDataGrid';
import ProgramWizardDialog from './ProgramWizardDialog';
// @ts-expect-error jsx file
import ProgramDetail from './ProgramDetail';
import ProgramDialog from './ProgramDialog';
import type { Program } from '../../api/types';

const ProgramsPage: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    const handleEdit = (program: Program) => {
        setSelectedProgram(program);
        setEditOpen(true);
    };

    const handleSeeDetails = (program: Program) => {
        setSelectedProgram(program);
        setDetailOpen(true);
    };

    const handleDetailClose = () => {
        setDetailOpen(false);
        setSelectedProgram(null);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedProgram(null);
    };

    const handleEditSaved = () => {
        setEditOpen(false);
        setSelectedProgram(null);
        setRefreshTrigger((t) => t + 1);
    };

    const handleWizardCompleted = () => {
        setWizardOpen(false);
        setRefreshTrigger((t) => t + 1);
    };

    return (
        <Box sx={{ pb: 6 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                        Curriculum & Programs
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Review and manage academy session schedules, pricing, and age requirements.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} strokeWidth={2.5} />}
                    onClick={() => setWizardOpen(true)}
                    sx={{
                        borderRadius: '0.75rem',
                        textTransform: 'none',
                        fontWeight: 800,
                        px: 3,
                        py: 1.2,
                        boxShadow: 'none',
                    }}
                >
                    Add Program
                </Button>
            </Box>

            <ProgramsDataGrid
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit}
                onSeeDetails={handleSeeDetails}
            />

            <ProgramWizardDialog
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onCompleted={handleWizardCompleted}
            />

            <ProgramDetail
                open={detailOpen}
                programId={selectedProgram?.id ?? null}
                onClose={handleDetailClose}
            />

            <ProgramDialog
                open={editOpen}
                program={selectedProgram}
                onClose={handleEditClose}
                onSaved={handleEditSaved}
            />
        </Box>
    );
};

export default ProgramsPage;
