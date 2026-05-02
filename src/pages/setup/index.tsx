import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setupAcademy } from '../../api/academy.api';
import * as authApi from '../../api/auth.api';
import { getStoredRefreshToken } from '../../context/AuthContext';

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('tt_access_token', accessToken);
  localStorage.setItem('tt_refresh_token', refreshToken);
}

const features = [
  { icon: <SchoolIcon fontSize="small" />, text: 'Manage students, instructors & classes' },
  { icon: <LocationOnIcon fontSize="small" />, text: 'Set up locations and program schedules' },
  { icon: <PhoneIcon fontSize="small" />, text: 'Track attendance and skill progress' },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setupAcademy({ name, description: description || undefined, phone: phone || undefined, address: address || undefined });

      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        const res = await authApi.refresh(refreshToken);
        storeTokens(res.accessToken, res.refreshToken);
      }

      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setError('You already have an academy. Redirecting…');
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to set up academy. Please try again.');
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
          Set Up Your Academy
        </Typography>
        <Typography variant="body1" sx={{ mb: '2.5rem', opacity: 0.85 }}>
          Almost there! Tell us about your academy to get started managing your operations.
        </Typography>
        <Stack spacing={2}>
          {features.map((f) => (
            <Stack key={f.text} direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ opacity: 0.9 }}>{f.icon}</Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {f.text}
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
        <Box sx={{ width: '100%', maxWidth: '24rem' }}>
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
            Academy Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
            Configure your academy to unlock the dashboard.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Academy Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                helperText="Optional — tell students what your academy is about."
              />
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
              <TextField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Setting up…' : 'Set Up Academy'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
