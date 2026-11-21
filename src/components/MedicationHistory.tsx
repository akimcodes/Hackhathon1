import React, { useState, useMemo } from 'react';
import { DoseRecord } from '../types';
import { formatTimeDisplay, getTodayDateString } from '../services/scheduler';
import { DoseStatusBadge } from './StatusBadges';
import { 
  CheckCircle2, 
  FastForward, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Clock, 
  Sparkles,
  TrendingUp,
  Pill
} from 'lucide-react';

interface MedicationHistoryProps {
  doseRecords: DoseRecord[];
}

type DateRangeFilter = 'today' | '7days' | '30days' | 'all';

export const MedicationHistory: React.FC<MedicationHistoryProps> = ({ doseRecords }) => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('7days');
  const [searchMedicine, setSearchMedicine] = useState('');

  // Calculate cutoff dates based on local time
  const todayStr = getTodayDateString();

  const getDateCutoff = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cutoff7 = getDateCutoff(7);
  const cutoff30 = getDateCutoff(30);

  // Filter records
  const filteredRecords = useMemo(() => {
    return doseRecords.filter(rec => {
      // Date filter
      if (dateFilter === 'today' && rec.scheduledDate !== todayStr) return false;
      if (dateFilter === '7days' && rec.scheduledDate < cutoff7) return false;
      if (dateFilter === '30days' && rec.scheduledDate < cutoff30) return false;

      // Medicine search filter
      if (searchMedicine.trim()) {
        const query = searchMedicine.toLowerCase();
        if (!rec.medicineName.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort reverse chronologically
      if (a.scheduledDate !== b.scheduledDate) {
        return b.scheduledDate.localeCompare(a.scheduledDate);
      }
      return b.scheduledTime.localeCompare(a.scheduledTime);
    });
  }, [doseRecords, dateFilter, searchMedicine, todayStr, cutoff7, cutoff30]);

  // Statistics on filtered set
  const total = filteredRecords.length;
  const taken = filteredRecords.filter(r => r.status === 'taken').length;
  const skipped = filteredRecords.filter(r => r.status === 'skipped').length;
  const missed = filteredRecords.filter(r => r.status === 'missed').length;

  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

  // Encouraging message
  const getEncouragement = (rate: number, count: number) => {
    if (count === 0) return 'No records found for the selected period.';
    if (rate >= 90) {
      return '🌟 Outstanding consistency! You are taking superb care of your daily well-being.';
    }
    if (rate >= 75) {
      return '👏 Great work! Regular routines provide steady, effective protection.';
    }
    if (rate >= 50) {
      return '🌱 Good progress! Every dose counts toward your long-term health.';
    }
    return '💙 We are with you. Every single step matters—keep your water and medicine close by.';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Medication History
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Review your dose adherence over time and track your health progress.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled</span>
            <Pill className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{total}</p>
          <span className="text-xs text-slate-500 font-medium">In selected range</span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Taken</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-900">{taken}</p>
          <span className="text-xs text-emerald-700 font-medium">Doses completed</span>
        </div>

        <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Skipped</span>
            <FastForward className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{skipped}</p>
          <span className="text-xs text-slate-600 font-medium">User skipped</span>
        </div>

        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Missed</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-900">{missed}</p>
          <span className="text-xs text-rose-700 font-medium">Past grace period</span>
        </div>
      </div>

      {/* Adherence Rate & Encouragement Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#138A72]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Adherence</span>
              <h3 className="text-2xl font-black text-slate-900">{adherenceRate}% Adherence</h3>
            </div>
          </div>

          <div className="text-xs sm:text-right text-slate-500 font-medium">
            Formula: Taken Doses ({taken}) / Total Scheduled ({total})
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              adherenceRate >= 80 ? 'bg-[#138A72]' : adherenceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${adherenceRate}%` }}
          />
        </div>

        {/* Encouraging Non-Judgmental Message */}
        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex items-center gap-3 text-[#138A72] text-sm font-semibold">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-[#138A72]" />
          <span>{getEncouragement(adherenceRate, total)}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date Range Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'all', label: 'All Records' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as DateRangeFilter)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  dateFilter === f.id
                    ? 'bg-[#138A72] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search by Medicine Name */}
          <div className="relative min-w-[260px]">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchMedicine}
              onChange={e => setSearchMedicine(e.target.value)}
              placeholder="Filter by medicine name..."
              className="w-full min-h-[46px] pl-11 pr-4 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:border-[#138A72]"
            />
          </div>
        </div>

        {/* Records Count */}
        <div className="text-xs text-slate-500 font-semibold flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Showing {filteredRecords.length} records</span>
          {searchMedicine && (
            <button
              onClick={() => setSearchMedicine('')}
              className="text-[#138A72] hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No records match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different date range or clearing the search text.</p>
          </div>
        ) : (
          filteredRecords.map(rec => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{rec.medicineName}</span>
                  <span className="text-xs font-bold text-[#138A72] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {rec.dosage}
                  </span>
                  <DoseStatusBadge status={rec.status} isLate={rec.isLate} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {rec.scheduledDate}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Scheduled: {formatTimeDisplay(rec.scheduledTime)}
                  </span>
                  {rec.takenAt && (
                    <span className="text-emerald-700 font-semibold">
                      Taken at: {new Date(rec.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {rec.snoozeCount > 0 && (
                    <span className="text-amber-700">
                      (Snoozed {rec.snoozeCount}x)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 self-start sm:self-auto">
                ID: {rec.id.slice(0, 16)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
