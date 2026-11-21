import { DoseRecord } from '../types';
import { formatTimeDisplay } from './scheduler';

export const NotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  },

  playChime(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // Friendly, gentle healthcare two-tone chime (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.2); // B5
      gain2.gain.setValueAtTime(0.18, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio chime playback was blocked or unsupported:', e);
    }
  },

  sendBrowserNotification(dose: DoseRecord): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    try {
      const formattedTime = formatTimeDisplay(dose.scheduledTime);
      const title = 'Time for your medication! 💊';
      const body = `Medicine: ${dose.medicineName}\nDosage: ${dose.dosage}\nScheduled: ${formattedTime}`;

      const notification = new Notification(title, {
        body,
        icon: '/vite.svg',
        tag: `dose_${dose.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('Failed to dispatch browser notification:', err);
    }
  },
};
