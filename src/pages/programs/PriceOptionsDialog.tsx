import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, TextField,
  MenuItem, Chip, Divider, Switch, FormControlLabel,
  Alert, Tooltip, Paper,
} from '@mui/material';
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { getPriceOptions, createPriceOption, updatePriceOption, deletePriceOption } from '../../api/priceOptions.api';
import { getDiscounts } from '../../api/discounts.api';
import { getDiscountOverrides, createDiscountOverride, updateDiscountOverride, deleteDiscountOverride } from '../../api/discountOverrides.api';
import type {
  PriceOption, Discount, DiscountOverride,
  PriceKind, MonthlyBillingMode, UUID,
} from '../../api/types';

const PRICE_KINDS: { value: PriceKind; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'FULL_PROGRAM', label: 'Full Program' },
  { value: 'CUSTOM', label: 'Custom' },
];

interface PriceFormState {
  name: string;
  amount: string;
  kind: PriceKind;
  billingMode: '' | MonthlyBillingMode;
  description: string;
  isDefault: boolean;
}

const emptyPriceForm = (): PriceFormState => ({
  name: '',
  amount: '',
  kind: 'CUSTOM',
  billingMode: '',
  description: '',
  isDefault: false,
});

interface Props {
  open: boolean;
  onClose: () => void;
  programLocationId: UUID;
  locationName: string;
}

export default function PriceOptionsDialog({ open, onClose, programLocationId, locationName }: Props) {
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [overrides, setOverrides] = useState<DiscountOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [addingPrice, setAddingPrice] = useState(false);
  const [priceForm, setPriceForm] = useState<PriceFormState>(emptyPriceForm());
  const [priceError, setPriceError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [opts, disc, ovr] = await Promise.all([
        getPriceOptions(programLocationId),
        getDiscounts(),
        getDiscountOverrides(programLocationId),
      ]);
      setPriceOptions(opts);
      setDiscounts(disc);
      setOverrides(ovr);
    } finally {
      setLoading(false);
    }
  }, [programLocationId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  // ─── Price Options ────────────────────────────────────────────────────────────

  const startAddPrice = () => {
    setAddingPrice(true);
    setEditingPriceId(null);
    setPriceForm(emptyPriceForm());
    setPriceError('');
  };

  const startEditPrice = (opt: PriceOption) => {
    setEditingPriceId(opt.id);
    setAddingPrice(false);
    setPriceForm({
      name: opt.name,
      amount: String(opt.amount),
      kind: opt.kind,
      billingMode: opt.billingMode ?? '',
      description: opt.description ?? '',
      isDefault: opt.isDefault,
    });
    setPriceError('');
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setAddingPrice(false);
    setPriceError('');
  };

  const validatePriceForm = (): boolean => {
    if (!priceForm.name.trim()) { setPriceError('Name required.'); return false; }
    if (!priceForm.amount || isNaN(Number(priceForm.amount))) { setPriceError('Valid amount required.'); return false; }
    if (priceForm.kind === 'MONTHLY' && !priceForm.billingMode) {
      setPriceError('Billing mode required for Monthly type.'); return false;
    }
    return true;
  };

  const handleSavePrice = async () => {
    if (!validatePriceForm()) return;
    const data = {
      name: priceForm.name.trim(),
      amount: Number(priceForm.amount),
      kind: priceForm.kind,
      billingMode: priceForm.kind === 'MONTHLY' && priceForm.billingMode ? priceForm.billingMode : undefined,
      description: priceForm.description.trim() || undefined,
      isDefault: priceForm.isDefault,
    };
    try {
      if (addingPrice) {
        await createPriceOption({ ...data, programLocationId });
      } else if (editingPriceId) {
        await updatePriceOption(editingPriceId, data);
      }
      cancelPriceEdit();
      load();
    } catch (e: any) {
      setPriceError(e?.response?.data?.message ?? 'Failed to save.');
    }
  };

  const handleDeletePrice = async (id: UUID) => {
    if (!window.confirm('Delete this price option?')) return;
    try { await deletePriceOption(id); load(); } catch { alert('Failed to delete.'); }
  };

  // ─── Discount Overrides ───────────────────────────────────────────────────────

  const handleAddDiscount = async (discountId: UUID) => {
    try {
      await createDiscountOverride({ discountId, programLocationId, isEnabled: true });
      load();
    } catch { alert('Failed to add discount.'); }
  };

  const handleToggleOverride = async (override: DiscountOverride) => {
    try {
      await updateDiscountOverride(override.id, { isEnabled: !override.isEnabled });
      load();
    } catch { alert('Failed to update.'); }
  };

  const handleRemoveOverride = async (id: UUID) => {
    if (!window.confirm('Remove this discount from location?')) return;
    try { await deleteDiscountOverride(id); load(); } catch { alert('Failed to remove.'); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const priceFormJSX = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', mt: '0.5rem', p: '0.75rem', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      {priceError && <Alert severity="error" sx={{ py: 0 }}>{priceError}</Alert>}
      <Box sx={{ display: 'flex', gap: '0.75rem' }}>
        <TextField label="Name" value={priceForm.name} onChange={(e) => setPriceForm((f) => ({ ...f, name: e.target.value }))} size="small" sx={{ flex: 2 }} placeholder="e.g. Monthly" />
        <TextField label="Amount ($)" type="number" value={priceForm.amount} onChange={(e) => setPriceForm((f) => ({ ...f, amount: e.target.value }))} size="small" sx={{ flex: 1 }} inputProps={{ min: 0 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: '0.75rem' }}>
        <TextField select label="Kind" value={priceForm.kind} onChange={(e) => setPriceForm((f) => ({ ...f, kind: e.target.value as PriceKind, billingMode: '' }))} size="small" sx={{ flex: 1 }}>
          {PRICE_KINDS.map((k) => <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>)}
        </TextField>
        {priceForm.kind === 'MONTHLY' && (
          <TextField select label="Billing Mode" value={priceForm.billingMode} onChange={(e) => setPriceForm((f) => ({ ...f, billingMode: e.target.value as MonthlyBillingMode }))} size="small" sx={{ flex: 1 }}>
            <MenuItem value="MONTH_BASED">Calendar Month</MenuItem>
            <MenuItem value="DATE_BASED">Enrollment Day</MenuItem>
          </TextField>
        )}
      </Box>
      <TextField label="Description" value={priceForm.description} onChange={(e) => setPriceForm((f) => ({ ...f, description: e.target.value }))} size="small" fullWidth />
      <FormControlLabel
        control={<Switch checked={priceForm.isDefault} onChange={(e) => setPriceForm((f) => ({ ...f, isDefault: e.target.checked }))} size="small" />}
        label={<Typography variant="caption">Set as default</Typography>}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <IconButton size="small" onClick={cancelPriceEdit}><X size={15} /></IconButton>
        <IconButton size="small" color="primary" onClick={handleSavePrice}><Check size={15} /></IconButton>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight={700}>Pricing & Discounts</Typography>
          <Typography variant="caption" color="text.secondary">{locationName}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', pt: '1rem !important' }}>
        {loading ? <Typography>Loading…</Typography> : (
          <>
            {/* Price Options */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '0.5rem' }}>
                <Typography variant="subtitle2" fontWeight={700}>Price Options</Typography>
                {!addingPrice && <Button size="small" startIcon={<Plus size={14} />} onClick={startAddPrice}>Add</Button>}
              </Box>
              {priceOptions.length === 0 && !addingPrice && (
                <Typography variant="caption" color="text.secondary">No price options. Add one to enable enrollment pricing.</Typography>
              )}
              {priceOptions.map((opt) => (
                <Box key={opt.id}>
                  {editingPriceId === opt.id ? (
                    priceFormJSX
                  ) : (
                    <Paper variant="outlined" sx={{ p: '0.5rem 0.75rem', mb: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Typography variant="body2" fontWeight={600}>{opt.name}</Typography>
                          {opt.isDefault && <Chip label="default" size="small" color="primary" variant="outlined" />}
                          <Chip label={opt.kind} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          ${opt.amount}
                          {opt.kind === 'MONTHLY' && opt.billingMode ? ` · ${opt.billingMode === 'MONTH_BASED' ? 'Calendar Month' : 'Enrollment Day'}` : ''}
                          {opt.description ? ` — ${opt.description}` : ''}
                        </Typography>
                      </Box>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => startEditPrice(opt)}><Pencil size={13} /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeletePrice(opt.id)}><Trash2 size={13} /></IconButton></Tooltip>
                    </Paper>
                  )}
                </Box>
              ))}
              {addingPrice && priceFormJSX}
            </Box>

            <Divider />

            {/* Discount Overrides */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: '0.5rem' }}>Allowed Discounts</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: '0.75rem' }}>
                Select academy discounts that can be applied to enrollments at this location. Toggle to enable/disable.
              </Typography>
              {discounts.length === 0 ? (
                <Typography variant="caption" color="text.secondary">No academy discounts defined yet. Go to Discounts page to create.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {discounts.map((d) => {
                    const override = overrides.find((o) => o.discountId === d.id);
                    const added = !!override;
                    return (
                      <Paper variant="outlined" key={d.id} sx={{ p: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                            <Chip
                              label={d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}
                              size="small" variant="outlined"
                            />
                            {override?.valueOverride !== null && override?.valueOverride !== undefined && (
                              <Chip label={`override: ${override.typeOverride === 'PERCENTAGE' ? `${override.valueOverride}%` : `$${override.valueOverride}`}`} size="small" color="warning" variant="outlined" />
                            )}
                          </Box>
                          {d.description && <Typography variant="caption" color="text.secondary">{d.description}</Typography>}
                        </Box>
                        {added ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FormControlLabel
                              control={<Switch checked={override!.isEnabled} onChange={() => handleToggleOverride(override!)} size="small" />}
                              label={<Typography variant="caption">{override!.isEnabled ? 'Enabled' : 'Disabled'}</Typography>}
                              sx={{ mr: 0 }}
                            />
                            <Tooltip title="Remove from location">
                              <IconButton size="small" color="error" onClick={() => handleRemoveOverride(override!.id)}>
                                <X size={13} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Button size="small" variant="outlined" onClick={() => handleAddDiscount(d.id)}>Add</Button>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: '1.5rem', pb: '1rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
