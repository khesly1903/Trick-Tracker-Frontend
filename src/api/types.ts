export type UUID = string;

// ────────── Auth ──────────
export interface AuthUser {
  id: UUID;
  email: string;
  roles: Role[];
  academyId: UUID | null;
}

export interface Academy {
  id: UUID;
  name: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  ownerId: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface SetupAcademyDto {
  name: string;
  description?: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ────────── Enums ──────────
export type SkillType = "SKILL" | "TRICK";
export type ClassType = "PRIVATE" | "GROUP" | "MAKEUP" | "WORKSHOP" | "EVENT";
export type SessionType = "CLASS" | "MAKEUP" | "CANCELLED" | "EVENT";
export type Gender = "BOYS" | "GIRLS" | "ALL_GENDER";
export type PriceKind = "MONTHLY" | "WALK_IN" | "FULL_PROGRAM" | "CUSTOM";
export type MonthlyBillingMode = "MONTH_BASED" | "DATE_BASED";
export type DiscountType = "PERCENTAGE" | "FLAT";
export type PaymentType = "PAYMENT" | "REFUND" | "ADJUSTMENT";

export interface ProgramStage {
  id: UUID;
  programId: UUID;
  name: string;
  description?: string;
  skills?: ProgramSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramStageDto {
  name: string;
  description?: string;
}
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type Role =
  | "ADMIN"
  | "MANAGER"
  | "OWNER"
  | "INSTRUCTOR"
  | "PARENT"
  | "STUDENT"
  | "VISITOR";

export const DEFAULT_STUDENT_ROLES: Role[] = ["STUDENT"];

// ────────── Domain Models ──────────
// deprecated actually, user created when eg student created
export interface User {
  id: UUID;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Student {
  id?: UUID;
  name: string;
  surname: string;
  email?: string;
  password?: string;
  roles?: Role[];
  type: string;
  dob: string;
  isActive: boolean;
  userId?: UUID;
  injuries?: string[];
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  school?: string;
  contacts?: Contact[];
}

export interface Contact {
  id: UUID;
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  roles?: Role[];
  type: string;
  isActive: boolean;
  userId?: UUID;
}

export interface Instructor {
  id: UUID;
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  isActive: boolean;
  userId?: UUID;
  roles?: Role[];
}

export interface Location {
  id: UUID;
  name: string;
  address?: string;
}

export interface Class {
  id: UUID;
  name: string;
  type: ClassType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    programs: number;
  };
}

export interface ProgramSchedule {
  id: UUID;
  programLocationId: UUID;
  dayOfWeek?: DayOfWeek;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  type: SessionType;
}

export interface PriceOption {
  id: UUID;
  programLocationId: UUID;
  name: string;
  amount: number;
  kind: PriceKind;
  sessionsCovered?: number | null;
  billingMode?: MonthlyBillingMode | null;
  description?: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: UUID;
  academyId: UUID;
  name: string;
  value: number;
  type: DiscountType;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountOverride {
  id: UUID;
  discountId: UUID;
  programLocationId: UUID;
  isEnabled: boolean;
  valueOverride?: number | null;
  typeOverride?: DiscountType | null;
  discount?: Discount;
}

export interface Payment {
  id: UUID;
  studentProgramId: UUID;
  amount: number;
  paidAt: string;
  method?: string | null;
  note?: string | null;
  type: PaymentType;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPeriod {
  label: string;
  dueDate: string;
  amount: number;
}

export interface EnrollmentBalance {
  finalPrice: number;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  monthlySchedule?: MonthlyPeriod[];
}

export interface AccountingMonth {
  label: string;
  monthKey: string;
  expected: number;
  revenue: number;
}

export interface AccountingTimeline {
  months: AccountingMonth[];
  totals: { expected: number; revenue: number };
}

export interface AccountingProgramSummary {
  id: UUID;
  name: string;
  enrolled: number;
  expected: number;
  revenue: number;
}

export interface PaymentPlanLine {
  enrollmentId: UUID;
  programName: string;
  locationName: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  isActive: boolean;
}

export interface PaymentPlanMonth {
  monthKey: string;
  label: string;
  totalDue: number;
  totalPaid: number;
  status: 'paid' | 'overdue' | 'upcoming' | 'partial';
  lines: PaymentPlanLine[];
}

export interface PaymentPlan {
  studentId: UUID;
  studentName: string;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  months: PaymentPlanMonth[];
}

export interface AccountingLocationSummary {
  id: UUID;
  name: string;
  enrolled: number;
  expected: number;
  revenue: number;
  programs: AccountingProgramSummary[];
}

export interface ProgramLocation {
  id: UUID;
  programId: UUID;
  locationId: UUID;
  /** @deprecated use priceOptions instead */
  price: number;
  capacity: number;
  instructorId?: UUID;
  isActive: boolean;
  location?: Location;
  instructor?: Instructor;
  backupInstructors?: Instructor[];
  schedules?: ProgramSchedule[];
  program?: Program;
  priceOptions?: PriceOption[];
  discountOverrides?: DiscountOverride[];
  _count?: { sessions: number; studentPrograms: number };
}

export interface Program {
  id: UUID;
  name: string;
  isActive: boolean;
  gender: Gender;
  requiredEquipment: string[];
  level?: string | null;
  minAge: number;
  maxAge: number;
  startDate: string;
  endDate: string;
  classId: UUID;
  createdAt: string;
  updatedAt: string;
  inheritedClass?: Class;
  programLocations?: ProgramLocation[];
  programStages?: ProgramStage[];
  _count?: { programLocations: number };
}

export interface ProgramSession {
  id: UUID;
  programLocationId: UUID;
  scheduleId?: UUID;
  date: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  createdAt: string;
  updatedAt: string;
  programLocation?: {
    id: UUID;
    instructor?: { name: string; surname: string } | null;
    program?: { id: UUID; name: string };
    location?: { name: string };
  };
}

export interface ProgramSkill {
  id: UUID;
  stageId: UUID;
  name: string;
  type: SkillType;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgram {
  id: UUID;
  studentId: UUID;
  programLocationId: UUID;
  isActive: boolean;
  priceOptionId?: UUID | null;
  basePriceSnapshot?: number | null;
  priceKindSnapshot?: PriceKind | null;
  sessionsCoveredSnapshot?: number | null;
  monthlyBillingModeSnapshot?: MonthlyBillingMode | null;
  discountId?: UUID | null;
  discountSnapshot?: { name: string; value: number; type: DiscountType } | null;
  finalPrice?: number | null;
  enrolledAt?: string;
  student?: { id: UUID; name: string; surname: string };
  programLocation?: {
    id: UUID;
    program: { id: UUID; name: string };
    location: { id: UUID; name: string; address: string };
  };
  priceOption?: PriceOption | null;
  discount?: Discount | null;
  payments?: Payment[];
}

export interface StudentProgramSkill {
  id: UUID;
  studentProgramId: UUID;
  programSkillId: UUID;
  status: number;
  note?: string | null;
  updatedById?: string | null;
  achievedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  programSkill?: ProgramSkill & { stage?: ProgramStage };
}

export interface UpdateStudentProgramSkillDto {
  status?: number;
  note?: string;
  updatedById?: string;
}

export interface AttendanceRecord {
  studentProgramId: UUID;
  attended: boolean;
  note?: string;
}

export interface AttendanceEntry {
  id: UUID;
  sessionId: UUID;
  studentProgramId: UUID;
  attended: boolean;
  note?: string;
}

export interface SessionAttendanceEntry {
  studentProgramId: UUID;
  studentName: string;
  attended: boolean;
  note: string;
  isMarked: boolean;
}

// ────────── Request DTOs ──────────
export interface CreateUserDto {
  email: string;
  password: string;
  role?: Role;
}

export type ContactType = "PARENT" | "GUARDIAN" | "EMERGENCY";
export type ContactRelation = "PARENT" | "GUARDIAN" | "EMERGENCY";

export interface NewContactInStudentDto {
  email?: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  whatsappPhoneNumber?: string;
  secondaryPhoneNumber?: string;
  relation?: ContactRelation;
}

export interface CreateStudentDto {
  name: string;
  surname: string;
  email?: string;
  password?: string;
  roles?: Role[];
  type: string;
  dob: string;
  userId?: UUID;
  injuries?: string[];
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  school?: string;
  contactIds?: UUID[];
  enrollmentId?: string;
}

export interface CreateStudentWithContactsDto {
  name: string;
  surname: string;
  email: string;
  roles?: Role[];
  type: string;
  dob: string;
  injuries?: string[];
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  school?: string;
  contactIds?: UUID[];
  newContacts?: NewContactInStudentDto[];
  enrollmentId?: string;
}

export interface CreateContactDto {
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  roles?: Role[];
  enrollmentId?: string;
}

export interface CreateInstructorDto {
  name: string;
  surname: string;
  email?: string;
  password?: string;
  roles?: Role[];
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  enrollmentId?: string;
}

export interface CreateLocationDto {
  name: string;
  address?: string;
}

export interface CreateClassDto {
  name: string;
  type: ClassType;
  isActive?: boolean;
}

export interface CreateProgramDto {
  name: string;
  startDate: string;
  endDate: string;
  gender: Gender;
  minAge: number;
  maxAge: number;
  level?: string;
  classId: UUID;
  requiredEquipment?: string[];
  isActive?: boolean;
}

export interface CreateProgramLocationDto {
  programId: UUID;
  locationId: UUID;
  price: number;
  capacity: number;
  instructorId?: UUID;
  backupInstructorIds?: UUID[];
}

export interface CreateProgramScheduleDto {
  programLocationId: UUID;
  type: SessionType;
  dayOfWeek?: DayOfWeek;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration: number;
}

export interface CreateSessionDto {
  programId: UUID;
  date: string;
  notes?: string;
}

export interface CreateProgramSkillDto {
  name: string;
  type: SkillType;
  description?: string;
}

export interface BulkAddProgramSkillsDto {
  skills: CreateProgramSkillDto[];
}

export interface EnrollStudentDto {
  studentId: UUID;
  programLocationId: UUID;
  priceOptionId?: UUID;
  discountId?: UUID;
  enrollmentStartDate?: string;
  overrideBasePrice?: number;
}

export interface CreatePriceOptionDto {
  programLocationId: UUID;
  name: string;
  amount: number;
  kind?: PriceKind;
  sessionsCovered?: number;
  billingMode?: MonthlyBillingMode;
  description?: string;
  isDefault?: boolean;
}

export interface UpdatePriceOptionDto {
  name?: string;
  amount?: number;
  kind?: PriceKind;
  sessionsCovered?: number;
  billingMode?: MonthlyBillingMode;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface CreateDiscountDto {
  name: string;
  value: number;
  type: DiscountType;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDiscountDto {
  name?: string;
  value?: number;
  type?: DiscountType;
  description?: string;
  isActive?: boolean;
}

export interface CreateDiscountOverrideDto {
  discountId: UUID;
  programLocationId: UUID;
  isEnabled?: boolean;
  valueOverride?: number;
  typeOverride?: DiscountType;
}

export interface UpdateDiscountOverrideDto {
  isEnabled?: boolean;
  valueOverride?: number;
  typeOverride?: DiscountType;
}

export interface CreatePaymentDto {
  studentProgramId: UUID;
  amount: number;
  paidAt: string;
  method?: string;
  note?: string;
  type?: PaymentType;
}

export interface BulkAttendanceDto {
  programSessionId: UUID;
  attendances: AttendanceRecord[];
}

export interface GetEnrollmentsParams {
  studentId?: UUID;
  programLocationId?: UUID;
}

// ────────── Portal ──────────

export interface PortalStudentProgram {
  id: UUID;
  isActive: boolean;
  programLocation: {
    id: UUID;
    price: number;
    capacity: number;
    location: Location;
    instructor?: Instructor | null;
    schedules: ProgramSchedule[];
    program: Program & { programStages: (ProgramStage & { skills: ProgramSkill[] })[] };
  };
  studentProgramSkills: (StudentProgramSkill & { programSkill: ProgramSkill })[];
}

export interface PortalStudentData {
  id: UUID;
  name: string;
  surname: string;
  enrollmentId?: string;
  studentPrograms: PortalStudentProgram[];
}

export interface PortalParentStudent {
  id: UUID;
  name: string;
  surname: string;
  enrollmentId?: string;
  isActive: boolean;
  programCount: number;
}

export interface PortalInstructorProgramLocation {
  id: UUID;
  program: Program & { programStages: (ProgramStage & { skills: ProgramSkill[] })[] };
  location: Location;
  schedules: ProgramSchedule[];
  studentPrograms: {
    id: UUID;
    student: { id: UUID; name: string; surname: string };
    studentProgramSkills: (StudentProgramSkill & { programSkill: ProgramSkill })[];
  }[];
}

export interface UpdateSkillDto {
  status: number;
  note?: string;
}

export interface DashboardData {
  statistics: {
    totalStudents: number;
    studentsByType: {
      child: number;
      adult: number;
    };
    totalPrograms: number;
    totalInstructors: number;
    attendanceRate: number; // Yüzde cinsinden (örn: 85.5)
  };
  recentActivity: {
    students: {
      id: string;
      name: string;
      surname: string;
      createdAt: string; // ISO Date string
    }[];
    programs: {
      id: string;
      name: string;
      startDate: string; // ISO Date string
    }[];
  };
  upcomingSessions: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isCancelled: boolean;
    type: string;
    program: {
      name: string;
    };
  }[];
  distributions: {
    byLocation: {
      location: string;
      count: number;
    }[];
  };
}
