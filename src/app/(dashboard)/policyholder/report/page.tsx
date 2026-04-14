export const dynamic = 'force-dynamic';
import { requireRole } from '@/lib/auth';
import { ReportWizard } from './report-wizard';

export default async function ReportPage() {
  const user = await requireRole('POLICYHOLDER');
  const profileId = user.policyholderProfile?.id;
  if (!profileId) return <div>Profile not found</div>;
  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Report a New Claim</h1><p className="text-sm text-navy-400 mt-1">Walk through each step to file your First Notice of Loss</p></div>
      <ReportWizard profileId={profileId} />
    </div>
  );
}
