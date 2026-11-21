import React, { useState } from 'react';
import { Medication } from '../types';
import { formatTimeDisplay } from '../services/scheduler';
import { FoodInstructionBadge } from './StatusBadges';
import { 
  PlusCircle, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Clock, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Pill,
  Sparkles
} from 'lucide-react';

interface MedicationManagementProps {
  medications: Medication[];
  onOpenAddModal: () => void;
  onEditMedication: (med: Medication) => void;
  onArchiveMedication: (medId: string) => void;
  onUnarchiveMedication: (medId: string) => void;
  onLoadDemoData: () => void;
}

export const MedicationManagement: React.FC<MedicationManagementProps> = ({
  medications,
  onOpenAddModal,
  onEditMedication,
  onArchiveMedication,
  onUnarchiveMedication,
  onLoadDemoData,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

  const activeMeds = medications.filter(m => !m.archived);
  const archivedMeds = medications.filter(m => m.archived);

  const displayedMeds = medications.filter(m => {
    if (activeFilter === 'active') return !m.archived;
    if (activeFilter === 'archived') return m.archived;
    return true;
  });

  const getFrequencyLabel = (freq: Medication['frequency']) => {
    switch (freq) {
      case 'once_daily': return 'Once daily';
      case 'twice_daily': return 'Twice daily';
      case 'three_times_daily': return 'Three times daily';
      case 'custom': return 'Custom schedule';
      default: return freq;
    }
  };

  const handleConfirmArchive = () => {
    if (archiveTargetId) {
      onArchiveMedication(archiveTargetId);
      setArchiveTargetId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 md:pb-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Medications
          </h2>
          <p className="text-slate-600 mt-1 text-base">
            Manage your prescriptions, dosages, and daily reminder times.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#138A72] hover:bg-[#0e705d] text-white text-base font-bold shadow-md shadow-teal-800/20 min-h-[48px] transition-transform active:scale-98"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveFilter('active')}
          className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'active'
              ? 'bg-[#138A72] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Active ({activeMeds.length})
        </button>
        <button
          onClick={() => setActiveFilter('archived')}
          className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'archived'
              ? 'bg-[#138A72] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Archived ({archivedMeds.length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-[#138A72] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          All ({medications.length})
        </button>
      </div>

      {/* List of Medications */}
      {displayedMeds.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200/80 text-center max-w-lg mx-auto space-y-4 my-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {activeFilter === 'archived' ? 'No Archived Medications' : 'No Medications Found'}
          </h3>
          <p className="text-slate-500 text-sm">
            {activeFilter === 'archived'
              ? 'Medicines you archive in the future will appear here.'
              : 'Get started by creating your first medication reminder or loading demo data.'}
          </p>
          {activeFilter !== 'archived' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenAddModal}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-[#138A72] hover:bg-[#0e705d] text-white font-bold rounded-xl shadow-sm text-sm"
              >
                Add Medicine
              </button>
              <button
                onClick={onLoadDemoData}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#138A72] font-bold rounded-xl border border-teal-200 text-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Load Demo Data
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMeds.map(med => (
            <div
              key={med.id}
              className={`bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col justify-between ${
                med.archived ? 'border-slate-300 opacity-70 bg-slate-50' : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-slate-900">{med.name}</h3>
                      {med.archived && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-[#138A72] mt-0.5">{med.dosage}</p>
                  </div>
                  
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {getFrequencyLabel(med.frequency)}
                  </span>
                </div>

                {/* Reminder Times Chips */}
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Scheduled Times</span>
                  <div className="flex flex-wrap gap-2">
                    {med.reminderTimes.map(time => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-[#138A72] border border-teal-200 rounded-xl text-sm font-bold"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeDisplay(time)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags & Dates */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Meal Guide:</span>
                    <FoodInstructionBadge instruction={med.foodInstruction} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Duration:
                    </span>
                    <span className="font-medium text-slate-800">
                      {med.startDate} {med.endDate ? `to ${med.endDate}` : '(Ongoing)'}
                    </span>
                  </div>

                  {med.notes && (
                    <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs italic">{med.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-end gap-2">
                {!med.archived ? (
                  <>
                    <button
                      onClick={() => onEditMedication(med)}
                      className="min-h-[48px] px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-slate-500" />
                      Edit
                    </button>
                    <button
                      onClick={() => setArchiveTargetId(med.id)}
                      className="min-h-[48px] px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-sm flex items-center gap-1.5 transition-colors border border-rose-200"
                    >
                      <Archive className="w-4 h-4 text-rose-600" />
                      Archive
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onUnarchiveMedication(med.id)}
                    className="min-h-[48px] px-4 py-2 rounded-xl text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold text-sm flex items-center gap-1.5 transition-colors border border-teal-200"
                  >
                    <ArchiveRestore className="w-4 h-4 text-[#138A72]" />
                    Unarchive & Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Archiving */}
      {archiveTargetId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Archive this medication?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Archiving will stop future reminders and schedule generation, but all your past dose records and adherence history will be safely preserved.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setArchiveTargetId(null)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
