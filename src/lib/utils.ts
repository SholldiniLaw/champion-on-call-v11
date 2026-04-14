import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n); }
export function statusLabel(s: string) {
  const map: Record<string,string> = { REPORTED:'Reported', BLASTING:'Finding Contractor', ASSIGNED:'Contractor Assigned', CHECKED_IN:'On-Site', INSPECTION_COMPLETE:'Inspection Done', CLOSED:'Closed' };
  return map[s] || s;
}
export function statusColor(s: string) {
  const map: Record<string,string> = { REPORTED:'bg-blue-100 text-blue-700', BLASTING:'bg-amber-100 text-amber-700', ASSIGNED:'bg-violet-100 text-violet-700', CHECKED_IN:'bg-emerald-100 text-emerald-700', INSPECTION_COMPLETE:'bg-teal-100 text-teal-700', CLOSED:'bg-gray-100 text-gray-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
}
