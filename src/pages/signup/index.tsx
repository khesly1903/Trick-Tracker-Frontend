import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminCapabilities = [
  { icon: <AdminPanelSettingsIcon fontSize="small" />, text: 'Full control over academy settings' },
  { icon: <GroupIcon fontSize="small" />, text: 'Create and manage students, instructors & contacts' },
  { icon: <CalendarMonthIcon fontSize="small" />, text: 'Set up programs, schedules, and locations' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({ email, password });
      navigate('/setup');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: '4rem',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: '3rem' }}>
          <SportsGymnasticsIcon sx={{ fontSize: '2rem' }} />
          <Typography variant="h4" fontWeight={700}>
            TrickTracker
          </Typography>
        </Stack>
        <Typography variant="h2" sx={{ mb: '1rem', lineHeight: 1.2 }}>
          Academy Admin Sign Up
        </Typography>
        <Typography variant="body1" sx={{ mb: '2.5rem', opacity: 0.85 }}>
          This page is for academy administrators only. As an admin, you'll have full control over your academy's operations.
        </Typography>
        <Stack spacing={2} sx={{ mb: '3rem' }}>
          {adminCapabilities.map((c) => (
            <Stack key={c.text} direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ opacity: 0.9 }}>{c.icon}</Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {c.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: '2rem' }} />

        <Box>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: '1rem' }}>
            Are you a student, instructor, or parent? Your account is created by your academy admin — no sign-up needed.
          </Typography>
          <Button
            variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Box>
      </Box>

      {/* Right panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: '2rem',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '22rem' }}>
          {/* Mobile logo */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: '2rem', display: { xs: 'flex', md: 'none' } }}
          >
            <SportsGymnasticsIcon color="primary" />
            <Typography variant="h6" fontWeight={700} color="primary">
              TrickTracker
            </Typography>
          </Stack>

          <Typography variant="h3" sx={{ mb: '0.5rem' }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
            Register your academy admin account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '2rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <Button
              variant="text"
              size="small"
              sx={{ p: 0, minWidth: 0, textDecoration: 'underline' }}
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </Typography>

          {/* Mobile: student/instructor notice */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: '2rem' }}>
            <Divider sx={{ mb: '1.5rem' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: '1rem' }}>
              Student, instructor, or parent? Your account is created by your academy admin.
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
