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
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  BookOpenCheck,
  Activity,
  Users,
  Moon,
  Sun,
  ClipboardList,
} from 'lucide-react';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import LogOut from '@mui/icons-material/Logout';
import { useColorMode } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../api/types';

const drawerWidth = '15rem';

type NavItem = { text: string; icon: React.ReactNode; path: string };

const navByRole: Record<string, NavItem[]> = {
  STUDENT: [
    { text: 'My Programs', icon: <BookOpenCheck strokeWidth={1} />, path: '/student' },
    { text: 'Skill Tracker', icon: <Activity strokeWidth={1} />, path: '/student/skills' },
  ],
  PARENT: [
    { text: 'My Children', icon: <Users strokeWidth={1} />, path: '/parent' },
  ],
  INSTRUCTOR: [
    { text: 'My Programs', icon: <BookOpenCheck strokeWidth={1} />, path: '/instructor' },
    { text: 'Skill Tracker', icon: <Activity strokeWidth={1} />, path: '/instructor/tracker' },
    { text: 'Attendance', icon: <ClipboardList strokeWidth={1} />, path: '/instructor/attendance' },
  ],
};

const roleLabel: Record<string, string> = {
  STUDENT: 'Student',
  PARENT: 'Parent',
  INSTRUCTOR: 'Instructor',
};

function getPortalRole(roles: Role[]): string | null {
  for (const r of ['STUDENT', 'PARENT', 'INSTRUCTOR']) {
    if (roles.includes(r as Role)) return r;
  }
  return null;
}

const PortalLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleColorMode, mode } = useColorMode();
  const { logout, user } = useAuth();

  const portalRole = user ? getPortalRole(user.roles) : null;
  const menuItems: NavItem[] = portalRole ? (navByRole[portalRole] ?? []) : [];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          px: '1rem',
          minHeight: '4rem',
          backgroundColor: mode === 'light' ? 'primary.main' : 'primary.dark',
          borderRadius: '0.5rem 0.5rem 0 0',
        }}
      >
        <SportsGymnasticsIcon sx={{ color: 'white', fontSize: '1.25rem' }} />
        <Typography variant="subtitle1" noWrap sx={{ color: 'white', fontWeight: 700, letterSpacing: '0.05em' }}>
          TRICKTRACKER
        </Typography>
      </Box>

      {portalRole && (
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Chip
            label={roleLabel[portalRole]}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      <Divider />

      <Box sx={{ flexGrow: 1, mt: '0.5rem' }}>
        <List>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path ||
              (item.path !== '/student' && item.path !== '/parent' && item.path !== '/instructor' &&
                location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  selected={isSelected}
                  sx={{
                    mb: '0.25rem',
                    '&.Mui-selected': {
                      backgroundColor: mode === 'light' ? 'primary.light' : 'primary.dark',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: mode === 'light' ? 'primary.light' : 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '2.5rem', color: isSelected ? 'white' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
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
              {mode === 'dark' ? <Moon strokeWidth={1} /> : <Sun strokeWidth={1} />}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </Box>
          }
          sx={{ width: '100%' }}
        />

        <Divider sx={{ my: '0.75rem' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, mr: 1 }}>
            {user?.email ?? user?.id?.slice(0, 8)}
          </Typography>
          <Tooltip title="Log out">
            <IconButton size="small" onClick={logout} color="default">
              <LogOut fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRadius: 0 },
        }}
      >
        {drawer}
      </Drawer>

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

export default PortalLayout;
