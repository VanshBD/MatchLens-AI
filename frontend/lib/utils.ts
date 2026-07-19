import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
    critical: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
  };
  return colors[severity] || 'text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    in_progress: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    resolved: 'text-green-600 dark:text-green-400 bg-green-500/10',
    closed: 'text-gray-500 dark:text-gray-400 bg-gray-500/10',
    escalated: 'text-red-600 dark:text-red-400 bg-red-500/10',
  };
  return colors[status] || 'text-gray-500 dark:text-gray-400 bg-gray-500/10';
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}
