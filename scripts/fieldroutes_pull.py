"""
Banner Pest Control — FieldRoutes Daily Data Pull
--------------------------------------------------
Pulls jobs, invoices, customers, subscriptions, and employees
from the FieldRoutes API and saves each to a CSV file.

Run this script once per day (e.g. via Task Scheduler or cron).

Setup:
  1. Copy .env.example to .env and fill in your credentials
  2. pip install -r requirements.txt
  3. python fieldroutes_pull.py

Output: one CSV per data type in the /output folder
"""

import os
import csv
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path

# ── Load credentials from .env ──────────────────────────────────────────────
load_dotenv()

API_KEY   = os.getenv("FR_API_KEY")
OFFICE_ID = os.getenv("FR_OFFICE_ID")
BASE_URL  = os.getenv("FR_BASE_URL", "https://api.fieldroutes.com")

if not API_KEY or not OFFICE_ID:
    raise SystemExit(
        "\n[ERROR] Missing credentials.\n"
        "Copy .env.example to .env and fill in FR_API_KEY and FR_OFFICE_ID."
    )

# ── Config ───────────────────────────────────────────────────────────────────
OUTPUT_DIR   = Path(__file__).parent / "output"
LOOKBACK_DAYS = int(os.getenv("LOOKBACK_DAYS", 1))   # default: yesterday only
                                                        # set to 30 on first run

OUTPUT_DIR.mkdir(exist_ok=True)

# Date range: yesterday (or further back on first run)
end_date   = datetime.today().date()
start_date = end_date - timedelta(days=LOOKBACK_DAYS)

DATE_START = start_date.strftime("%Y-%m-%d")
DATE_END   = end_date.strftime("%Y-%m-%d")

print(f"Pulling data from {DATE_START} to {DATE_END}")

# ── Shared headers for every request ─────────────────────────────────────────
HEADERS = {
    "authenticationKey": API_KEY,
    "officeID":          OFFICE_ID,
    "Content-Type":      "application/json",
}


# ── Helper functions ──────────────────────────────────────────────────────────

def get(endpoint: str, params: dict = None) -> list:
    """
    GET from the FieldRoutes API.
    Handles pagination automatically (FieldRoutes uses offset/limit).
    Returns a flat list of all records.
    """
    url      = f"{BASE_URL}/{endpoint.lstrip('/')}"
    all_data = []
    offset   = 0
    limit    = 500  # max per page

    while True:
        page_params = {"limit": limit, "offset": offset, **(params or {})}

        try:
            resp = requests.get(url, headers=HEADERS, params=page_params, timeout=30)
            resp.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] {endpoint}: HTTP {resp.status_code} — {resp.text[:200]}")
            break
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] {endpoint}: {e}")
            break

        data = resp.json()

        # FieldRoutes wraps results — adjust key name if needed
        # Common patterns: data["data"], data["appointments"], data["invoices"], etc.
        records = []
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict):
            # Try common wrapper keys
            for key in ("data", "items", "results", "appointments", "invoices",
                        "customers", "subscriptions", "employees"):
                if key in data:
                    records = data[key]
                    break
            if not records and "error" in data:
                print(f"[ERROR] {endpoint}: {data['error']}")
                break

        if not records:
            break

        all_data.extend(records)

        # Stop if we got fewer records than the page limit (last page)
        if len(records) < limit:
            break

        offset += limit

    print(f"  {endpoint}: {len(all_data)} records")
    return all_data


def save_csv(filename: str, records: list, fields: list) -> None:
    """Write a list of dicts to a CSV file, keeping only the specified fields."""
    if not records:
        print(f"  [SKIP] {filename} — no records returned")
        return

    path = OUTPUT_DIR / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)

    print(f"  Saved {len(records)} rows → {path}")


def flatten(record: dict, prefix: str = "") -> dict:
    """
    Flatten one level of nested dicts so CSV columns stay clean.
    e.g. {"customer": {"id": 1}} → {"customer_id": 1}
    """
    out = {}
    for k, v in record.items():
        col = f"{prefix}{k}" if not prefix else f"{prefix}_{k}"
        if isinstance(v, dict):
            out.update(flatten(v, col))
        else:
            out[col] = v
    return out


# ── Pull functions ────────────────────────────────────────────────────────────

def pull_jobs():
    print("\n[1/5] Jobs / Appointments")
    params = {
        "dateStart": DATE_START,
        "dateEnd":   DATE_END,
    }
    records = get("/appointment", params)
    fields = [
        "appointmentID", "date", "completedDate", "status",
        "customerID", "employeeID", "serviceType", "duration", "notes",
    ]
    save_csv("jobs.csv", records, fields)


def pull_invoices():
    print("\n[2/5] Invoices")
    params = {
        "dateStart": DATE_START,
        "dateEnd":   DATE_END,
    }
    records = get("/invoice", params)
    fields = [
        "invoiceID", "customerID", "date", "amount",
        "amountPaid", "balance", "status", "serviceType",
    ]
    save_csv("invoices.csv", records, fields)


def pull_customers():
    print("\n[3/5] Customers")
    # Customers don't always filter by date — pull all active and let Sheets dedupe
    params = {
        "dateStart": DATE_START,
        "dateEnd":   DATE_END,
    }
    records = get("/customer", params)
    fields = [
        "customerID", "firstName", "lastName",
        "address", "city", "zip", "phone", "email",
        "createdDate", "status", "source",
    ]
    save_csv("customers.csv", records, fields)


def pull_subscriptions():
    print("\n[4/5] Subscriptions")
    records = get("/subscription")
    fields = [
        "subscriptionID", "customerID", "serviceType", "frequency",
        "nextServiceDate", "status", "price",
    ]
    save_csv("subscriptions.csv", records, fields)


def pull_employees():
    print("\n[5/5] Employees")
    records = get("/employee")
    fields = [
        "employeeID", "firstName", "lastName", "type", "status",
    ]
    save_csv("employees.csv", records, fields)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print(" Banner FieldRoutes Pull")
    print(f" Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    pull_jobs()
    pull_invoices()
    pull_customers()
    pull_subscriptions()
    pull_employees()

    print("\nDone. CSV files are in:", OUTPUT_DIR)
    print("\nNext step: upload CSVs to Google Sheets (or set up auto-sync).")


if __name__ == "__main__":
    main()
