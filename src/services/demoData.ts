import { Medication } from '../types';
import { getTodayDateString } from './scheduler';

export function getDemoMedications(): Medication[] {
  const today = getTodayDateString();
  const now = new Date().toISOString();

  return [
    {
      id: 'demo_vitamin_d3',
      name: 'Vitamin D3 (Sample)',
      dosage: '1 Capsule',
      frequency: 'once_daily',
      reminderTimes: ['09:00'],
      startDate: today,
      foodInstruction: 'after_food',
      notes: 'Take with morning breakfast for best absorption. (Demo data)',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo_multivitamin',
      name: 'Multivitamin (Sample)',
      dosage: '1 Tablet',
      frequency: 'once_daily',
      reminderTimes: ['13:00'],
      startDate: today,
      foodInstruction: 'with_food',
      notes: 'Take during lunch with a glass of water. (Demo data)',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo_calcium',
      name: 'Calcium (Sample)',
      dosage: '1 Tablet',
      frequency: 'twice_daily',
      reminderTimes: ['10:00', '20:00'],
      startDate: today,
      foodInstruction: 'after_food',
      notes: 'Morning and evening doses after meals. (Demo data)',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
