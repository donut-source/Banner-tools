"""
Banner Pest Control — Demo Script (Fake Data)
----------------------------------------------
Generates realistic fake data in the exact same format as the live
FieldRoutes pull. No API key needed — run this to see what the output
looks like before connecting to the real system.

Run:
  python demo_fake_data.py

Output: CSV files in scripts/output/demo/
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path(__file__).parent / "output" / "demo"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TODAY      = datetime.today().date()
START_DATE = TODAY - timedelta(days=30)

random.seed(42)  # fixed seed = same fake data every run

# ── Fake reference data ───────────────────────────────────────────────────────
TECHNICIANS = [
    {"employeeID": "E001", "firstName": "Marcus",  "lastName": "Rivera",   "type": "technician", "status": "active"},
    {"employeeID": "E002", "firstName": "Danielle", "lastName": "Brooks",  "type": "technician", "status": "active"},
    {"employeeID": "E003", "firstName": "Tyler",    "lastName": "Nguyen",  "type": "technician", "status": "active"},
    {"employeeID": "E004", "firstName": "Priya",    "lastName": "Kapoor",  "type": "office",     "status": "active"},
]

SERVICE_TYPES = [
    "General Pest Control",
    "Mosquito Treatment",
    "Termite Inspection",
    "Rodent Control",
    "Bed Bug Treatment",
    "Fire Ant Treatment",
]

SOURCES = ["Google Ads", "Organic Search", "Referral", "Direct", "Yelp", "Nextdoor"]

CITIES = ["Austin", "Round Rock", "Cedar Park", "Pflugerville", "Georgetown"]

FIRST_NAMES = ["James", "Maria", "David", "Linda", "Robert", "Patricia",
               "Michael", "Barbara", "William", "Susan", "Carlos", "Angela",
               "Brian", "Melissa", "Kevin", "Stephanie", "Jason", "Nicole"]

LAST_NAMES  = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
               "Miller", "Davis", "Wilson", "Martinez", "Anderson", "Taylor",
               "Thomas", "Hernandez", "Moore", "Robinson", "Clark", "Lewis"]

STATUSES_JOB     = ["completed", "completed", "completed", "cancelled", "rescheduled"]
STATUSES_INVOICE = ["paid", "paid", "paid", "unpaid", "unpaid"]
STATUSES_SUB     = ["active", "active", "active", "active", "cancelled", "suspended"]
FREQUENCIES      = ["monthly", "quarterly", "bi-monthly", "annually"]


def rand_date(start=START_DATE, end=TODAY):
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def rand_phone():
    return f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}"


def rand_address():
    return f"{random.randint(100, 9999)} {random.choice(['Oak', 'Elm', 'Cedar', 'Pine', 'Maple'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}"


def save_csv(filename, records, fields):
    path = OUTPUT_DIR / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    print(f"  Saved {len(records)} rows -> {path}")


# ── Generators ────────────────────────────────────────────────────────────────

def make_customers(n=80):
    customers = []
    for i in range(1, n + 1):
        customers.append({
            "customerID":   f"C{i:04d}",
            "firstName":    random.choice(FIRST_NAMES),
            "lastName":     random.choice(LAST_NAMES),
            "address":      rand_address(),
            "city":         random.choice(CITIES),
            "zip":          f"786{random.randint(10,99)}",
            "phone":        rand_phone(),
            "email":        f"customer{i}@email.com",
            "createdDate":  rand_date(TODAY - timedelta(days=365), TODAY).isoformat(),
            "status":       random.choices(["active", "inactive", "cancelled"], weights=[80, 10, 10])[0],
            "source":       random.choice(SOURCES),
        })
    return customers


def make_subscriptions(customers):
    subs = []
    for i, c in enumerate(customers):
        if c["status"] == "active":
            price = random.choice([49, 59, 79, 99, 129, 149])
            subs.append({
                "subscriptionID":  f"S{i+1:04d}",
                "customerID":      c["customerID"],
                "serviceType":     random.choice(SERVICE_TYPES),
                "frequency":       random.choice(FREQUENCIES),
                "nextServiceDate": rand_date(TODAY, TODAY + timedelta(days=60)).isoformat(),
                "status":          random.choice(STATUSES_SUB),
                "price":           price,
            })
    return subs


def make_jobs(customers, n=200):
    jobs = []
    for i in range(1, n + 1):
        customer    = random.choice(customers)
        tech        = random.choice([t for t in TECHNICIANS if t["type"] == "technician"])
        sched_date  = rand_date()
        status      = random.choice(STATUSES_JOB)
        comp_date   = sched_date.isoformat() if status == "completed" else ""
        jobs.append({
            "appointmentID": f"A{i:05d}",
            "date":          sched_date.isoformat(),
            "completedDate": comp_date,
            "status":        status,
            "customerID":    customer["customerID"],
            "employeeID":    tech["employeeID"],
            "serviceType":   random.choice(SERVICE_TYPES),
            "duration":      random.choice([30, 45, 60, 90, 120]),
            "notes":         random.choice(["", "", "Customer not home", "Gate code 1234", "Dog in yard"]),
        })
    return jobs


def make_invoices(jobs):
    invoices = []
    inv_id   = 1
    for job in jobs:
        if job["status"] == "completed":
            amount    = round(random.uniform(75, 350), 2)
            status    = random.choice(STATUSES_INVOICE)
            paid      = amount if status == "paid" else round(amount * random.choice([0, 0.5]), 2)
            invoices.append({
                "invoiceID":   f"I{inv_id:05d}",
                "customerID":  job["customerID"],
                "date":        job["completedDate"],
                "amount":      amount,
                "amountPaid":  paid,
                "balance":     round(amount - paid, 2),
                "status":      status,
                "serviceType": job["serviceType"],
            })
            inv_id += 1
    return invoices


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print(" Banner Demo — Fake Data Generator")
    print(f" Date range: {START_DATE} to {TODAY}")
    print("=" * 50)

    print("\n[1/5] Generating customers...")
    customers = make_customers(80)
    save_csv("customers.csv", customers, [
        "customerID", "firstName", "lastName", "address", "city", "zip",
        "phone", "email", "createdDate", "status", "source",
    ])

    print("\n[2/5] Generating subscriptions...")
    subs = make_subscriptions(customers)
    save_csv("subscriptions.csv", subs, [
        "subscriptionID", "customerID", "serviceType", "frequency",
        "nextServiceDate", "status", "price",
    ])

    print("\n[3/5] Generating jobs...")
    jobs = make_jobs(customers, 200)
    save_csv("jobs.csv", jobs, [
        "appointmentID", "date", "completedDate", "status",
        "customerID", "employeeID", "serviceType", "duration", "notes",
    ])

    print("\n[4/5] Generating invoices...")
    invoices = make_invoices(jobs)
    save_csv("invoices.csv", invoices, [
        "invoiceID", "customerID", "date", "amount",
        "amountPaid", "balance", "status", "serviceType",
    ])

    print("\n[5/5] Generating employees...")
    save_csv("employees.csv", TECHNICIANS, [
        "employeeID", "firstName", "lastName", "type", "status",
    ])

    # ── Print a quick summary so you can see the numbers at a glance ──────────
    completed  = [j for j in jobs     if j["status"] == "completed"]
    paid_inv   = [i for i in invoices if i["status"] == "paid"]
    active_sub = [s for s in subs     if s["status"] == "active"]
    total_rev  = sum(i["amount"] for i in paid_inv)
    outstanding = sum(i["balance"] for i in invoices)

    print("\n" + "=" * 50)
    print(" DEMO SUMMARY (last 30 days)")
    print("=" * 50)
    print(f"  Customers:            {len(customers)}")
    print(f"  Active subscriptions: {len(active_sub)}")
    print(f"  Jobs scheduled:       {len(jobs)}")
    print(f"  Jobs completed:       {len(completed)}")
    print(f"  Completion rate:      {len(completed)/len(jobs)*100:.1f}%")
    print(f"  Invoices generated:   {len(invoices)}")
    print(f"  Revenue collected:    ${total_rev:,.2f}")
    print(f"  Outstanding balance:  ${outstanding:,.2f}")
    print()
    print(f"  CSV files saved to:   {OUTPUT_DIR}")
    print()
    print("  Next step: upload these CSVs to the Banner Data Warehouse")
    print("  Google Sheet to see the dashboards populate with demo data.")
    print("=" * 50)


if __name__ == "__main__":
    main()
