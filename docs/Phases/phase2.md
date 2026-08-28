# PHASE 2 — TRANSACTIONS & MONEY TRACKING

### Goal

> Turn the Phase 1 foundation into a **fully usable personal money tracker** where users can record income, expenses, and transfers, manage categories and money sources, and immediately see how their money is changing.

At the end of Phase 2, a user should be able to use the app every day without needing to manually calculate their financial position.

---

# 1. PHASE 2 SCOPE

### Build

```text
TRANSACTIONS
├── Add Expense
├── Add Income
├── Add Transfer
├── Edit
├── Delete
├── Details
├── Search
├── Filter
├── Sort
├── Date selection
└── Notes

CATEGORIES
├── Default categories
├── Custom categories
├── Edit
├── Delete
└── Icons

MONEY SOURCES
├── Source balances
├── Add
├── Edit
├── Delete
└── Balance updates

CALCULATIONS
├── Total Money
├── Total Income
├── Total Expenses
└── Net Cash Flow

ANALYTICS
├── Spending by category
├── Income vs Expenses
├── Monthly spending
├── Daily spending
└── Transaction trends
```

### Still DON'T build

```text
❌ Financial Health Score
❌ Safe-to-Spend
❌ Financial Goals
❌ Bills
❌ Forecasting
❌ What-If Simulator
❌ Ciel
❌ SMS parsing
❌ Notification parsing
❌ Receipt OCR
❌ Scam detection
❌ Bank API
❌ GCash API
```

Those belong to later phases.

---

# 2. TRANSACTION DATA MODEL

Your Phase 1 `transactions` table now becomes an active part of the application.

I'd structure it as:

```text
transactions
────────────────────────────────────
id
user_id
money_source_id
category_id
type
amount
merchant
description
transaction_date
source
created_at
updated_at
```

### Field meanings

| Field              | Purpose                       |
| ------------------ | ----------------------------- |
| `id`               | Unique transaction            |
| `user_id`          | Owner                         |
| `money_source_id`  | Where money came from/went to |
| `category_id`      | Transaction category          |
| `type`             | Income / Expense / Transfer   |
| `amount`           | Transaction amount            |
| `merchant`         | Store/person/company          |
| `description`      | Additional information        |
| `transaction_date` | When transaction happened     |
| `source`           | Manual for now                |
| `created_at`       | Creation timestamp            |
| `updated_at`       | Last modification             |

---

# 3. TRANSACTION TYPES

You have three fundamental transaction types:

```text
INCOME
EXPENSE
TRANSFER
```

These must behave differently.

---

# 4. EXPENSE

Example:

> Bought food for ₱250 using GCash.

Create:

```text
Type:
EXPENSE

Amount:
₱250

Source:
GCash

Category:
Food

Merchant:
Jollibee

Date:
August 28, 2026

Note:
Lunch
```

Money calculation:

```text
GCash
₱8,500
   ↓
- ₱250
   ↓
₱8,250
```

The transaction becomes part of:

```text
Total Expenses
```

but **not** income.

---

# 5. INCOME

Example:

> Received ₱5,000 allowance.

```text
Type:
INCOME

Amount:
₱5,000

Source:
GCash

Category:
Allowance

Date:
August 28
```

Balance:

```text
₱8,500
   +
₱5,000
   ↓
₱13,500
```

And:

```text
Total Income
+ ₱5,000
```

---

# 6. TRANSFER

This needs special treatment.

Example:

> Transfer ₱2,000 from BPI → GCash.

You **didn't earn ₱2,000**.

You simply moved your own money.

So:

```text
BPI
₱10,000
   ↓
- ₱2,000
   ↓
₱8,000
```

and:

```text
GCash
₱5,000
   ↓
+ ₱2,000
   ↓
₱7,000
```

But:

```text
Total Money
UNCHANGED
```

and:

```text
Total Income
UNCHANGED

Total Expenses
UNCHANGED
```

This distinction is extremely important for your later financial calculations.

---

# 7. TRANSFER DATA

For transfers, I recommend extending your transaction structure slightly.

Instead of treating a transfer as a normal one-sided transaction, support:

```text
source_money_source_id
destination_money_source_id
```

Conceptually:

```text
Transfer
│
├── From: BPI
├── To: GCash
└── Amount: ₱2,000
```

You can either represent this with:

### Option A — Transfer pair

```text
Transaction A
BPI → -₱2,000

Transaction B
GCash → +₱2,000
```

with a shared:

```text
transfer_id
```

### Or Option B — Single transfer record

```text
Transfer
from_source_id
to_source_id
amount
```

For your app, I'd lean toward **a dedicated transfer relationship/pair**, because it will make transaction history and balances easier to reason about.

---

# 8. TRANSACTION CREATION FLOW

Your UI should have a central action:

```text
+ Add Transaction
```

Then:

```text
┌─────────────────────────────┐
│       ADD TRANSACTION       │
│                             │
│  Expense    Income Transfer │
│                             │
│  Amount                      │
│  ₱ _________                 │
│                             │
│  Source                      │
│  [ GCash ▼ ]                 │
│                             │
│  Category                    │
│  [ Food ▼ ]                  │
│                             │
│  Merchant                    │
│  [ Jollibee ]                │
│                             │
│  Date                        │
│  [ Aug 28, 2026 ]            │
│                             │
│  Note                        │
│  [ Lunch ]                   │
│                             │
│        [ Add Transaction ]   │
└─────────────────────────────┘
```

---

# 9. EXPENSE FORM

Required:

```text
Amount
Money Source
Category
Transaction Date
```

Optional:

```text
Merchant
Note
```

Validation:

```text
Amount > 0
Source exists
Category exists
Date valid
```

---

# 10. INCOME FORM

Required:

```text
Amount
Money Source
Category
Transaction Date
```

Optional:

```text
Source/Employer
Note
```

Example:

```text
₱15,000
BPI
Salary
Aug 30
```

---

# 11. TRANSFER FORM

When the user selects:

> Transfer

change the form.

```text
FROM

[ BPI ▼ ]

TO

[ GCash ▼ ]

AMOUNT

₱ _______

DATE

[ Aug 28 ]

NOTE

[ ]
```

Prevent:

```text
BPI → BPI
```

The source and destination must be different.

---

# 12. TRANSACTION API

Create:

```text
POST /api/v1/transactions
GET /api/v1/transactions
GET /api/v1/transactions/{id}
PATCH /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}
```

---

# 13. CREATE TRANSACTION

Example expense request:

```json
{
  "type": "EXPENSE",
  "amount": 250,
  "money_source_id": "...",
  "category_id": "...",
  "merchant": "Jollibee",
  "description": "Lunch",
  "transaction_date": "2026-08-28"
}
```

Backend:

```text
Request
   ↓
Validate
   ↓
Authenticate user
   ↓
Verify source belongs to user
   ↓
Verify category belongs to user
   ↓
Create transaction
   ↓
Update source balance
   ↓
Commit database transaction
   ↓
Return result
```

---

# 14. IMPORTANT — DATABASE TRANSACTION

When creating a financial transaction, updating the transaction and balance should happen **atomically**.

For example:

```text
Create expense
      +
Update GCash balance
```

must either:

```text
BOTH SUCCEED
```

or:

```text
BOTH FAIL
```

You don't want:

```text
Transaction created ✓
Balance update failed ✗
```

because then your financial data becomes inconsistent.

---

# 15. MONEY SOURCE BALANCES

Each source should display its current balance.

Example:

```text
YOUR MONEY

┌─────────────────────┐
│ GCash               │
│ ₱8,500              │
└─────────────────────┘

┌─────────────────────┐
│ Cash                │
│ ₱2,000              │
└─────────────────────┘

┌─────────────────────┐
│ BPI                 │
│ ₱15,000             │
└─────────────────────┘

TOTAL
₱25,500
```

---

# 16. BALANCE CALCULATION

You have two possible approaches.

### Approach A

Store:

```text
current_balance
```

and update it whenever a transaction occurs.

### Approach B

Calculate:

```text
Initial Balance
+
Income
-
Expenses
+
Transfers In
-
Transfers Out
```

I recommend using a **combination**:

```text
money_source
    ↓
current_balance
```

for fast UI display, while maintaining transaction history as the source of truth/audit trail.

Later, you can add reconciliation tools to detect inconsistencies.

---

# 17. EDIT TRANSACTION

This is more complicated than simply updating a database row.

Example:

Original:

```text
GCash
₱8,500

Expense:
₱500
```

After:

```text
₱8,000
```

If user edits it to:

```text
₱300
```

you need to reverse the old effect:

```text
+ ₱500
```

then apply:

```text
- ₱300
```

Final:

```text
₱8,200
```

Therefore:

```text
Old transaction
       ↓
Reverse old balance effect
       ↓
Update transaction
       ↓
Apply new balance effect
```

All within one database transaction.

---

# 18. EDIT SOURCE

If the user changes:

```text
GCash
```

to:

```text
Cash
```

you need to:

```text
Reverse effect on GCash
        ↓
Apply effect to Cash
        ↓
Update transaction
```

Same principle.

---

# 19. DELETE TRANSACTION

Never simply:

```text
DELETE transaction
```

without correcting the balance.

Example:

```text
Expense ₱500
```

Current:

```text
GCash ₱8,000
```

Delete:

```text
GCash
₱8,000
 +
₱500
 ↓
₱8,500
```

Then remove the transaction.

Again:

```text
Reverse effect
     ↓
Delete transaction
```

inside one database transaction.

---

# 20. TRANSACTION HISTORY

Create the main transaction page:

```text
TRANSACTIONS

[ Search transactions... ]

All     Income     Expense     Transfer

Today
──────────────────────────────
🍔 Jollibee
Food
- ₱250

💰 Allowance
Income
+ ₱2,000

Yesterday
──────────────────────────────
🚕 Grab
Transportation
- ₱180
```

---

# 21. TRANSACTION DETAILS

Clicking a transaction opens:

```text
TRANSACTION

Jollibee

- ₱250

Food
GCash

August 28, 2026
12:42 PM

Lunch

────────────────

[ Edit ]       [ Delete ]
```

If it was a transfer:

```text
TRANSFER

BPI
   ↓
GCash

₱2,000

August 28, 2026
```

---

# 22. SEARCH

Search should initially search:

```text
Merchant
Description
Category
Money source
```

Example:

```text
Search:
"grab"
```

Results:

```text
Grab
GrabFood
Grab
Grab
```

Backend example:

```text
GET /transactions?search=grab
```

Don't fetch thousands of transactions to the frontend and filter everything there.

Let the backend/database handle filtering.

---

# 23. FILTERING

Support:

### Type

```text
All
Income
Expense
Transfer
```

### Category

```text
Food
Transport
Bills
...
```

### Money Source

```text
GCash
Cash
BPI
...
```

### Amount

```text
₱0–₱500
₱500–₱1,000
Custom
```

### Date

```text
Today
This week
This month
Custom
```

---

# 24. SORTING

Support:

```text
Newest
Oldest
Highest amount
Lowest amount
```

Default:

```text
Newest first
```

---

# 25. PAGINATION

Don't load every transaction at once.

Example:

```text
GET /transactions?page=1&limit=25
```

Return:

```text
25 transactions
```

Then:

```text
Load more
```

or pagination.

This becomes important once users have thousands of transactions.

---

# 26. CATEGORIES

Your initial default categories:

### Expenses

```text
Food
Transportation
Bills
Shopping
Entertainment
Education
Healthcare
Savings
Debt
Other
```

### Income

I recommend adding:

```text
Salary
Allowance
Freelance
Business
Gift
Other
```

This prevents users from having to use "Other" for common income sources.

---

# 27. CATEGORY OWNERSHIP

You should distinguish:

```text
DEFAULT CATEGORY
```

from:

```text
USER CATEGORY
```

Example:

```text
Food
is_default = true
user_id = null
```

while:

```text
Coffee
is_default = false
user_id = abc123
```

This gives you reusable system categories while allowing customization.

---

# 28. CUSTOM CATEGORIES

User:

```text
+ Create Category
```

Form:

```text
Name:
Pets

Type:
Expense

Icon:
🐶
```

Result:

```text
🐶 Pets
```

---

# 29. CATEGORY ICONS

Don't make users upload icons yet.

Give them a predefined icon set:

```text
🍔 Food
🚗 Transportation
🏠 Bills
🛍️ Shopping
🎮 Entertainment
📚 Education
💊 Healthcare
💰 Savings
💳 Debt
🐶 Pets
📦 Other
```

Store an icon identifier:

```text
icon = "utensils"
```

rather than storing emoji directly if you're using an icon library.

---

# 30. CATEGORY DELETION

You need to handle existing transactions.

Suppose:

```text
Coffee
```

has:

```text
52 transactions
```

User deletes Coffee.

You should **not delete the transactions**.

Instead:

```text
Coffee category
       ↓
Delete
       ↓
Existing transactions
       ↓
category_id = NULL
```

or require the user to choose:

> Move transactions to another category.

I recommend:

```text
Delete category
        ↓
"What should happen to existing transactions?"
        ↓
[ Move to Other ]
```

This is much cleaner.

---

# 31. MONEY SOURCE MANAGEMENT

Users should be able to:

```text
+ Add Money Source
```

Example:

```text
Name:
GCash

Type:
E-Wallet

Initial Balance:
₱8,500
```

Then:

```text
GCash
₱8,500
```

---

# 32. SOURCE BALANCE RULE

Make it clear that:

> **Initial Balance** means the amount the user says they already had when starting the app.

For example:

```text
Starting balance:
₱10,000
```

Then:

```text
Expense
- ₱500

Income
+ ₱2,000
```

Current:

```text
₱11,500
```

---

# 33. MANUAL BALANCE ADJUSTMENT

This is a feature I'd add during Phase 2.

Real users may discover:

> "The app says I have ₱8,500, but I actually have ₱8,300."

Give them:

```text
Adjust Balance
```

Example:

```text
Current:
₱8,500

Actual:
₱8,300

Difference:
- ₱200
```

Create an adjustment record rather than silently modifying history.

For example:

```text
BALANCE ADJUSTMENT
- ₱200
```

This preserves your financial audit trail.

---

# 34. BASIC CALCULATIONS

Your dashboard should now show:

```text
TOTAL MONEY
₱25,500

TOTAL INCOME
₱30,000

TOTAL EXPENSES
₱12,500

NET CASH FLOW
+₱17,500
```

---

# 35. TOTAL MONEY

Calculate across all active money sources:

```text
GCash      ₱8,500
Cash       ₱2,000
BPI       ₱15,000
────────────────
TOTAL     ₱25,500
```

Transfers should **not change total money**.

---

# 36. TOTAL INCOME

For selected period:

```text
SUM(
    transactions
    WHERE type = INCOME
)
```

Example:

```text
Salary       ₱20,000
Allowance     ₱5,000
Freelance     ₱3,000
────────────────────
Income       ₱28,000
```

---

# 37. TOTAL EXPENSES

```text
Food          ₱4,000
Transport     ₱2,000
Bills         ₱3,000
Shopping      ₱1,500
Entertainment ₱1,000
────────────────────
Expenses     ₱11,500
```

---

# 38. NET CASH FLOW

The basic formula:

```text
Net Cash Flow
=
Total Income
-
Total Expenses
```

Example:

```text
₱28,000
-
₱11,500
────────
₱16,500
```

Transfers excluded.

---

# 39. DATE PERIODS

Your calculations need a period.

Support:

```text
Today
This Week
This Month
Last Month
This Year
Custom
```

Example:

```text
August 1 → August 28
```

This same date-filtering system can later be reused by:

- Financial Health
- Forecasting
- Ciel
- Reports
- Goals

---

# 40. ANALYTICS — SPENDING BY CATEGORY

Create your first chart.

Example:

```text
AUGUST SPENDING

Food             ₱5,200
████████████████

Transportation   ₱2,400
████████

Bills            ₱2,000
██████

Shopping         ₱1,500
████

Entertainment      ₱800
██
```

The important part is that this isn't just visual.

The backend should calculate the actual aggregated data.

---

# 41. CATEGORY ANALYTICS API

Something like:

```text
GET /api/v1/analytics/spending-by-category
```

Parameters:

```text
start_date
end_date
```

Response conceptually:

```json
{
  "period": {
    "start": "2026-08-01",
    "end": "2026-08-28"
  },
  "categories": [
    {
      "category": "Food",
      "amount": 5200
    },
    {
      "category": "Transportation",
      "amount": 2400
    }
  ]
}
```

---

# 42. INCOME VS EXPENSES

Display:

```text
AUGUST

Income
₱30,000

Expenses
₱18,500
```

Then a timeline:

```text
Week 1
Income    ₱10k
Expense    ₱4k

Week 2
Income     ₱5k
Expense    ₱6k

Week 3
Income    ₱15k
Expense    ₱4k
```

Later Ciel can analyze these patterns.

---

# 43. MONTHLY SPENDING

Show:

```text
MONTHLY SPENDING

May      ₱18,200
June     ₱20,400
July     ₱17,800
August   ₱19,500
```

This establishes the data infrastructure you'll need for Phase 3.

---

# 44. DAILY SPENDING

Example:

```text
August 28
₱450

August 27
₱800

August 26
₱250

August 25
₱1,200
```

Later:

> "You typically spend more on Fridays."

Ciel will eventually use this data.

---

# 45. TRANSACTION TRENDS

Don't overdo this in Phase 2.

Basic trends:

```text
Spending ↑ 12%
Income ↑ 8%
```

Compared with:

```text
previous month
```

This is enough.

Advanced behavioral analysis belongs in Phase 3.

---

# 46. DASHBOARD INTEGRATION

Your existing dashboard should now stop using placeholders.

Instead:

```text
Dashboard
│
├── Total Money
│
├── Total Income
│
├── Total Expenses
│
├── Net Cash Flow
│
├── Recent Transactions
│
├── Spending by Category
│
└── Income vs Expenses
```

Example:

```text
┌─────────────────────────────────────┐
│ TOTAL MONEY                         │
│ ₱25,500                             │
└─────────────────────────────────────┘

┌───────────────┐ ┌───────────────────┐
│ INCOME        │ │ EXPENSES          │
│ ₱30,000       │ │ ₱12,500           │
└───────────────┘ └───────────────────┘

┌─────────────────────────────────────┐
│ NET CASH FLOW                       │
│ +₱17,500                            │
└─────────────────────────────────────┘

RECENT TRANSACTIONS
─────────────────────────────────────
🍔 Jollibee              - ₱250
🚕 Grab                  - ₱180
💰 Allowance             + ₱2,000
```

---

# 47. API STRUCTURE AFTER PHASE 2

Your backend becomes:

```text
/api/v1
│
├── auth/
│
├── users/
│
├── money-sources/
│
├── categories/
│   ├── GET /
│   ├── POST /
│   ├── PATCH /{id}
│   └── DELETE /{id}
│
├── transactions/
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PATCH /{id}
│   └── DELETE /{id}
│
└── analytics/
    ├── spending-by-category
    ├── income-vs-expenses
    ├── daily-spending
    └── monthly-spending
```

---

# 48. FRONTEND STRUCTURE

I'd organize the transaction features separately:

```text
src/
│
├── app/
│   ├── dashboard/
│   ├── transactions/
│   ├── money/
│   └── settings/
│
├── features/
│   │
│   ├── transactions/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── hooks.ts
│   │   ├── components/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionDetails.tsx
│   │   │   ├── TransactionFilters.tsx
│   │   │   └── TransactionSearch.tsx
│   │   └── utils/
│   │
│   ├── categories/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── components/
│   │
│   ├── money-sources/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── components/
│   │
│   └── analytics/
│       ├── api.ts
│       ├── types.ts
│       └── components/
```

This keeps Phase 2 from becoming one giant collection of components.

---

# 49. BACKEND STRUCTURE

Expand Phase 1:

```text
app/
│
├── api/
│   └── routes/
│       ├── auth.py
│       ├── users.py
│       ├── money_sources.py
│       ├── categories.py
│       ├── transactions.py
│       └── analytics.py
│
├── models/
│   ├── user.py
│   ├── money_source.py
│   ├── category.py
│   └── transaction.py
│
├── schemas/
│   ├── user.py
│   ├── money_source.py
│   ├── category.py
│   ├── transaction.py
│   └── analytics.py
│
├── services/
│   ├── user_service.py
│   ├── money_source_service.py
│   ├── category_service.py
│   ├── transaction_service.py
│   └── analytics_service.py
│
└── core/
    ├── config.py
    ├── database.py
    └── security.py
```

---

# 50. TRANSACTION SERVICE

Don't put financial logic directly inside your API route.

Bad:

```text
POST endpoint
    ↓
30 lines of balance calculations
```

Instead:

```text
POST /transactions
        ↓
TransactionService
        ↓
validate_transaction()
        ↓
apply_balance_change()
        ↓
create_transaction()
```

This becomes very important when you later add:

```text
SMS
OCR
CSV
Ciel
```

All of them can eventually use the same transaction service.

---

# 51. MONEY CALCULATION SERVICE

Create something conceptually like:

```text
FinancialCalculationService
```

Responsibilities:

```text
get_total_money()
get_total_income()
get_total_expenses()
get_net_cash_flow()
get_category_spending()
get_daily_spending()
get_monthly_spending()
```

Then Phase 3 can extend this into:

```text
FinancialIntelligenceService
```

---

# 52. IMPORTANT MONEY RULES

Define these now and **never change them casually later**.

### Expense

```text
Source balance ↓
Expenses ↑
Net cash flow ↓
Total money ↓
```

### Income

```text
Source balance ↑
Income ↑
Net cash flow ↑
Total money ↑
```

### Transfer

```text
Source A ↓
Source B ↑

Income unchanged
Expenses unchanged
Net cash flow unchanged
Total money unchanged
```

This foundation will prevent major bugs in Phase 3.

---

# 53. DECIMAL MONEY HANDLING

Do **not** use floating-point numbers for financial amounts.

Avoid:

```text
float
```

Use a decimal/numeric database type.

For example:

```text
DECIMAL(15,2)
```

So:

```text
₱1,234.56
```

remains exact.

Your backend should also use a decimal type rather than binary floating point for money calculations.

---

# 54. CURRENCY

For Phase 2, keep your MVP simple:

```text
PHP
```

Since your primary target is Philippine users.

Store:

```text
currency = "PHP"
```

But design your database so currency can be expanded later.

Don't build currency conversion yet.

---

# 55. PHASE 2 DEVELOPMENT ORDER

I recommend doing it in this exact order:

```text
1. Transaction model
        ↓
2. Transaction schemas
        ↓
3. Transaction service
        ↓
4. Create expense
        ↓
5. Create income
        ↓
6. Balance updates
        ↓
7. Create transfer
        ↓
8. Transaction history
        ↓
9. Transaction details
        ↓
10. Edit transaction
        ↓
11. Delete transaction
        ↓
12. Categories
        ↓
13. Custom categories
        ↓
14. Money source management
        ↓
15. Dashboard calculations
        ↓
16. Analytics
        ↓
17. Search/filter/sort
        ↓
18. Loading/error states
        ↓
19. Testing
        ↓
20. Phase 2 completion
```

---

# 56. TESTING

This phase needs substantially more testing than Phase 1 because **money calculations are now involved**.

### Expense tests

```text
✓ Create expense
✓ Balance decreases
✓ Total expense increases
✓ Net cash flow decreases
```

### Income tests

```text
✓ Create income
✓ Balance increases
✓ Total income increases
✓ Net cash flow increases
```

### Transfer tests

```text
✓ Source decreases
✓ Destination increases
✓ Total money unchanged
✓ Income unchanged
✓ Expenses unchanged
✓ Net cash flow unchanged
```

### Edit tests

```text
✓ Edit amount
✓ Correct old balance
✓ Apply new balance
✓ Edit category
✓ Edit source
```

### Delete tests

```text
✓ Delete expense
✓ Restore balance
✓ Delete income
✓ Restore balance
✓ Delete transfer
✓ Restore both source balances
```

---

# 57. SECURITY TESTING

Every transaction endpoint must check:

```text
Does this transaction belong to the logged-in user?
```

For example:

```text
User A
Transaction A
```

User B must NOT be able to:

```text
GET Transaction A
PATCH Transaction A
DELETE Transaction A
```

The same applies to:

```text
Categories
Money Sources
```

---

# 58. PHASE 2 UI CHECKLIST

Your UI should eventually have:

### Dashboard

```text
[ Total Money ]

[ Income ] [ Expenses ]

[ Net Cash Flow ]

[ Spending Chart ]

[ Recent Transactions ]
```

### Transactions

```text
[ + Add Transaction ]

[ Search ]

[ Filters ]

Transaction List
```

### Transaction modal/page

```text
Expense | Income | Transfer

Amount
Source
Category
Merchant
Date
Note

[Save]
```

### Money

```text
Your Money

GCash
₱8,500

Cash
₱2,000

BPI
₱15,000

[+ Add Source]
```

### Categories

```text
Categories

🍔 Food
🚗 Transportation
🏠 Bills
🛍️ Shopping
...

[+ Add Category]
```

---

# 59. PHASE 2 DEFINITION OF DONE

Don't move to Phase 3 until you can check all of these.

### Transactions

- [ ] Add expense
- [ ] Add income
- [ ] Add transfer
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] View transaction details
- [ ] Search transactions
- [ ] Filter transactions
- [ ] Sort transactions
- [ ] Filter by date
- [ ] Add notes
- [ ] Transaction history persists

### Money Sources

- [ ] Add source
- [ ] Edit source
- [ ] Delete source
- [ ] Set initial balance
- [ ] Balance updates automatically
- [ ] Total money calculated correctly
- [ ] Manual balance adjustment works

### Categories

- [ ] Default categories exist
- [ ] Create custom category
- [ ] Edit category
- [ ] Delete category safely
- [ ] Category icon works
- [ ] Existing transactions aren't destroyed when category is removed

### Calculations

- [ ] Total money
- [ ] Total income
- [ ] Total expenses
- [ ] Net cash flow
- [ ] Transfers excluded from income/expense calculations

### Analytics

- [ ] Spending by category
- [ ] Income vs expenses
- [ ] Monthly spending
- [ ] Daily spending
- [ ] Basic transaction trends

### Security

- [ ] User can only see own transactions
- [ ] User can only modify own transactions
- [ ] User can only see own money sources
- [ ] User can only modify own categories

### Quality

- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Mobile/responsive UI
- [ ] Backend tests
- [ ] Financial calculation tests

---

# 60. FINAL PHASE 2 RESULT

When Phase 2 is complete, your application should have transformed from:

```text
PHASE 1

Login
 ↓
Dashboard
 ↓
User profile
```

into:

```text
PHASE 2

                    FINANCIAL OS
                         │
            ┌────────────┼────────────┐
            ↓            ↓            ↓
         MONEY       TRANSACTIONS   CATEGORIES
            │            │            │
            └────────────┼────────────┘
                         ↓
                   CALCULATION
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
          Total Money  Income    Expenses
                         │
                         ↓
                   Net Cash Flow
                         │
                         ↓
                    ANALYTICS
```

And most importantly, you should be able to perform this complete real-world workflow:

```text
User receives ₱5,000
        ↓
Add Income
        ↓
GCash balance +₱5,000
        ↓
User buys food ₱250
        ↓
Add Expense
        ↓
GCash balance -₱250
        ↓
User transfers ₱1,000 to Cash
        ↓
Add Transfer
        ↓
GCash -₱1,000
Cash +₱1,000
        ↓
Dashboard recalculates
        ↓
Income / Expenses / Net Cash Flow
        ↓
Analytics update
```

### The key principle for Phase 2

**Transactions should be your source of financial truth.**

Don't build the dashboard as a collection of independent numbers. Build the transaction engine correctly first, then let:

```text
Transactions
      ↓
Balances
      ↓
Calculations
      ↓
Analytics
      ↓
Phase 3 Intelligence
```

derive everything from that foundation.

That architecture will make **Phase 3 — Financial Intelligence** much easier because Ciel, Financial Health, spending behavior, forecasting, and Safe-to-Spend can all consume the same reliable financial data.
