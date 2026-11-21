import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TabType, Medication, DoseRecord, AppSettings } from './types';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { 
  reconcileDoseRecords, 
  getTodayDateString, 
  calculateDoseStatus 
} from './services/scheduler';
import { NotificationService } from './services/notification';
import { getDemoMedications } from './services/demoData';

import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MedicationManagement } from './components/MedicationManagement';
import { MedicationHistory } from './components/MedicationHistory';
import { Settings } from './components/Settings';
import { MedicationFormModal } from './components/MedicationFormModal';
import { ReminderModal } from './components/ReminderModal';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Core Data States
  const [medications, setMedications] = useState<Medication[]>(() => StorageService.getMedications());
  const [doseRecords, setDoseRecords] = useState<DoseRecord[]>(() => StorageService.getDoseRecords());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [activeReminderDose, setActiveReminderDose] = useState<DoseRecord | null>(null);

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => 
    NotificationService.getPermission()
  );

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Schedule Reconciliation & Setup
  useEffect(() => {
    const now = new Date();
    const reconciled = reconcileDoseRecords(medications, doseRecords, settings, now);
    setDoseRecords(reconciled);
    StorageService.saveDoseRecords(reconciled);
  }, []); // Run on startup

  // Save medications whenever they change
  const updateMedications = (newMeds: Medication[]) => {
    setMedications(newMeds);
    StorageService.saveMedications(newMeds);
    
    // Automatically reconcile dose records with new medications
    const reconciled = reconcileDoseRecords(newMeds, doseRecords, settings, new Date());
    setDoseRecords(reconciled);
    StorageService.saveDoseRecords(reconciled);
  };

  // Save dose records whenever they change
  const updateDoseRecords = (newRecords: DoseRecord[]) => {
    setDoseRecords(newRecords);
    StorageService.saveDoseRecords(newRecords);
  };

  // Filter today's doses
  const todayStr = getTodayDateString();
  const todayDoses = useMemo(() => {
    return doseRecords.filter(d => d.scheduledDate === todayStr);
  }, [doseRecords, todayStr]);

  // Count due doses for badges
  const pendingDueCount = useMemo(() => {
    return todayDoses.filter(d => d.status === 'due').length;
  }, [todayDoses]);

  // 2. Periodic Reminder Checking & Dynamic Status Updates (Every 30s)
  const checkSchedulesAndReminders = useCallback(() => {
    const now = new Date();
    const nowIso = now.toISOString();

    setDoseRecords(prevRecords => {
      let hasChanges = false;
      const updated = prevRecords.map(dose => {
        // If already taken or skipped, status doesn't change
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

        if (freshStatus !== dose.status) {
          hasChanges = true;
          return { ...dose, status: freshStatus };
        }
        return dose;
      });

      if (hasChanges) {
        StorageService.saveDoseRecords(updated);
      }

      // Check for doses that need reminder modal right now
      // A dose qualifies if it is today, 'due', not taken/skipped,
      // and either:
      // - not yet notified
      // - or snoozeUntil has elapsed
      if (!activeReminderDose) {
        const candidate = updated.find(d => {
          if (d.scheduledDate !== todayStr) return false;
          if (d.status !== 'due') return false;

          if (d.snoozeUntil) {
            return nowIso >= d.snoozeUntil;
          }
          return !d.notifiedAt;
        });

        if (candidate) {
          setActiveReminderDose(candidate);

          // Mark notified timestamp
          candidate.notifiedAt = nowIso;
          candidate.snoozeUntil = undefined;
          StorageService.saveDoseRecords(updated);

          // Trigger browser notification
          if (settings.notificationsEnabled) {
            NotificationService.sendBrowserNotification(candidate);
          }
        }
      }

      return updated;
    });
  }, [activeReminderDose, settings, todayStr]);

  useEffect(() => {
    // Initial check
    checkSchedulesAndReminders();

    // 30-second interval
    const interval = setInterval(checkSchedulesAndReminders, 30000);
    return () => clearInterval(interval);
  }, [checkSchedulesAndReminders]);

  // 3. User Actions: Mark Taken
  const handleTakeDose = (doseId: string) => {
    const now = new Date();
    const nowIso = now.toISOString();

    const updated = doseRecords.map(dose => {
      if (dose.id === doseId) {
        const isLate = dose.status === 'missed';
        return {
          ...dose,
          status: 'taken' as const,
          takenAt: nowIso,
          isLate,
          snoozeUntil: undefined,
        };
      }
      return dose;
    });

    updateDoseRecords(updated);

    if (activeReminderDose?.id === doseId) {
      setActiveReminderDose(null);
    }

    showToast('Dose recorded as Taken! Great job staying on track.');
  };

  // 4. User Actions: Skip Dose
  const handleSkipDose = (doseId: string) => {
    const updated = doseRecords.map(dose => {
      if (dose.id === doseId) {
        return {
          ...dose,
          status: 'skipped' as const,
          snoozeUntil: undefined,
        };
      }
      return dose;
    });

    updateDoseRecords(updated);

    if (activeReminderDose?.id === doseId) {
      setActiveReminderDose(null);
    }

    showToast('Dose skipped for today.');
  };

  // 5. User Actions: Snooze (10 minutes, max 3 times)
  const handleSnoozeDose = (doseId: string) => {
    const now = new Date();
    // 10 minutes in future
    const snoozeTime = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

    const updated = doseRecords.map(dose => {
      if (dose.id === doseId) {
        const currentCount = dose.snoozeCount || 0;
        return {
          ...dose,
          snoozeUntil: snoozeTime,
          snoozeCount: currentCount + 1,
        };
      }
      return dose;
    });

    updateDoseRecords(updated);

    if (activeReminderDose?.id === doseId) {
      setActiveReminderDose(null);
    }

    showToast('Reminder snoozed for 10 minutes.');
  };

  // 6. Medication Add / Edit
  const handleOpenAddModal = () => {
    setEditingMedication(null);
    setIsFormOpen(true);
  };

  const handleEditMedication = (med: Medication) => {
    setEditingMedication(med);
    setIsFormOpen(true);
  };

  const handleSaveMedication = (
    medData: Omit<Medication, 'createdAt' | 'updatedAt' | 'archived' | 'id'> & { id?: string }
  ) => {
    const nowIso = new Date().toISOString();

    if (medData.id) {
      // Edit existing
      const updated = medications.map(m => {
        if (m.id === medData.id) {
          return {
            ...m,
            ...medData,
            id: m.id,
            archived: m.archived,
            createdAt: m.createdAt,
            updatedAt: nowIso,
          };
        }
        return m;
      });
      updateMedications(updated);
      showToast(`Updated "${medData.name}" successfully.`);
    } else {
      // Create new
      const newMed: Medication = {
        ...medData,
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        archived: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updateMedications([...medications, newMed]);
      showToast(`Added "${newMed.name}" to your medicines.`);
    }
  };

  // 7. Archive / Unarchive Medication
  const handleArchiveMedication = (medId: string) => {
    const updated = medications.map(m => {
      if (m.id === medId) {
        return { ...m, archived: true, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    updateMedications(updated);
    showToast('Medication archived. Past history is preserved.');
  };

  const handleUnarchiveMedication = (medId: string) => {
    const updated = medications.map(m => {
      if (m.id === medId) {
        return { ...m, archived: false, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    updateMedications(updated);
    showToast('Medication reactivated and schedule restored.');
  };

  // 8. Demo Data Loader
  const handleLoadDemoData = () => {
    const demoMeds = getDemoMedications();
    // Merge or replace
    const existingIds = new Set(medications.map(m => m.id));
    const newItems = demoMeds.filter(d => !existingIds.has(d.id));

    if (newItems.length === 0) {
      showToast('Demo medications are already loaded.');
      return;
    }

    const merged = [...medications, ...newItems];
    updateMedications(merged);
    showToast('Demo medications loaded successfully! Check Today\'s Schedule.');
  };

  // 9. Browser Notification Request
  const handleRequestNotificationPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      const updatedSettings = { ...settings, notificationsEnabled: true };
      setSettings(updatedSettings);
      StorageService.saveSettings(updatedSettings);
      showToast('Notifications enabled! You will receive timely alerts.');
    } else {
      showToast('Notifications were not granted. In-app reminders will continue to work.');
    }
  };

  // 10. Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    
    // Reconcile status with new grace period
    const reconciled = reconcileDoseRecords(medications, doseRecords, newSettings, new Date());
    setDoseRecords(reconciled);
    StorageService.saveDoseRecords(reconciled);

    showToast('Settings updated.');
  };

  // 11. Export Data as JSON
  const handleExportData = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medimate_backup_${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully.');
  };

  // 12. Clear All Data
  const handleClearAllData = () => {
    StorageService.clearAllData();
    setMedications([]);
    setDoseRecords([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveReminderDose(null);
    showToast('All local data cleared successfully.');
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-slate-800 flex flex-col md:flex-row">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div 
          className="fixed top-5 right-5 z-50 bg-[#138A72] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-teal-400"
          role="status"
        >
          <span className="text-xl">🔔</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Navigation (Desktop Left Sidebar + Mobile Bottom Nav) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingDueCount={pendingDueCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {currentTab === 'dashboard' && (
          <Dashboard
            todayDoses={todayDoses}
            onTakeDose={handleTakeDose}
            onSkipDose={handleSkipDose}
            onOpenAddModal={handleOpenAddModal}
            onLoadDemoData={handleLoadDemoData}
            notificationsEnabled={settings.notificationsEnabled}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}

        {currentTab === 'medicines' && (
          <MedicationManagement
            medications={medications}
            onOpenAddModal={handleOpenAddModal}
            onEditMedication={handleEditMedication}
            onArchiveMedication={handleArchiveMedication}
            onUnarchiveMedication={handleUnarchiveMedication}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {currentTab === 'history' && (
          <MedicationHistory
            doseRecords={doseRecords}
          />
        )}

        {currentTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportData}
            onClearAllData={handleClearAllData}
            onRequestNotificationPermission={handleRequestNotificationPermission}
            notificationPermission={notificationPermission}
          />
        )}
      </main>

      {/* Medication Add / Edit Form Modal */}
      <MedicationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMedication}
        initialData={editingMedication}
      />

      {/* In-App Reminder Modal */}
      <ReminderModal
        dose={activeReminderDose}
        onTake={handleTakeDose}
        onSkip={handleSkipDose}
        onSnooze={handleSnoozeDose}
        onDismiss={() => setActiveReminderDose(null)}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
};
