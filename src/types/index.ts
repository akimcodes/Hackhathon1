export type Frequency = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'custom';

export type FoodInstruction = 'before_food' | 'after_food' | 'with_food' | 'no_specific';

export type DoseStatus = 'upcoming' | 'due' | 'missed' | 'taken' | 'skipped';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  reminderTimes: string[]; // HH:mm format, e.g. ["09:00", "20:00"]
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  foodInstruction: FoodInstruction;
  notes?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoseRecord {
  id: string; // Deterministic: `${medicationId}_${scheduledDate}_${scheduledTime}`
  medicationId: string;
  medicineName: string;
  dosage: string;
  foodInstruction: FoodInstruction;
  notes?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: DoseStatus;
  takenAt?: string; // ISO timestamp
  isLate?: boolean;
  snoozeUntil?: string; // ISO timestamp
  snoozeCount: number; // Max 3 times
  notifiedAt?: string; // ISO timestamp
}

export interface AppSettings {
  gracePeriodMinutes: 30 | 60 | 120;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export type TabType = 'dashboard' | 'medicines' | 'history' | 'settings';
