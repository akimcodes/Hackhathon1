import React from 'react';
import { DoseRecord } from '../types';
import { formatTimeDisplay, getNextUpcomingDose } from '../services/scheduler';
import { DoseStatusBadge, FoodInstructionBadge } from './StatusBadges';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Sparkles, 
  Bell, 
  Calendar, 
  Check, 
  FastForward,
  Pill,
  Heart
} from 'lucide-react';

interface DashboardProps {
  todayDoses: DoseRecord[];
  onTakeDose: (doseId: string) => void;
  onSkipDose: (doseId: string) => void;
  onOpenAddModal: () => void;
  onLoadDemoData: () => void;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todayDoses,
  onTakeDose,
  onSkipDose,
  onOpenAddModal,
  onLoadDemoData,
  notificationsEnabled,
  onRequestNotificationPermission,
}) => {
  // Current dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! ☀️';
    if (hour < 17) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate statistics
  const totalDoses = todayDoses.length;
  const takenDoses = todayDoses.filter(d => d.status === 'taken').length;
  const skippedDoses = todayDoses.filter(d => d.status === 'skipped').length;
  const missedDoses = todayDoses.filter(d => d.status === 'missed').length;
  const pendingDoses = todayDoses.filter(d => d.status === 'upcoming' || d.status === 'due').length;

  const completionPercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  // Next upcoming medication
  const nextDose = getNextUpcomingDose(todayDoses);

  // Sort today's doses chronologically
  const sortedDoses = [...todayDoses].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 md:pb-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold mb-1">
            <Calendar className="w-4 h-4 text-[#138A72]" />
            <span>{formattedDate}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-slate-600 mt-1 text-base">
            Here is your daily medication schedule. Stay healthy and hydrated!
          </p>
        </div>

        {/* Quick Actions / Notification Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRequestNotificationPermission}
            title={notificationsEnabled ? 'Notifications are active' : 'Click to enable browser notifications'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold min-h-[48px] border transition-all ${
              notificationsEnabled
                ? 'bg-teal-50 text-teal-800 border-teal-300'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-[#138A72]' : 'text-amber-600 animate-pulse'}`} />
            <span>{notificationsEnabled ? 'Reminders On' : 'Enable Alerts'}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#138A72] hover:bg-[#0e705d] text-white text-base font-bold shadow-md shadow-teal-800/20 min-h-[48px] transition-transform active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5 text-teal-100" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* When no doses exist: Friendly Empty State */}
      {totalDoses === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200/80 text-center max-w-xl mx-auto space-y-6 my-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-[#138A72]">
            <Pill className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">No Medications Scheduled Today</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              You don't have any medicine reminders set up yet. You can add your daily prescriptions or load sample demo data to see how MediMate works.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-[#138A72] hover:bg-[#0e705d] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
            >
              <PlusCircle className="w-5 h-5" />
              Add Medicine
            </button>
            <button
              onClick={onLoadDemoData}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-teal-50 hover:bg-teal-100 text-[#138A72] border-2 border-[#138A72]/30 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-[#138A72]" />
              Load Demo Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Progress Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Today's Progress</h3>
                <p className="text-sm text-slate-500 font-medium">
                  {takenDoses} of {totalDoses} doses taken ({completionPercentage}%)
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="flex items-center gap-4 self-start sm:self-auto">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#138A72] transition-all duration-700 ease-out"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#138A72] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Quick Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Scheduled</span>
                  <Pill className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{totalDoses}</p>
                <span className="text-xs text-slate-500 font-medium">Total for today</span>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Taken</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-emerald-900">{takenDoses}</p>
                <span className="text-xs text-emerald-700 font-medium">Completed doses</span>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center justify-between text-amber-800 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-amber-900">{pendingDoses}</p>
                <span className="text-xs text-amber-700 font-medium">Upcoming / Due</span>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Skipped</span>
                  <FastForward className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-2xl font-black text-slate-800">{skippedDoses}</p>
                <span className="text-xs text-slate-600 font-medium">Skipped doses</span>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-rose-800 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Missed</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-black text-rose-900">{missedDoses}</p>
                <span className="text-xs text-rose-700 font-medium">Overdue doses</span>
              </div>
            </div>
          </div>

          {/* Next Medication Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#138A72] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Next In Line
              </span>
            </div>

            {nextDose ? (
              <div className="bg-gradient-to-r from-teal-50/70 to-emerald-50/50 rounded-2xl p-5 md:p-6 border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#138A72] text-white flex items-center justify-center font-bold text-xl shadow-md">
                      💊
                    </div>
                    <div>
                      <h4 className="text-2xl font-extrabold text-slate-900">{nextDose.medicineName}</h4>
                      <p className="text-base font-bold text-[#138A72]">{nextDose.dosage}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Clock className="w-4 h-4 text-[#138A72]" />
                      Scheduled: {formatTimeDisplay(nextDose.scheduledTime)}
                    </span>
                    <FoodInstructionBadge instruction={nextDose.foodInstruction} />
                    <DoseStatusBadge status={nextDose.status} />
                  </div>

                  {nextDose.notes && (
                    <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded-lg">
                      Note: {nextDose.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onTakeDose(nextDose.id)}
                    className="min-h-[48px] px-6 py-3 bg-[#138A72] hover:bg-[#0e705d] text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-base transition-transform active:scale-[0.98]"
                  >
                    <Check className="w-5 h-5" />
                    Mark Taken Now
                  </button>
                  <button
                    onClick={() => onSkipDose(nextDose.id)}
                    className="min-h-[48px] px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-2xl text-sm flex items-center justify-center gap-1.5"
                  >
                    <FastForward className="w-4 h-4" />
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-pulse" />
                <h4 className="text-lg font-bold text-slate-800">All caught up for now!</h4>
                <p className="text-sm text-slate-500 mt-1">
                  You have completed or reviewed all scheduled doses for today. Rest well!
                </p>
              </div>
            )}
          </div>

          {/* Today's Schedule List */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Today's Schedule</h3>
                <p className="text-xs text-slate-500 font-medium">All doses scheduled for today</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {sortedDoses.length} {sortedDoses.length === 1 ? 'dose' : 'doses'}
              </span>
            </div>

            <div className="space-y-3">
              {sortedDoses.map(dose => {
                const isTaken = dose.status === 'taken';
                const isSkipped = dose.status === 'skipped';
                const isMissed = dose.status === 'missed';
                const isDue = dose.status === 'due';
                const isUpcoming = dose.status === 'upcoming';

                return (
                  <div
                    key={dose.id}
                    className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isTaken
                        ? 'bg-emerald-50/30 border-emerald-200/80'
                        : isDue
                        ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                        : isMissed
                        ? 'bg-rose-50/40 border-rose-200'
                        : isSkipped
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Medicine details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-lg font-extrabold text-slate-900">{dose.medicineName}</span>
                        <span className="text-sm font-bold text-[#138A72] bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                          {dose.dosage}
                        </span>
                        <DoseStatusBadge status={dose.status} isLate={dose.isLate} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-600">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatTimeDisplay(dose.scheduledTime)}
                        </span>
                        <FoodInstructionBadge instruction={dose.foodInstruction} />
                        {dose.takenAt && (
                          <span className="text-xs text-emerald-800 font-medium">
                            Recorded at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {dose.notes && (
                        <p className="text-xs text-slate-500 italic">
                          "{dose.notes}"
                        </p>
                      )}
                    </div>

                    {/* Interactive Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      {/* For unfinalized doses (upcoming or due) */}
                      {(isUpcoming || isDue) && (
                        <>
                          <button
                            onClick={() => onTakeDose(dose.id)}
                            className="min-h-[48px] px-5 py-2.5 bg-[#138A72] hover:bg-[#0e705d] text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            Taken
                          </button>
                          <button
                            onClick={() => onSkipDose(dose.id)}
                            className="min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <FastForward className="w-4 h-4" />
                            Skip
                          </button>
                        </>
                      )}

                      {/* For missed doses: Allow marking as taken late */}
                      {isMissed && (
                        <button
                          onClick={() => onTakeDose(dose.id)}
                          className="min-h-[48px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          Mark as Taken (Late)
                        </button>
                      )}

                      {/* Already taken checkmark */}
                      {isTaken && (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-100/70 px-4 py-2 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          Recorded
                        </span>
                      )}

                      {/* Already skipped tag */}
                      {isSkipped && (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-3 py-2 rounded-xl">
                          Skipped for today
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
