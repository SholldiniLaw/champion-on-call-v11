export const dynamic = 'force-dynamic'; 
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Zap, CheckCircle2, AlertTriangle, Loader2, Navigation, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

type ClaimData = {
  id: string; addressLine1: string; city: string; state: string; zip: string;
  latitude: string; longitude: string; perilType: string; description: string;
  status: string; xactimateUnitPriceTotal: string | null; assignedContractorId: string | null;
  assignedContractor?: { id: string; companyName: string; isVetted: boolean; user: { name: string } } | null;
  createdAt: string;
};

export default function ContractorClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, startAccept] = useTransition();
  const [checkingIn, startCheckIn] = useTransition();
  const [conflict, setConflict] = useState(false);
  const [geoStatus, setGeoStatus] = useState<{ lat: number; lng: number; dist: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [demoBypass, setDemoBypass] = useState(false);

  useEffect(() => {
    fetch(`/api/claims/${id}`).then(r => r.json()).then(d => { setClaim(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  function handleAccept() {
    startAccept(async () => {
      const res = await fetch(`/api/claims/${id}/accept`, { method: 'PATCH' });
      if (res.ok) {
        toast.success('Claim accepted! You are now assigned.');
        const data = await res.json();
        setClaim((c) => c ? { ...c, status: data.status, assignedContractorId: 'self' } : c);
        router.refresh();
      } else if (res.status === 409) {
        setConflict(true);
        toast.error('Another contractor already accepted this claim');
      } else {
        const e = await res.json();
        toast.error(e.error || 'Failed to accept');
      }
    });
  }

  function handleGeoCheck() {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!claim) return;
        const R = 6371000;
        const dLat = (Number(claim.latitude) - pos.coords.latitude) * Math.PI / 180;
        const dLng = (Number(claim.longitude) - pos.coords.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(pos.coords.latitude*Math.PI/180) * Math.cos(Number(claim.latitude)*Math.PI/180) * Math.sin(dLng/2)**2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setGeoStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude, dist: Math.round(dist) });
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); toast.error('Could not get location'); }
    );
  }

  function handleCheckIn() {
    if (!geoStatus && !demoBypass) return toast.error('Get your location first');
    startCheckIn(async () => {
      const body = demoBypass
        ? { latitude: Number(claim?.latitude || 0), longitude: Number(claim?.longitude || 0), demoBypass: true }
        : { latitude: geoStatus!.lat, longitude: geoStatus!.lng, demoBypass: false };
      const res = await fetch(`/api/claims/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const d = await res.json();
        toast.success(d.message);
        setClaim((c) => c ? { ...c, status: 'CHECKED_IN' } : c);
        router.refresh();
      } else {
        const e = await res.json();
        toast.error(e.error || 'Check-in failed');
      }
    });
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-navy-300 animate-spin" /></div>;
  if (!claim) return <div className="p-8 text-center text-navy-400">Claim not found</div>;

  const isBlasting = claim.status === 'BLASTING';
  const isAssigned = claim.status === 'ASSIGNED';
  const isCheckedIn = ['CHECKED_IN', 'INSPECTION_COMPLETE', 'CLOSED'].includes(claim.status);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-navy-400 hover:text-navy mb-4 inline-block">← Back</button>

      {/* Claim info */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isBlasting ? 'bg-amber-100 text-amber-700 animate-pulse' : isCheckedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
          }`}>{claim.status.replace('_', ' ')}</span>
          <span className="text-xs text-navy-300">{claim.perilType}</span>
        </div>
        <h1 className="text-xl font-bold text-navy mb-1">{claim.addressLine1}</h1>
        <p className="text-sm text-navy-400">{claim.city}, {claim.state} {claim.zip}</p>
        <p className="text-sm text-navy-500 mt-3">{claim.description}</p>
        <div className="mt-4 p-3 bg-navy-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-navy-400">Xactimate Estimate</span>
          <span className="text-xl font-bold text-navy">${Number(claim.xactimateUnitPriceTotal || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* FCFS Accept */}
      {isBlasting && !conflict && (
        <div className="card mb-4 border-l-4 border-l-crimson">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-crimson" />
            <h2 className="font-semibold text-navy">Claim Available — First Come, First Served</h2>
          </div>
          <p className="text-sm text-navy-400 mb-4">Accept this claim to be assigned as the responding contractor.</p>
          <button onClick={handleAccept} disabled={accepting} className="btn-primary w-full py-3 text-base gap-2">
            {accepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {accepting ? 'Accepting...' : 'Accept This Claim'}
          </button>
        </div>
      )}

      {/* 409 Conflict */}
      {conflict && (
        <div className="card mb-4 bg-crimson-50 border-crimson-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-crimson shrink-0" />
            <div>
              <h2 className="font-semibold text-crimson">Claim Already Taken</h2>
              <p className="text-sm text-crimson/70 mt-0.5">Another contractor accepted this claim before you. Check back for new blasts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Geo Check-In */}
      {isAssigned && (
        <div className="card mb-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-navy">On-Site Check-In</h2>
          </div>
          <p className="text-sm text-navy-400 mb-4">You must be within 100 meters of the property to check in.</p>

          {/* Demo bypass toggle */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <button onClick={() => setDemoBypass(!demoBypass)} className="text-amber-600">
              {demoBypass ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
            <div>
              <p className="text-sm font-medium text-amber-700">Demo Mode {demoBypass ? 'ON' : 'OFF'}</p>
              <p className="text-xs text-amber-600">Bypass geo requirement for demo purposes</p>
            </div>
          </div>

          {!demoBypass && (
            <>
              <button onClick={handleGeoCheck} disabled={geoLoading} className="btn-outline w-full mb-3 gap-2">
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {geoLoading ? 'Getting location...' : 'Check My Location'}
              </button>
              {geoStatus && (
                <div className={`p-3 rounded-lg mb-3 ${geoStatus.dist <= 100 ? 'bg-emerald-50 border border-emerald-200' : 'bg-crimson-50 border border-crimson-200'}`}>
                  <p className={`text-sm font-medium ${geoStatus.dist <= 100 ? 'text-emerald-700' : 'text-crimson'}`}>
                    {geoStatus.dist <= 100 ? `✓ Within range — ${geoStatus.dist}m from property` : `✗ Too far — ${geoStatus.dist}m away (max 100m)`}
                  </p>
                </div>
              )}
            </>
          )}

          <button onClick={handleCheckIn}
            disabled={checkingIn || (!demoBypass && (!geoStatus || geoStatus.dist > 100))}
            className="btn-primary w-full py-3 text-base gap-2">
            {checkingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {checkingIn ? 'Checking in...' : 'Check In On-Site'}
          </button>
        </div>
      )}

      {isCheckedIn && (
        <div className="card mb-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h2 className="font-semibold text-emerald-700">Checked In</h2>
              <p className="text-sm text-emerald-600 mt-0.5">You have been verified on-site. Proceed with inspection.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
