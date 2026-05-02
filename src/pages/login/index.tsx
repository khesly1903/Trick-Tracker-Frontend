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
} from '@mui/material';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const highlights = [
  'Real-time skill progression tracking',
  'Full program and schedule management',
  'Attendance monitoring across sessions',
  'Multi-role access for your whole team',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
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
          Welcome back
        </Typography>
        <Typography variant="body1" sx={{ mb: '3rem', opacity: 0.85 }}>
          Log in to manage your academy — students, programs, and skill progress all in one place.
        </Typography>
        <Stack spacing={1.5}>
          {highlights.map((h) => (
            <Stack key={h} direction="row" alignItems="center" spacing={1.5}>
              <CheckCircleOutlineIcon sx={{ opacity: 0.9, fontSize: '1.1rem' }} />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {h}
              </Typography>
            </Stack>
          ))}
        </Stack>
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
            Log In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
            Enter your credentials to access the dashboard.
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
                autoComplete="current-password"
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '2rem', textAlign: 'center' }}>
            Academy admin?{' '}
            <Button
              variant="text"
              size="small"
              sx={{ p: 0, minWidth: 0, textDecoration: 'underline' }}
              onClick={() => navigate('/signup')}
            >
              Create an account
            </Button>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: '0.75rem', textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              sx={{ p: 0, minWidth: 0, textDecoration: 'underline' }}
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
