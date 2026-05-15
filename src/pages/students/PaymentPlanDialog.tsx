import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, IconButton, Paper, Chip, Collapse, Divider, CircularProgress,
} from '@mui/material';
import { Calendar, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { getStudentPaymentPlan } from '../../api/payments.api';
import type { PaymentPlan, PaymentPlanMonth, UUID } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: UUID;
  studentName: string;
}

const statusColor = (s: PaymentPlanMonth['status']): 'success' | 'warning' | 'error' | 'default' => {
  if (s === 'paid') return 'success';
  if (s === 'partial') return 'warning';
  if (s === 'overdue') return 'error';
  return 'default';
};

const statusLabel = (s: PaymentPlanMonth['status']): string => {
  if (s === 'paid') return 'Paid';
  if (s === 'partial') return 'Partial';
  if (s === 'overdue') return 'Overdue';
  return 'Upcoming';
};

const StatBox = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box sx={{ flex: '1 1 130px', textAlign: 'center', p: '0.5rem' }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography fontWeight={700} color={color} sx={{ fontSize: '1.05rem' }}>{value}</Typography>
  </Box>
);

const MonthRow = ({ month }: { month: PaymentPlanMonth }) => {
  const [open, setOpen] = useState(false);
  const outstanding = Math.max(0, month.totalDue - month.totalPaid);

  return (
    <Paper variant="outlined" sx={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', p: '0.625rem 0.875rem', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        onClick={() => setOpen((v) => !v)}
      >
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>{month.label}</Typography>
        <Box sx={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'right', minWidth: 80 }}>
            <Typography variant="caption" color="text.secondary" display="block">Due</Typography>
            <Typography variant="body2" fontWeight={600}>${month.totalDue.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 80 }}>
            <Typography variant="caption" color="text.secondary" display="block">Paid</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">${month.totalPaid.toFixed(2)}</Typography>
          </Box>
          {outstanding > 0 && (
            <Box sx={{ textAlign: 'right', minWidth: 80 }}>
              <Typography variant="caption" color="text.secondary" display="block">Outstanding</Typography>
              <Typography variant="body2" fontWeight={600} color="warning.main">${outstanding.toFixed(2)}</Typography>
            </Box>
          )}
          <Chip
            label={statusLabel(month.status)}
            size="small"
            color={statusColor(month.status)}
            variant={month.status === 'paid' ? 'filled' : 'outlined'}
            sx={{ minWidth: 84 }}
          />
        </Box>
        <IconButton size="small">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</IconButton>
      </Box>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: '0.5rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {month.lines.map((l, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {l.paid ? <Check size={14} color="#4caf50" /> : <X size={14} color="#9e9e9e" />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ opacity: l.isActive ? 1 : 0.6 }}>
                  {l.programName}
                  {!l.isActive && ' (inactive)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">{l.locationName}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ textDecoration: l.paid ? 'none' : 'none' }}>
                ${l.amount.toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default function PaymentPlanDialog({ open, onClose, studentId, studentName }: Props) {
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudentPaymentPlan(studentId);
      setPlan(data);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Calendar size={20} />
          <Box>
            <Typography variant="h6" fontWeight={700}>Payment Plan</Typography>
            <Typography variant="caption" color="text.secondary">{studentName}</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '1rem !important' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : !plan || plan.months.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No payment schedule. Student has no priced enrollments.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Paper variant="outlined" sx={{ p: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="Total Expected" value={`$${plan.totalExpected.toFixed(2)}`} />
              <StatBox label="Total Paid" value={`$${plan.totalPaid.toFixed(2)}`} color="success.main" />
              <StatBox
                label={plan.balance < 0 ? 'Credit' : 'Balance'}
                value={`$${Math.abs(plan.balance).toFixed(2)}`}
                color={plan.balance < 0 ? 'success.main' : plan.balance > 0 ? 'warning.main' : undefined}
              />
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {plan.months.map((m) => <MonthRow key={m.monthKey} month={m} />)}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: '1.5rem', pb: '1rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
