     # REPLATE — MASTER MVP BUILD SPECIFICATION

## 0. ROLE AND INSTRUCTIONS

You are the lead full-stack engineer, product designer, database architect, QA engineer, and technical reviewer responsible for building a production-quality MVP called **RePlate**.

You are working inside an existing development environment using Antigravity. Your job is to inspect the existing repository first, determine what already exists, and then build or modify the project according to this specification.

Do NOT blindly overwrite an existing project.

Before making major changes:

1. Inspect the repository structure.
2. Identify the current framework and installed dependencies.
3. Identify whether Supabase is already configured.
4. Identify existing environment variables.
5. Identify existing components or pages that can be reused.
6. Identify any existing errors.
7. Decide whether the current project can be adapted or whether a clean architecture is preferable.

The final result must be a **fully functional full-stack MVP**, not a static frontend prototype.

The most important requirement is:

> The complete Business → Listing → Customer → Reservation → Ready for Pickup → Collected → Impact Dashboard flow must work using real persistent backend data without manually editing the database.

Do not fake backend functionality with local React state, hardcoded statistics, or localStorage.

---

# 1. PRODUCT

## Product Name

**RePlate**

## Product Category

Surplus-food marketplace / food-waste reduction platform.

## Core Concept

RePlate helps restaurants, bakeries, and college canteens sell safe, unsold surplus food at discounted prices before it becomes waste.

Businesses can publish surplus food with:

- Food name
- Image
- Original price
- Discounted price
- Quantity
- Pickup start
- Pickup deadline
- Description

Customers can discover nearby surplus food, reserve it, and collect it during the specified pickup window.

The MVP is initially focused on India.

Use Indian Rupee pricing throughout the application.

---

# 2. PRODUCT POSITIONING

RePlate should feel like a real startup product, not a college CRUD application.

Core message:

**Good food deserves another plate.**

Supporting positioning:

**Save good food. Spend less. Waste less.**

The product should communicate three values:

1. Affordable food for customers.
2. Recovered revenue for food businesses.
3. Reduced food waste.

---

# 3. MVP SCOPE

Build these capabilities:

## Authentication

- Customer role
- Business role
- Login
- Logout
- Role-based routing
- Persistent sessions
- Demo accounts

## Business

- Business dashboard
- Create surplus listing
- Upload food image
- Edit listing
- Delete listing
- View active listings
- View quantity remaining
- View orders
- Change order status
- Mark order Ready for Pickup
- Mark order Collected
- Analytics
- Impact statistics
- Surplus prediction

## Customer

- Homepage
- Explore listings
- Food details
- Select quantity
- Reserve food
- Generate unique order ID
- View confirmation
- View My Orders
- View pickup status

## System

- Persistent database
- Real authentication
- Database authorization
- Quantity updates
- Order lifecycle
- Commission calculation
- Impact calculations
- Responsive UI
- Loading states
- Empty states
- Error handling
- Success notifications

---

# 4. NON-GOALS

Do NOT implement:

- Delivery system
- Delivery drivers
- Complex payment gateway
- Customer-business chat
- NGO portal
- Advanced ML model
- Multi-city infrastructure
- Complex recommendation engine
- Loyalty points
- Cryptocurrency
- Wallet system
- Real financial settlement
- Complex inventory management
- Complex restaurant POS integration

Payment can use a mock confirmation flow.

---

# 5. TECHNOLOGY STACK

Use the following stack unless the existing project makes an equivalent choice necessary.

## Frontend

- Next.js 16.x
- React
- TypeScript
- App Router
- Tailwind CSS 4.x
- shadcn/ui
- Lucide React

## Backend

Use Next.js server-side functionality:

- Server Actions where appropriate
- Route Handlers where appropriate
- Server Components where appropriate

Do not introduce a separate Express/Nest backend unless there is a compelling technical reason.

## Database

Supabase PostgreSQL.

## Authentication

Supabase Auth.

## Storage

Supabase Storage for food images.

## Validation

Zod.

## Forms

React Hook Form + Zod.

## Charts

Recharts.

## Notifications

Sonner.

## Deployment target

Vercel + Supabase.

---

# 6. ARCHITECTURE PRINCIPLES

## Principle 1 — Database is the source of truth

Do not use:

- localStorage as the primary data store
- fake React state as backend state
- hardcoded dashboard statistics
- mock API responses for core functionality

React state can be used for temporary UI state only.

Persistent application state must live in Supabase.

---

## Principle 2 — Server-side validation

Never trust the client.

Validate:

- authenticated user
- role
- business ownership
- listing ownership
- quantity
- prices
- order state
- available quantity

on the server.

---

## Principle 3 — Centralize business logic

Do not duplicate:

- commission calculations
- discount calculations
- waste calculations
- prediction calculations
- order state transitions

Create reusable functions.

Suggested modules:

```text
/lib/constants
/lib/calculations
/lib/prediction
/lib/validations
```

---

## Principle 4 — Type everything

Create TypeScript types for:

- User/Profile
- Business
- FoodListing
- Order
- Impact
- PredictionResult

Avoid `any` unless absolutely unavoidable.

---

# 7. DATABASE MODEL

Create the database using proper migrations.

## TABLE: profiles

Fields:

```text
id UUID PRIMARY KEY
name TEXT NOT NULL
email TEXT NOT NULL
role TEXT NOT NULL
avatar_url TEXT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

Role must be restricted to:

```text
customer
business
```

The `id` should correspond to the Supabase Auth user ID.

---

# 8. BUSINESSES TABLE

## TABLE: businesses

Fields:

```text
id UUID PRIMARY KEY
owner_id UUID NOT NULL REFERENCES profiles(id)
name TEXT NOT NULL
location TEXT NOT NULL
address TEXT NULL
contact TEXT NULL
image_url TEXT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

Each business must belong to an authenticated business user.

---

# 9. FOOD LISTINGS TABLE

## TABLE: food_listings

Fields:

```text
id UUID PRIMARY KEY
business_id UUID NOT NULL REFERENCES businesses(id)
name TEXT NOT NULL
image_url TEXT NULL
original_price NUMERIC(10,2) NOT NULL
discounted_price NUMERIC(10,2) NOT NULL
quantity INTEGER NOT NULL
initial_quantity INTEGER NOT NULL
pickup_start TIMESTAMPTZ NOT NULL
pickup_deadline TIMESTAMPTZ NOT NULL
description TEXT NULL
status TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

Status:

```text
active
sold_out
expired
paused
```

Constraints:

- original price > 0
- discounted price > 0
- discounted price < original price
- quantity >= 0
- initial_quantity > 0
- pickup_deadline > pickup_start

---

# 10. ORDERS TABLE

## TABLE: orders

Fields:

```text
id UUID PRIMARY KEY
order_code TEXT UNIQUE NOT NULL
customer_id UUID NOT NULL REFERENCES profiles(id)
listing_id UUID NOT NULL REFERENCES food_listings(id)
quantity INTEGER NOT NULL
total_amount NUMERIC(10,2) NOT NULL
commission NUMERIC(10,2) NOT NULL
status TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
ready_at TIMESTAMPTZ NULL
collected_at TIMESTAMPTZ NULL
```

Order statuses:

```text
reserved
ready
collected
cancelled
```

---

# 11. ORDER STATE MACHINE

Orders must follow this lifecycle:

```text
RESERVED
    ↓
READY
    ↓
COLLECTED
```

Cancellation may be allowed only where appropriate.

Do not allow invalid transitions such as:

```text
collected → reserved
collected → ready
```

The server must validate state transitions.

---

# 12. ORDER QUANTITY LOGIC

This is critical.

Suppose:

```text
Listing initial quantity = 20
Current quantity = 20
```

Customer orders:

```text
2
```

After successful reservation:

```text
Current quantity = 18
```

The order stores:

```text
quantity = 2
```

Never allow:

```text
order quantity > available quantity
```

The database operation must safely handle simultaneous orders.

Do not perform a naive:

```text
SELECT quantity
then
UPDATE quantity
```

without protection against race conditions.

Use a safe database transaction/RPC/conditional update approach so inventory cannot become negative.

---

# 13. COMMISSION

RePlate commission is:

```text
10%
```

Create a central constant:

```text
COMMISSION_RATE = 0.10
```

Commission calculation:

```text
commission = total_amount × 0.10
```

Example:

```text
₹60 × 2 = ₹120

₹120 × 10% = ₹12
```

Display:

```text
Customer pays: ₹120
Business revenue recovered: ₹120
RePlate commission: ₹12
```

If displaying business net revenue, calculate separately:

```text
net_business_revenue = total_amount - commission
```

Do not confuse gross recovered revenue with RePlate commission.

---

# 14. DISCOUNT CALCULATION

Discount percentage:

```text
discount_percentage =
((original_price - discounted_price) / original_price) × 100
```

Round appropriately for display.

Example:

```text
Original: ₹100
Discounted: ₹60

Discount = 40%
```

The UI should automatically display the discount.

The user should not have to manually enter the percentage.

---

# 15. WASTE AVOIDED CALCULATION

Do not claim scientific precision.

Use a configurable MVP assumption.

Create:

```text
ESTIMATED_WEIGHT_PER_MEAL_KG = 0.25
```

Then:

```text
estimated_waste_avoided =
collected_meals × ESTIMATED_WEIGHT_PER_MEAL_KG
```

Display the value as:

**Estimated waste avoided**

Add a subtle explanation:

> Estimated using RePlate's configurable average food-weight assumption.

Make the assumption easy to change later.

---

# 16. IMPACT CALCULATIONS

Impact must be calculated dynamically from completed orders.

Only orders with:

```text
status = collected
```

should count toward actual rescued food.

Calculate:

## Total orders

Number of collected orders.

## Meals/items rescued

Sum of `quantity` from collected orders.

## Revenue recovered

Sum of `total_amount` from collected orders.

## RePlate revenue

Sum of `commission` from collected orders.

## Estimated waste avoided

```text
collected_quantity × estimated_weight_per_meal
```

## Active listings

Number of currently active listings with quantity > 0 and pickup deadline in the future.

Do not hardcode these statistics.

---

# 17. SUPABASE ROW LEVEL SECURITY

Implement proper RLS.

## Customer permissions

Customers can:

- read active food listings
- read relevant business information
- create orders for themselves
- read their own orders

Customers cannot:

- modify listings
- modify businesses
- modify another customer's orders
- change order status

---

## Business permissions

Business users can:

- read their own business
- create listings for their business
- update their own listings
- delete their own listings where allowed
- read orders associated with their listings
- change statuses for their own orders

Business users cannot:

- modify another business's listings
- modify another business's orders
- access another business's private information

---

# 18. AUTHENTICATION

Use Supabase Auth.

Implement:

```text
/login
```

The UI should include:

```text
Email
Password

[ Sign In ]
```

Also provide convenient demo access:

```text
[ Continue as Customer Demo ]

[ Continue as Business Demo ]
```

If using seeded demo users, document the credentials in the README.

After login:

```text
customer → /customer
business → /business
```

If a user attempts to access the wrong role's dashboard, redirect appropriately.

---

# 19. DEMO ACCOUNTS

Create demo accounts where practical.

Example:

```text
Customer Demo
customer@replate.demo

Business Demo
business@replate.demo
```

Do not expose passwords publicly in production code.

If Supabase seed/auth limitations make automatic account creation inappropriate, provide a clear setup script or README instructions.

---

# 20. DEMO DATA

Seed realistic Indian demo data.

Businesses:

```text
GreenBite Café
RUAS Campus Canteen
FreshBake Bakery
```

Listings:

```text
Veg Sandwich
Rice Bowl
Paneer Wrap
Pastry Box
Idli/Vada Combo
```

Use realistic Indian pricing.

Example:

```text
Veg Sandwich
Original ₹100
Discounted ₹60

Rice Bowl
Original ₹150
Discounted ₹90

Paneer Wrap
Original ₹120
Discounted ₹72

Pastry Box
Original ₹240
Discounted ₹150

Idli/Vada Combo
Original ₹80
Discounted ₹50
```

Use realistic pickup windows.

---

# 21. BUSINESS DASHBOARD

Route:

```text
/business
```

The dashboard should feel like a modern SaaS/business product.

Header:

```text
Good morning, [Business Name]

Here's how you're reducing food waste today.
```

Stats cards:

```text
Revenue Recovered
Meals Rescued
Estimated Waste Avoided
RePlate Revenue
```

Additional stats:

```text
Active Listings
Orders Today
Meals Remaining
```

---

# 22. BUSINESS NAVIGATION

Business navigation:

```text
Dashboard
Listings
Orders
Analytics
Profile
```

Use a responsive sidebar on desktop.

On mobile, use:

- bottom navigation
or
- compact navigation menu

Do not allow the navigation to become unusable on mobile.

---

# 23. BUSINESS LISTINGS

Show:

- Food image
- Food name
- Original price
- Discounted price
- Discount %
- Quantity remaining
- Pickup window
- Status
- Number of orders

Actions:

```text
Edit
Delete
View
```

Statuses should have clear badges.

Examples:

```text
Active
Sold Out
Expired
Paused
```

---

# 24. CREATE LISTING

Route:

```text
/business/listings/new
```

Fields:

```text
Food name
Food image
Original price
Discounted price
Quantity
Pickup start time
Pickup deadline
Description
```

Use React Hook Form + Zod.

Validation:

- food name required
- image optional
- original price positive
- discounted price positive
- discounted price < original price
- quantity positive integer
- pickup deadline after pickup start
- description optional but recommended

Automatically display:

```text
40% OFF
```

and:

```text
Potential revenue
```

Potential revenue:

```text
discounted_price × quantity
```

Commission:

```text
potential_revenue × 10%
```

---

# 25. CREATE LISTING LIVE PREVIEW

The creation page should include a live listing preview.

Example:

```text
┌──────────────────────────┐
│                          │
│       Food Image         │
│                          │
├──────────────────────────┤
│ Paneer Wrap              │
│ RUAS Campus Canteen      │
│                          │
│ ₹60   ₹100   40% OFF     │
│                          │
│ 20 available             │
│ Pickup 4:30–6:30 PM      │
└──────────────────────────┘
```

This makes the creation workflow feel like a real marketplace.

---

# 26. SMART PREDICTION

Create a Business Dashboard section:

**RePlate Smart Prediction**

This is NOT advanced AI.

Implement a transparent rule-based engine designed so an ML model can replace it later.

Inputs:

```text
Previous average daily sales
Current stock
Expected demand
Days remaining / expected demand period
```

Output:

```text
High Surplus Risk
Medium Surplus Risk
Low Surplus Risk
```

---

# 27. SURPLUS RISK ALGORITHM

Use a transparent heuristic.

Calculate:

```text
surplus = currentStock - expectedDemand
```

If surplus <= 0:

```text
LOW RISK
```

If surplus is positive:

```text
surplusRatio = surplus / currentStock
```

Suggested rules:

```text
surplusRatio >= 0.50
HIGH RISK

surplusRatio >= 0.25
MEDIUM RISK

otherwise
LOW RISK
```

Handle division-by-zero safely.

---

# 28. PREDICTION RECOMMENDATIONS

For HIGH risk:

```text
Recommended discount: 40%
Recommended listing time: 2–3 hours before closing
```

For MEDIUM:

```text
Recommended discount: 30%
Recommended listing time: 2 hours before closing
```

For LOW:

```text
Recommended discount: 20%
Recommended listing time: 1–2 hours before closing
```

These are MVP heuristics, not scientific predictions.

Clearly label:

**Rule-based MVP prediction**

Do not claim that this is machine learning.

---

# 29. SMART PREDICTION INTEGRATION

When creating a listing, allow the business to enter prediction inputs.

Display:

```text
RePlate Smart Prediction

🟡 Medium Surplus Risk

Recommended discount: 30–40%

Recommended listing time:
2–3 hours before closing

[ Apply Recommendation ]
```

When the user clicks:

```text
Apply Recommendation
```

automatically update the discounted price.

Example:

```text
Original ₹100
Recommended 40%

Discounted ₹60
```

---

# 30. CUSTOMER HOME

Route:

```text
/customer
```

Hero:

```text
Good food.
Less waste.
Better prices.

Discover surplus food from businesses near you.
```

CTA:

```text
Explore surplus food
```

Show featured/current listings.

---

# 31. CUSTOMER NAVIGATION

Customer navigation:

```text
Home
Explore
My Orders
Profile
```

Mobile navigation must remain easy to use.

---

# 32. EXPLORE PAGE

Route:

```text
/customer/explore
```

Display active listings.

Food cards should show:

- Image
- Food name
- Business
- Location
- Original price
- Discounted price
- Discount percentage
- Quantity available
- Pickup time

Actions:

```text
View details
Reserve
```

---

# 33. CUSTOMER FILTERS

Provide simple filters:

```text
All
Canteens
Restaurants
Bakeries
```

Optional useful filters:

```text
30%+ OFF
Under ₹100
Pickup today
```

Do not build a complicated recommendation system.

---

# 34. FOOD DETAIL PAGE

Route:

```text
/customer/listings/[id]
```

Show:

- Large food image
- Food name
- Business
- Location
- Description
- Original price
- Discounted price
- Discount percentage
- Quantity available
- Pickup window

Quantity selector:

```text
[-]  1  [+]
```

Then:

```text
Total ₹60
```

Primary CTA:

```text
Reserve for ₹60
```

Disable the button if:

- listing is unavailable
- quantity is zero
- pickup deadline has passed
- user is not authenticated

---

# 35. ORDER CREATION

When customer clicks Reserve:

1. Verify authentication.
2. Verify customer role.
3. Fetch listing.
4. Verify listing is active.
5. Verify pickup deadline has not passed.
6. Verify requested quantity > 0.
7. Verify requested quantity <= available quantity.
8. Calculate total.
9. Calculate commission.
10. Generate unique order code.
11. Atomically reduce listing quantity.
12. Create order.
13. Return order confirmation.

If any operation fails, do not partially create the order.

---

# 36. ORDER ID

Generate a human-readable unique pickup code.

Format:

```text
RP-XXXXXX
```

Example:

```text
RP-7K4M2Q
```

The code must be unique.

Do not use only the raw database UUID as the customer-facing pickup code.

---

# 37. ORDER CONFIRMATION

After successful order creation:

Show a dedicated confirmation screen.

Example:

```text
✓ Reservation confirmed

Your food is waiting for you.

Pickup code

RP-7K4M2Q

2 × Paneer Wrap

₹120

RUAS Campus Canteen

4:30 PM – 6:30 PM

Show this code at pickup.
```

Buttons:

```text
View My Orders
Back to Explore
```

---

# 38. CUSTOMER MY ORDERS

Route:

```text
/customer/orders
```

Show order cards.

Each card:

```text
Food
Business
Quantity
Total
Order ID
Pickup window
Status
```

Status:

```text
Reserved
Ready for Pickup
Collected
Cancelled
```

Use clear status badges.

---

# 39. PICKUP EXPERIENCE

When business marks an order:

```text
Ready
```

the customer should see:

```text
Ready for Pickup
```

with the order code prominently displayed.

The customer should be able to show the order code to the business.

---

# 40. BUSINESS ORDERS

Route:

```text
/business/orders
```

Display incoming orders.

Each order:

```text
RP-7K4M2Q

Paneer Wrap × 2

₹120

Customer: [name]

Reserved at 10:42 AM

[ Mark Ready ]
```

After ready:

```text
Ready for Pickup

[ Mark Collected ]
```

After collection:

```text
✓ Collected
```

---

# 41. ORDER STATUS TRANSITIONS

Business can:

```text
reserved → ready
ready → collected
```

Do not allow invalid transitions.

When marking ready:

```text
ready_at = NOW()
```

When marking collected:

```text
collected_at = NOW()
```

---

# 42. ANALYTICS

Route:

```text
/business/analytics
```

Include:

## Summary

```text
Total collected orders
Meals rescued
Revenue recovered
RePlate commission
Estimated waste avoided
```

## Charts

Use Recharts.

Include:

- Revenue over time
- Meals rescued over time
- Orders over time

## Top surplus items

Show:

```text
Food item
Orders
Quantity rescued
Revenue
```

Do not create fake numbers.

All charts must be derived from database data.

---

# 43. CUSTOMER PROFILE

Create:

```text
/customer/profile
```

Show:

- Name
- Email
- Role
- Account information
- Logout

---

# 44. BUSINESS PROFILE

Create:

```text
/business/profile
```

Show:

- Business name
- Location
- Address
- Contact
- Owner email
- Logout

Allow editing basic business information.

---

# 45. UI DESIGN SYSTEM

The UI must look like a modern startup.

Do NOT make it look like:

- Bootstrap default
- generic admin template
- college project
- excessive glassmorphism
- excessive gradients
- excessive rounded boxes
- emoji-heavy dashboard

---

# 46. BRAND STYLE

Use a fresh sustainability-oriented design language.

Suggested visual direction:

Primary:

```text
Deep green
```

Secondary:

```text
Fresh/lime green
```

Background:

```text
Warm off-white
```

Cards:

```text
White
```

Typography:

Use a modern clean sans-serif.

Prefer a strong display font paired with a highly readable body font if appropriate.

Keep typography hierarchy clear.

---

# 47. COMPONENT STYLE

Use:

- rounded but not excessively rounded cards
- subtle borders
- subtle shadows
- strong spacing
- high-quality food imagery
- clean iconography
- clear hierarchy

Buttons should have clear primary/secondary/destructive states.

Use Lucide icons consistently.

Do not mix random icon libraries.

---

# 48. ANIMATION

Use subtle animation only where it improves UX.

Examples:

- card hover
- button feedback
- page transitions
- modal entrance
- toast
- loading skeleton

Avoid:

- excessive bouncing
- spinning decorative elements
- distracting animations
- unnecessary parallax

The product should feel fast.

---

# 49. RESPONSIVE DESIGN

The application must work on:

- desktop
- laptop
- tablet
- mobile

Do not simply shrink desktop layouts.

Mobile layouts should be deliberately designed.

Customer mobile experience should prioritize:

```text
Food image
Food name
Price
Discount
Pickup
Reserve
```

Business mobile experience should prioritize:

```text
Orders
Listings
Stats
Actions
```

---

# 50. LOADING STATES

Use skeleton loaders for:

- food cards
- dashboard cards
- orders
- analytics

Do not display blank screens while data is loading.

---

# 51. EMPTY STATES

Every collection needs a useful empty state.

Examples:

```text
No surplus listings available

Check back later for fresh surplus food near you.
```

Business:

```text
No active listings yet

Create your first surplus listing and start recovering revenue.
```

Orders:

```text
No orders yet
```

Analytics:

```text
Not enough completed orders for analytics yet.
```

---

# 52. ERROR HANDLING

Use friendly errors.

Do not expose raw database errors to users.

Bad:

```text
PostgrestError: duplicate key violates unique constraint...
```

Better:

```text
We couldn't complete that reservation.
The item may have just sold out. Please try again.
```

Use Sonner for transient success/error notifications.

---

# 53. FORM UX

Forms should include:

- labels
- helper text where useful
- inline validation
- disabled submit state
- loading indicator
- success feedback
- error feedback

Do not make the user guess what a field means.

---

# 54. IMAGE UPLOAD

Use Supabase Storage.

Food image upload should support:

- image selection
- preview
- upload progress/loading state
- replacement
- fallback image

Validate:

- file type
- reasonable file size

Do not allow arbitrary executable files.

---

# 55. TIME HANDLING

Use proper timestamps.

Store timestamps consistently in UTC in the database.

Convert them for display in the user's/local business context.

Pickup times must be displayed clearly.

Example:

```text
Today · 4:30 PM – 6:30 PM
```

Avoid confusing raw ISO timestamps in the UI.

---

# 56. LISTING STATUS LOGIC

A listing should automatically be considered unavailable when:

```text
quantity = 0
```

It can become:

```text
sold_out
```

A listing whose pickup deadline has passed should no longer be reservable.

It can be represented as:

```text
expired
```

Do not require the business to manually clean up expired listings before customer availability is correct.

---

# 57. SECURITY

Do not expose:

- Supabase service-role keys
- private environment variables
- credentials
- secrets

Client-side code must only use safe public environment variables.

Use server-side privileged operations only when necessary.

---

# 58. ENVIRONMENT VARIABLES

Create/update `.env.example`.

Expected values may include:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

If newer Supabase tooling requires different variables, follow the current official Supabase pattern.

Never commit actual secrets.

---

# 59. DATABASE MIGRATIONS

Do not rely on manually creating tables through the Supabase dashboard.

Create reproducible migrations.

Example:

```text
supabase/migrations/
```

Include:

- tables
- indexes
- constraints
- RLS
- policies
- functions/RPCs where needed
- triggers where useful

---

# 60. DATABASE INDEXING

Add indexes for frequently queried fields.

At minimum consider:

```text
food_listings.business_id
food_listings.status
food_listings.pickup_deadline
orders.customer_id
orders.listing_id
orders.status
orders.created_at
```

Do not over-index the MVP unnecessarily.

---

# 61. BUSINESS OWNERSHIP

Every business-related database operation must verify:

```text
authenticated user → business owner → business_id
```

Never trust a `business_id` supplied by the client.

For example, a malicious business user must not be able to submit:

```text
business_id = another_business
```

and create/edit that business's listing.

---

# 62. ORDER OWNERSHIP

Customers may only access their own orders.

Businesses may only access orders connected to their own listings.

This must be enforced by RLS and server-side validation.

---

# 63. DEMO SCENARIO — REQUIRED ACCEPTANCE TEST

This scenario MUST work without manual database editing.

## Step 1

Login as:

```text
RUAS Campus Canteen
```

## Step 2

Create surplus listing:

```text
Food:
Surplus Meal

Quantity:
20

Original price:
₹100
```

## Step 3

Use Smart Prediction.

Expected recommendation:

```text
40% discount
```

Apply recommendation.

Expected price:

```text
₹60
```

## Step 4

Publish listing.

Expected:

```text
20 available
₹60
₹100
40% OFF
```

## Step 5

Logout.

Login as customer.

## Step 6

Customer discovers listing.

## Step 7

Customer selects:

```text
Quantity = 2
```

## Step 8

Customer confirms reservation.

Expected:

```text
Order created
Unique order ID generated
Total = ₹120
Commission = ₹12
```

## Step 9

Listing quantity must change:

```text
20 → 18
```

without manual intervention.

## Step 10

Business logs in.

New order appears automatically.

## Step 11

Business clicks:

```text
Mark Ready
```

## Step 12

Customer sees:

```text
Ready for Pickup
```

## Step 13

Customer shows:

```text
RP-XXXXXX
```

## Step 14

Business clicks:

```text
Mark Collected
```

## Step 15

Impact dashboard updates.

Expected change:

```text
Meals rescued: +2
Revenue recovered: +₹120
RePlate commission: +₹12
Estimated waste avoided: +0.50 kg
```

assuming:

```text
0.25kg per meal
```

This flow is the primary definition of "working."

---

# 64. TESTING REQUIREMENTS

Before declaring the project complete, test:

## Authentication

- Customer login
- Business login
- Logout
- Session persistence
- Incorrect credentials
- Role protection

## Listings

- Create listing
- Invalid prices
- Invalid quantity
- Invalid pickup time
- Edit listing
- Delete listing
- Image upload
- Listing visibility

## Ordering

- Valid order
- Invalid quantity
- Quantity > available
- Sold-out listing
- Expired listing
- Duplicate/rapid order attempts
- Quantity update
- Order creation

## Pickup

- Reserved → Ready
- Ready → Collected
- Invalid status transitions

## Impact

- Only collected orders count
- Quantity totals correct
- Revenue totals correct
- Commission correct
- Waste estimate correct

## Security

- Customer cannot edit listing
- Customer cannot modify order status
- Business cannot modify another business's listing
- Business cannot access another business's orders

---

# 65. REFRESH TEST

This is mandatory.

After every important operation:

1. Perform operation.
2. Refresh browser.
3. Verify data remains correct.

Especially test:

```text
Create listing → refresh
Reserve → refresh
Mark ready → refresh
Mark collected → refresh
Dashboard → refresh
Logout/login → verify state
```

If the application only works before refresh, it is not considered functional.

---

# 66. MULTI-TAB TEST

If practical, test:

```text
Customer tab
Business tab
```

Customer reserves food.

Business refreshes.

Business should see the order.

After business marks ready:

Customer refreshes.

Customer should see Ready.

This proves that the application is actually database-driven.

---

# 67. PERFORMANCE

Avoid unnecessary database requests.

Use:

- Server Components where useful
- Server Actions
- proper loading states
- efficient queries
- indexes
- selective data fetching

Do not fetch the entire database to the client.

---

# 68. ACCESSIBILITY

Use:

- semantic HTML
- labels
- keyboard navigation
- accessible buttons
- accessible dialogs
- sufficient contrast
- meaningful alt text

Do not use icons alone where the meaning is unclear.

---

# 69. MOBILE UX

Test at approximately:

```text
375px
390px
768px
1024px
1440px
```

Ensure:

- no horizontal overflow
- buttons remain tappable
- cards do not become unreadable
- tables become mobile-friendly
- navigation remains accessible
- forms work comfortably

---

# 70. ERROR BOUNDARIES

Implement sensible error handling for major application sections.

A database failure should not crash the entire application.

Provide recovery actions such as:

```text
Try again
Go back
Return to dashboard
```

---

# 71. SEO / METADATA

Add sensible metadata:

```text
RePlate — Save Good Food. Waste Less.
```

Use appropriate page titles.

The customer-facing homepage should have useful metadata.

---

# 72. PROJECT STRUCTURE

Use a maintainable architecture approximately like:

```text
app/
├── page.tsx
├── login/
├── customer/
│   ├── page.tsx
│   ├── explore/
│   ├── listings/[id]/
│   ├── orders/
│   └── profile/
│
├── business/
│   ├── page.tsx
│   ├── listings/
│   ├── listings/new/
│   ├── listings/[id]/
│   ├── orders/
│   ├── analytics/
│   └── profile/
│
└── api/

components/
├── ui/
├── customer/
├── business/
├── listings/
├── orders/
└── dashboard/

lib/
├── supabase/
├── calculations/
├── prediction/
├── validations/
└── constants/

types/

supabase/
├── migrations/
└── seed.sql
```

Adapt this structure if the framework requires a better organization.

---

# 73. IMPORTANT: AVOID MONOLITHIC COMPONENTS

Do not create 1,000-line components.

Split reusable pieces.

Examples:

```text
FoodCard
ListingForm
ListingPreview
StatCard
OrderCard
OrderStatusBadge
PredictionCard
QuantitySelector
ImpactCard
```

---

# 74. REUSABLE CALCULATION FUNCTIONS

Create reusable functions such as:

```text
calculateDiscountPercentage()
calculatePotentialRevenue()
calculateCommission()
calculateWasteAvoided()
calculateOrderTotal()
calculateSurplusRisk()
getRecommendedDiscount()
getRecommendedListingTime()
```

Write tests for these where practical.

---

# 75. REUSABLE UI COMPONENTS

Create:

```text
FoodCard
PriceDisplay
DiscountBadge
PickupTime
QuantitySelector
OrderStatusBadge
StatCard
EmptyState
LoadingSkeleton
PredictionCard
```

Avoid duplicating the same UI logic across pages.

---

# 76. CUSTOMER FOOD CARD

The food card should feel like a real marketplace card.

Include:

```text
Image
Discount badge

Food name

Business name
Location

₹60
₹100

40% OFF

12 available

Pickup 4:30–6:30 PM

[ Reserve ]
```

Use high-quality imagery from seeded data or uploaded images.

---

# 77. BUSINESS LISTING CARD

Business listing card should prioritize operational information:

```text
Food image
Food name
Status

₹60 / ₹100
40% OFF

18 / 20 remaining

Pickup 4:30–6:30 PM

Orders: 3

[ Edit ]
[ View ]
```

---

# 78. IMPACT DASHBOARD DESIGN

Create visually strong impact cards.

Example:

```text
128
Meals rescued

₹9,240
Revenue recovered

32 kg
Estimated waste avoided

₹924
RePlate revenue
```

Add contextual labels.

The dashboard should visually communicate that RePlate has measurable impact.

---

# 79. EMPTY STATE DESIGN

Empty states should still look polished.

Example:

```text
No surplus food nearby

New listings usually appear around
meal closing times.

[ Refresh listings ]
```

Business:

```text
Your surplus shelf is empty.

List unsold food before closing
and turn potential waste into revenue.

[ Create listing ]
```

---

# 80. DEMO MODE

If convenient, provide a clearly labeled demo experience.

For example:

```text
Demo Environment
```

Allow quick switching between demo roles.

Do not compromise real backend behavior to achieve this.

Demo accounts must still interact with the real database.

---

# 81. README

Create a comprehensive README containing:

## Overview

What RePlate is.

## Tech stack

List all technologies.

## Setup

How to install.

## Environment variables

What is required.

## Supabase setup

How to configure the project.

## Database migration

How to run migrations.

## Seed data

How to seed.

## Demo accounts

How to log in.

## Development

How to run locally.

## Production

How to deploy.

## Architecture

Explain the major components.

## Prediction algorithm

Explain that the current implementation is rule-based.

## Waste calculation

Explain the configurable assumption.

---

# 82. CODE QUALITY

Before completion:

- remove unused imports
- remove dead code
- remove console debugging
- remove temporary mocks
- remove placeholder buttons
- remove TODOs for core functionality
- fix TypeScript errors
- fix ESLint errors where applicable
- ensure build succeeds

Do not leave fake functionality disguised as complete functionality.

If a feature is intentionally omitted, document it.

---

# 83. NO PLACEHOLDER BUTTONS

Do not create buttons that appear functional but do nothing.

Bad:

```text
Analytics
```

with no page.

Bad:

```text
Edit
```

that does nothing.

Bad:

```text
Reserve
```

that only changes local UI.

Every visible primary action must work.

---

# 84. NO HARDCODED BUSINESS DATA

Do not hardcode:

```text
₹9,240
128 meals
₹924
```

into the dashboard.

These numbers may exist in seed data, but the dashboard must calculate them dynamically.

---

# 85. NO FAKE ORDER IDs

Order IDs must be generated when orders are actually created.

Do not hardcode:

```text
RP-123456
```

for every order.

---

# 86. NO FAKE QUANTITY UPDATE

The listing quantity must be updated in the database.

Do not simply display:

```text
18 remaining
```

while the database still contains:

```text
20
```

---

# 87. NO MANUAL DATABASE STEPS IN THE DEMO

The following must NOT be required:

```text
Open Supabase
Edit row
Change quantity
Change status
Refresh
```

Everything must be done through the UI.

---

# 88. DESIGN REVIEW

After implementing functionality, perform a visual review of every major screen.

Review:

```text
Login
Customer Home
Explore
Food Details
Order Confirmation
My Orders
Business Dashboard
Create Listing
Listings
Orders
Analytics
Profile
```

Check:

- spacing
- typography
- alignment
- consistency
- responsiveness
- hierarchy
- button placement
- loading states
- empty states
- error states

Fix visual issues before declaring completion.

---

# 89. FINAL QUALITY BAR

The application should feel like something that could realistically be shown to:

- startup competition judges
- college administrators
- restaurants
- potential customers
- investors

It should not feel like a basic student CRUD application.

The judges should be able to understand the product within approximately 30 seconds.

---

# 90. FINAL DEMO SCRIPT

The final application should support this exact live demonstration:

### Business

Login as:

```text
RUAS Campus Canteen
```

Open:

```text
Dashboard
```

Show:

```text
Smart Prediction
```

Enter:

```text
Average daily sales: 12
Current stock: 20
Expected demand: 8
```

Prediction should identify surplus risk.

Create:

```text
20 surplus meals
Original ₹100
Recommended 40% discount
Selling price ₹60
```

Publish.

---

### Customer

Logout/login as customer.

Open:

```text
Explore
```

Find:

```text
RUAS Campus Canteen
```

Open listing.

Select:

```text
2 meals
```

Reserve.

Show:

```text
RP-XXXXXX
```

and:

```text
₹120
```

---

### Business

Return to business account.

Open:

```text
Orders
```

Show the new order.

Click:

```text
Mark Ready
```

---

### Customer

Return to My Orders.

Show:

```text
Ready for Pickup
```

and pickup code.

---

### Business

Return to Orders.

Click:

```text
Mark Collected
```

---

### Dashboard

Return to Business Dashboard.

Show dynamically updated:

```text
Meals rescued: +2

Revenue recovered: +₹120

RePlate commission: +₹12

Estimated waste avoided: +0.50 kg
```

No manual database changes.

---

# 91. IMPLEMENTATION ORDER

Implement in this order:

## Phase 1 — Foundation

- Inspect repository
- Configure project
- Install dependencies
- Configure Supabase
- Configure Auth
- Create database schema
- Create migrations
- Create RLS
- Create seed data
- Create shared types
- Create calculation utilities

Do not move forward if database/auth foundation is broken.

---

## Phase 2 — Authentication

- Login
- Logout
- Session handling
- Role detection
- Protected routes
- Demo accounts

Test both roles.

---

## Phase 3 — Business

- Business dashboard
- Listing creation
- Image upload
- Listing management
- Prediction engine
- Business orders

Test business flow before building extensive customer UI.

---

## Phase 4 — Customer

- Customer homepage
- Explore
- Listing details
- Quantity selector
- Reservation
- Confirmation
- My Orders

---

## Phase 5 — Order Lifecycle

- Reserved
- Ready
- Collected
- Quantity updates
- Status validation
- Impact calculations

---

## Phase 6 — Analytics

- Impact cards
- Charts
- Revenue
- Meals rescued
- Waste avoided
- Commission

---

## Phase 7 — UI Polish

- Responsive layouts
- Animations
- Skeletons
- Empty states
- Error states
- Toasts
- Accessibility
- Visual consistency

---

## Phase 8 — QA

Run the entire acceptance flow.

Fix all errors.

Then run:

```text
npm run build
```

and any configured lint/type/test commands.

The final build must succeed.

---

# 92. CRITICAL DEVELOPMENT BEHAVIOR

If you encounter a problem:

Do not hide it.

Investigate the root cause.

Do not work around backend problems by replacing the feature with local state.

Do not silently disable security.

Do not remove functionality just to make the build pass.

If a dependency is incompatible, choose the correct compatible version.

If the current repository has an architectural problem, explain it internally through your implementation plan and fix it systematically.

---

# 93. SELF-VERIFICATION REQUIREMENT

Before saying the project is complete, verify all of the following:

```text
[ ] App starts successfully
[ ] Production build succeeds
[ ] Login works
[ ] Logout works
[ ] Customer role works
[ ] Business role works
[ ] Business route protection works
[ ] Customer route protection works
[ ] Business can create listing
[ ] Listing persists after refresh
[ ] Listing appears to customer
[ ] Customer can reserve
[ ] Quantity decreases correctly
[ ] Order is persisted
[ ] Unique order code generated
[ ] Business sees order
[ ] Business can mark Ready
[ ] Customer sees Ready
[ ] Business can mark Collected
[ ] Customer sees Collected
[ ] Impact updates
[ ] Revenue calculation correct
[ ] Commission calculation correct
[ ] Waste estimate correct
[ ] Prediction works
[ ] Image upload works
[ ] Invalid input is rejected
[ ] Unauthorized access is rejected
[ ] Empty states work
[ ] Loading states work
[ ] Error states work
[ ] Mobile layout works
[ ] No major console errors
[ ] No fake primary functionality remains
```

---

# 94. FINAL PRINCIPLE

Do not optimize for the number of screens.

Optimize for:

**one extremely polished, completely functional end-to-end experience.**

The core RePlate loop is:

```text
SURPLUS FOOD
     ↓
BUSINESS LISTS IT
     ↓
CUSTOMER DISCOVERS IT
     ↓
CUSTOMER RESERVES IT
     ↓
QUANTITY DECREASES
     ↓
BUSINESS PREPARES IT
     ↓
CUSTOMER PICKS IT UP
     ↓
BUSINESS MARKS COLLECTED
     ↓
IMPACT IS CALCULATED
     ↓
FOOD WASTE IS REDUCED
```

Every part of this loop must work using real persistent backend data.

The application should be visually impressive, technically credible, responsive, secure, and simple enough to demonstrate live in a startup competition.

Build the MVP around this principle.