import type { Medication, DoseRecord, DoseStatus, AppSettings } from '../types/index.ts';

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeDisplay(timeStr: string): string {
  // Converts "09:00" or "13:30" to "9:00 AM" or "1:30 PM"
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minStr} ${ampm}`;
}

export function parseScheduledDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Determine dynamic status for unfinalized doses (not taken/skipped)
 */
export function calculateDoseStatus(
  scheduledDate: string,
  scheduledTime: string,
  existingStatus: DoseStatus,
  gracePeriodMinutes: number,
  now: Date = new Date()
): DoseStatus {
  // If user already took or skipped, preserve that terminal status
  if (existingStatus === 'taken' || existingStatus === 'skipped') {
    return existingStatus;
  }

  const scheduledDt = parseScheduledDateTime(scheduledDate, scheduledTime);
  const diffMs = now.getTime() - scheduledDt.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 0) {
    // Before scheduled time
    return 'upcoming';
  } else if (diffMinutes <= gracePeriodMinutes) {
    // Within grace period (e.g. 0 to 60 mins after scheduled time)
    return 'due';
  } else {
    // Past grace period
    return 'missed';
  }
}

/**
 * Deterministic dose instance ID
 */
export function generateDoseId(medicationId: string, scheduledDate: string, scheduledTime: string): string {
  return `${medicationId}_${scheduledDate}_${scheduledTime}`;
}

/**
 * Generate doses for a specific date given the active medications list
 */
export function generateDosesForDate(
  medications: Medication[],
  existingDoseRecords: DoseRecord[],
  targetDateStr: string,
  settings: AppSettings,
  now: Date = new Date()
): DoseRecord[] {
  const recordMap = new Map<string, DoseRecord>();
  existingDoseRecords.forEach(rec => recordMap.set(rec.id, rec));

  const updatedRecords: DoseRecord[] = [...existingDoseRecords];

  medications.forEach(med => {
    // Check if medication is active on targetDate
    // If archived, we do NOT generate new future doses, but existing ones remain.
    // If med.archived is true, skip generating new doses for today if not already present
    const isAfterOrOnStart = targetDateStr >= med.startDate;
    const isBeforeOrOnEnd = !med.endDate || targetDateStr <= med.endDate;

    if (!isAfterOrOnStart || !isBeforeOrOnEnd) {
      return;
    }

    // For each reminder time
    med.reminderTimes.forEach(timeStr => {
      const doseId = generateDoseId(med.id, targetDateStr, timeStr);
      const existing = recordMap.get(doseId);

      if (existing) {
        // Re-evaluate dynamic status if not taken or skipped
        if (existing.status !== 'taken' && existing.status !== 'skipped') {
          const freshStatus = calculateDoseStatus(
            existing.scheduledDate,
            existing.scheduledTime,
            existing.status,
            settings.gracePeriodMinutes,
            now
          );
          if (freshStatus !== existing.status) {
            existing.status = freshStatus;
          }
        }
      } else {
        // If medicine is archived, don't generate new doses
        if (med.archived) return;

        // Generate brand new dose instance
        const status = calculateDoseStatus(
          targetDateStr,
          timeStr,
          'upcoming',
          settings.gracePeriodMinutes,
          now
        );

        const newDose: DoseRecord = {
          id: doseId,
          medicationId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          foodInstruction: med.foodInstruction,
          notes: med.notes,
          scheduledDate: targetDateStr,
          scheduledTime: timeStr,
          status,
          snoozeCount: 0,
        };

        recordMap.set(doseId, newDose);
        updatedRecords.push(newDose);
      }
    });
  });

  return updatedRecords;
}

/**
 * Reconcile all doses on startup or date change
 */
export function reconcileDoseRecords(
  medications: Medication[],
  existingRecords: DoseRecord[],
  settings: AppSettings,
  now: Date = new Date()
): DoseRecord[] {
  const todayStr = getTodayDateString(now);

  // 1. Generate / update today's doses
  let reconciled = generateDosesForDate(medications, existingRecords, todayStr, settings, now);

  // 2. Also ensure all past unfinalized doses are marked as 'missed' if past grace period
  reconciled = reconciled.map(dose => {
    if (dose.status === 'taken' || dose.status === 'skipped') {
      return dose;
    }
    const freshStatus = calculateDoseStatus(
      dose.scheduledDate,
      dose.scheduledTime,
      dose.status,
      settings.gracePeriodMinutes,
      now
    );
    return { ...dose, status: freshStatus };
  });

  return reconciled;
}

/**
 * Get Next Upcoming Medication dose for Today
 */
export function getNextUpcomingDose(todayDoses: DoseRecord[], now: Date = new Date()): DoseRecord | null {
  const currentTime = getCurrentTimeString(now);

  // First check for any dose that is currently 'due'
  const dueDoses = todayDoses
    .filter(d => d.status === 'due')
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  if (dueDoses.length > 0) return dueDoses[0];

  // Next look for upcoming doses scheduled for later today
  const upcomingDoses = todayDoses
    .filter(d => d.status === 'upcoming' && d.scheduledTime >= currentTime)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  if (upcomingDoses.length > 0) return upcomingDoses[0];

  return null;
}
