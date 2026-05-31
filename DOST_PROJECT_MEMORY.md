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

---

## 2. Tech Stack
* **Frontend**: React (Vite, TypeScript), TailwindCSS, `shadcn/ui`, Framer Motion, Recharts.
* **Backend**: Node.js (Express, TypeScript) running on `http://localhost:8000`. Acts as an API gateway.
* **Database**: PostgreSQL hosted on **Supabase** via direct client SDK and backend integrations.
* **Data Integration**: Standardized Excel upload templates matching the dashboard indicators.

---

## 3. Database Architecture
The database is fully normalized. The most critical aspect is how the data is joined for the frontend.
* `sections`, `categories`, and `indicators` define the hierarchy and the metrics being tracked.
* `targets`: Defines the `annual_target` and quarterly targets (`q1_target`, etc.) for an indicator for a specific year.
* `accomplishments`: The actual numbers achieved by the PSTO per quarter.

**Aggregation Types (`aggregation_type`):**
* `SUM`: For cumulative metrics (e.g., "Amount Funded"). The system must add Q1+Q2+Q3+Q4 to compare against the Annual Target.
* `LATEST`: For snapshot metrics (e.g., "% SETUP refund rate", "5S Audit Score"). The system must use the most recent quarter's value and compare it directly to the target.

**The Crucial SQL View:**
The frontend relies on a custom PostgreSQL view named `v_indicator_data`. This view `LEFT JOIN`s the `accomplishments` table with the `targets` table so the API payload contains both the `value` (actual) and the `annual_target`. 

**Performance & Security Hardening (Optimized):**
* **Foreign Key Indexes**: Covering indexes (`idx_categories_section_id`, `idx_indicators_category_id`, `idx_targets_indicator_id`, `idx_accomplishments_indicator_id`) are implemented to accelerate multi-table JOINs and view scans.
* **RLS Caching**: Security context calls are wrapped in subqueries, e.g. `((SELECT auth.jwt()) ->> 'email')`, enabling Postgres to evaluate user claims once per query instead of row-by-row, eliminating RLS query bottlenecks.
* **Write Privileges Hardening**: Insecure public write/delete policies have been discarded. Direct client-side writes are blocked, routing all grid updates strictly through the Node.js API gateway using the service role key.
* **Security Invoker View**: Re-created the `v_indicator_data` view with `WITH (security_invoker = true)` to enforce row-level security constraints correctly at query time.
* **Function Isolation**: Trigger functions are set to `search_path = public, pg_temp` and public execution grants are revoked to prevent search path hijacking.

---

## 4. Key Workflows & Features

### A. Excel Report Export Utility (`client/features/dashboard/utils/exportToExcel.ts`)
* **Template-Bound**: Dynamically populates data into `/public/DOST_Performance_Template.xlsx`.
* **Export Filters**: Users can choose to export "All", "Targets only", or "KPIs only" via `ExportDialog.tsx`. Unselected sheets are programmatically deleted from the Excel workbook structure before downloading.
* **Conditional Formatting**: Conditionally displays decimal values (e.g., `88.50` retains decimals, while whole numbers like `1200.00` are formatted as `1200` to look clean).
* **Signatures Block**: Automatically prints the prepared name and position of the Provincial Director/Approver in rows 121 and 122 of both sheets.
* **Fuzzy Tag Matching**: Matches indicators from the database to cells in the Excel template using tag strings (Column J on KPIs sheet, Column G on Targets sheet).

### B. Security & Inactivity Safeguards (`client/features/auth/context/AuthContext.tsx`)
* **Role-Based Access (RBAC)**: Supports roles: `PD` (Provincial Director), `Editor`, and `Staff` (Read-only) authorized via domain-filtered Google OAuth.
* **Persistent Inactivity Auto-Logout**: Monitors standard user events (`mousemove`, `click`, `keydown`, `scroll`, `touchstart`) and signs the user out automatically after **15 minutes** of inactivity, displaying a warning toast. The last-active timestamp is persisted via `localStorage` so that inactivity triggers correctly even if the user reloads the page, closes the tab, or restarts the browser.
* **Event Throttling**: The mouse/activity event listeners are throttled to run at most once every 2 seconds to optimize CPU usage and reduce local storage write frequency.
* **Tab-Focus Cache Protection**: Uses a `hasFetched` flag in `AccountSettings.tsx` to stop the profile loading state from flashing when users Alt+Tab or switch browser tabs.
* **Tab Naming Standards**: All browser document titles (tab names) are standardized with the layout name and the short office suffix (e.g., `Dashboard CY 2026 | DOST-PSTO-DO`).
* **Premium Settings UI/UX**: The `AccountSettings.tsx` view is refactored with high-end glassmorphism, a profile hero gradient banner with overlapping avatar, dynamic credential badges styled by access role (gold for PD, emerald for Editor, muted gray for Staff), and modern micro-interaction hover glows.

### C. Buffered Audit & Save Flow (`client/features/dashboard/components/DataEntryGrid.tsx`)
* **Local Buffering**: Edits are stored in React state as users write. No typing lag or redundant network fetches occur.
* **Audit Modal**: Before saving to the backend, the user is shown a side-by-side comparison modal displaying:
  * Modified Indicator name & Category
  * Old Value vs. New Value
  * Corresponding Target Value (as reference helper)
* **Unsaved Changes Shield**: Prompts the user with a browser confirmation window before leaving the page if there are uncommitted edits.

---

## 5. Database Backup Strategy
To ensure maximum resilience and disaster recovery capabilities, the performance monitoring system relies on a dual-layer backup strategy:

### A. Native Supabase Backups
* **Daily Backups**: Automated daily logical backups are run natively by Supabase and kept for up to 7 days (Pro) or 14 days (Team) in **Settings > Database > Backups**.
* **Point-in-Time Recovery (PITR)**: Active as an add-on, storing Write-Ahead Logs (WAL) at 2-minute intervals to allow recovering the database state to the exact second of any emergency.

### B. Automated GitHub Actions Backup (`.github/workflows/database-backup.yml`)
* **Frequency**: Triggered automatically every day at 00:00 UTC (08:00 PHT) and supports manual triggering via `workflow_dispatch`.
* **Output**: Dumps the schema and tables, compresses it to a `.sql.gz` file, saves it as a 7-day build artifact, and archives it as a private repository Release.
* **Required Secret**: Set the GitHub Repository Secret `SUPABASE_DB_URL` with your Postgres connection string:
  `postgresql://postgres:[PASSWORD]@db.zbdpoyycrfipnxfuzisv.supabase.co:5432/postgres`

### C. Manual Logical Backups
* **CLI Method**: Download a local logical copy directly from your terminal using:
  ```bash
  pg_dump "postgresql://postgres:[PASSWORD]@db.zbdpoyycrfipnxfuzisv.supabase.co:5432/postgres" --no-owner --no-privileges -F c -f dost_backup_manual.sql
  ```

---

## 6. Ongoing Guidelines for Future Modifications
1. **Search Input Fields**: Ensure all search bars include unique `id` and `name` attributes to pass accessibility standards and autofill criteria.
2. **Template Alterations**: If indicators are added/updated, corresponding rows with correct tags **must** be updated in the physical `/public/DOST_Performance_Template.xlsx` template to appear on exports.
3. **Responsive Forms**: Use the responsive 2-column grid layout pattern (e.g., `grid-cols-1 lg:grid-cols-3 gap-6`) for page-level settings to maximize screen space utilization on desktop screens while remaining responsive on mobile.

---
*End of Memory File.*
