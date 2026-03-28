# Banner Pest Control — Data & Reporting Initiative
**Executive Summary**
Version 1.0 | March 2026

---

## What We're Building and Why

Right now, getting a clear picture of the business requires logging into FieldRoutes and manually pulling numbers. There's no single place to see daily revenue, how many jobs were completed, whether technicians are hitting targets, or how many customers cancelled this month.

This project fixes that. We're building a simple reporting system that pulls data automatically from FieldRoutes every morning and displays it in a clean dashboard — accessible from any browser or phone, no login to FieldRoutes required.

In the second phase, we'll connect marketing data from CallTrackingMetrics so you can see the full picture: from the first phone call a lead makes, all the way through to the invoice getting paid.

---

## What You'll Be Able to See

Once complete, the following dashboards will be available daily:

| Dashboard | What It Answers |
|-----------|----------------|
| **Daily Revenue** | How much did we make today, this week, this month? Are we on track? |
| **Jobs Completed vs. Scheduled** | Are we executing the schedule or losing jobs to cancellations? |
| **Technician Productivity** | Who completed the most jobs? Who generated the most revenue? |
| **Customer Retention** | How many customers cancelled this month? How many renewed? |
| **Average Ticket Size** | Are we charging appropriately per service type and per technician? |
| **Outstanding Balances** | Who owes us money and how long has it been outstanding? |
| **Subscription Health** | Is our recurring revenue growing or shrinking? |

In Phase 2, two additional dashboards will be added:

| Dashboard | What It Answers |
|-----------|----------------|
| **Lead to Revenue Funnel** | How many calls turned into booked jobs and paid invoices? |
| **Marketing Attribution** | Which marketing channels are generating the most revenue? |

---

## Cost and Timeline

### Phase 1: FieldRoutes Dashboards (0–30 Days)

| Item | Cost |
|------|------|
| Make.com (automation tool) | $9–$16/month |
| Google Sheets + Looker Studio | Free |
| Contractor setup (one-time) | $375–$800 |
| **Ongoing monthly cost** | **~$35–$100/month** |

Estimated time to first working dashboard: **1–2 weeks** after contractor begins work.

### Phase 2: Add Marketing Funnel (30–90 Days)

| Item | Cost |
|------|------|
| Additional contractor hours | $200–$400 |
| No new tool costs | — |

### Phase 3: Scale (90+ Days)

Only needed if the business grows significantly or expands to multiple locations. Costs will be scoped at that time.

---

## What We Need From You

To get started, three things are required:

1. **FieldRoutes API Key**
   - Log into FieldRoutes → Settings → API → Generate Key
   - Share securely with the contractor (not by email — use a password manager or a tool like 1Password)

2. **CallTrackingMetrics API Key** *(Phase 2 only)*
   - Same process — available in CTM Settings → API

3. **Contractor Approval**
   - Approve up to 20 hours of contractor time for Phase 1 setup
   - Budget ~$35–$100/month for ongoing tool costs

That's it. The contractor handles everything else.

---

## How It Works (Simple Version)

```
FieldRoutes (your data)
        |
        | Every morning at 6 AM, data is pulled automatically
        |
Google Sheets (stores the data)
        |
        | Looker Studio reads from Sheets in real time
        |
Dashboard (view on any browser or phone)
```

No servers. No databases. No IT department needed. If something breaks, the contractor can fix it.

---

## Decision: Approve to Proceed

The contractor will use the attached technical guide to build this system. Before they begin, confirm the following:

- [ ] API key access will be provided
- [ ] Contractor hours approved (up to 20 hrs for Phase 1)
- [ ] Monthly tool budget approved (~$35–$100/mo)
- [ ] Point of contact identified for data validation questions

---

*Technical implementation details are in the accompanying document: `data-analytics-plan.md`*

*Questions? Contact: [CONTRACTOR NAME] | [CONTRACTOR EMAIL]*
