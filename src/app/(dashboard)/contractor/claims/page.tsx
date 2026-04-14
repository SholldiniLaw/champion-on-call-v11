export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Loader2, RefreshCw } from 'lucide-react';

type Claim = {
  id: string; addressLine1: string; city: string; state: string; perilType: string;
  description: string; status: string; xactimateUnitPriceTotal: string | null; createdAt: string;
};

export default function ContractorClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function fetchClaims() {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); setLastRefresh(new Date()); }
  }

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  const blasting = claims.filter((c) => c.status === 'BLASTING');
  const other = claims.filter((c) => c.status !== 'BLASTING');

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-navy-300 animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Claim Grab</h1>
          <p className="text-sm text-navy-400 mt-1">First-come, first-served — accept a claim before anyone else</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Auto-refresh · {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {blasting.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse" />
            <h2 className="text-lg font-semibold text-navy">Available Now ({blasting.length})</h2>
          </div>
          <div className="space-y-3">
            {blasting.map((c) => (
              <Link key={c.id} href={`/contractor/claims/${c.id}`}
                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3 border-l-4 border-l-crimson cursor-pointer hover:shadow-card-hover">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-crimson" />
                    <span className="text-xs font-semibold text-crimson uppercase">LIVE BLAST</span>
                    <span className="text-xs text-navy-300">· {c.perilType}</span>
                  </div>
                  <p className="font-semibold text-navy">{c.addressLine1}, {c.city}</p>
                  <p className="text-xs text-navy-400 mt-0.5 truncate">{c.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-navy">${Number(c.xactimateUnitPriceTotal || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-navy-400">Xactimate est.</p>
                  </div>
                  <span className="btn-primary text-sm py-2 px-5">Accept →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {blasting.length === 0 && (
        <div className="card text-center py-12 mb-8">
          <Zap className="w-10 h-10 text-navy-200 mx-auto mb-3" />
          <p className="text-navy-400 font-medium">No active blasts right now</p>
          <p className="text-xs text-navy-300 mt-1">This page refreshes automatically every 8 seconds</p>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy mb-4">Other Claims</h2>
          <div className="space-y-2">
            {other.map((c) => (
              <Link key={c.id} href={`/contractor/claims/${c.id}`} className="card p-4 flex items-center gap-3 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm truncate">{c.addressLine1}, {c.city}</p>
                  <p className="text-xs text-navy-400">{c.perilType} · {c.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

