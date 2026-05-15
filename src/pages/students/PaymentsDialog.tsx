import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, IconButton, TextField, MenuItem,
  Paper, Chip, Alert, Divider, Tooltip,
} from '@mui/material';
import { Plus, Trash2, Circle } from 'lucide-react';
import { getPayments, createPayment, deletePayment } from '../../api/payments.api';
import { getEnrollmentBalance } from '../../api/studentPrograms.api';
import type { Payment, CreatePaymentDto, PaymentType, EnrollmentBalance, MonthlyPeriod, UUID } from '../../api/types';
import dayjs from 'dayjs';

const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER', 'OTHER'];
const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
];

interface PaymentFormState {
  amount: string;
  paidAt: string;
  method: string;
  note: string;
  type: PaymentType;
}

const emptyForm = (): PaymentFormState => ({
  amount: '',
  paidAt: dayjs().format('YYYY-MM-DD'),
  method: 'CASH',
  note: '',
  type: 'PAYMENT',
});

interface Props {
  open: boolean;
  onClose: () => void;
  studentProgramId: UUID;
  enrollmentLabel: string;
}

export default function PaymentsDialog({ open, onClose, studentProgramId, enrollmentLabel }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<EnrollmentBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingPayment, setAddingPayment] = useState(false);
  const [form, setForm] = useState<PaymentFormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([
        getPayments(studentProgramId),
        getEnrollmentBalance(studentProgramId),
      ]);
      setPayments(p);
      setBalance(b);
    } finally {
      setLoading(false);
    }
  }, [studentProgramId]);

  useEffect(() => { if (open) { load(); setAddingPayment(false); setForm(emptyForm()); } }, [open, load]);

  const handleAddPayment = async () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError('Valid amount required.'); return;
    }
    if (!form.paidAt) { setFormError('Date required.'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const dto: CreatePaymentDto = {
        studentProgramId,
        amount: Number(form.amount),
        paidAt: new Date(form.paidAt).toISOString(),
        method: form.method || undefined,
        note: form.note.trim() || undefined,
        type: form.type,
      };
      await createPayment(dto);
      setAddingPayment(false);
      setForm(emptyForm());
      load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: UUID) => {
    if (!window.confirm('Delete this payment record?')) return;
    try { await deletePayment(id); load(); } catch { alert('Failed to delete.'); }
  };

  const balanceColor = balance
    ? balance.balance < 0 ? 'success.main' : balance.balance === 0 ? 'text.secondary' : 'error.main'
    : 'text.secondary';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight={700}>Payments</Typography>
          <Typography variant="caption" color="text.secondary">{enrollmentLabel}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '1rem !important' }}>
        {loading ? <Typography>Loading…</Typography> : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Balance summary */}
            {balance && (
              <Paper variant="outlined" sx={{ p: '0.75rem 1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total Expected</Typography>
                  <Typography fontWeight={700}>${(balance.totalExpected ?? balance.finalPrice ?? 0).toFixed(2)}</Typography>
                </Box>
                {balance.monthlySchedule && balance.monthlySchedule.length > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Monthly</Typography>
                    <Typography fontWeight={700}>${(balance.finalPrice ?? 0).toFixed(2)}</Typography>
                  </Box>
                )}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Paid</Typography>
                  <Typography fontWeight={700} color="success.main">${(balance.totalPaid ?? 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{(balance.balance ?? 0) < 0 ? 'Credit' : 'Balance'}</Typography>
                  <Typography fontWeight={700} color={balanceColor}>
                    ${Math.abs(balance.balance ?? 0).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Monthly schedule */}
            {balance?.monthlySchedule && balance.monthlySchedule.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Monthly Schedule
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', mt: '0.5rem' }}>
                  {balance.monthlySchedule.map((period: MonthlyPeriod, i: number) => {
                    const cumulativeDue = (i + 1) * period.amount;
                    const isPaid = balance.totalPaid >= cumulativeDue - 0.01;
                    const isPast = new Date(period.dueDate) < new Date();
                    const status = isPaid ? 'paid' : isPast ? 'overdue' : 'upcoming';
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Circle
                          size={8}
                          fill={status === 'paid' ? '#4caf50' : status === 'overdue' ? '#ff9800' : '#9e9e9e'}
                          color={status === 'paid' ? '#4caf50' : status === 'overdue' ? '#ff9800' : '#9e9e9e'}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>{period.label}</Typography>
                        <Typography variant="body2" fontWeight={600}>${period.amount.toFixed(2)}</Typography>
                        <Chip
                          label={status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Upcoming'}
                          size="small"
                          color={status === 'paid' ? 'success' : status === 'overdue' ? 'warning' : 'default'}
                          variant="outlined"
                          sx={{ minWidth: 72 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Add payment form */}
            {addingPayment ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', p: '0.75rem', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {formError && <Alert severity="error" sx={{ py: 0 }}>{formError}</Alert>}
                <Box sx={{ display: 'flex', gap: '0.75rem' }}>
                  <TextField label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} size="small" sx={{ flex: 1 }} inputProps={{ min: 0.01, step: 0.01 }} />
                  <TextField label="Date" type="date" value={form.paidAt} onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))} size="small" sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
                </Box>
                <Box sx={{ display: 'flex', gap: '0.75rem' }}>
                  <TextField select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PaymentType }))} size="small" sx={{ flex: 1 }}>
                    {PAYMENT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </TextField>
                  <TextField select label="Method" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} size="small" sx={{ flex: 1 }}>
                    {PAYMENT_METHODS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Box>
                <TextField label="Note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} size="small" fullWidth />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button size="small" onClick={() => setAddingPayment(false)}>Cancel</Button>
                  <Button size="small" variant="contained" onClick={handleAddPayment} disabled={submitting}>
                    {submitting ? 'Saving…' : 'Record Payment'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button startIcon={<Plus size={14} />} variant="outlined" size="small" onClick={() => { setAddingPayment(true); setFormError(''); setForm(emptyForm()); }}>
                Record Payment
              </Button>
            )}

            {/* Payment list */}
            {payments.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No payments recorded yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {payments.map((p) => (
                  <Paper key={p.id} variant="outlined" sx={{ p: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {p.type === 'REFUND' ? '-' : '+'}${p.amount.toFixed(2)}
                        </Typography>
                        <Chip label={p.type} size="small" color={p.type === 'REFUND' ? 'error' : p.type === 'ADJUSTMENT' ? 'warning' : 'success'} variant="outlined" />
                        {p.method && <Chip label={p.method} size="small" variant="outlined" />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(p.paidAt).format('MMM D, YYYY')}
                        {p.note ? ` — ${p.note}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete payment">
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={13} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: '1.5rem', pb: '1rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
