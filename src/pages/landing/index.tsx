import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';

const features = [
  'Track student skill progression in real time',
  'Manage classes, programs, and schedules',
  'Assign instructors to program locations',
  'Monitor attendance across all sessions',
  'Enroll students and track contacts',
];

type PlanKey = 'basic' | 'advanced' | 'accountment' | 'pro';

interface PlanFeature {
  label: string;
  basic: boolean;
  advanced: boolean;
  accountment: boolean;
  pro: boolean;
}

const planFeatures: PlanFeature[] = [
  { label: 'Student enrollment & contact tracking', basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Class & program management',            basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Instructor assignment',                 basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Attendance tracking',                   basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Scheduling & session management',       basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Basic skill / trick tracking',          basic: true,  advanced: true,  accountment: true,  pro: true  },
  { label: 'Academy-custom skill tree system',      basic: false, advanced: true,  accountment: false, pro: true  },
  { label: 'Tree graph visualization',              basic: false, advanced: true,  accountment: false, pro: true  },
  { label: 'Advanced progression analytics',        basic: false, advanced: true,  accountment: false, pro: true  },
  { label: 'Financial management',                  basic: false, advanced: false, accountment: true,  pro: true  },
  { label: 'Payment tracking',                      basic: false, advanced: false, accountment: true,  pro: true  },
  { label: 'Rent & plan billing',                   basic: false, advanced: false, accountment: true,  pro: true  },
];

const plans: { key: PlanKey; label: string; sub: string }[] = [
  { key: 'basic',       label: 'Basic',       sub: 'Core operations'               },
  { key: 'advanced',    label: 'Advanced',    sub: '+ Custom skill tracking'        },
  { key: 'accountment', label: 'Accountment', sub: '+ Financial management'         },
  { key: 'pro',         label: 'Pro',         sub: 'Advanced + Accountment'         },
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
          <Button variant="outlined" startIcon={<BadgeIcon />} onClick={() => navigate('/user-login')}>
            Member Login
          </Button>
          <Button variant="outlined" startIcon={<AdminPanelSettingsIcon />} onClick={() => navigate('/academy-login')}>
            Admin Login
          </Button>
          <Button variant="contained" onClick={() => navigate('/academy-signup')}>
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
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: '4rem', gap: 1 }}>
            <Button variant="contained" size="large" onClick={() => navigate('/academy-signup')}>
              Get Started — Academy Admin
            </Button>
            <Button variant="outlined" size="large" startIcon={<BadgeIcon />} onClick={() => navigate('/user-login')}>
              Member Portal
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

          {/* Plans table */}
          <Box sx={{ mt: '4rem' }}>
            <Typography variant="h5" sx={{ mb: '0.5rem' }}>
              Plans
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: '2rem' }}>
              Contact us for pricing tailored to your academy.
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 700, width: '34%' }}>
                      Feature
                    </TableCell>
                    {plans.map((p) => (
                      <TableCell
                        key={p.key}
                        align="center"
                        sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                      >
                        <Typography variant="body1" fontWeight={700} lineHeight={1.2}>
                          {p.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {p.sub}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planFeatures.map((row, i) => (
                    <TableRow
                      key={row.label}
                      sx={{ bgcolor: i % 2 === 0 ? 'background.paper' : 'action.hover' }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{row.label}</TableCell>
                      {plans.map((p) => (
                        <TableCell key={p.key} align="center">
                          {row[p.key] ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : (
                            <CloseIcon color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
