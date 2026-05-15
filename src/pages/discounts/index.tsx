import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, IconButton, Tooltip, Chip, useTheme, Collapse,
} from '@mui/material';
import { Plus, Pencil, Trash2, TrendingUp, ChevronDown, ChevronUp, Tag, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Legend,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import { getAllPrograms } from '../../api/programs.api';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../api/discounts.api';
import { getAccountingTimeline, getAccountingByLocation } from '../../api/accounting.api';
import type { Program, Discount, CreateDiscountDto, DiscountType, AccountingTimeline, AccountingLocationSummary } from '../../api/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const calcNet = (gross: number, enrolled: number, overrides: any[]): number => {
  let deduction = 0;
  for (const o of overrides ?? []) {
    if (!o.isEnabled) continue;
    const type = o.typeOverride ?? o.discount?.type;
    const value = o.valueOverride ?? o.discount?.value ?? 0;
    if (type === 'PERCENTAGE') deduction += gross * (value / 100);
    else deduction += enrolled * value;
  }
  return Math.max(0, gross - deduction);
};

const getLocationStats = (pl: any) => {
  const enrolled: number = pl._count?.studentPrograms ?? 0;
  const opts: any[] = pl.priceOptions ?? [];
  const def = opts.find((o: any) => o.isDefault) ?? opts[0];
  const gross = def ? enrolled * def.amount : 0;
  const net = def ? calcNet(gross, enrolled, pl.discountOverrides ?? []) : 0;
  return { enrolled, gross, net, hasPrice: !!def };
};

const getProgramStats = (p: any) => {
  const locs: any[] = p.programLocations ?? [];
  return locs.reduce(
    (acc, pl) => {
      const s = getLocationStats(pl);
      return { enrolled: acc.enrolled + s.enrolled, gross: acc.gross + s.gross, net: acc.net + s.net };
    },
    { enrolled: 0, gross: 0, net: 0 },
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color }: any) => (
  <Paper variant="outlined" sx={{ p: '1rem 1.25rem', borderRadius: '0.75rem', flex: '1 1 140px', minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} color={color ?? 'text.primary'} sx={{ mt: 0.25 }}>
      {value}
    </Typography>
    {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
  </Paper>
);

// ─── Program Row ──────────────────────────────────────────────────────────────

const ProgramRow = ({ program }: { program: any }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const stats = getProgramStats(program);
  const locs: any[] = program.programLocations ?? [];

  const locChartData = locs.map((pl) => {
    const s = getLocationStats(pl);
    return { name: pl.location?.name ?? 'Location', Gross: s.gross, Net: s.net, Enrolled: s.enrolled };
  });

  return (
    <Paper variant="outlined" sx={{ borderRadius: '0.75rem', overflow: 'hidden', mb: '0.75rem' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '1rem', p: '1rem 1.25rem', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        onClick={() => setOpen((v) => !v)}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>{program.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {locs.length} location{locs.length !== 1 ? 's' : ''} · {stats.enrolled} enrolled
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '2rem', mr: '0.5rem' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Gross</Typography>
            <Typography variant="body2" fontWeight={600}>{fmt(stats.gross)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Net</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{fmt(stats.net)}</Typography>
          </Box>
        </Box>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Box>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: '1rem 1.25rem' }}>
          {locs.length === 0 && (
            <Typography variant="caption" color="text.secondary">No locations.</Typography>
          )}

          {locs.length > 0 && (
            <Box sx={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Location stat cards */}
              <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {locs.map((pl) => {
                  const s = getLocationStats(pl);
                  return (
                    <Paper key={pl.id} variant="outlined" sx={{ p: '0.75rem 1rem', borderRadius: '0.5rem' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                        {pl.location?.name ?? pl.locationId}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Enrolled</Typography>
                          <Typography variant="body2" fontWeight={600}>{s.enrolled}/{pl.capacity}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Gross</Typography>
                          <Typography variant="body2" fontWeight={600}>{s.hasPrice ? fmt(s.gross) : '—'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Net</Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">{s.hasPrice ? fmt(s.net) : '—'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {/* Location bar chart */}
              {locs.length > 1 && (
                <Box sx={{ flex: '1 1 280px', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height={locs.length * 48 + 40}>
                    <BarChart data={locChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={80} />
                      <RTooltip
                        formatter={(v: any) => fmt(v)}
                        contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Gross" fill={theme.palette.primary.main} radius={[0, 3, 3, 0]} maxBarSize={20} />
                      <Bar dataKey="Net" fill={theme.palette.success.main} radius={[0, 3, 3, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ─── Location Revenue Donut ───────────────────────────────────────────────────

const LocationRevenueDonut = ({ locations }: { locations: AccountingLocationSummary[] }) => {
  const theme = useTheme();
  const palette = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
  ];

  const data = locations.filter((l) => l.revenue > 0 || l.expected > 0);
  if (data.length === 0) return null;

  const totalRevenue = data.reduce((s, l) => s + l.revenue, 0);
  const totalExpected = data.reduce((s, l) => s + l.expected, 0);

  return (
    <Paper variant="outlined" sx={{ p: '1.25rem', borderRadius: '0.75rem', mb: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Box sx={{ flex: '1 1 320px', minWidth: 280, position: 'relative' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '0.5rem' }}>
          Revenue Distribution
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
                stroke={theme.palette.background.paper}
              >
                {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <RTooltip
                formatter={(v: any) => fmt(v)}
                contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{fmt(totalRevenue)}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: '1 1 240px', minWidth: 220 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '0.75rem' }}>
          Breakdown
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((l, i) => {
            const pctRev = totalRevenue > 0 ? Math.round((l.revenue / totalRevenue) * 100) : 0;
            const pctExp = totalExpected > 0 ? Math.round((l.expected / totalExpected) * 100) : 0;
            return (
              <Box key={l.id} sx={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: palette[i % palette.length], flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{l.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmt(l.revenue)} ({pctRev}%) · exp {fmt(l.expected)} ({pctExp}%)
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

// ─── Location Row ─────────────────────────────────────────────────────────────

const LocationRow = ({ loc }: { loc: AccountingLocationSummary }) => {
  const [open, setOpen] = useState(false);
  const outstanding = Math.max(0, loc.expected - loc.revenue);
  const pct = loc.expected > 0 ? Math.round((loc.revenue / loc.expected) * 100) : 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: '0.75rem', overflow: 'hidden', mb: '0.75rem' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '1rem', p: '1rem 1.25rem', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        onClick={() => setOpen((v) => !v)}
      >
        <MapPin size={16} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>{loc.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {loc.programs.length} program{loc.programs.length !== 1 ? 's' : ''} · {loc.enrolled} enrolled · {pct}% collected
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '2rem', mr: '0.5rem' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Expected</Typography>
            <Typography variant="body2" fontWeight={600}>{fmt(loc.expected)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Revenue</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{fmt(loc.revenue)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Outstanding</Typography>
            <Typography variant="body2" fontWeight={600} color={outstanding > 0 ? 'warning.main' : 'text.secondary'}>{fmt(outstanding)}</Typography>
          </Box>
        </Box>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Box>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: '0.75rem 1.25rem' }}>
          {loc.programs.length === 0 ? (
            <Typography variant="caption" color="text.secondary">No programs at this location.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {loc.programs.map((p) => {
                const pOut = Math.max(0, p.expected - p.revenue);
                const pPct = p.expected > 0 ? Math.round((p.revenue / p.expected) * 100) : 0;
                return (
                  <Paper key={p.id} variant="outlined" sx={{ p: '0.5rem 0.875rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.enrolled} enrolled · {pPct}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '1.25rem' }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Expected</Typography>
                        <Typography variant="body2" fontWeight={600}>{fmt(p.expected)}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Revenue</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">{fmt(p.revenue)}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Out.</Typography>
                        <Typography variant="body2" fontWeight={600} color={pOut > 0 ? 'warning.main' : 'text.secondary'}>{fmt(pOut)}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ─── Discount CRUD ────────────────────────────────────────────────────────────

const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
  { value: 'FLAT', label: 'Flat Amount ($)' },
];

interface DiscountFormState { name: string; value: string; type: DiscountType; description: string; }
const emptyForm = (): DiscountFormState => ({ name: '', value: '', type: 'PERCENTAGE', description: '' });

const DiscountManager = ({ discounts, onRefresh }: { discounts: Discount[]; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState<DiscountFormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setError(''); setDialogOpen(true); };
  const openEdit = (d: Discount) => { setEditing(d); setForm({ name: d.name, value: String(d.value), type: d.type, description: d.description ?? '' }); setError(''); setDialogOpen(true); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.value) { setError('Name and value required.'); return; }
    const val = Number(form.value);
    if (isNaN(val) || val < 0) { setError('Value must be ≥ 0.'); return; }
    setSubmitting(true); setError('');
    try {
      const dto: CreateDiscountDto = { name: form.name.trim(), value: val, type: form.type, description: form.description.trim() || undefined };
      editing ? await updateDiscount(editing.id, dto) : await createDiscount(dto);
      setDialogOpen(false);
      onRefresh();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (d: Discount) => {
    if (!window.confirm(`Delete "${d.name}"?`)) return;
    try { await deleteDiscount(d.id); onRefresh(); } catch { alert('Failed to delete.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '0.75rem', cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={15} />
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Manage Discounts ({discounts.length})
          </Typography>
        </Box>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '0.75rem' }}>
          <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={openCreate}>New Discount</Button>
        </Box>
        {discounts.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No discounts defined.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {discounts.map((d) => (
              <Paper key={d.id} variant="outlined" sx={{ p: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                    <Chip label={d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`} size="small" variant="outlined" color="primary" />
                  </Box>
                  {d.description && <Typography variant="caption" color="text.secondary">{d.description}</Typography>}
                </Box>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(d)}><Pencil size={13} /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(d)}><Trash2 size={13} /></IconButton></Tooltip>
              </Paper>
            ))}
          </Box>
        )}
      </Collapse>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Discount' : 'New Discount'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', pt: '1rem !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <TextField select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DiscountType }))} sx={{ flex: 1 }}>
              {DISCOUNT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField label={form.type === 'PERCENTAGE' ? 'Value (%)' : 'Value ($)'} type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} sx={{ flex: 1 }} inputProps={{ min: 0 }} />
          </Box>
          <TextField label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: '1.5rem', pb: '1rem' }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const theme = useTheme();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [timeline, setTimeline] = useState<AccountingTimeline | null>(null);
  const [byLocation, setByLocation] = useState<AccountingLocationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [progs, discs, tl, locs] = await Promise.all([
        getAllPrograms(),
        getDiscounts(),
        getAccountingTimeline().catch(() => null),
        getAccountingByLocation().catch(() => []),
      ]);
      setPrograms(progs);
      setDiscounts(discs);
      setTimeline(tl);
      setByLocation(locs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activePrograms = programs.filter((p) => (p as any).isActive !== false);

  const totalEnrolled = activePrograms.reduce((s, p) => s + getProgramStats(p).enrolled, 0);
  const totalGross = activePrograms.reduce((s, p) => s + getProgramStats(p).gross, 0);
  const totalNet = activePrograms.reduce((s, p) => s + getProgramStats(p).net, 0);

  const programChartData = activePrograms.map((p) => {
    const s = getProgramStats(p);
    return { name: p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name, Gross: s.gross, Net: s.net };
  });

  return (
    <Box sx={{ p: '1.5rem', maxWidth: '1100px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '1.5rem' }}>
        <TrendingUp size={20} />
        <Typography variant="h5" fontWeight={700}>Accounting</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>(estimated · based on enrollments)</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Timeline summary */}
          {timeline && (
            <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', mb: '1.5rem' }}>
              <StatCard label="Total Expected" value={fmt(timeline.totals.expected)} sub="all months" />
              <StatCard label="Total Revenue" value={fmt(timeline.totals.revenue)} sub="payments received" color="success.main" />
              <StatCard
                label="Outstanding"
                value={fmt(Math.max(0, timeline.totals.expected - timeline.totals.revenue))}
                sub="expected − revenue"
                color="warning.main"
              />
              <StatCard
                label="Collection Rate"
                value={timeline.totals.expected > 0
                  ? `${Math.round((timeline.totals.revenue / timeline.totals.expected) * 100)}%`
                  : '—'}
                sub="revenue / expected"
              />
            </Box>
          )}

          {/* Timeline chart */}
          {timeline && timeline.months.length > 0 && (
            <Paper variant="outlined" sx={{ p: '1.25rem', borderRadius: '0.75rem', mb: '1.5rem' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '1rem' }}>
                Expected vs Revenue by Month
              </Typography>
              <ResponsiveContainer width="100%" height={Math.max(220, timeline.months.length * 40 + 60)}>
                <BarChart data={timeline.months} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <RTooltip
                    formatter={(v: any) => fmt(v)}
                    contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="expected" name="Expected" fill={theme.palette.primary.main} radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="revenue" name="Revenue" fill={theme.palette.success.main} radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Timeline detail table */}
          {timeline && timeline.months.length > 0 && (
            <Paper variant="outlined" sx={{ p: '0.5rem 0', borderRadius: '0.75rem', mb: '2rem' }}>
              <Box sx={{ display: 'flex', px: '1.25rem', py: '0.5rem', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ flex: 2, fontWeight: 700 }}>Month</Typography>
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>Expected</Typography>
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>Revenue</Typography>
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>Outstanding</Typography>
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>Collected</Typography>
              </Box>
              {timeline.months.map((m) => {
                const outstanding = Math.max(0, m.expected - m.revenue);
                const pct = m.expected > 0 ? Math.round((m.revenue / m.expected) * 100) : 0;
                return (
                  <Box key={m.monthKey} sx={{ display: 'flex', px: '1.25rem', py: '0.5rem', '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                    <Typography variant="body2" sx={{ flex: 2 }}>{m.label}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>{fmt(m.expected)}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: 'success.main' }}>{fmt(m.revenue)}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: outstanding > 0 ? 'warning.main' : 'text.secondary' }}>{fmt(outstanding)}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>{m.expected > 0 ? `${pct}%` : '—'}</Typography>
                  </Box>
                );
              })}
            </Paper>
          )}

          {/* Enrollment-based estimates (gross/net) */}
          <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', mb: '2rem' }}>
            <StatCard label="Total Enrolled" value={totalEnrolled} sub={`across ${activePrograms.length} programs`} />
            <StatCard label="Total Gross" value={fmt(totalGross)} sub="no discounts applied" />
            <StatCard label="Total Net" value={fmt(totalNet)} sub="after enabled discounts" color="success.main" />
            <StatCard label="Total Discount Impact" value={fmt(totalGross - totalNet)} sub="gross − net" color="warning.main" />
          </Box>

          {/* Program comparison chart */}
          {programChartData.length > 0 && (
            <Paper variant="outlined" sx={{ p: '1.25rem', borderRadius: '0.75rem', mb: '2rem' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '1rem' }}>
                Gross vs Net by Program
              </Typography>
              <ResponsiveContainer width="100%" height={Math.max(200, programChartData.length * 44 + 40)}>
                <BarChart data={programChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={110} />
                  <RTooltip
                    formatter={(v: any) => fmt(v)}
                    contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Gross" fill={theme.palette.primary.main} radius={[0, 3, 3, 0]} maxBarSize={22}>
                    {programChartData.map((_, i) => <Cell key={i} fill={theme.palette.primary.main} />)}
                  </Bar>
                  <Bar dataKey="Net" fill={theme.palette.success.main} radius={[0, 3, 3, 0]} maxBarSize={22}>
                    {programChartData.map((_, i) => <Cell key={i} fill={theme.palette.success.main} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Per-location breakdown */}
          {byLocation.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '0.75rem' }}>
                Per Location
              </Typography>
              <LocationRevenueDonut locations={byLocation} />
              {byLocation.map((l) => <LocationRow key={l.id} loc={l} />)}
              <Divider sx={{ my: '1.5rem' }} />
            </>
          )}

          {/* Per-program breakdown */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: '0.75rem' }}>
            Per Program
          </Typography>
          {activePrograms.length === 0 ? (
            <Typography color="text.secondary">No active programs.</Typography>
          ) : (
            activePrograms.map((p) => <ProgramRow key={p.id} program={p} />)
          )}

          <Divider sx={{ my: '2rem' }} />

          {/* Discount management */}
          <DiscountManager discounts={discounts} onRefresh={load} />
        </>
      )}
    </Box>
  );
}
