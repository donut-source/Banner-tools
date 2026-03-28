# Banner Pest Control — Data & Analytics Plan
**Crawl → Walk → Run Roadmap**
Version 1.0 | March 2026

---

## Table of Contents
1. [Overview](#overview)
2. [Crawl Phase (0–30 Days)](#crawl-phase-030-days)
3. [Walk Phase (30–90 Days)](#walk-phase-3090-days)
4. [Run Phase (90+ Days)](#run-phase-90-days)
5. [Instructions for a Low-Tech Contractor](#instructions-for-a-low-tech-contractor)
6. [Security Guidelines](#security-guidelines)

---

## Overview

### Systems We Use
| System | Purpose | Phase |
|--------|---------|-------|
| FieldRoutes | CRM, scheduling, invoicing, operations | Crawl |
| CallTrackingMetrics (CTM) | Marketing, lead tracking | Walk |
| Zendesk | Customer support | Run |
| Verizon Connect | GPS / fleet | Run |
| Gmail | Communication data | Run |

### Guiding Principles
- Start with the simplest tool that works
- Only add complexity when the simple tool breaks
- Every phase must deliver visible business value before moving to the next
- A contractor with moderate skills should be able to build each phase from these instructions

---

## Crawl Phase (0–30 Days)

**Goal:** Get FieldRoutes data into a simple dashboard. Start seeing revenue, jobs, and technician performance without writing custom code.

---

### Recommended Stack

| Layer | Tool | Why |
|-------|------|-----|
| Data destination | Google Sheets | Free, easy to share, connects to everything |
| Automation / API connector | Make.com (formerly Integromat) | Low-code, handles REST APIs, $9–$16/mo |
| Dashboard | Looker Studio (free) | Free, connects to Google Sheets natively |
| Backup option (if Make feels hard) | Zapier | Simpler UI, more expensive at volume |

**Total estimated cost: $9–$16/month for Make.com. Everything else is free.**

---

### Architecture (Plain English)

```
FieldRoutes API
      |
      | (Make.com pulls data once per day, ~6 AM)
      |
Google Sheets (one tab per data type)
      |
      | (Looker Studio reads live from Sheets)
      |
Looker Studio Dashboard
      |
      | (shared link — view on phone or desktop)
      |
Business Owner + Manager
```

No servers. No databases. No code required.

---

### What Data to Pull from FieldRoutes

Pull these specific endpoints daily. All are available in the FieldRoutes REST API (`https://api.fieldroutes.com/`).

#### 1. Jobs / Appointments
- **Endpoint:** `GET /appointment` or `GET /job`
- **Fields to capture:**
  - `appointmentID`
  - `date` (scheduled date)
  - `completedDate`
  - `status` (scheduled, completed, cancelled, rescheduled)
  - `customerID`
  - `employeeID` (technician)
  - `serviceType`
  - `duration`
  - `notes`

#### 2. Invoices / Revenue
- **Endpoint:** `GET /invoice`
- **Fields to capture:**
  - `invoiceID`
  - `customerID`
  - `date`
  - `amount`
  - `amountPaid`
  - `balance`
  - `status` (paid, unpaid, void)
  - `serviceType`

#### 3. Customers
- **Endpoint:** `GET /customer`
- **Fields to capture:**
  - `customerID`
  - `firstName`, `lastName`
  - `address`, `city`, `zip`
  - `phone`, `email`
  - `createdDate` (when they became a customer)
  - `status` (active, inactive, cancelled)
  - `source` (how they found you, if tracked)

#### 4. Technicians / Employees
- **Endpoint:** `GET /employee`
- **Fields to capture:**
  - `employeeID`
  - `firstName`, `lastName`
  - `type` (technician, office, etc.)
  - `status` (active/inactive)

#### 5. Subscriptions / Recurring Service Plans
- **Endpoint:** `GET /subscription`
- **Fields to capture:**
  - `subscriptionID`
  - `customerID`
  - `serviceType`
  - `frequency` (monthly, quarterly, etc.)
  - `nextServiceDate`
  - `status` (active, cancelled, suspended)
  - `annualRecurringRevenue` or `price`

---

### Pull Frequency

| Data Type | How Often | Why |
|-----------|-----------|-----|
| Jobs/Appointments | Daily at 6 AM | Reflects prior day completions |
| Invoices | Daily at 6 AM | Revenue recognition |
| Customers | Daily | New signups, cancellations |
| Subscriptions | Daily | Plan changes, renewals |
| Employees | Weekly | Rarely changes |

Use a 30–90 day lookback window on the first pull, then daily delta updates after that.

---

### Step-by-Step Setup Instructions

#### Step 1: Get Your FieldRoutes API Key
1. Log into FieldRoutes admin portal
2. Go to **Settings → API** (or ask your FieldRoutes account rep)
3. Generate an API key — copy it immediately, store it in a password manager (e.g., 1Password, Bitwarden, or even a locked Google Doc)
4. Note your **Office ID** — you'll need this for all API calls

#### Step 2: Set Up Google Sheets
1. Create a new Google Sheets file called **"Banner Data Warehouse"**
2. Create these tabs (one per data type):
   - `jobs_raw`
   - `invoices_raw`
   - `customers_raw`
   - `subscriptions_raw`
   - `employees_raw`
3. Add a header row to each tab matching the field names listed above
4. Share the sheet with anyone who needs dashboard access (view only)

#### Step 3: Set Up Make.com
1. Go to [make.com](https://make.com) and create a free account
2. Upgrade to the **Core plan** ($9/month) — needed for API calls and scheduling
3. Create a new **Scenario** for each data type (start with Jobs and Invoices)

**For each Make.com Scenario:**

1. Add a **Schedule** trigger — set to daily at 6:00 AM
2. Add an **HTTP → Make a Request** module:
   - URL: `https://api.fieldroutes.com/appointment` (adjust per endpoint)
   - Method: GET
   - Headers:
     - `authenticationKey`: *(your API key — stored as a Make.com variable, NOT typed in plaintext)*
     - `officeID`: *(your office ID)*
   - Query params: `dateStart` = yesterday's date (use Make's date functions)
3. Add a **Google Sheets → Add a Row** module:
   - Connect to your Banner Data Warehouse sheet
   - Map each API response field to the correct column
4. Turn on the scenario and run it once manually to test

**Pro tip:** Use Make.com's built-in **Variables** or **Data Stores** to store your API key — never type it directly into a URL field.

#### Step 4: Validate the Data
Before building dashboards, spend 30 minutes validating:
- Open FieldRoutes and count yesterday's completed jobs
- Check your Google Sheet — does it match?
- Check one invoice amount against FieldRoutes — does it match?
- If numbers differ by more than 1–2 records, check your date filters in Make

#### Step 5: Build Looker Studio Dashboards
1. Go to [lookerstudio.google.com](https://lookerstudio.google.com)
2. Create a new report
3. Add data source → Google Sheets → select "Banner Data Warehouse"
4. Add one tab per dashboard (see dashboard specs below)

---

### 5–7 High-Value Dashboards

#### Dashboard 1: Daily Revenue
**Purpose:** Did we hit our revenue target today/this week?

| Metric | How to Calculate |
|--------|-----------------|
| Revenue today | Sum of `invoice.amount` where `date` = today |
| Revenue this week | Sum of `invoice.amount` where `date` in current week |
| Revenue this month | Sum of `invoice.amount` for current month |
| MTD vs last month | Current month sum vs prior month same period |
| Unpaid invoices | Sum of `invoice.balance` where `status` = unpaid |

**Chart types:** Big number cards (for quick scan), line chart for daily trend

---

#### Dashboard 2: Jobs Completed vs. Scheduled
**Purpose:** Are we executing the schedule, or losing jobs to cancellations?

| Metric | How to Calculate |
|--------|-----------------|
| Jobs scheduled today | Count of `appointment.status` = scheduled, `date` = today |
| Jobs completed today | Count of `appointment.status` = completed, `date` = today |
| Completion rate | Completed ÷ Scheduled × 100 |
| Cancellations | Count of `status` = cancelled |
| Reschedules | Count of `status` = rescheduled |

**Chart types:** Big number cards, stacked bar chart by day

---

#### Dashboard 3: Technician Productivity
**Purpose:** Who is working hardest? Who needs coaching?

| Metric | How to Calculate |
|--------|-----------------|
| Jobs per technician (day/week) | Count of completed jobs grouped by `employeeID` |
| Revenue per technician | Sum of invoice amount tied to technician's jobs |
| Average jobs per day per tech | Total jobs ÷ working days |
| Cancellation rate per tech | Cancellations ÷ assigned jobs |

**Chart types:** Bar chart by technician, table with all metrics side by side

**Note:** You'll need to join the `jobs` sheet (which has `employeeID`) to the `employees` sheet (which has the name). In Looker Studio, use a blended data source or add a VLOOKUP in Sheets to resolve names.

---

#### Dashboard 4: Customer Retention & Repeat Visits
**Purpose:** Are customers staying or churning?

| Metric | How to Calculate |
|--------|-----------------|
| New customers this month | Count of `customer.createdDate` in current month |
| Active subscriptions | Count of `subscription.status` = active |
| Cancelled this month | Count of subscriptions cancelled this month |
| Monthly churn rate | Cancellations ÷ Total active start of month |
| Customers with 2+ visits | Count of customers with more than one completed job |

**Chart types:** Trend lines for new vs cancelled, big number for active subscriptions

---

#### Dashboard 5: Average Ticket Size
**Purpose:** Are we maximizing revenue per visit?

| Metric | How to Calculate |
|--------|-----------------|
| Average invoice amount | Sum of all invoices ÷ count of invoices |
| Average by service type | Same calc, grouped by `serviceType` |
| Average by technician | Same calc, grouped by `employeeID` |
| Trend over time | Rolling average by week |

**Chart types:** Bar chart by service type, line chart for trend

---

#### Dashboard 6: Outstanding Balances / Accounts Receivable
**Purpose:** How much money are we owed and how old is it?

| Metric | How to Calculate |
|--------|-----------------|
| Total outstanding | Sum of `invoice.balance` where > 0 |
| Invoices 30+ days unpaid | Count/sum where `date` < today - 30 and unpaid |
| Invoices 60+ days unpaid | Same, > 60 days |
| % collected | Total paid ÷ total invoiced |

**Chart types:** Table of open invoices, aging bar chart (0–30, 31–60, 60+ days)

---

#### Dashboard 7: Subscription Health
**Purpose:** Is our recurring revenue growing or shrinking?

| Metric | How to Calculate |
|--------|-----------------|
| Total active subscriptions | Count where `status` = active |
| Monthly Recurring Revenue (MRR) | Sum of monthly subscription values |
| Next 30 days renewals | Count of `nextServiceDate` within 30 days |
| Subscription mix by service type | Count grouped by service type |

**Chart types:** Big number for MRR, pie chart for service mix, calendar heatmap for renewals

---

## Walk Phase (30–90 Days)

**Goal:** Add CallTrackingMetrics. Connect the marketing funnel to revenue. Improve data reliability.

---

### Add CallTrackingMetrics (CTM)

#### What to Pull from CTM
CTM tracks inbound calls and web leads. Pull these into a new Google Sheets tab: `ctm_leads_raw`

| Field | Description |
|-------|-------------|
| `callID` | Unique ID |
| `callDate` | When the call happened |
| `trackingNumber` | Which campaign/source generated the call |
| `source` | e.g., Google Ads, Organic, Direct |
| `medium` | e.g., CPC, Organic, Referral |
| `campaign` | Campaign name |
| `callDuration` | In seconds — short calls = poor quality leads |
| `callOutcome` | Answered, missed, voicemail |
| `customerPhone` | For matching to FieldRoutes customer record |
| `agentName` | Who answered |

**How to pull:** CTM has a REST API. Set up a Make.com scenario identical to the FieldRoutes ones — daily pull into Google Sheets.

CTM API docs: Available in your CTM account under **Settings → API**

---

### Simple Data Model (No Jargon)

Think of your data as a funnel with four stages:

```
[CTM: Lead calls in]
        |
        | (match on phone number)
        |
[FieldRoutes: Customer created]
        |
        | (customer gets scheduled)
        |
[FieldRoutes: Job completed]
        |
        | (job gets invoiced)
        |
[FieldRoutes: Invoice paid]
```

To connect CTM to FieldRoutes:
1. When a CTM call comes in, CTM records the caller's phone number
2. When FieldRoutes creates a customer, it also records a phone number
3. Match them: in Google Sheets, use `VLOOKUP(phone_number, customers_raw, column, FALSE)`
4. This gives you a rough "this lead became this customer" linkage

It won't be perfect — phones change, people call from different numbers — but it will give you 70–80% attribution accuracy, which is enough to make marketing decisions.

---

### Funnel Dashboards

#### Dashboard 8: Lead to Revenue Funnel
| Stage | Metric | Source |
|-------|--------|--------|
| Leads | Calls received | CTM |
| Answered | Calls answered | CTM |
| Booked | New customers created after call | FieldRoutes |
| Completed | Jobs completed for those customers | FieldRoutes |
| Paid | Revenue collected | FieldRoutes |

**Key ratios to watch:**
- Answer rate: Answered ÷ Total calls
- Book rate: Booked ÷ Answered calls
- Completion rate: Completed ÷ Booked
- Revenue per lead: Total revenue ÷ Total leads

---

#### Dashboard 9: Marketing Attribution (Simple)
| Metric | How to Calculate |
|--------|-----------------|
| Calls by source | Count of CTM calls grouped by `source` |
| Revenue by source | Sum of FieldRoutes revenue matched to CTM source |
| Cost per lead by source | Ad spend ÷ calls (manual input in Sheets) |
| Best performing campaign | Sort by revenue generated |

**Keep it simple:** Have someone enter ad spend manually into a small Sheets tab each month. Don't over-automate this yet.

---

### Improving Data Reliability

By day 30–60, you'll notice some data gaps. Common issues and fixes:

| Issue | Fix |
|-------|-----|
| Jobs show no revenue | Invoice isn't created yet — add 1-day lag |
| Customer phone doesn't match CTM | Normalize format: strip spaces, dashes, country code |
| Duplicate rows in Sheets | Add a dedup step in Make.com using the record ID |
| Missing technician names | Make sure employee pull runs before job dashboard refreshes |
| Data stops flowing | Make.com scenarios have a run limit — check plan or error logs |

---

## Run Phase (90+ Days)

**Goal:** Scale the system, reduce manual work, add predictive insights.

---

### When to Move to a Real Database

Move to a real database (BigQuery, Supabase, or Snowflake) when any of these are true:

- Google Sheets hits the 10 million cell limit (unlikely for 1–2 years for a small operator)
- Queries are taking too long (Looker Studio refresh > 30 seconds)
- You need more than 3 people building on the data
- You want to run SQL queries for ad hoc analysis
- You're adding 3+ new data sources (Zendesk, GPS, Gmail)

**Recommended database when the time comes:** BigQuery (free tier covers most small business needs, integrates natively with Looker Studio)

---

### When to Hire a Real Data Engineer

Hire when:
- You're spending more than 5 hours/month maintaining data pipelines
- Data accuracy issues are costing you real money or decisions
- You want to build predictive models (LTV, churn prediction)
- You're expanding to multiple locations

**What to hire for:** A part-time data engineer or analytics engineer (dbt + BigQuery) — 10–20 hrs/month is sufficient at your scale.

---

### What to Automate vs Keep Manual

| Task | Automate | Keep Manual |
|------|----------|-------------|
| Daily data pulls | Yes — Make.com or Fivetran | |
| Dashboard refresh | Yes — Looker Studio auto | |
| Ad spend entry | | Yes — once monthly |
| Data quality checks | Automate alerts | |
| Interpreting dashboards | | Yes — human judgment |
| Responding to leads | | Yes — human call |
| Payroll calculations | | Yes — verify before running |

---

### Optional Predictive Insights

Once you have 12+ months of clean data:

| Insight | How to Build | Value |
|---------|-------------|-------|
| Customer Lifetime Value (LTV) | Average revenue × average tenure | Know what a lead is worth |
| Churn prediction | % of customers who cancel after X months | Proactively retain at-risk accounts |
| Routing efficiency | Jobs per route vs drive time | Cut fuel costs, fit more stops |
| Seasonal demand forecasting | Prior year patterns | Staff and route ahead of busy season |
| Upsell probability | Customers with one service likely to buy another | Target upgrade campaigns |

These require either a data analyst who can write Python/SQL, or tools like Google's Vertex AI (advanced) or even a simple regression in Sheets (basic).

---

## Instructions for a Low-Tech Contractor

**Read this section first. This is your guide.**

---

### Exact Tools to Use
1. **Make.com** — for connecting FieldRoutes API to Google Sheets (start here)
2. **Google Sheets** — for storing data
3. **Looker Studio** — for building dashboards
4. **FieldRoutes API docs** at `https://api.fieldroutes.com/index` — for reference
5. **A password manager** — to store API keys safely

That's it. Do not install anything else without checking with the business owner first.

---

### What NOT to Do

- **Do NOT hardcode the API key anywhere** — not in a URL, not in a formula, not in a comment
- **Do NOT build a custom database or server** — Google Sheets is fine for now
- **Do NOT write custom Python scripts** — Make.com handles the API calls
- **Do NOT try to pull all historical data at once** — start with 30 days lookback
- **Do NOT skip the validation step** — always verify one number matches FieldRoutes before building dashboards
- **Do NOT share the Google Sheet with everyone** — only the business owner and authorized staff
- **Do NOT build 10 dashboards at once** — do 2–3, get approval, then continue
- **Do NOT move to a different tool** (Airtable, Notion, etc.) without discussing with the business owner — the plan above is deliberate

---

### How to Test if Data is Correct

Run these checks before delivering any dashboard:

1. **Job count check:**
   - Open FieldRoutes → go to Jobs → filter for yesterday → count completed jobs
   - Open your Google Sheet `jobs_raw` tab → filter for yesterday → count rows
   - They should match within 1–2 records (minor timing differences are OK)

2. **Revenue check:**
   - Open FieldRoutes → Reports → Daily Revenue for yesterday
   - Open your Sheet → sum the `amount` column for yesterday
   - Should match within $5 (rounding/timing)

3. **New customer check:**
   - FieldRoutes → Customers → filter created this week → count
   - Sheet → `customers_raw` → filter by `createdDate` → count
   - Should match

4. **Spot check one record:**
   - Pick a random `invoiceID` from the Sheet
   - Look it up in FieldRoutes — verify name, amount, date match

If checks fail: look at your Make.com scenario date filters first — that's the most common cause.

---

### Expected Timeline

| Task | Hours |
|------|-------|
| Get API key from FieldRoutes | 0.5 hrs |
| Set up Google Sheets structure | 1 hr |
| Build Make.com scenario for Jobs | 2–3 hrs |
| Build Make.com scenario for Invoices | 1–2 hrs (easier after first one) |
| Build Make.com scenarios for Customers + Subscriptions | 2 hrs |
| Validate all data | 2 hrs |
| Build 5 Looker Studio dashboards | 4–6 hrs |
| Review with business owner + fix feedback | 2 hrs |
| **Total** | **~15–20 hrs** |

At $25–$40/hr contractor rate: **$375–$800 total for Crawl phase.**

---

### Estimated Ongoing Cost

| Item | Monthly Cost |
|------|-------------|
| Make.com Core plan | $9–$16/mo |
| Google Sheets + Looker Studio | Free |
| Contractor maintenance (1–2 hrs/mo) | $25–$80/mo |
| **Total** | **~$35–$100/mo** |

---

### Helpful Tips for the Contractor

- **Test with small data first.** When setting up a new Make.com scenario, limit the date range to 1 day until it works, then expand.
- **Label everything.** Name your Make.com scenarios clearly: `FR - Jobs - Daily Pull`, `FR - Invoices - Daily Pull`, etc.
- **Screenshot your Make.com flows.** Share screenshots with the business owner when each piece is done.
- **Use Make.com's built-in error notifications.** Set up an email alert so if a scenario fails, someone is notified automatically.
- **Keep a simple change log.** In Google Sheets, add a tab called `changelog` and write one line every time you change something: date, what changed, why.

---

## Security Guidelines

### Why API Keys Must Be Protected

Your FieldRoutes API key gives full access to your business data — all customers, all revenue, all appointments. If someone gets this key:
- They can read all your customer data (names, addresses, phones)
- They could potentially modify or delete records
- You would have no way to know until damage is done

**Treat your API key like a password to your bank account.**

---

### Where API Keys Should Never Go

- **Never** paste an API key into a Google Sheet cell
- **Never** include it in a shared document, email, or Slack message
- **Never** hardcode it into a script or formula that others can see
- **Never** commit it to GitHub or any version control system
- **Never** include it in a screenshot shared with contractors

---

### Where to Store API Keys Safely

| Method | How to Use | Security Level |
|--------|-----------|----------------|
| **Make.com Variables** | In your scenario, use Connection or Variables to store the key — it's masked in the UI | Good |
| **Password manager** (1Password, Bitwarden) | Store the raw key here, paste only when needed | Good |
| **Google Secret Manager** | Advanced — only if using custom scripts | Best |
| **Environment variables** | Only if contractor writes a Python script — `os.environ.get("API_KEY")` | Good |

**For this project:** Store in Make.com's variable/connection system + your password manager. That's sufficient.

---

### Access Control

- Only the business owner and the contractor working on this project should have the API key
- If a contractor leaves, **rotate the API key immediately** in FieldRoutes settings
- Use a separate, read-only API key if FieldRoutes supports it (check with their support)
- Restrict Google Sheet access to named individuals — do not use "anyone with the link"

---

*End of Plan — Version 1.0*

*Next review: After Crawl phase completion (~30 days)*
