'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const NAVY = '#0A1F44';
const CRIMSON = '#D71920';
const COLORS = ['#0A1F44', '#D71920', '#3E5C87', '#728AB1', '#A1B1CB'];

export function AnalyticsCharts({ responseData, perilData, benefitData, contractorData, monthlyData }: {
  responseData: { claim: string; minutes: number; peril: string }[];
  perilData: { name: string; value: number }[];
  benefitData: { name: string; value: number }[];
  contractorData: { name: string; score: number; claims: number }[];
  monthlyData: { month: string; claims: number; payout: number }[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Monthly Claims Volume</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D8E5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#728AB1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#728AB1' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="claims" fill={NAVY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Monthly Payouts ($)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D8E5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#728AB1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#728AB1' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => ['$' + v.toLocaleString(), 'Payout']} />
              <Line type="monotone" dataKey="payout" stroke={CRIMSON} strokeWidth={2} dot={{ fill: CRIMSON }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Peril Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={perilData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {perilData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Network vs Cash Benefit</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={benefitData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" label>
                <Cell fill="#059669" /><Cell fill="#D97706" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card lg:col-span-2">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Contractor Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contractorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D8E5" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#728AB1' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#728AB1' }} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="score" fill={NAVY} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {responseData.length > 0 && (
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Response Time (Minutes to Assignment)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D0D8E5" />
                <XAxis dataKey="claim" tick={{ fontSize: 10, fill: '#728AB1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#728AB1' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="minutes" fill={CRIMSON} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
