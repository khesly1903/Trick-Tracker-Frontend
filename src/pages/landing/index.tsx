import { Box, Button, Container, Typography, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const features = [
  'Track student skill progression in real time',
  'Manage classes, programs, and schedules',
  'Assign instructors to program locations',
  'Monitor attendance across all sessions',
  'Enroll students and track contacts',
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Nav */}
      <Box
        component="nav"
        sx={{
          px: '2rem',
          py: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SportsGymnasticsIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            TrickTracker
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button variant="contained" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </Stack>
      </Box>

      {/* Hero */}
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: '5rem' }}>
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Chip label="Sports Academy Management" size="small" color="primary" sx={{ mb: '1.5rem' }} />
          <Typography variant="h1" sx={{ mb: '1rem', lineHeight: 1.2 }}>
            The smarter way to run your gymnastics academy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: '2.5rem', maxWidth: '36rem', mx: 'auto' }}>
            TrickTracker helps academy admins manage students, instructors, programs, and skill progression — all in one place.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: '4rem' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
              Log In
            </Button>
          </Stack>

          {/* Features */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '0.75rem',
              p: '2rem',
              textAlign: 'left',
            }}
          >
            <Typography variant="h5" sx={{ mb: '1.25rem' }}>
              Everything you need
            </Typography>
            <Stack spacing={1}>
              {features.map((f) => (
                <Stack key={f} direction="row" alignItems="center" spacing={1.5}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  <Typography variant="body1">{f}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Pricing placeholder */}
          <Box sx={{ mt: '3rem' }}>
            <Typography variant="h5" sx={{ mb: '1.5rem' }}>
              Pricing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Contact us for pricing information tailored to your academy size.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ py: '1.5rem', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} TrickTracker. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
