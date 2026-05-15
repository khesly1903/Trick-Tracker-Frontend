// @ts-ignore
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
// @ts-ignore
import PaymentsDialog from "./PaymentsDialog";
// @ts-ignore
import PaymentPlanDialog from "./PaymentPlanDialog";
import {
  Phone,
  Mail,
  User,
  Calendar,
  School,
  AlertTriangle,
  Users,
  GraduationCap,
  MapPin,
  CreditCard,
  CalendarClock,
} from "lucide-react";
import { getStudentById } from "../../api/students.api";

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
    <Box sx={{ color: "text.secondary", mt: 0.25, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value || "—"}</Typography>
    </Box>
  </Box>
);

const SectionHeader = ({ icon, label, color }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="subtitle2"
      fontWeight={700}
      sx={{ display: "flex", alignItems: "center", gap: 1, color: color || "text.primary", mb: 0.75 }}
    >
      {icon}
      {label}
    </Typography>
    <Divider />
  </Box>
);

const COL_SX = {
  flex: "0 0 33.33%",
  p: 3,
  overflowY: "auto",
};

const StudentDetailDialog = ({ open, onClose, student }) => {
  const [fullStudent, setFullStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && student?.id) {
      setLoading(true);
      getStudentById(student.id)
        .then(setFullStudent)
        .catch(() => setFullStudent(null))
        .finally(() => setLoading(false));
    } else {
      setFullStudent(null);
    }
  }, [open, student?.id]);

  const [paymentsEnrollment, setPaymentsEnrollment] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);

  if (!student) return null;
  const s = fullStudent || student;
  const contacts = fullStudent?.studentContacts || [];
  const programs = (fullStudent?.studentPrograms || []).filter((sp) => sp.isActive);

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
            <User size={26} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              {s.name} {s.surname}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, mt: 0.5 }}>
              <Chip label={s.type || "STUDENT"} size="small" color={s.type === "CHILD" ? "primary" : "secondary"} />
              <Chip label={s.isActive ? "Active" : "Inactive"} size="small" variant="outlined" color={s.isActive ? "success" : "default"} />
              {s.enrollmentId && <Chip label={s.enrollmentId} size="small" variant="outlined" />}
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", minHeight: 400 }}>

            {/* ── Col 1: Personal Info ── */}
            <Box sx={{ ...COL_SX, borderRight: "1px solid", borderColor: "divider" }}>
              <SectionHeader icon={<User size={15} />} label="Personal Info" />
              <InfoRow icon={<Mail size={15} />} label="Email" value={s.email} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={s.phoneNumber} />
              {s.secondaryPhoneNumber && (
                <InfoRow icon={<Phone size={15} />} label="Secondary Phone" value={s.secondaryPhoneNumber} />
              )}
              {s.whatsappPhoneNumber && (
                <InfoRow
                  icon={
                    <Box sx={{ width: 15, height: 15, bgcolor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8, fontWeight: "bold" }}>
                      W
                    </Box>
                  }
                  label="WhatsApp"
                  value={s.whatsappPhoneNumber}
                />
              )}
              <InfoRow icon={<Calendar size={15} />} label="Date of Birth" value={s.dob ? new Date(s.dob).toLocaleDateString() : null} />
              <InfoRow icon={<School size={15} />} label="School" value={s.school} />
            </Box>

            {/* ── Col 2: Injuries + Contacts ── */}
            <Box sx={{ ...COL_SX, borderRight: "1px solid", borderColor: "divider" }}>
              <SectionHeader icon={<AlertTriangle size={15} />} label="Injuries" color="error.main" />
              {s.injuries && s.injuries.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
                  {s.injuries.map((inj, i) => (
                    <Chip key={i} label={inj} size="small" color="error" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  None reported.
                </Typography>
              )}

              <SectionHeader icon={<Users size={15} />} label="Contacts" />
              {contacts.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {contacts.map((sc) => {
                    const c = sc.contact;
                    return (
                      <Paper key={sc.contactId} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={600}>{c.name} {c.surname}</Typography>
                          <Chip label={sc.relation} size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 16 }} />
                        </Box>
                        {c.phoneNumber && <Typography variant="caption" color="text.secondary" display="block">{c.phoneNumber}</Typography>}
                        {c.user?.email && <Typography variant="caption" color="text.secondary" display="block">{c.user.email}</Typography>}
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No contacts linked.</Typography>
              )}
            </Box>

            {/* ── Col 3: Programs ── */}
            <Box sx={{ ...COL_SX, bgcolor: "action.hover" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <GraduationCap size={15} />
                  Enrolled Programs
                </Typography>
                {programs.length > 0 && (
                  <Tooltip title="Payment Plan">
                    <IconButton size="small" onClick={() => setPlanOpen(true)}>
                      <CalendarClock size={14} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              {programs.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {programs.map((sp) => {
                    const prog = sp.programLocation?.program;
                    const loc = sp.programLocation?.location;
                    const label = `${prog?.name || "—"}${loc?.name ? ` @ ${loc.name}` : ""}`;
                    return (
                      <Paper key={sp.id} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: "background.paper" }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{prog?.name || "—"}</Typography>
                            {loc?.name && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                                <MapPin size={12} color="gray" />
                                <Typography variant="caption" color="text.secondary">{loc.name}</Typography>
                              </Box>
                            )}
                            {sp.finalPrice != null && (
                              <Typography variant="caption" color="primary.main" fontWeight={600}>
                                ${sp.finalPrice.toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                          <Tooltip title="Payments">
                            <IconButton size="small" onClick={() => setPaymentsEnrollment({ id: sp.id, label })}>
                              <CreditCard size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No active programs.</Typography>
              )}
            </Box>

          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>

    {planOpen && (
      <PaymentPlanDialog
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        studentId={s.id}
        studentName={`${s.name} ${s.surname}`}
      />
    )}

    {paymentsEnrollment && (
      <PaymentsDialog
        open={!!paymentsEnrollment}
        onClose={() => setPaymentsEnrollment(null)}
        studentProgramId={paymentsEnrollment.id}
        enrollmentLabel={paymentsEnrollment.label}
      />
    )}
    </>
  );
};

export default StudentDetailDialog;
