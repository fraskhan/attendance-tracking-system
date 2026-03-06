// Utility functions

import { format, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatTime(time: string): string {
  const d = parseISO(time);
  return format(d, 'hh:mm a');
}

export function formatDateTime(dateTime: string): string {
  const d = parseISO(dateTime);
  return format(d, 'MMM dd, yyyy hh:mm a');
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  d.setDate(diff);
  return format(d, 'yyyy-MM-dd');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
