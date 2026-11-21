import React, { useState, useEffect } from 'react';
import { Medication, Frequency, FoodInstruction } from '../types';
import { getTodayDateString } from '../services/scheduler';
import { X, Plus, Trash2, AlertCircle, Save } from 'lucide-react';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Omit<Medication, 'createdAt' | 'updatedAt' | 'archived' | 'id'> & { id?: string }) => void;
  initialData?: Medication | null;
}

export const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('once_daily');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00']);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [foodInstruction, setFoodInstruction] = useState<FoodInstruction>('after_food');
  const [notes, setNotes] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosage(initialData.dosage);
      setFrequency(initialData.frequency);
      setReminderTimes(initialData.reminderTimes.length > 0 ? initialData.reminderTimes : ['09:00']);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate || '');
      setFoodInstruction(initialData.foodInstruction);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setDosage('');
      setFrequency('once_daily');
      setReminderTimes(['09:00']);
      setStartDate(getTodayDateString());
      setEndDate('');
      setFoodInstruction('after_food');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Adjust default reminder times when frequency changes
  const handleFrequencyChange = (newFreq: Frequency) => {
    setFrequency(newFreq);
    if (newFreq === 'once_daily') {
      setReminderTimes([reminderTimes[0] || '09:00']);
    } else if (newFreq === 'twice_daily') {
      setReminderTimes(['09:00', '21:00']);
    } else if (newFreq === 'three_times_daily') {
      setReminderTimes(['08:00', '14:00', '20:00']);
    } else if (newFreq === 'custom') {
      if (reminderTimes.length === 0) setReminderTimes(['09:00']);
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...reminderTimes];
    updated[index] = val;
    setReminderTimes(updated);
  };

  const handleAddCustomTime = () => {
    if (reminderTimes.length < 5) {
      setReminderTimes([...reminderTimes, '12:00']);
    }
  };

  const handleRemoveCustomTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter the medicine name';
    }
    if (!dosage.trim()) {
      newErrors.dosage = 'Please specify the dosage (e.g. 1 Tablet, 5 ml)';
    }
    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }
    if (endDate && endDate < startDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    // Check reminder times
    if (reminderTimes.length === 0) {
      newErrors.reminderTimes = 'At least one reminder time is required';
    } else {
      // Check for duplicates
      const uniqueTimes = new Set(reminderTimes);
      if (uniqueTimes.size !== reminderTimes.length) {
        newErrors.reminderTimes = 'Duplicate reminder times detected. Please choose distinct times.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: initialData ? initialData.id : undefined,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      reminderTimes: [...reminderTimes].sort(),
      startDate,
      endDate: endDate ? endDate : undefined,
      foodInstruction,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#138A72] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {initialData ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <p className="text-teal-100 text-sm mt-0.5">
              Fill in the schedule and dosage details below
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-white/80 hover:text-white hover:bg-teal-700/60 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* General Errors Banner if any */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p>Please fix the highlighted fields below:</p>
                <ul className="list-disc list-inside mt-1 font-medium text-rose-700 text-xs">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Medicine Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Medicine Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Lisinopril, Metformin, Vitamin D3"
              className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
              } focus:border-[#138A72] focus:ring-2 focus:ring-teal-500/20`}
            />
            {errors.name && <p className="text-xs text-rose-600 font-semibold">{errors.name}</p>}
          </div>

          {/* Dosage */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Dosage <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g. 1 Tablet, 20 mg, 5 ml, 1 Capsule"
              className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base ${
                errors.dosage ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
              } focus:border-[#138A72] focus:ring-2 focus:ring-teal-500/20`}
            />
            {errors.dosage && <p className="text-xs text-rose-600 font-semibold">{errors.dosage}</p>}
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Frequency <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: 'once_daily', label: 'Once daily' },
                { id: 'twice_daily', label: 'Twice daily' },
                { id: 'three_times_daily', label: 'Three times' },
                { id: 'custom', label: 'Custom' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFrequencyChange(f.id as Frequency)}
                  className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    frequency === f.id
                      ? 'bg-[#138A72] text-white border-[#138A72] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Times */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800">
                Reminder Time(s) <span className="text-rose-500">*</span>
              </label>
              {frequency === 'custom' && reminderTimes.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddCustomTime}
                  className="text-xs font-bold text-[#138A72] hover:text-teal-800 flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg bg-teal-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Time ({reminderTimes.length}/5)
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {reminderTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="time"
                      value={time}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base font-semibold text-slate-800 focus:border-[#138A72]"
                      required
                    />
                  </div>
                  {frequency === 'custom' && reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomTime(idx)}
                      aria-label="Remove time"
                      className="p-3 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center border border-slate-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.reminderTimes && (
              <p className="text-xs text-rose-600 font-semibold">{errors.reminderTimes}</p>
            )}
          </div>

          {/* Dates: Start & End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-base ${
                  errors.startDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:border-[#138A72]`}
                required
              />
              {errors.startDate && <p className="text-xs text-rose-600 font-semibold">{errors.startDate}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">
                End Date <span className="text-slate-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-base ${
                  errors.endDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:border-[#138A72]`}
                placeholder="Ongoing if empty"
              />
              {errors.endDate && <p className="text-xs text-rose-600 font-semibold">{errors.endDate}</p>}
            </div>
          </div>

          {/* Food Instructions */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Food Instructions
            </label>
            <select
              value={foodInstruction}
              onChange={e => setFoodInstruction(e.target.value as FoodInstruction)}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base bg-white focus:border-[#138A72]"
            >
              <option value="after_food">After food (Recommended for most pills)</option>
              <option value="before_food">Before food (Empty stomach)</option>
              <option value="with_food">With food / during meal</option>
              <option value="no_specific">No specific instruction (Any time)</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Special Notes or Instructions <span className="text-slate-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Drink a full glass of water. Avoid taking with dairy."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base focus:border-[#138A72]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-8 py-2.5 rounded-xl bg-[#138A72] hover:bg-[#0e705d] text-white font-bold text-base shadow-md shadow-teal-800/20 flex items-center gap-2 transition-transform active:scale-98"
            >
              <Save className="w-5 h-5" />
              Save Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
