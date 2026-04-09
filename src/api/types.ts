export type UUID = string;

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
export type SkillStatus = "NOT_STARTED" | "IN_PROGRESS" | "MASTERED";

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
}

export interface Contact {
  id: UUID;
  name: string;
  phone?: string;
  email?: string;
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
  isActive: boolean;
}

export interface ProgramSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Program {
  id: UUID;
  name: string;
  classId: UUID;
  locationId: UUID;
  instructorId: UUID;
  isActive: boolean;
  schedules: ProgramSchedule[];
}

export interface ProgramSession {
  id: UUID;
  programId: UUID;
  date: string;
  notes?: string;
}

export interface ProgramSkill {
  id: UUID;
  programId: UUID;
  name: string;
  order: number;
}

export interface StudentProgram {
  id: UUID;
  studentId: UUID;
  programId: UUID;
  isActive: boolean;
}

export interface StudentProgramSkill {
  id: UUID;
  studentProgramId: UUID;
  programSkillId: UUID;
  status: SkillStatus;
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

export interface CreateStudentDto {
  name: string;
  surname: string;
  email?: string;
  password?: string;
  roles?: Role[];
  type: string;
  dob: string;
  userId?: UUID;
}

export interface CreateContactDto {
  name: string;
  phone?: string;
  email?: string;
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
}

export interface CreateProgramDto {
  name: string;
  classId: UUID;
  locationId: UUID;
  instructorId: UUID;
  schedules: ProgramSchedule[];
}

export interface CreateSessionDto {
  programId: UUID;
  date: string;
  notes?: string;
}

export interface CreateProgramSkillDto {
  name: string;
  order?: number;
}

export interface EnrollStudentDto {
  studentId: UUID;
  programId: UUID;
}

export interface BulkAttendanceDto {
  sessionId: UUID;
  records: AttendanceRecord[];
}

export interface GetEnrollmentsParams {
  studentId?: UUID;
  programId?: UUID;
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
