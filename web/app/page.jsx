'use client'

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  dailyRevenue, kpis, technicianStats,
  avgTicketByService, subscriptionsByService,
  arAging, jobStatusLast7, customerTrend,
} from '@/lib/fakeData'

const CHART_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2']
const TABS = ['Revenue', 'Jobs', 'Technicians', 'Retention', 'Avg Ticket', 'Balances', 'Subscriptions']

const fmt$   = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtInt = (n) => Number(n).toLocaleString('en-US')
const fmtPct = (n) => `${Number(n).toFixed(1)}%`

// ── Shared components ─────────────────────────────────────────────────────

function KPI({ label, value, sub, green }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${green ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-5">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ── Tab: Revenue ──────────────────────────────────────────────────────────

function RevenueTab() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Today's Revenue"   value={fmt$(kpis.revenueToday)}     green />
        <KPI label="This Week"         value={fmt$(kpis.revenueWeek)} />
        <KPI label="This Month"        value={fmt$(kpis.revenueMonth)} />
        <KPI label="Outstanding (AR)"  value={fmt$(kpis.totalOutstanding)}
             sub={`${fmtPct(100 - kpis.collectionRate)} uncollected`} />
      </div>
      <ChartCard title="Daily Revenue — Last 30 Days">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip formatter={(v) => [fmt$(v), 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Tab: Jobs ─────────────────────────────────────────────────────────────

function JobsTab() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Scheduled Today"    value={fmtInt(kpis.jobsToday)} />
        <KPI label="Completed Today"    value={fmtInt(kpis.completedToday)} green />
        <KPI label="Completion Rate"    value={fmtPct(kpis.completionRate)} sub="last 30 days" />
        <KPI label="Cancelled (month)"  value={fmtInt(kpis.totalCancelled)} />
      </div>
      <ChartCard title="Jobs Last 7 Days — Completed / Cancelled / Rescheduled">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobStatusLast7} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Completed"   fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Cancelled"   fill="#dc2626" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Rescheduled" fill="#d97706" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Tab: Technicians ──────────────────────────────────────────────────────

function TechniciansTab() {
  const top = [...technicianStats].sort((a, b) => b.revenue - a.revenue)[0]
  const avgCompletion = technicianStats.reduce((s, t) => s + t.completionRate, 0) / technicianStats.length
  const totalRevenue  = technicianStats.reduce((s, t) => s + t.revenue, 0)

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Top Performer"       value={top.name} sub={`${fmt$(top.revenue)} this month`} green />
        <KPI label="Avg Completion Rate" value={fmtPct(avgCompletion)} />
        <KPI label="Total Tech Revenue"  value={fmt$(totalRevenue)} />
      </div>
      <ChartCard title="Revenue by Technician — This Month">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={technicianStats} layout="vertical"
            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [fmt$(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="#16a34a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Jobs Completed vs Cancelled by Technician">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={technicianStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cancelled" name="Cancelled"  fill="#dc2626" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Tab: Retention ────────────────────────────────────────────────────────

function RetentionTab() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Subscriptions" value={fmtInt(kpis.activeSubscriptions)} green />
        <KPI label="MRR"                  value={fmt$(kpis.mrr)} sub="monthly recurring revenue" />
        <KPI label="New This Month"        value={`+${kpis.newCustomersMonth}`} />
        <KPI label="Churned This Month"    value={kpis.churnedMonth}
             sub={`${fmtPct(kpis.churnRate)} churn rate`} />
      </div>
      <ChartCard title="New Customers vs Cancellations — Last 8 Weeks">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={customerTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="New Customers" fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Cancellations" fill="#dc2626" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Tab: Avg Ticket ───────────────────────────────────────────────────────

function AvgTicketTab() {
  const highest = [...avgTicketByService].sort((a, b) => b.avgTicket - a.avgTicket)[0]
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Overall Avg Ticket" value={fmt$(kpis.avgTicket)} green />
        <KPI label="Highest Category"   value={highest.service}
             sub={`${fmt$(highest.avgTicket)} avg`} />
        <KPI label="Jobs This Month"    value={fmtInt(kpis.totalCompleted)} />
      </div>
      <ChartCard title="Average Ticket Size by Service Type">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgTicketByService} layout="vertical"
            margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <YAxis dataKey="service" type="category" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [fmt$(v), 'Avg Ticket']} />
            <Bar dataKey="avgTicket" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Tab: Balances ─────────────────────────────────────────────────────────

function BalancesTab() {
  const total  = arAging.reduce((s, b) => s + b.amount, 0)
  const over30 = arAging.slice(1).reduce((s, b) => s + b.amount, 0)
  const over60 = arAging[2].amount
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Outstanding"  value={fmt$(kpis.totalOutstanding)} />
        <KPI label="30+ Days Overdue"   value={fmt$(over30)}
             sub={`${fmtPct((over30 / total) * 100)} of total`} />
        <KPI label="60+ Days Overdue"   value={fmt$(over60)} />
        <KPI label="Collection Rate"    value={fmtPct(kpis.collectionRate)} green />
      </div>
      <ChartCard title="Accounts Receivable by Age">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={arAging} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip formatter={(v) => [fmt$(v), 'Outstanding']} />
            <Bar dataKey="amount" name="Amount" fill="#d97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <table className="w-full text-sm mt-5 border-t border-gray-100 pt-4">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left py-2">Age Bucket</th>
              <th className="text-right py-2">Invoices</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {arAging.map((row) => (
              <tr key={row.bucket} className="border-t border-gray-50 text-gray-700">
                <td className="py-2">{row.bucket}</td>
                <td className="py-2 text-right">{row.count}</td>
                <td className="py-2 text-right font-medium">{fmt$(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
    </>
  )
}

// ── Tab: Subscriptions ────────────────────────────────────────────────────

function SubscriptionsTab() {
  const topPlan = subscriptionsByService[0]
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Subscriptions" value={fmtInt(kpis.activeSubscriptions)} green />
        <KPI label="MRR"                  value={fmt$(kpis.mrr)} sub="monthly recurring" />
        <KPI label="Renewing (30 days)"   value={kpis.renewalsNext30} sub="upcoming visits" />
        <KPI label="Most Popular Plan"    value={topPlan.name}
             sub={`${topPlan.value} customers`} />
      </div>
      <ChartCard title="Active Subscriptions by Service Type">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={subscriptionsByService}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
              labelLine
            >
              {subscriptionsByService.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [v, 'Subscriptions']} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

const TAB_CONTENT = {
  'Revenue':       <RevenueTab />,
  'Jobs':          <JobsTab />,
  'Technicians':   <TechniciansTab />,
  'Retention':     <RetentionTab />,
  'Avg Ticket':    <AvgTicketTab />,
  'Balances':      <BalancesTab />,
  'Subscriptions': <SubscriptionsTab />,
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Revenue')

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center
                            text-white text-sm font-bold tracking-tight">
              B
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">Banner Pest Control</h1>
              <p className="text-xs text-gray-400">Analytics Dashboard</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                           bg-amber-100 text-amber-700 border border-amber-200">
            Demo Data
          </span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {TAB_CONTENT[activeTab]}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-4">
        <p className="text-xs text-gray-400 text-center">
          All data is synthetic — for demonstration purposes only.
          Connect the FieldRoutes API to see live business data.
          &nbsp;&middot;&nbsp; Built with Next.js + Recharts + Tailwind CSS
        </p>
      </footer>

    </div>
  )
}
