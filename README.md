# Milimani Brothers — Savings & Member Management Portal

A full-stack, responsive web application built for the **Milimani Brothers** savings group. The platform manages member records, tracks monthly savings contributions, processes M-Pesa transaction logs, and provides real-time financial progress toward the group's seasonal savings goals.

---

## Key Features

- **Dynamic Group Target Engine:** Automatically calculates total seasonal targets (August – December) based on the total active member count ($N \times \text{KSh } 400 \times 5 \text{ months}$) and updates cumulative progress dynamically from live payment records.
- **M-Pesa Transaction Tracking:** Logs and validates M-Pesa receipt codes, amounts, and dates associated with individual members.
- **Member Directory & Profiles:** Centralized registry for member details, status, and system roles (`admin` vs. `member`).
- **Audit & Financial Reporting:** Clear summary views and reports for individual contributions, monthly tallies, and overall group savings.
- **Responsive Navigation UI:** Dual-navigation architecture with a fixed desktop sidebar and a slide-out mobile drawer, both displaying dynamic target metrics.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 14/15 (App Router, Client & Server Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Icons & UI** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL, Row-Level Security, Auth) |
| **State Management** | React Context (`UserContext`) |
| **Deployment** | Vercel |

---

## Financial Target Formula

The core savings target tracks contributions across the **5-month cycle** from **August through December**. Each member contributes a fixed fee of **KSh 400 per month**.

$$\text{Total Group Target} = \text{Active Member Count} \times \text{KSh } 400 \times 5$$

### Calculation Matrix Example

$$\text{Target for 13 Members} = 13 \times 400 \times 5 = \text{KSh 26,000}$$

$$\text{Target for 15 Members} = 15 \times 400 \times 5 = \text{KSh 30,000}$$

The percentage fill for the UI progress bar is computed as:

$$\text{Progress \%} = \min\left(\left\lfloor \frac{\text{Total Collected Payments}}{\text{Total Group Target}} \times 100 \right\rfloor, 100\right)$$

---

## Database Schema (Supabase / PostgreSQL)

### 1. `members`
Stores member account information and access privileges.

```sql
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
