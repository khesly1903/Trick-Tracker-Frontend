import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Switch,
  FormControlLabel,
} from '@mui/material';

import {
  LayoutDashboard,
  Users,
  Landmark,
  BookOpenCheck,
  // UserCheck,
  Settings,
  MapPin,
  ContactRound,
  Dumbbell,
  Moon,
  Sun,
  ClipboardList,
  Activity,
} from "lucide-react"

import { useColorMode } from '../theme/ThemeContext';

const drawerWidth = '16.25rem'; // ~260px in rem

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleColorMode, mode } = useColorMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard strokeWidth={1}/>, path: '/' },
    { text: 'Students', icon: <Users strokeWidth={1} />, path: '/students' },
    { text: 'Contacts', icon: <ContactRound strokeWidth={1} />, path: '/contacts' },
    { text: 'Instructors', icon: <Dumbbell strokeWidth={1} /> ,path: '/instructors' },
    { text: 'Classes', icon: <Landmark strokeWidth={1} />, path: '/classes' },
    { text: 'Programs', icon: <BookOpenCheck strokeWidth={1} />, path: '/programs' },
    { text: 'Enrollments', icon: <ClipboardList strokeWidth={1} />, path: '/enrollments' },
    { text: 'Tracker', icon: <Activity strokeWidth={1} />, path: '/tracker' },
    // { text: 'Attendance', icon: <UserCheck strokeWidth={1} />, path: '/attendance' },
    { text: 'Locations', icon: <MapPin strokeWidth={1} />, path: '/locations' },
    { text: 'Management', icon: <Settings strokeWidth={1} />, path: '/management' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: '1rem',
          minHeight: '4rem',
          backgroundColor: mode === 'light' ? 'primary.main' : 'primary.dark',
          borderRadius: '0.5rem 0.5rem 0 0',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 700, letterSpacing: '0.05em' }}>
          TRICKTRACKER
        </Typography>
      </Box>

      <Divider />
      
      <Box sx={{ flexGrow: 1, mt: '0.5rem' }}>
        <List >
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mb: '0.25rem',
                  '&.Mui-selected': {
                    backgroundColor: mode === 'light' ? 'primary.light' : 'primary.dark',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: mode === 'light' ? 'primary.light' : 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '2.5rem', color: location.pathname === item.path ? 'white' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ p: '1rem' }}>
        <Divider sx={{ mb: '1rem' }} />
        <FormControlLabel
          control={
            <Switch 
              checked={mode === 'dark'} 
              onChange={toggleColorMode} 
              color="secondary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mode === 'dark' ?  <Moon strokeWidth={1} /> : <Sun strokeWidth={1} />}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </Box>
          }
          sx={{ width: '100%' }}
        />
       

      </Box>
    </Box>

  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile: overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRadius: 0 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop: floating sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          position: 'fixed',
          top: '0.5rem',
          left: '0.5rem',
          width: drawerWidth,
          height: 'calc(100vh - 1rem)',
          bgcolor: 'background.paper',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          zIndex: (theme) => theme.zIndex.drawer,
          boxShadow: mode === 'light'
            ? '0 4px 24px rgba(0,0,0,0.10)'
            : '0 4px 24px rgba(0,0,0,0.45)',
        }}
      >
        {drawer}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `calc(${drawerWidth} + 1rem)` },
          p: '0.5rem',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl" sx={{ mt: '1rem' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
