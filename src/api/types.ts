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
  email: string;
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
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime?: string;
  duration: number;
  type: SessionType;
}

export interface ProgramLocation {
  id: UUID;
  programId: UUID;
  locationId: UUID;
  price: number;
  capacity: number;
  instructorId?: UUID;
  isActive: boolean;
  location?: Location;
  instructor?: Instructor;
  backupInstructors?: Instructor[];
  schedules?: ProgramSchedule[];
  _count?: { sessions: number };
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
  student?: { id: UUID; name: string; surname: string };
  programLocation?: {
    id: UUID;
    program: { id: UUID; name: string };
    location: { id: UUID; name: string; address: string };
  };
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
  type?: ContactType[];
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
}

export interface CreateContactDto {
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  whatsappPhoneNumber?: string;
  roles?: Role[];
  type: string;
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
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime?: string;
  duration: number;
  type: SessionType;
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
}

export interface BulkAttendanceDto {
  sessionId: UUID;
  records: AttendanceRecord[];
}

export interface GetEnrollmentsParams {
  studentId?: UUID;
  programLocationId?: UUID;
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
