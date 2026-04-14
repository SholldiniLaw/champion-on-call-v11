'use client';

import { useState } from 'react';
import { Star, Shield, AlertTriangle, ArrowUpDown, MapPin, X } from 'lucide-react';
import { distanceMiles } from '@/lib/geo';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

type Contractor = {
  id: string; name: string; companyName: string; tradeType: string; isVetted: boolean;
  championScore: number; communicationRating: number; professionalismRating: number;
  punctualityRating: number; cleanlinessRating: number; qualityRating: number;
  latitude: number; longitude: number;
};

type SortKey = 'rating' | 'alpha' | 'distance' | 'popular';

export function MarketplaceClient({ claimId, claimLat, claimLng, xactimateTotal, contractors }: {
  claimId: string; claimLat: number; claimLng: number; xactimateTotal: number; contractors: Contractor[];
}) {
  const [sort, setSort] = useState<SortKey>('rating');
  const [warningContractor, setWarningContractor] = useState<Contractor | null>(null);

  const withDist = contractors.map((c) => ({ ...c, distance: distanceMiles(claimLat, claimLng, c.latitude, c.longitude) }));

  const sorted = [...withDist].sort((a, b) => {
    if (sort === 'rating') return b.championScore - a.championScore;
    if (sort === 'alpha') return a.companyName.localeCompare(b.companyName);
    if (sort === 'distance') return a.distance - b.distance;
    return b.championScore - a.championScore;
  });

  const networkPayout = xactimateTotal;
  const cashPayout = xactimateTotal * 0.8;
  const penalty = xactimateTotal * 0.2;

  return (
    <div>
      {/* Benefit info banner */}
      <div className="card mb-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-navy text-sm">Network Benefit: 100% Coverage</p>
            <p className="text-xs text-navy-400 mt-1">Choose a <span className="font-semibold text-emerald-600">Champion Network</span> provider for full Xactimate coverage ({formatCurrency(networkPayout)}). Non-network providers are covered at 80% ({formatCurrency(cashPayout)}).</p>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <ArrowUpDown className="w-4 h-4 text-navy-400 shrink-0" />
        {(['rating', 'distance', 'alpha'] as SortKey[]).map((key) => (
          <button key={key} onClick={() => setSort(key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${sort === key ? 'bg-navy text-white' : 'bg-white border border-navy-200 text-navy-500 hover:bg-navy-50'}`}>
            {key === 'rating' ? 'Champion Score' : key === 'distance' ? 'Distance' : 'A-Z'}
          </button>
        ))}
      </div>

      {/* Contractor grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy text-sm">{c.companyName}</h3>
                  {c.isVetted && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Shield className="w-3 h-3" /> Network
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy-400 mt-0.5">{c.name} · {c.tradeType}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-navy">{c.championScore.toFixed(2)}</span>
                </div>
                {c.championScore >= 4.5 && (
                  <span className="text-[10px] font-semibold text-navy-400 bg-navy-50 px-1.5 py-0.5 rounded mt-1 inline-block">SLA CHAMPION</span>
                )}
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="grid grid-cols-5 gap-1 mb-3">
              {[
                { label: 'Comm', val: c.communicationRating },
                { label: 'Prof', val: c.professionalismRating },
                { label: 'Punct', val: c.punctualityRating },
                { label: 'Clean', val: c.cleanlinessRating },
                { label: 'Qual', val: c.qualityRating },
              ].map((r) => (
                <div key={r.label} className="text-center">
                  <div className="text-[10px] text-navy-300 mb-0.5">{r.label}</div>
                  <div className="text-xs font-semibold text-navy">{r.val.toFixed(1)}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.distance.toFixed(1)} mi</span>
              {c.isVetted ? (
                <div className="text-right">
                  <p className="text-xs text-emerald-600 font-medium">100% Coverage</p>
                  <p className="text-sm font-bold text-navy">{formatCurrency(networkPayout)}</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-amber-600 font-medium">80% Coverage</p>
                  <p className="text-sm font-bold text-navy">{formatCurrency(cashPayout)}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { if (!c.isVetted) setWarningContractor(c); else window.location.href = `/policyholder/claims/${claimId}`; }}
              className={`w-full mt-3 text-sm font-semibold py-2.5 rounded-lg transition-all ${c.isVetted ? 'btn-secondary' : 'btn-outline'}`}
            >
              {c.isVetted ? 'Select Network Provider' : 'Select Provider'}
            </button>
          </div>
        ))}
      </div>

      {/* Benefit Impact Warning Modal */}
      {warningContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated relative">
            <button onClick={() => setWarningContractor(null)} className="absolute top-4 right-4"><X className="w-5 h-5 text-navy-400" /></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-lg font-bold text-navy">Benefit Impact Warning</h3>
            </div>
            <p className="text-sm text-navy-500 mb-4">
              <strong>{warningContractor.companyName}</strong> is not a Champion Network provider. Selecting a non-network provider will reduce your coverage:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-navy-400">Xactimate Estimate</span>
                <span className="font-semibold text-navy">{formatCurrency(xactimateTotal)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-sm text-amber-700">Your Payout (80%)</span>
                <span className="font-bold text-amber-700">{formatCurrency(cashPayout)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-crimson-50 rounded-lg border border-crimson-200">
                <span className="text-sm text-crimson">You Lose</span>
                <span className="font-bold text-crimson">-{formatCurrency(penalty)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setWarningContractor(null)} className="btn-secondary flex-1">Choose Network Instead</button>
              <Link href={`/policyholder/claims/${claimId}`} className="btn-outline flex-1 text-center">Proceed Anyway</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
