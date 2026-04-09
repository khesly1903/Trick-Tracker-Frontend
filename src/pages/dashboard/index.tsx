import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Paper,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Users,
  BookOpen,
  MapPin,
  UserCheck,
  Plus,
  Bell,
} from 'lucide-react';
import { getDashboardData } from '../../api/dashboard.api';
import type { DashboardData } from '../../api/types';
import { StatusCard } from './StatusCard';
import WeeklySchedule from './WeeklySchedule';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardData()
      .then((res) => {
        console.log('Dashboard API Response:', res);
        // Handle array/object case
        const dashboardData = Array.isArray(res) ? res[0] : res;
        setData(dashboardData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err);
        setError('Dashboard verileri yüklenirken bir hata oluştu.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Safety check to ensure statistics exists before rendering
  if (error || !data || !data.statistics) {
    return (
      <Box sx={{ p: '2rem', textAlign: 'center' }}>
        <Typography color="error">{error || 'There is no data or data format is wrong.'}</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
          There is an error happenning, please check the server status.
        </Typography>
      </Box>
    );
  }

  const {
    statistics = {
      totalStudents: 0,
      studentsByType: { child: 0, adult: 0 },
      totalPrograms: 0,
      totalInstructors: 0,
      attendanceRate: 0,
    },
    recentActivity = { students: [], programs: [] },
    distributions = { byLocation: [] },
  } = data;

  return (
    <Box sx={{ pb: '4rem' }}>
      <Box sx={{ mb: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: '0.5rem' }}>
            Dashboard Overview 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here's a summary of academy's current activity and performance.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <IconButton>
            <Bell size={20} strokeWidth={1} />
          </IconButton>
          {/* USER profile pic */}
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'primary.main',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            BK
          </Avatar>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: '3rem' }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatusCard
            title="Total Students"
            value={statistics.totalStudents}
            icon={<Users size={24} />}
            color={theme.palette.primary.main}
            subtitle={`${statistics.studentsByType.child} children, ${statistics.studentsByType.adult} adults`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatusCard
            title="Total Programs"
            value={statistics.totalPrograms}
            icon={<BookOpen size={24} />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatusCard
            title="Attendance Rate"
            value={`${statistics.attendanceRate}%`}
            icon={<UserCheck size={24} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatusCard
            title="Instructors"
            value={statistics.totalInstructors}
            icon={<Plus size={24} />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Weekly Schedule */}
        <Grid size={{ xs: 12 }}>
          <WeeklySchedule />
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: '1.5rem',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: '1.5rem' }}>
              Newly Joined Students
            </Typography>
            <List disablePadding>
              {recentActivity.students.map((student: any) => (
                <ListItem key={student.id} sx={{ px: 0, mb: '0.75rem' }}>
                  <ListItemIcon sx={{ minWidth: '3.5rem' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: '1rem', fontWeight: 700 }}>
                      {student.name[0]}{student.surname[0]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${student.name} ${student.surname}`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    secondary={new Date(student.createdAt).toLocaleDateString()}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Location Distribution */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: '1.5rem',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={20} /> Locations
            </Typography>
            {distributions.byLocation.map((loc: any) => (
              <Box key={loc.location} sx={{ mb: '1rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '0.5rem' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{loc.location}</Typography>
                  <Typography variant="body2" color="textSecondary">{loc.count} Students</Typography>
                </Box>
                <Box
                  sx={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '4px',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(loc.count / statistics.totalStudents) * 100}%`,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
