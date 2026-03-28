// Seeded random number generator — same data every page load
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);
const rand   = () => rng();
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const fmt2   = (n) => Math.round(n * 100) / 100;

// ── Daily revenue — last 30 days ──────────────────────────────────────────
const today = new Date();
export const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (29 - i));
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const jobs      = isWeekend ? randInt(3, 8) : randInt(10, 20);
  const completed = Math.floor(jobs * (0.72 + rand() * 0.23));
  const revenue   = fmt2(completed * (randInt(110, 210) + rand() * 40));
  return {
    date:      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue,
    jobs,
    completed,
    cancelled: jobs - completed,
  };
});

// ── Summary KPIs ──────────────────────────────────────────────────────────
const totalRev       = fmt2(dailyRevenue.reduce((s, d) => s + d.revenue,   0));
const totalJobs      = dailyRevenue.reduce((s, d) => s + d.jobs,       0);
const totalCompleted = dailyRevenue.reduce((s, d) => s + d.completed,  0);
const totalCancelled = dailyRevenue.reduce((s, d) => s + d.cancelled,  0);

export const kpis = {
  revenueToday:         dailyRevenue[29].revenue,
  revenueWeek:          fmt2(dailyRevenue.slice(23).reduce((s, d) => s + d.revenue, 0)),
  revenueMonth:         totalRev,
  jobsToday:            dailyRevenue[29].jobs,
  completedToday:       dailyRevenue[29].completed,
  cancelledToday:       dailyRevenue[29].cancelled,
  completionRate:       fmt2((totalCompleted / totalJobs) * 100),
  totalJobs,
  totalCompleted,
  totalCancelled,
  avgTicket:            fmt2(totalRev / totalCompleted),
  activeSubscriptions:  43,
  mrr:                  3847,
  newCustomersMonth:    12,
  churnedMonth:         3,
  churnRate:            fmt2((3 / 43) * 100),
  totalOutstanding:     6924.25,
  collectionRate:       fmt2((totalRev / (totalRev + 6924.25)) * 100),
  renewalsNext30:       18,
};

// ── Technician stats ──────────────────────────────────────────────────────
export const technicianStats = [
  { name: 'Marcus R.',    jobs: 48, completed: 44, revenue: 7480 },
  { name: 'Danielle B.',  jobs: 41, completed: 38, revenue: 5890 },
  { name: 'Tyler N.',     jobs: 35, completed: 29, revenue: 3944 },
].map((t) => ({
  ...t,
  cancelled:      t.jobs - t.completed,
  avgTicket:      fmt2(t.revenue / t.completed),
  completionRate: fmt2((t.completed / t.jobs) * 100),
}));

// ── Average ticket by service type ────────────────────────────────────────
export const avgTicketByService = [
  { service: 'Bed Bug',      avgTicket: 289, count: 8  },
  { service: 'Termite',      avgTicket: 245, count: 14 },
  { service: 'Rodent',       avgTicket: 198, count: 22 },
  { service: 'Mosquito',     avgTicket: 149, count: 31 },
  { service: 'Fire Ant',     avgTicket: 125, count: 18 },
  { service: 'General Pest', avgTicket: 98,  count: 55 },
];

// ── Subscription mix (for pie chart) ─────────────────────────────────────
export const subscriptionsByService = [
  { name: 'General Pest', value: 18 },
  { name: 'Mosquito',     value: 10 },
  { name: 'Rodent',       value:  7 },
  { name: 'Termite',      value:  4 },
  { name: 'Fire Ant',     value:  3 },
  { name: 'Bed Bug',      value:  1 },
];

// ── Accounts receivable aging ─────────────────────────────────────────────
export const arAging = [
  { bucket: '0-30 days',  amount: 3812.50, count: 14 },
  { bucket: '31-60 days', amount: 2318.75, count:  8 },
  { bucket: '60+ days',   amount:  793.00, count:  3 },
];

// ── Jobs by status — last 7 days ──────────────────────────────────────────
export const jobStatusLast7 = dailyRevenue.slice(-7).map((d) => ({
  date:        d.date,
  Completed:   d.completed,
  Cancelled:   Math.floor(d.cancelled * 0.55),
  Rescheduled: Math.ceil(d.cancelled * 0.45),
}));

// ── New customers vs cancellations — last 8 weeks ─────────────────────────
export const customerTrend = Array.from({ length: 8 }, (_, i) => ({
  week:              `Wk ${i + 1}`,
  'New Customers':   randInt(1, 5),
  'Cancellations':   randInt(0, 2),
}));
