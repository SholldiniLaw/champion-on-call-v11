'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Star, Shield } from 'lucide-react';

const COLORS = ['#3E5C87', '#D71920', '#728AB1', '#0A1F44', '#A1B1CB', '#E95157'];

export function AdminCharts({ chartData, topContractors }: {
  chartData: { name: string; value: number }[];
  topContractors: { name: string; score: number; trade: string; vetted: boolean }[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Claims by Status</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D8E5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#728AB1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#728AB1' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0D8E5' }} />
              <Bar dataKey="value" fill="#0A1F44" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Status Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card lg:col-span-2">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Top Champion Contractors</h2>
        <div className="space-y-3">
          {topContractors.map((c, i) => (
            <div key={c.name} className="flex items-center gap-4 p-3 bg-navy-50/50 rounded-lg">
              <span className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm font-bold">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy text-sm truncate">{c.name}</p>
                  {c.vetted && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><Shield className="w-2.5 h-2.5" /> Network</span>}
                </div>
                <p className="text-xs text-navy-400">{c.trade}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-navy">{c.score.toFixed(2)}</span>
              </div>
              <div className="w-24 h-2 bg-navy-100 rounded-full overflow-hidden">
                <div className="h-full bg-navy rounded-full" style={{ width: `${(c.score / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
