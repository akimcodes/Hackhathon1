# MediMate – Never Miss a Dose. Stay on Track.

MediMate is a modern, accessible healthcare web application designed primarily for elderly individuals and patients to help manage prescriptions, daily dosages, and timely medication adherence.

Built for a 6-hour hackathon MVP.

---

## ✨ Features

- **Dashboard**: Dynamic time-based greeting, daily progress ring, next medication highlight card, and complete daily schedule.
- **My Medicines**: Add, edit, and archive prescriptions with flexible frequencies (Once, Twice, Three times, Custom 1–5 times) and food instructions.
- **Deterministic Scheduling Engine**: Unique deterministic dose IDs (`medicationId + date + time`) preventing duplicate schedules.
- **Dose Status Transitions**: `Upcoming` ➔ `Due` ➔ `Missed` with configurable grace period (30, 60, or 120 minutes).
- **Reminders & Audio Alerts**: In-app pop-up modal with dual-tone audio chime and 10-minute snooze (max 3 times).
- **Medication History**: Adherence percentage analytics, encouraging health messages, date range filters (Today, 7 Days, 30 Days, All), and medicine search.
- **Settings & Privacy**: 100% offline-first local data storage (`localStorage`), JSON data export/backup, and safe data clearance.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Browser `localStorage`
- **Audio & Notifications**: Web Audio API + HTML5 Notification API

---

## 🚀 Quick Start

1. Clone or download the repository:
   ```bash
   git clone <your-repo-url>
   cd medimate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run preview
   ```
