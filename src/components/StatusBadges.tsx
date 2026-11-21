import React from 'react';
import { DoseStatus, FoodInstruction } from '../types';
import { CheckCircle2, Clock, AlertTriangle, FastForward, UtensilsCrossed, Apple, Coffee } from 'lucide-react';

export const DoseStatusBadge: React.FC<{ status: DoseStatus; isLate?: boolean }> = ({ status, isLate }) => {
  switch (status) {
    case 'taken':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {isLate ? 'Taken (Late)' : 'Taken'}
        </span>
      );
    case 'due':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
          <Clock className="w-4 h-4 text-amber-700" />
          Due Now
        </span>
      );
    case 'upcoming':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          <Clock className="w-4 h-4 text-sky-600" />
          Upcoming
        </span>
      );
    case 'missed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-900 border border-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          Missed
        </span>
      );
    case 'skipped':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <FastForward className="w-4 h-4 text-slate-500" />
          Skipped
        </span>
      );
    default:
      return null;
  }
};

export const FoodInstructionBadge: React.FC<{ instruction: FoodInstruction }> = ({ instruction }) => {
  switch (instruction) {
    case 'before_food':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          <Apple className="w-4 h-4 text-amber-700" />
          Before food
        </span>
      );
    case 'after_food':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
          <UtensilsCrossed className="w-4 h-4 text-teal-700" />
          After food
        </span>
      );
    case 'with_food':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
          <UtensilsCrossed className="w-4 h-4 text-indigo-700" />
          With food
        </span>
      );
    case 'no_specific':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          <Coffee className="w-4 h-4 text-slate-500" />
          Any time
        </span>
      );
  }
};
