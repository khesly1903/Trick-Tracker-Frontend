import type { Dayjs } from 'dayjs';
import type { DayOfWeek, SessionType } from '../../api/types';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface ScheduleFormRow {
  localId: string;
  dayOfWeek: DayOfWeek | '';
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  type: SessionType | '';
}

export interface AddedSchedule {
  scheduleId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // display: "HH:mm"
  endTime?: string;  // display: "HH:mm"
  duration: number;
  type: SessionType;
}

export interface AddedLocation {
  programLocationId: string;
  locationId: string;
  locationName: string;
  price: number;
  capacity: number;
  instructorId?: string;
  instructorName?: string;
  backupInstructorIds?: string[];
  schedules: AddedSchedule[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'CLASS', label: 'Class' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EVENT', label: 'Event' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatTime = (t: Dayjs): string =>
  `1970-01-01T${t.format('HH:mm')}:00.000Z`;

export const displayTime = (isoTime: string): string => {
  const m = isoTime.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : isoTime;
};

export const makeLocalId = () => Math.random().toString(36).slice(2);

export const emptyScheduleRow = (): ScheduleFormRow => ({
  localId: makeLocalId(),
  dayOfWeek: '',
  startTime: null,
  endTime: null,
  type: 'CLASS',
});
