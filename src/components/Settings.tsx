import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Bell, 
  Clock, 
  Download, 
  Trash2, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ShieldCheck
} from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onClearAllData: () => void;
  onRequestNotificationPermission: () => Promise<void>;
  notificationPermission: NotificationPermission;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onClearAllData,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmationText, setClearConfirmationText] = useState('');

  const handleGracePeriodChange = (minutes: 30 | 60 | 120) => {
    onUpdateSettings({
      ...settings,
      gracePeriodMinutes: minutes,
    });
  };

  const handleToggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const confirmAndClear = () => {
    if (clearConfirmationText.trim().toLowerCase() === 'delete') {
      onClearAllData();
      setShowClearModal(false);
      setClearConfirmationText('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Configure reminder alerts, grace periods, data privacy, and exports.
        </p>
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#138A72]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Notifications & Alerts</h3>
            <p className="text-sm text-slate-500">Manage how you receive timely dose reminders</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-base">Browser Permission Status:</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {notificationPermission}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {notificationPermission === 'granted'
                ? 'System desktop notifications are allowed and active.'
                : notificationPermission === 'denied'
                ? 'Notifications are blocked in your browser settings. In-app reminders will still work!'
                : 'Click enable to receive pop-up alerts on your device.'}
            </p>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={onRequestNotificationPermission}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#138A72] hover:bg-[#0e705d] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </button>
          )}

          {notificationPermission === 'granted' && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              Alerts Active
            </span>
          )}
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-base font-bold text-slate-800">Chime Sound for Reminders</p>
              <p className="text-xs text-slate-500">Play a pleasant, gentle audio tone when reminders appear</p>
            </div>
          </div>

          <button
            onClick={handleToggleSound}
            className={`min-h-[48px] px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
              settings.soundEnabled
                ? 'bg-[#138A72] text-white border-[#138A72]'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            {settings.soundEnabled ? 'Sound On' : 'Sound Muted'}
          </button>
        </div>

        {/* Important MVP Notice */}
        <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900 leading-relaxed">
          <Info className="w-5 h-5 text-[#138A72] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Important Notice about Local Notifications:</p>
            <p className="mt-0.5">
              MediMate is an offline-first private MVP running completely inside your browser without external servers. Browser alerts trigger while the web app is open or kept in a background tab. In-app reminder modals will always pop up whenever you view the app.
            </p>
          </div>
        </div>
      </div>

      {/* Missed Dose Grace Period */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Missed Dose Grace Period</h3>
            <p className="text-sm text-slate-500">
              How long after scheduled time before an untaken dose is marked as Missed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { value: 30, title: '30 Minutes', desc: 'Strict schedule reminder' },
            { value: 60, title: '60 Minutes (Default)', desc: 'Balanced & standard grace period' },
            { value: 120, title: '120 Minutes', desc: 'Relaxed schedule window' },
          ].map(opt => {
            const isSelected = settings.gracePeriodMinutes === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleGracePeriodChange(opt.value as 30 | 60 | 120)}
                className={`p-4 rounded-2xl text-left border-2 transition-all min-h-[80px] flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#138A72] bg-teal-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-bold ${isSelected ? 'text-[#138A72]' : 'text-slate-800'}`}>
                    {opt.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#138A72]" />}
                </div>
                <span className="text-xs text-slate-500 mt-2">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Data & Privacy</h3>
            <p className="text-sm text-slate-500">Your health data never leaves your device</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Export button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-base font-bold text-slate-800">Export All Data as JSON</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a complete backup copy of your medications, history, and preferences.
              </p>
            </div>
            <button
              onClick={onExportData}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Export Backup
            </button>
          </div>

          {/* Clear all data button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div>
              <p className="text-base font-bold text-rose-900">Clear All Local Data</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Permanently removes all saved medicines, schedule records, and settings from this browser.
              </p>
            </div>
            <button
              onClick={() => setShowClearModal(true)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clear All Data */}
      {showClearModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5 border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Permanently Delete All Data?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                This will erase all locally stored medications, scheduled dose history, and customized settings. This action cannot be undone.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
                Type <span className="text-rose-600 font-mono">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={clearConfirmationText}
                onChange={e => setClearConfirmationText(e.target.value)}
                placeholder="delete"
                className="w-full min-h-[48px] px-4 py-2 text-center rounded-xl border border-slate-300 font-mono text-base focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmationText('');
                }}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndClear}
                disabled={clearConfirmationText.trim().toLowerCase() !== 'delete'}
                className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                  clearConfirmationText.trim().toLowerCase() === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
