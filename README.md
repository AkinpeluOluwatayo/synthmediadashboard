# Synth Media Agency — Customer Portal & Service Platform

Production-ready Customer Service Portal and Admin Operations Center for Synth Media Agency.

## Technology Stack
- **Framework**: Next.js (App Router, JavaScript `.js`/`.jsx`)
- **Styling**: Tailwind CSS with custom Magenta-to-Purple accent gradient (`from-pink-500 via-fuchsia-500 to-purple-600`)
- **Backend & Auth**: Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`), Supabase Storage, and Row Level Security (RLS)
- **Icons**: Lucide React

## Project Features
1. **Authentication**: Sign Up, Login, Forgot Password, Logout with server-side middleware route guards.
2. **Customer Portal (`/dashboard`)**:
   - Welcome overview banner with active project progress indicators.
   - **Services Marketplace (`/dashboard/services`)**: Categorized by Creative, Digital Growth, and Technology pillars.
   - **Service Package Details (`/dashboard/services/[id]`)**: Package feature comparison and selection.
   - **Order Submission (`/dashboard/services/[id]/order`)**: Project brief requirements form & reference file uploads.
   - **My Orders (`/dashboard/orders`, `/dashboard/orders/[id]`)**: Visual timeline status tracking (`PENDING_PAYMENT`, `PAID`, `IN_PRODUCTION`, `COMPLETED`), requirement details, and deliverable download button.
   - **Customer Profile (`/dashboard/profile`)** & **Payments Ledger (`/dashboard/payments`)**.
3. **Admin Operations Hub (`/admin`)**:
   - Key metrics: Total Customers, Active Production, Paid Orders, Completed Projects, Revenue.
   - **Orders Manager (`/admin/orders`, `/admin/orders/[id]`)**: Status switcher, internal notes, and deliverable file link attachment.
   - **Customer Directory (`/admin/customers`)**, Services (`/admin/services`), Packages (`/admin/packages`), Payments (`/admin/payments`), Deliveries (`/admin/deliveries`).

## Integration Architecture & Boundaries
Clean service layer boundaries are architected for future extensions:
- `lib/payments/paystack.js`
- `lib/storage/google-drive.js`
- `lib/automations/make.js`

## Setup & Running Instructions

### 1. Database Migration
Run the contents of `supabase/schema.sql` in your Supabase SQL Editor.

### 2. Environment Variables
Create a `.env.local` file based on `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run start
```
# synthmediadashboard
