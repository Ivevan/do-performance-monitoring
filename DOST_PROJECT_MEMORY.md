# DOST XI PSTO Performance Monitoring Dashboard
**Project Memory & Context File**

*If you are a new AI assistant taking over this project, read this file carefully to understand the exact context, business logic, and architecture of what we are building.*

---

## 1. Business Context
This project is a performance monitoring dashboard for the **Department of Science and Technology (DOST) Regional Office XI**, specifically tracking the performance of a Provincial Science and Technology Office (PSTO).
The performance is divided into 4 main pillars (MFOs):
1. **I. Operations**: Direct assistance to MSMEs and LGUs (SETUP, LGIA, Technology Trainings, Innovation Fund).
2. **II. Enhancement of Science and Technology**: Scholarships, S&T Promotion (STARBOOKS), Networks.
3. **III. General Administrative Services**: Financial disbursements and fund utilization.
4. **IV. Support to Operations**: Quality Management, Employee Morale, 5S Audits.

**The Golden Rule:** The dashboard must calculate and compare **Actual Accomplishments** against **Targets** (both Annual and Quarterly) accurately.

## 2. Tech Stack
* **Frontend**: React (Vite, TypeScript), TailwindCSS, `shadcn/ui`, Framer Motion, Recharts.
* **Backend**: Node.js (Express, TypeScript) running on `http://localhost:8000`. Acts as an API gateway.
* **Database**: PostgreSQL hosted on **Supabase**.
* **Future Data Pipeline**: Python (Pandas, openpyxl, supabase-py).

## 3. Database Architecture
The database is fully normalized. The most critical aspect is how the data is joined for the frontend.
* `sections`, `categories`, and `indicators` define the hierarchy and the metrics being tracked.
* `targets`: Defines the `annual_target` and quarterly targets (`q1_target`, etc.) for an indicator for a specific year.
* `accomplishments`: The actual numbers achieved by the PSTO per quarter.

**Aggregation Types (`aggregation_type`):**
* `SUM`: For cumulative metrics (e.g., "Amount Funded"). The system must add Q1+Q2+Q3+Q4 to compare against the Annual Target.
* `LATEST`: For snapshot metrics (e.g., "% SETUP refund rate", "5S Audit Score"). The system must use the most recent quarter's value and compare it directly to the target.

**The Crucial SQL View:**
The frontend relies entirely on a custom PostgreSQL view named `v_indicator_data`. This view `LEFT JOIN`s the `accomplishments` table with the `targets` table so the API payload contains both the `value` (actual) and the `annual_target`. 

## 4. Current Frontend UI State
We recently overhauled the UX/UI of the `Dashboard.tsx` Overview tab:
1. **The "Big 4" KPI Cards**: Displays "Total Funding", "Projects Approved", "Employment Generated", and "SETUP Refund Rate". Features animated radial progress rings calculating `(actual / target) * 100`.
2. **Quarterly Pace Chart**: A `ComposedChart` (Bar + Line) that plots actual accomplishments as bars and the quarterly targets as a dashed line.
3. **Annual Progress Bars**: Horizontal bars that display the raw numbers `Actual / Target` alongside the percentage.

## 5. The "Phase 2" Plan (Pending Execution)
**The Problem:** The targets currently hardcoded in `seed_cy2026.sql` were initial baselines. We discovered that when the PSTO submits their quarterly Excel report (e.g., `PTSO-DO 1stQ KPIs.xlsx`), they often include *recalibrated, updated Annual Targets*.

**The Solution:** We are building a Python/Pandas Data Pipeline.
Instead of treating database targets as static, the upcoming Python script will:
1. Ingest the actual PSTO Excel `.xlsx` file.
2. Read both the "1st Q Accomplishments" **AND** the "Annual Target" columns.
3. Connect directly to Supabase.
4. Execute an `UPSERT` to push the new accomplishments AND overwrite the database targets with the newly recalibrated targets from the Excel sheet.

This ensures the React dashboard is always a 100% accurate reflection of the PSTO's latest Excel files.

---
*End of Memory File.*
