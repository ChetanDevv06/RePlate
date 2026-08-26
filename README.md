# RePlate — Save Good Food. Waste Less.

> **Good food deserves another plate.**

RePlate is a surplus-food marketplace that helps restaurants, bakeries, and college canteens sell safe, unsold surplus food at discounted prices before it becomes waste.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Lucide React |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Deployment | Vercel + Supabase |

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd replate-app
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: Supabase Dashboard → Project Settings → API

### 3. Supabase Setup

Create a new Supabase project at [supabase.com](https://supabase.com).

### 4. Run Database Migrations

In the Supabase SQL Editor, run these files **in order**:

1. `supabase/migrations/001_initial_schema.sql` — Tables, indexes, triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security
3. `supabase/migrations/003_functions.sql` — RPCs (reserve_food, update_order_status, etc.)

### 5. Create Demo Auth Users

In Supabase Dashboard → Authentication → Users → "Invite user":

**Customer Demo Account:**
- Email: `customer@replate.demo`
- Password: `demo123456`
- User Metadata: `{"name": "Demo Customer", "role": "customer"}`

**Business Demo Account:**
- Email: `business@replate.demo`
- Password: `demo123456`
- User Metadata: `{"name": "Demo Business Owner", "role": "business"}`

> The `handle_new_user` trigger will automatically create their profiles.

### 6. Create Demo Business

After creating the business demo user, get their UUID from Supabase Auth, then run in SQL Editor:

```sql
-- Replace BUSINESS_USER_UUID with the actual UUID
INSERT INTO businesses (owner_id, name, location, address, contact)
VALUES 
  ('BUSINESS_USER_UUID', 'RUAS Campus Canteen', 'Bangalore', 'RUAS Campus, Peenya, Bangalore 560058', '+91 98765 43210'),
  ('BUSINESS_USER_UUID', 'GreenBite Café', 'Bangalore', '14th Cross, Indiranagar, Bangalore 560038', '+91 98765 43211'),
  ('BUSINESS_USER_UUID', 'FreshBake Bakery', 'Bangalore', 'Church Street, MG Road, Bangalore 560001', '+91 98765 43212');
```

> Note: For the MVP demo, all businesses are owned by the single business demo account. In production, each business owner would have their own account.

### 7. Configure Supabase Storage

The `003_functions.sql` migration automatically creates the `food-images` storage bucket. If it doesn't appear, create it manually in Supabase Dashboard → Storage → "New bucket" → name: `food-images` → Public.

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production

```bash
npm run build
npm run start
```

Deploy to Vercel:

```bash
vercel
```

Set environment variables in Vercel dashboard.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@replate.demo` | `demo123456` |
| Business | `business@replate.demo` | `demo123456` |

Use the **Customer Demo** / **Business Demo** buttons on the login page for quick access.

---

## Architecture

### Authentication Flow
- Supabase Auth handles email/password login
- On first login, a database trigger creates a `profiles` row linked to the auth user
- Role is stored in `profiles.role` (either `customer` or `business`)
- Next.js middleware enforces role-based routing

### Core Order Flow
1. Business creates listing → stored in `food_listings`
2. Customer reserves food → atomic `reserve_food()` RPC decrements quantity
3. Business marks Ready → `update_order_status()` RPC validates transition
4. Business marks Collected → impact stats automatically updated

### Race Condition Prevention
The `reserve_food()` PostgreSQL function uses `FOR UPDATE` row locking to prevent concurrent orders from over-selling inventory. The quantity decrement and order creation happen atomically.

### Business Logic Location
All business calculations are in `lib/calculations/` and `lib/constants/`. Never duplicated across components.

---

## Prediction Algorithm

The Smart Prediction feature is a **rule-based heuristic**, not machine learning.

```
surplus = currentStock - expectedDemand
surplusRatio = surplus / currentStock

surplusRatio >= 0.50 → HIGH RISK  → Recommend 40% discount
surplusRatio >= 0.25 → MEDIUM RISK → Recommend 30% discount
otherwise           → LOW RISK   → Recommend 20% discount
```

This is designed so an ML model can replace it later with minimal code changes.

---

## Waste Calculation

```
estimated_waste_avoided_kg = meals_collected × 0.25 kg
```

The `0.25 kg` assumption is configurable in `lib/constants/index.ts`:

```typescript
export const ESTIMATED_WEIGHT_PER_MEAL_KG = 0.25;
```

Displayed with a disclaimer: *"Estimated using RePlate's configurable average food-weight assumption."*

---

## Project Structure

```
replate-app/
├── app/
│   ├── actions/          # Server Actions (auth, listings, orders)
│   ├── business/         # Business dashboard, listings, orders, analytics
│   ├── customer/         # Customer home, explore, listing detail, orders
│   └── login/            # Authentication page
├── components/
│   ├── business/         # Business nav
│   ├── customer/         # Customer nav
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Shared components (FoodCard, StatCard, etc.)
├── lib/
│   ├── calculations/     # calculateDiscountPercentage, calculateCommission, etc.
│   ├── constants/        # COMMISSION_RATE, ESTIMATED_WEIGHT_PER_MEAL_KG, etc.
│   ├── prediction/       # calculateSurplusRisk, surplus prediction engine
│   ├── supabase/         # Browser, server, and middleware Supabase clients
│   └── validations/      # Zod schemas
├── supabase/
│   ├── migrations/       # 001_schema, 002_rls, 003_functions
│   └── seed.sql          # Demo data instructions
├── types/
│   └── index.ts          # TypeScript types
└── middleware.ts          # Route protection
```

---

## Security

- Row Level Security (RLS) enforced on all database tables
- Server-side ownership verification on all mutations
- Atomic order creation via PostgreSQL RPC (prevents overselling)
- No service-role keys exposed to client
- Only `NEXT_PUBLIC_*` variables are client-visible
