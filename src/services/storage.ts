import { Medication, DoseRecord, AppSettings } from '../types';

const STORAGE_KEYS = {
  MEDICATIONS: 'medimate_medications',
  DOSE_RECORDS: 'medimate_dose_records',
  SETTINGS: 'medimate_settings',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  gracePeriodMinutes: 60,
  notificationsEnabled: false,
  soundEnabled: true,
};

// Safe JSON parser
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

// Safe JSON writer
function safeSave<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save to localStorage key "${key}":`, err);
    return false;
  }
}

export const StorageService = {
  getMedications(): Medication[] {
    return safeParse<Medication[]>(STORAGE_KEYS.MEDICATIONS, []);
  },

  saveMedications(medications: Medication[]): boolean {
    return safeSave(STORAGE_KEYS.MEDICATIONS, medications);
  },

  getDoseRecords(): DoseRecord[] {
    return safeParse<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS, []);
  },

  saveDoseRecords(records: DoseRecord[]): boolean {
    return safeSave(STORAGE_KEYS.DOSE_RECORDS, records);
  },

  getSettings(): AppSettings {
    return safeParse<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: AppSettings): boolean {
    return safeSave(STORAGE_KEYS.SETTINGS, settings);
  },

  exportAllData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      medications: this.getMedications(),
      doseRecords: this.getDoseRecords(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
      localStorage.removeItem(STORAGE_KEYS.DOSE_RECORDS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (err) {
      console.error('Error clearing localStorage data:', err);
    }
  },
};
