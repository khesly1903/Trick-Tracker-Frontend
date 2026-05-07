import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const PORTAL_ROLES = ['STUDENT', 'PARENT', 'INSTRUCTOR'] as const;
type PortalRole = typeof PORTAL_ROLES[number];

const PORTAL_ROUTE: Record<PortalRole, string> = {
  STUDENT: '/student',
  PARENT: '/parent',
  INSTRUCTOR: '/instructor',
};

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/academy-login" replace />;
  }

  if (user) {
    // Portal role → redirect to portal if not already there
    for (const role of PORTAL_ROLES) {
      if (user.roles.includes(role)) {
        const base = PORTAL_ROUTE[role];
        if (!location.pathname.startsWith(base)) {
          return <Navigate to={base} replace />;
        }
        return <>{children}</>;
      }
    }

    // Admin/Manager/Owner: require academy setup
    if (user.academyId === null) {
      return <Navigate to="/setup" replace />;
    }
  }

  return <>{children}</>;
}
