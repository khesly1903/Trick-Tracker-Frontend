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
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleInfo = [
  { icon: <SchoolIcon sx={{ opacity: 0.9, fontSize: '1.1rem' }} />, label: 'Students — view your enrolled programs and skill progress' },
  { icon: <PeopleIcon sx={{ opacity: 0.9, fontSize: '1.1rem' }} />, label: 'Parents — track your child\'s programs and achievements' },
  { icon: <FitnessCenterIcon sx={{ opacity: 0.9, fontSize: '1.1rem' }} />, label: 'Instructors — manage skill progress for your classes' },
];

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ identifier, password });
      if (user.roles.includes('STUDENT')) navigate('/student');
      else if (user.roles.includes('PARENT')) navigate('/parent');
      else if (user.roles.includes('INSTRUCTOR')) navigate('/instructor');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid Academy ID or password.');
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
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
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
          Student & Member Login
        </Typography>
        <Typography variant="body1" sx={{ mb: '3rem', opacity: 0.85 }}>
          For students, parents, and instructors. Log in with your Academy ID — provided by your academy admin.
        </Typography>
        <Stack spacing={1.5}>
          {roleInfo.map((item) => (
            <Stack key={item.label} direction="row" alignItems="center" spacing={1.5}>
              {item.icon}
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {item.label}
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
            Member Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
            For students, parents, and instructors. Enter your Academy ID and password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Academy ID"
                type="text"
                placeholder="e.g. 26001001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                fullWidth
                autoComplete="username"
                autoFocus
                helperText="Your unique Academy ID (e.g. 26001001)"
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
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '2rem', textAlign: 'center' }}>
            Academy admin?{' '}
            <Button
              variant="text"
              size="small"
              sx={{ p: 0, minWidth: 0, textDecoration: 'underline' }}
              onClick={() => navigate('/academy-login')}
            >
              Admin login
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
