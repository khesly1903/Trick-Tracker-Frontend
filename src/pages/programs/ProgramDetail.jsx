import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { MapPin, Calendar, Users, BookOpen, Layers, GraduationCap, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
import { getProgramById } from '../../api/programs.api';
import { displayTime } from './programShared';
import dayjs from 'dayjs';

const GENDER_LABELS = { BOYS: 'Boys', GIRLS: 'Girls', ALL_GENDER: 'All Genders' };
const DAY_SHORT = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

const fmt = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const calcNet = (gross, enrolled, discountOverrides) => {
  let deduction = 0;
  for (const o of (discountOverrides ?? [])) {
    if (!o.isEnabled) continue;
    const type = o.typeOverride ?? o.discount?.type;
    const value = o.valueOverride ?? o.discount?.value ?? 0;
    if (type === 'PERCENTAGE') deduction += gross * (value / 100);
    else deduction += enrolled * value;
  }
  return Math.max(0, gross - deduction);
};

const StatCard = ({ label, value, sub, color }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '0.75rem', flex: '1 1 120px', minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700} color={color ?? 'text.primary'} sx={{ mt: 0.25, lineHeight: 1.2 }}>
      {value}
    </Typography>
    {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
  </Paper>
);

const LocationAccountingCard = ({ pl }) => {
  const theme = useTheme();
  const enrolled = pl._count?.studentPrograms ?? 0;
  const fillRate = pl.capacity > 0 ? Math.round((enrolled / pl.capacity) * 100) : 0;
  const priceOptions = pl.priceOptions ?? [];
  const discountOverrides = pl.discountOverrides ?? [];
  const defaultOpt = priceOptions.find((o) => o.isDefault) ?? priceOptions[0];

  const defaultGross = defaultOpt ? enrolled * defaultOpt.amount : 0;
  const defaultNet = defaultOpt ? calcNet(defaultGross, enrolled, discountOverrides) : 0;
  const discountImpact = defaultGross - defaultNet;

  const chartData = priceOptions.map((opt) => {
    const gross = enrolled * opt.amount;
    const net = calcNet(gross, enrolled, discountOverrides);
    return { name: opt.name, Gross: gross, Net: net };
  });

  const fillData = [
    { name: 'Filled', value: enrolled, color: theme.palette.primary.main },
    { name: 'Open', value: Math.max(0, pl.capacity - enrolled), color: theme.palette.divider },
  ];

  const enabledDiscounts = discountOverrides.filter((o) => o.isEnabled);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: '0.75rem' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <MapPin size={14} />
        <Typography variant="body2" fontWeight={700}>{pl.location?.name ?? pl.locationId}</Typography>
      </Box>

      {/* Stat row */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <StatCard label="Enrolled" value={`${enrolled}/${pl.capacity}`} sub={`${fillRate}% full`} />
        {defaultOpt && (
          <>
            <StatCard label="Gross Est." value={fmt(defaultGross)} sub={defaultOpt.name} color="text.primary" />
            <StatCard
              label="Net Est."
              value={fmt(defaultNet)}
              sub={discountImpact > 0 ? `−${fmt(discountImpact)} discounts` : 'no discounts'}
              color={theme.palette.success.main}
            />
          </>
        )}
        {!defaultOpt && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '0.75rem', flex: '1 1 200px' }}>
            <Typography variant="caption" color="text.secondary">No price options configured.</Typography>
          </Paper>
        )}
      </Box>

      {priceOptions.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Bar chart — price option comparison */}
          <Box sx={{ flex: '1 1 280px', minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              REVENUE BY PRICE OPTION (EST.)
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v, name) => [fmt(v), name]}
                  contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Gross" fill={theme.palette.primary.main} radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Net" fill={theme.palette.success.main} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Fill rate donut + discounts */}
          <Box sx={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1, alignSelf: 'flex-start' }}>
              FILL RATE
            </Typography>
            <Box sx={{ position: 'relative', width: 120, height: 120 }}>
              <PieChart width={120} height={120}>
                <Pie data={fillData} cx={55} cy={55} innerRadius={36} outerRadius={52} dataKey="value" strokeWidth={0}>
                  {fillData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1}>{fillRate}%</Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>full</Typography>
              </Box>
            </Box>

            {enabledDiscounts.length > 0 && (
              <Box sx={{ mt: 1, width: '100%' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                  DISCOUNTS
                </Typography>
                {enabledDiscounts.map((o) => {
                  const type = o.typeOverride ?? o.discount?.type;
                  const value = o.valueOverride ?? o.discount?.value;
                  return (
                    <Typography key={o.id} variant="caption" color="text.secondary" display="block">
                      {o.discount?.name}: {type === 'PERCENTAGE' ? `${value}%` : `$${value}`}
                    </Typography>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const InfoRow = ({ label, children }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </Typography>
    <Box sx={{ mt: 0.5 }}>{children}</Box>
  </Box>
);

const ProgramDetail = ({ open, programId, onClose }) => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !programId) return;
    setLoading(true);
    setError(null);
    getProgramById(programId)
      .then(setProgram)
      .catch(() => setError('Failed to load program.'))
      .finally(() => setLoading(false));
  }, [open, programId]);

  useEffect(() => {
    if (!open) { setProgram(null); setError(null); }
  }, [open]);

  const locations = program?.programLocations ?? [];
  const totalEnrolled = locations.reduce((s, pl) => s + (pl._count?.studentPrograms ?? 0), 0);
  const totalGross = locations.reduce((s, pl) => {
    const enrolled = pl._count?.studentPrograms ?? 0;
    const def = (pl.priceOptions ?? []).find((o) => o.isDefault) ?? (pl.priceOptions ?? [])[0];
    return s + (def ? enrolled * def.amount : 0);
  }, 0);
  const totalNet = locations.reduce((s, pl) => {
    const enrolled = pl._count?.studentPrograms ?? 0;
    const def = (pl.priceOptions ?? []).find((o) => o.isDefault) ?? (pl.priceOptions ?? [])[0];
    if (!def) return s;
    const gross = enrolled * def.amount;
    return s + calcNet(gross, enrolled, pl.discountOverrides ?? []);
  }, 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {program ? program.name : 'Program Details'}
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {program && !loading && (
          <Grid container spacing={3}>
            {/* Left column — program meta */}
            <Grid size={{ xs: 12, md: 5 }}>
              <InfoRow label="Status">
                <Chip
                  label={program.isActive ? 'Active' : 'Inactive'}
                  color={program.isActive ? 'success' : 'default'}
                  size="small"
                />
              </InfoRow>

              <InfoRow label="Class">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <BookOpen size={15} />
                  <Typography variant="body2">{program.inheritedClass?.name ?? program.classId}</Typography>
                </Box>
              </InfoRow>

              <InfoRow label="Gender">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Users size={15} />
                  <Typography variant="body2">{GENDER_LABELS[program.gender] ?? program.gender}</Typography>
                </Box>
              </InfoRow>

              <InfoRow label="Age Range">
                <Typography variant="body2">{program.minAge} – {program.maxAge} yrs</Typography>
              </InfoRow>

              {program.level && (
                <InfoRow label="Level">
                  <Typography variant="body2">{program.level}</Typography>
                </InfoRow>
              )}

              <InfoRow label="Dates">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Calendar size={15} />
                  <Typography variant="body2">
                    {dayjs(program.startDate).format('DD MMM YYYY')} → {dayjs(program.endDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </InfoRow>

              {program.requiredEquipment?.length > 0 && (
                <InfoRow label="Required Equipment">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {program.requiredEquipment.map((e) => (
                      <Chip key={e} label={e} size="small" />
                    ))}
                  </Box>
                </InfoRow>
              )}
            </Grid>

            {/* Right column — locations & schedules */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <Layers size={15} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Locations & Schedules
                </Typography>
              </Box>

              {locations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No locations configured.</Typography>
              ) : (
                locations.map((pl) => (
                  <Paper key={pl.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: '0.75rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <MapPin size={14} />
                      <Typography variant="body2" fontWeight={700}>
                        {pl.location?.name ?? pl.locationId}
                      </Typography>
                      {pl._count?.sessions > 0 && (
                        <Chip label={`${pl._count.sessions} sessions`} size="small" color="info" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Cap: {pl._count?.studentPrograms ?? 0}/{pl.capacity}
                      {pl.instructor ? ` · ${pl.instructor.name} ${pl.instructor.surname}` : ''}
                    </Typography>

                    {pl.backupInstructors?.length > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Backup: {pl.backupInstructors.map((i) => `${i.name} ${i.surname}`).join(', ')}
                      </Typography>
                    )}

                    {pl.schedules?.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>SCHEDULES</Typography>
                        {pl.schedules.map((s) => (
                          <Box key={s.id} sx={{ mt: 0.5 }}>
                            <Typography variant="caption">
                              {DAY_SHORT[s.dayOfWeek] ?? s.dayOfWeek} · {displayTime(s.startTime)} · {s.duration}min · {s.type}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Paper>
                ))
              )}
            </Grid>

            {/* Bottom row — stages & skills */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <GraduationCap size={15} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stages & Skills
                </Typography>
              </Box>

              {(!program.programStages || program.programStages.length === 0) ? (
                <Typography variant="body2" color="text.secondary">No stages defined.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {program.programStages.map((stage) => (
                    <Paper key={stage.id} variant="outlined" sx={{ p: 1.5, borderRadius: '0.75rem', flex: '1 1 260px' }}>
                      <Typography variant="body2" fontWeight={700}>{stage.name}</Typography>
                      {stage.description && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                          {stage.description}
                        </Typography>
                      )}
                      {stage.skills?.length > 0 ? (
                        <Box sx={{ mt: 0.75 }}>
                          {stage.skills.map((skill) => (
                            <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.35 }}>
                              <Chip
                                label={skill.type}
                                size="small"
                                color={skill.type === 'TRICK' ? 'secondary' : 'primary'}
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: '1.2rem', minWidth: '3rem' }}
                              />
                              <Typography variant="caption" sx={{ flex: 1 }}>{skill.name}</Typography>
                              {skill.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ flex: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {skill.description}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">No skills added.</Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Accounting section */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <TrendingUp size={15} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accounting (Estimated)
                </Typography>
              </Box>

              {/* Program-wide summary */}
              {locations.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <StatCard label="Total Enrolled" value={totalEnrolled} sub="across all locations" />
                  <StatCard label="Total Gross" value={fmt(totalGross)} sub="default prices, no discounts" />
                  <StatCard label="Total Net" value={fmt(totalNet)} sub="after enabled discounts" color="success.main" />
                </Box>
              )}

              {locations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No locations to calculate.</Typography>
              ) : (
                locations.map((pl) => <LocationAccountingCard key={pl.id} pl={pl} />)
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: '1rem', textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDetail;
