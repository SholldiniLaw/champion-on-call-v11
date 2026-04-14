export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
export const metadata: Metadata = { title: 'Champion On-Call | Managed Repair Marketplace', description: "Houses don't make claims, people do." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen bg-gray-50 text-navy antialiased">{children}<Toaster position="top-right" /></body></html>
  );
}
