import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
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
  Sun
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
    // { text: 'Attendance', icon: <UserCheck strokeWidth={1} />, path: '/attendance' },
    { text: 'Locations', icon: <MapPin strokeWidth={1} />, path: '/locations' },
    { text: 'Management', icon: <Settings strokeWidth={1} />, path: '/management' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar 
        sx={{ 
          backgroundColor: mode === 'light' ? 'primary.main' : 'background.paper', 
          color: mode === 'light' ? 'white' : 'primary.main',
          minHeight: '4rem !important' 
        }}
      >
        <Typography variant="h6" noWrap component="div" >
          TRICKTRACKER
        </Typography>
      </Toolbar>

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
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              borderRight:'none',
              borderRadius: 0 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: '1.5rem',
          width: { sm: `calc(100% - ${drawerWidth})` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
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
