import React, { useEffect } from 'react';
import { DoseRecord } from '../types';
import { formatTimeDisplay } from '../services/scheduler';
import { FoodInstructionBadge } from './StatusBadges';
import { BellRing, CheckCircle, FastForward, Clock, X, AlertCircle } from 'lucide-react';
import { NotificationService } from '../services/notification';

interface ReminderModalProps {
  dose: DoseRecord | null;
  onTake: (doseId: string) => void;
  onSkip: (doseId: string) => void;
  onSnooze: (doseId: string) => void;
  onDismiss: () => void;
  soundEnabled: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  dose,
  onTake,
  onSkip,
  onSnooze,
  onDismiss,
  soundEnabled,
}) => {
  useEffect(() => {
    if (dose && soundEnabled) {
      NotificationService.playChime();
    }
  }, [dose, soundEnabled]);

  if (!dose) return null;

  const maxSnoozeReached = (dose.snoozeCount || 0) >= 3;
  const snoozesLeft = 3 - (dose.snoozeCount || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-teal-500 overflow-hidden transform transition-all animate-scale-up">
        {/* Header Banner */}
        <div className="bg-[#138A72] text-white p-6 relative">
          <button
            onClick={onDismiss}
            aria-label="Dismiss reminder"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-teal-700/60 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <BellRing className="w-7 h-7 text-amber-300 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-teal-100">Medication Reminder</span>
              <h2 id="reminder-title" className="text-2xl font-bold leading-tight">
                Time for your medication!
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-5 bg-white">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Medicine</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{dose.medicineName}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Dosage</p>
                <p className="text-lg font-bold text-[#138A72]">{dose.dosage}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Scheduled Time</p>
                <p className="text-lg font-bold text-slate-800">{formatTimeDisplay(dose.scheduledTime)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Instructions:</span>
              <FoodInstructionBadge instruction={dose.foodInstruction} />
            </div>

            {dose.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Notes:</span>
                <p className="text-sm text-slate-700 font-medium italic mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{dose.notes}"
                </p>
              </div>
            )}
          </div>

          {dose.snoozeCount > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Snoozed previously ({dose.snoozeCount}/3 times used)</span>
            </div>
          )}

          {/* Action Buttons - large, high contrast, minimum 48px */}
          <div className="space-y-3 pt-2">
            {/* Primary Action: Mark as Taken */}
            <button
              onClick={() => onTake(dose.id)}
              className="w-full min-h-[54px] px-6 py-3.5 bg-[#138A72] hover:bg-[#0e705d] text-white text-lg font-bold rounded-2xl shadow-lg shadow-teal-800/25 flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
            >
              <CheckCircle className="w-6 h-6 text-teal-100" />
              Mark as Taken
            </button>

            {/* Secondary Actions: Snooze & Skip */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSnooze(dose.id)}
                disabled={maxSnoozeReached}
                className={`min-h-[50px] px-4 py-3 rounded-2xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  maxSnoozeReached
                    ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                    : 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
                title={maxSnoozeReached ? 'Maximum 3 snoozes reached' : `Snooze 10 minutes (${snoozesLeft} left)`}
              >
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="truncate">
                  {maxSnoozeReached ? 'No more snoozes' : `Snooze 10m (${snoozesLeft} left)`}
                </span>
              </button>

              <button
                onClick={() => onSkip(dose.id)}
                className="min-h-[50px] px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FastForward className="w-4 h-4 text-slate-500" />
                Skip Dose
              </button>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Taking medicines on time keeps you healthy
          </span>
          <button 
            onClick={onDismiss} 
            className="text-slate-500 hover:text-slate-800 font-medium underline min-h-[36px] flex items-center"
          >
            Decide Later
          </button>
        </div>
      </div>
    </div>
  );
};
