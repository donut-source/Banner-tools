# FieldRoutes Daily Pull — Setup Guide

This script pulls data from FieldRoutes every day and saves it as CSV files.
Each CSV maps to one tab in the Banner Data Warehouse Google Sheet.

---

## Requirements

- Python 3.9 or higher
- A FieldRoutes API key and Office ID (get from business owner)

---

## First-Time Setup (do this once)

### Step 1 — Install Python
If Python isn't installed: https://www.python.org/downloads/
Check it works: open a terminal and run `python --version`

### Step 2 — Install dependencies
In your terminal, navigate to the `scripts/` folder and run:
```
pip install -r requirements.txt
```

### Step 3 — Create your .env file
In the root of the project (one level up from `scripts/`):
1. Copy `.env.example` and rename the copy to `.env`
2. Open `.env` in a text editor
3. Replace `your_api_key_here` with your real API key
4. Replace `your_office_id_here` with your real Office ID
5. Save the file

**Important:** The `.env` file must stay on your computer only. Do not email it, Slack it, or push it to GitHub.

### Step 4 — First run (pull 30 days of history)
In `.env`, set `LOOKBACK_DAYS=30`, then run:
```
python fieldroutes_pull.py
```

You should see output like:
```
==================================================
 Banner FieldRoutes Pull
 Run time: 2026-03-28 06:00:00
==================================================

[1/5] Jobs / Appointments
  /appointment: 142 records
  Saved 142 rows → output/jobs.csv
...
Done. CSV files are in: output/
```

After the first run succeeds, set `LOOKBACK_DAYS=1` in `.env` for all future runs.

---

## Daily Runs

### Option A — Run manually
Open a terminal in the `scripts/` folder and run:
```
python fieldroutes_pull.py
```

### Option B — Schedule it (recommended)

**Windows Task Scheduler:**
1. Open Task Scheduler → Create Basic Task
2. Name: "Banner FieldRoutes Pull"
3. Trigger: Daily at 6:00 AM
4. Action: Start a Program
   - Program: `python`
   - Arguments: `C:\path\to\banner\scripts\fieldroutes_pull.py`
5. Save

**Mac/Linux (cron):**
```
0 6 * * * cd /path/to/banner/scripts && python fieldroutes_pull.py
```

---

## Output Files

After each run, these files are created in `scripts/output/`:

| File | Contents |
|------|----------|
| `jobs.csv` | All appointments/jobs for the date range |
| `invoices.csv` | All invoices for the date range |
| `customers.csv` | All customers created/updated in the date range |
| `subscriptions.csv` | All active subscriptions |
| `employees.csv` | All employees |

---

## Uploading to Google Sheets

Two options:

### Manual (simplest)
1. Open the CSV file
2. Select all (Ctrl+A), copy
3. Open the matching tab in the Banner Data Warehouse Google Sheet
4. Click cell A2 (below the header row)
5. Paste

Do this once per day after the script runs.

### Automatic (next step)
Once the manual process is working reliably for 1 week, set up Make.com or a Google Apps Script to automate the upload. See `data-analytics-plan.md` for details.

---

## Troubleshooting

| Problem | What to check |
|---------|--------------|
| `Missing credentials` error | `.env` file doesn't exist or API key is blank |
| `HTTP 401` error | API key is wrong — double-check in FieldRoutes |
| `HTTP 403` error | Office ID is wrong, or your key doesn't have access |
| `0 records` returned | Date range may be wrong, or no data in that period — try `LOOKBACK_DAYS=7` |
| Script runs but CSV is empty | Check the `[SKIP]` message — the API returned no records |
| Connection error | Check internet connection; FieldRoutes API may be down |

If stuck, take a screenshot of the terminal output and share with the business owner.

---

## Validating the Data

Before using any dashboard, run these checks:

1. Open FieldRoutes → Jobs → filter yesterday → count completed jobs
2. Open `output/jobs.csv` → count rows → should match within 1–2
3. Open FieldRoutes → Invoices → sum yesterday's revenue
4. Open `output/invoices.csv` → sum the `amount` column → should match within $5

If they don't match, check `LOOKBACK_DAYS` and the date filters first.
