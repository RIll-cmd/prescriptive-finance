# PHASE 4 — GOALS + BILLS + SAFE-TO-SPEND

### Goal

Phase 3 tells the user:

> **"How am I doing financially?"**

Phase 4 should tell them:

> **"What can I afford to do with my money?"**

This phase introduces **forward-looking financial intelligence**.

Instead of only analyzing transactions that already happened, the app starts considering:

- money the user currently has
- money they expect to receive
- bills they need to pay
- financial goals they want to fund
- required payments
- emergency reserves
- upcoming deadlines

The core system becomes:

```text
                    CURRENT MONEY
                         │
                         ↓
                  EXPECTED INCOME
                         │
                         ↓
                  UPCOMING OBLIGATIONS
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
           BILLS       DEBT        GOALS
             │           │           │
             └───────────┼───────────┘
                         ↓
                 EMERGENCY RESERVE
                         │
                         ↓
                  AVAILABLE MONEY
                         │
                         ↓
                 SAFE-TO-SPEND
```

---

# 1. PHASE 4 FEATURES

```text
PHASE 4
│
├── Financial Goals
│   ├── Create goal
│   ├── Edit goal
│   ├── Delete goal
│   ├── Target amount
│   ├── Current amount
│   ├── Deadline
│   ├── Priority
│   ├── Contributions
│   ├── Contribution history
│   ├── Progress
│   ├── Required contribution
│   └── Goal status
│
├── Bills
│   ├── Create bill
│   ├── Edit bill
│   ├── Delete bill
│   ├── Amount
│   ├── Due date
│   ├── Recurring bills
│   ├── Frequency
│   ├── Category
│   ├── Paid/unpaid
│   ├── Upcoming bills
│   ├── Bill history
│   └── Overdue detection
│
└── Safe-to-Spend
    ├── Available money
    ├── Expected income
    ├── Upcoming bills
    ├── Required payments
    ├── Goal contributions
    ├── Emergency reserve
    ├── Daily safe-to-spend
    ├── Weekly safe-to-spend
    ├── Until-payday
    ├── Spending pace
    ├── Forecast
    └── Overspending warnings
```

---

# 2. DATABASE DESIGN

Phase 4 introduces several new tables.

I'd add:

```text
financial_goals
goal_contributions
bills
bill_payments
income_expectations
financial_settings
```

Potential structure:

```text
users
│
├── money_sources
│
├── transactions
│
├── categories
│
├── financial_goals
│   └── goal_contributions
│
├── bills
│   └── bill_payments
│
├── income_expectations
│
└── financial_settings
```

---

# 3. FINANCIAL GOALS

The user should be able to create a goal such as:

```text
Gaming PC

₱35,000 / ₱70,000

50%

Target:
December 2026
```

But internally, a goal should contain much more information.

---

# 4. GOAL DATA MODEL

```text
financial_goals
────────────────────────
id
user_id
name
description
target_amount
current_amount
deadline
priority
status
category
created_at
updated_at
completed_at
```

Example:

```text
name:
Gaming PC

target_amount:
70000

current_amount:
35000

deadline:
2026-12-31

priority:
HIGH

status:
ACTIVE
```

---

# 5. GOAL PRIORITY

Use:

```text
LOW
MEDIUM
HIGH
```

Example:

```text
Gaming PC
LOW

Emergency Fund
HIGH

Tuition
HIGH
```

Priority becomes important later when deciding which goals should receive money first.

---

# 6. GOAL STATUS

Don't rely only on `current_amount`.

Create explicit statuses:

```text
ACTIVE
COMPLETED
PAUSED
CANCELLED
OVERDUE
```

For example:

```text
Gaming PC
ACTIVE

New Phone
PAUSED

Emergency Fund
COMPLETED
```

---

# 7. GOAL PROGRESS

Basic calculation:

```text
current_amount
──────────────── × 100
target_amount
```

Example:

```text
35,000
─────── × 100
70,000

= 50%
```

Cap the displayed progress at 100%.

---

# 8. GOAL CONTRIBUTIONS

Don't simply modify:

```text
current_amount
```

without keeping history.

Create:

```text
goal_contributions
────────────────────────
id
goal_id
amount
date
source
note
created_at
```

Example:

```text
Gaming PC

Contributions

Aug 01    ₱5,000
Aug 10    ₱2,000
Aug 18    ₱3,000
Aug 25    ₱5,000
```

Total:

```text
₱15,000
```

---

# 9. WHY CONTRIBUTION HISTORY MATTERS

It lets the app answer:

> How much have I been contributing?

And:

> Am I contributing enough to reach my goal?

Example:

```text
Target:
₱70,000

Current:
₱35,000

Remaining:
₱35,000

Deadline:
Dec 31

Required:
₱8,750/month
```

---

# 10. REQUIRED GOAL CONTRIBUTION

Calculate:

```text
Remaining Amount
÷
Remaining Contribution Periods
```

For example:

```text
Target:
₱70,000

Current:
₱35,000

Remaining:
₱35,000

4 months remaining
```

Therefore:

```text
₱35,000 / 4
=
₱8,750/month
```

Display:

> **You need to contribute about ₱8,750/month to reach this goal on time.**

---

# 11. GOAL PACE

Compare actual contribution rate against required contribution rate.

Example:

```text
Required:
₱8,750/month

Actual:
₱10,000/month
```

Status:

```text
ON TRACK
```

If:

```text
Required:
₱8,750

Actual:
₱5,000
```

Then:

```text
BEHIND
```

---

# 12. GOAL STATUS INTELLIGENCE

Create:

```text
ON_TRACK
AT_RISK
BEHIND
COMPLETED
```

Example:

```text
Gaming PC

50% complete

Required:
₱8,750/month

Current pace:
₱10,000/month

✓ ON TRACK
```

Another:

```text
Emergency Fund

35% complete

Required:
₱6,000/month

Current pace:
₱3,500/month

⚠ AT RISK
```

---

# 13. GOAL PROGRESS FORECAST

Based on historical contributions:

```text
Average monthly contribution:
₱7,500
```

Remaining:

```text
₱30,000
```

Estimated time:

```text
30,000 / 7,500
=
4 months
```

Then:

> At your current contribution pace, you'll reach this goal in approximately 4 months.

This is a **forecast**, not a guarantee.

---

# 14. GOAL DASHBOARD

Create:

```text
/financial/goals
```

Example:

```text
FINANCIAL GOALS

┌──────────────────────────────┐
│ Gaming PC                   │
│                              │
│ ₱35,000 / ₱70,000           │
│ ██████████░░░░░░░░ 50%      │
│                              │
│ Target: Dec 2026            │
│ Required: ₱8,750/month      │
│                              │
│ ✓ ON TRACK                  │
└──────────────────────────────┘
```

---

# 15. GOAL DETAIL PAGE

Clicking a goal:

```text
Gaming PC

₱35,000 / ₱70,000

50%

Target
December 31, 2026

Remaining
₱35,000

Required Monthly
₱8,750

Current Contribution Pace
₱10,000

Status
✓ ON TRACK
```

Then:

```text
Contribution History

Aug 25     ₱5,000
Aug 18     ₱2,000
Aug 10     ₱3,000
Aug 01     ₱5,000
```

And:

```text
[ + Add Contribution ]
```

---

# 16. IMPORTANT GOAL DESIGN DECISION

A goal should **not automatically subtract money from a money source** unless the user actually records a contribution/transfer.

For example:

```text
Goal:
Gaming PC

Current:
₱35,000
```

doesn't necessarily mean there is literally a separate ₱35,000 account.

It means:

> ₱35,000 has been allocated/tracked toward the goal.

Later you can introduce actual goal-specific savings pots if needed.

---

# 17. BILLS SYSTEM

Now build recurring and upcoming obligations.

Example:

```text
UPCOMING

Internet
₱1,699
Due Sep 2

Credit Card
₱2,500
Due Sep 5

Electricity
₱2,100
Due Sep 7
```

---

# 18. BILL DATA MODEL

```text
bills
────────────────────────
id
user_id
name
amount
category_id
due_date
is_recurring
frequency
status
auto_create
notes
created_at
updated_at
```

Possible statuses:

```text
UPCOMING
DUE
PAID
OVERDUE
CANCELLED
```

---

# 19. BILL FREQUENCIES

Support:

```text
ONE_TIME
DAILY
WEEKLY
BIWEEKLY
MONTHLY
QUARTERLY
YEARLY
CUSTOM
```

For MVP, I'd prioritize:

```text
ONE_TIME
WEEKLY
BIWEEKLY
MONTHLY
YEARLY
```

Then add custom schedules later.

---

# 20. BILL CATEGORIES

Reuse your existing categories where possible.

Examples:

```text
Bills
Internet
Electricity
Water
Rent
Subscriptions
Insurance
Debt
Education
Other
```

Don't create an entirely separate category system if Phase 2's categories can already handle it.

---

# 21. RECURRING BILL EXAMPLE

User creates:

```text
Internet

Amount:
₱1,699

Frequency:
Monthly

Next Due:
September 2
```

The system generates the next occurrence after payment.

Conceptually:

```text
Internet
      │
      ↓
Sep 2
      │
   Mark paid
      │
      ↓
Oct 2
      │
   Mark paid
      │
      ↓
Nov 2
```

---

# 22. BILL PAYMENTS

Create:

```text
bill_payments
────────────────────────
id
bill_id
amount
due_date
paid_date
status
transaction_id
notes
```

This lets you distinguish:

```text
Bill definition
```

from:

```text
Actual payment
```

For example:

```text
Internet Bill
₱1,699
Monthly
```

versus:

```text
September Payment
₱1,699
Paid Sep 1
```

---

# 23. LINK BILL PAYMENT TO TRANSACTION

This is very useful.

Suppose the user records:

```text
Expense:
₱1,699
Internet
```

The system can associate it with:

```text
Internet Bill
September
```

Then:

```text
Bill:
✓ PAID
```

You should avoid automatically assuming every transaction is a bill payment unless the matching logic is reliable or the user confirms it.

---

# 24. UPCOMING BILL CALCULATOR

Create a query:

```text
get_upcoming_bills(
    user_id,
    start_date,
    end_date
)
```

Example:

```text
Today:
Aug 28
```

Search:

```text
Aug 28 → Sep 28
```

Result:

```text
Internet       ₱1,699
Credit Card    ₱2,500
Electricity    ₱2,100
```

Total:

```text
₱6,299
```

This number becomes critical for Safe-to-Spend.

---

# 25. OVERDUE BILL DETECTION

If:

```text
due_date < today
```

and:

```text
status != PAID
```

then:

```text
OVERDUE
```

Example:

```text
Internet
₱1,699

Due:
Aug 25

Today:
Aug 28

⚠ OVERDUE
```

---

# 26. BILL SUMMARY

Dashboard component:

```text
UPCOMING BILLS

₱6,299

3 bills due within 30 days

Next:
Internet — ₱1,699
Due in 5 days
```

This should feed directly into Safe-to-Spend.

---

# 27. BILL CALENDAR

A useful UI:

```text
SEPTEMBER

Mon Tue Wed Thu Fri Sat Sun
          1   2   3   4
              🔵
          5   6   7

2  Internet
5  Credit Card
7  Electricity
```

This gives the user a visual representation of upcoming obligations.

---

# 28. SAFE-TO-SPEND

This is the **signature feature of Phase 4**.

The fundamental question:

> **"How much money can I safely spend?"**

The calculation must look forward.

---

# 29. BASIC SAFE-TO-SPEND FORMULA

Start with:

```text
Available Money
+
Expected Income
-
Upcoming Bills
-
Required Payments
-
Goal Contributions
-
Emergency Reserve
=
Flexible Money
```

Then:

```text
Flexible Money
÷
Remaining Days
=
Daily Safe-to-Spend
```

---

# 30. IMPORTANT: DEFINE "AVAILABLE MONEY"

Don't simply use:

```text
SUM(all transaction amounts)
```

Instead:

```text
Available Money
=
SUM(current balances of money sources)
```

Your money sources from Phase 2:

```text
GCash
Cash
Maya
BPI
Other
```

are manually maintained.

Therefore:

```text
GCash     ₱8,500
Cash      ₱2,000
BPI      ₱15,000
```

Total:

```text
₱25,500
```

---

# 31. EXPECTED INCOME

This is where Phase 4 needs another feature:

## Expected Income

Users should be able to tell the system:

```text
Salary
₱30,000
Every 15th
```

or:

```text
Allowance
₱5,000
Every Monday
```

Create:

```text
income_expectations
────────────────────────
id
user_id
name
amount
frequency
next_date
is_active
```

---

# 32. EXPECTED INCOME EXAMPLE

Today:

```text
August 28
```

Expected:

```text
Salary
₱30,000
September 15
```

Safe-to-Spend can account for it:

```text
Available Money
₱25,500

Expected Income
+₱30,000
```

But you must avoid counting expected income that has already been received.

Once the actual transaction occurs:

```text
Expected income
→ fulfilled
```

or the forecast should exclude the expected occurrence.

---

# 33. UPCOMING BILLS

Suppose:

```text
Internet       ₱1,699
Credit Card    ₱2,500
Electricity    ₱2,100
```

Total:

```text
₱6,299
```

Then:

```text
₱25,500
+
₱30,000
-
₱6,299
```

---

# 34. REQUIRED PAYMENTS

These are obligations that aren't necessarily represented as recurring bills.

Examples:

```text
Tuition installment
Loan payment
Credit card minimum
Medical payment
School requirement
```

You can initially handle these through bills/categories.

Later you can build a dedicated debt system.

---

# 35. GOAL CONTRIBUTIONS

Suppose the user has:

```text
Gaming PC
Required contribution:
₱8,750/month
```

If the user wants this goal included in Safe-to-Spend:

```text
₱8,750
```

is reserved from the forecast.

Therefore:

```text
Available
+ Expected Income
- Bills
- Goal Contributions
```

---

# 36. EMERGENCY RESERVE

This should be user-configurable.

Don't force everyone to have the same reserve.

Create:

```text
financial_settings
────────────────────────
emergency_reserve_amount
safe_to_spend_mode
```

Example:

```text
Emergency Reserve:
₱10,000
```

Then Safe-to-Spend protects it.

---

# 37. SAFE-TO-SPEND EXAMPLE

Suppose:

```text
Available Money       ₱25,500
Expected Income       ₱30,000
Upcoming Bills        -₱6,299
Goal Contributions    -₱8,750
Emergency Reserve     -₱10,000
```

Then:

```text
₱25,500
+₱30,000
-₱6,299
-₱8,750
-₱10,000
────────
₱30,451
```

That's the projected flexible money.

If the planning horizon is 30 days:

```text
₱30,451 / 30
≈ ₱1,015/day
```

So:

```text
SAFE TO SPEND

₱1,015

PER DAY
```

---

# 38. BUT DON'T MAKE IT JUST A SIMPLE DIVISION

This is where your feature can become much more innovative.

The app should consider:

```text
Current spending pace
+
Days remaining
+
Upcoming obligations
+
Expected income
+
Goals
```

So the system isn't saying:

> You have ₱30,451, therefore spend ₱1,015 every day.

Instead:

> **Based on your current spending pace and upcoming obligations, your estimated safe daily spending is ₱1,015.**

---

# 39. SPENDING PACE

Use Phase 3's spending data.

Example:

```text
Current average:

₱750/day
```

Safe-to-spend:

```text
₱1,015/day
```

Therefore:

```text
You are currently spending below your safe pace.
```

If:

```text
Current:
₱1,200/day

Safe:
₱800/day
```

Then:

> **You're spending about ₱400/day above your current safe pace.**

---

# 40. SPENDING PACE STATUS

Create:

```text
UNDER_PACE
ON_PACE
NEAR_LIMIT
OVER_PACE
```

Example:

```text
₱600/day
```

vs:

```text
₱800 safe
```

→

```text
✓ UNDER PACE
```

---

# 41. SAFE-TO-SPEND WARNING

Example:

```text
SAFE TO SPEND

₱428
TODAY

⚠ CLOSE TO LIMIT

You're spending faster than
your current safe pace.
```

Or:

```text
SAFE TO SPEND

₱1,100
TODAY

✓ HEALTHY PACE

You are currently below your
projected spending limit.
```

---

# 42. DAILY SAFE-TO-SPEND

Calculate:

```text
Flexible Money
÷
Days Remaining
```

But define the planning horizon carefully.

Possible modes:

```text
TODAY
THIS WEEK
UNTIL PAYDAY
END OF MONTH
CUSTOM DATE
```

---

# 43. WEEKLY SAFE-TO-SPEND

Example:

```text
Flexible money:
₱7,000

Days remaining:
7
```

Then:

```text
₱7,000 / 7
=
₱1,000/day
```

Weekly:

```text
₱7,000
```

Display:

```text
SAFE TO SPEND THIS WEEK

₱7,000
```

---

# 44. UNTIL-PAYDAY MODE

This is particularly useful for students and salaried users.

Example:

```text
Today:
Aug 28

Next salary:
Sep 15

Days:
18
```

Available:

```text
₱12,000
```

Bills before payday:

```text
₱3,000
```

Reserve:

```text
₱2,000
```

Flexible:

```text
₱7,000
```

Therefore:

```text
₱7,000 / 18
≈ ₱389/day
```

Display:

```text
SAFE TO SPEND

₱389/day

Until Sep 15
```

---

# 45. PAYDAY SYSTEM

Because Safe-to-Spend can benefit greatly from expected income, add:

```text
PAYDAY
```

to the user's income expectation.

Example:

```text
Salary
₱30,000

Frequency:
Monthly

Payday:
15th
```

Then the app can automatically calculate:

```text
Days until payday
```

and:

```text
Safe-to-spend until payday
```

---

# 46. SAFE-TO-SPEND FORECAST

Show the user what happens if they maintain their current pace.

Example:

```text
TODAY

Available:
₱12,000

Projected expenses before payday:
₱7,500

Projected remaining:
₱4,500
```

Then:

```text
Projected
████████████████░░░░
```

This can eventually become a timeline.

---

# 47. FORECAST TIMELINE

```text
AUG 28
₱12,000
   │
   ↓
SEP 02
Internet
-₱1,699
   │
   ↓
SEP 05
Credit Card
-₱2,500
   │
   ↓
SEP 07
Electricity
-₱2,100
   │
   ↓
SEP 15
Salary
+₱30,000
```

This is extremely useful.

The user can visually understand:

> **What is going to happen to my money?**

---

# 48. CASH BALANCE FORECAST

Create a simple forecasting engine.

Input:

```text
Current balance
Expected income
Expected bills
Goal contributions
```

Output:

```text
Projected balance by date
```

Example:

```text
Aug 28
₱25,500

Sep 02
₱23,801

Sep 05
₱21,301

Sep 07
₱19,201

Sep 15
₱49,201
```

---

# 49. FORECAST WARNINGS

If projected balance drops below:

```text
Emergency Reserve
```

generate:

> ⚠ Your projected balance may fall below your emergency reserve before your next expected income.

If projected balance becomes negative:

> 🚨 Your current projected obligations exceed your available and expected funds.

This is much more useful than a generic spending warning.

---

# 50. SAFE-TO-SPEND STATES

I'd create:

```text
HEALTHY
CAUTION
AT_RISK
UNSAFE
```

Example:

### Healthy

```text
Safe-to-Spend
₱1,200/day

✓ Healthy
```

### Caution

```text
Safe-to-Spend
₱700/day

⚠ Spending carefully
```

### At Risk

```text
Safe-to-Spend
₱350/day

⚠ Your spending pace is high
```

### Unsafe

```text
Safe-to-Spend
₱0/day

🚨 Upcoming obligations exceed
your flexible money.
```

---

# 51. DON'T LET SAFE-TO-SPEND GO NEGATIVE

Internally you can have:

```text
flexible_money = -₱4,000
```

But the user-facing value should be:

```text
SAFE TO SPEND

₱0
```

with:

> **You're currently projected to be ₱4,000 short after accounting for upcoming obligations.**

That communicates the problem much better.

---

# 52. SAFE-TO-SPEND EXPLANATION

This should be transparent.

When the user taps:

```text
₱428
SAFE TO SPEND
```

show:

```text
HOW WE CALCULATED THIS

Current Money
₱12,000

Expected Income
+₱5,000

Upcoming Bills
-₱3,500

Goal Contributions
-₱2,000

Emergency Reserve
-₱4,000

────────────────

Flexible Money
₱7,500

Planning Period
18 days

Daily Safe-to-Spend
₱417
```

This transparency is **very important** for a financial app.

---

# 53. SAFE-TO-SPEND SHOULD BE A FIRST-CLASS FEATURE

Don't hide it inside analytics.

Give it a prominent dashboard card:

```text
┌─────────────────────────────┐
│                             │
│       SAFE TO SPEND         │
│                             │
│          ₱428               │
│           TODAY             │
│                             │
│  Until payday: Sep 15       │
│                             │
│  ✓ Bills accounted for      │
│  ✓ Goals accounted for      │
│  ✓ Reserve protected        │
│                             │
│       [ View Details ]      │
└─────────────────────────────┘
```

---

# 54. SAFE-TO-SPEND DETAIL PAGE

Create:

```text
/financial/safe-to-spend
```

Structure:

```text
Safe-to-Spend
│
├── Current Safe Amount
│
├── Today
│
├── This Week
│
├── Until Payday
│
├── End of Month
│
├── Calculation
│
├── Upcoming Obligations
│
├── Spending Pace
│
├── Forecast
│
└── Warnings
```

---

# 55. SAFE-TO-SPEND API

Create:

```text
GET /api/v1/financial/safe-to-spend
```

Potential response:

```json
{
  "available_money": 25500,
  "expected_income": 30000,
  "upcoming_bills": 6299,
  "required_payments": 0,
  "goal_contributions": 8750,
  "emergency_reserve": 10000,
  "flexible_money": 30451,
  "daily_safe_to_spend": 1015,
  "weekly_safe_to_spend": 7105,
  "status": "HEALTHY"
}
```

---

# 56. SAFE-TO-SPEND SERVICE

Backend:

```text
services/
└── financial/
    ├── cash_flow.py
    ├── spending.py
    ├── metrics.py
    ├── health_score.py
    ├── insights.py
    │
    └── safe_to_spend/
        ├── calculator.py
        ├── forecast.py
        ├── obligations.py
        ├── spending_pace.py
        └── explanations.py
```

This keeps the calculation from becoming one giant function.

---

# 57. GOAL SERVICE

```text
services/
└── goals/
    ├── goal_service.py
    ├── contribution_service.py
    ├── progress.py
    ├── pace.py
    └── forecast.py
```

---

# 58. BILL SERVICE

```text
services/
└── bills/
    ├── bill_service.py
    ├── recurrence.py
    ├── payment_service.py
    ├── upcoming.py
    └── overdue.py
```

---

# 59. FRONTEND STRUCTURE

```text
features/
│
├── goals/
│   ├── api.ts
│   ├── types.ts
│   ├── hooks.ts
│   ├── GoalCard.tsx
│   ├── GoalList.tsx
│   ├── GoalForm.tsx
│   ├── GoalProgress.tsx
│   ├── GoalDetail.tsx
│   ├── ContributionForm.tsx
│   └── ContributionHistory.tsx
│
├── bills/
│   ├── api.ts
│   ├── types.ts
│   ├── hooks.ts
│   ├── BillCard.tsx
│   ├── BillList.tsx
│   ├── BillForm.tsx
│   ├── BillCalendar.tsx
│   ├── UpcomingBills.tsx
│   └── BillHistory.tsx
│
└── safe-to-spend/
    ├── api.ts
    ├── types.ts
    ├── hooks.ts
    ├── SafeToSpendCard.tsx
    ├── SafeToSpendBreakdown.tsx
    ├── SpendingPace.tsx
    ├── ForecastChart.tsx
    ├── ObligationList.tsx
    └── SafeToSpendWarning.tsx
```

---

# 60. DASHBOARD AFTER PHASE 4

Your main dashboard becomes much more powerful:

```text
┌──────────────────────────────────────┐
│ GOOD MORNING                         │
│                                      │
│ Financial Health                     │
│ 82 / 100                             │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│ SAFE TO SPEND                        │
│                                      │
│ ₱428 TODAY                           │
│                                      │
│ ₱2,996 THIS WEEK                     │
│                                      │
│ Until payday: Sep 15                 │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│ UPCOMING BILLS                       │
│                                      │
│ Internet       ₱1,699   Sep 2        │
│ Credit Card    ₱2,500   Sep 5        │
│ Electricity    ₱2,100   Sep 7        │
│                                      │
│ Total          ₱6,299               │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│ GOALS                                │
│                                      │
│ Gaming PC                            │
│ ₱35,000 / ₱70,000                    │
│ ██████████░░░░░░ 50%                │
│                                      │
│ ✓ On track                           │
└──────────────────────────────────────┘
```

---

# 61. PHASE 4 DEVELOPMENT ORDER

Don't build everything simultaneously.

Build it in this order:

```text
1. Goal database
       ↓
2. Goal CRUD
       ↓
3. Goal contributions
       ↓
4. Goal progress
       ↓
5. Goal deadline calculations
       ↓
6. Goal pace
       ↓
7. Goal forecast
       ↓
8. Bill database
       ↓
9. Bill CRUD
       ↓
10. Recurring bills
       ↓
11. Bill payments
       ↓
12. Upcoming bills
       ↓
13. Overdue detection
       ↓
14. Expected income
       ↓
15. Financial settings
       ↓
16. Emergency reserve
       ↓
17. Safe-to-spend calculator
       ↓
18. Daily calculation
       ↓
19. Weekly calculation
       ↓
20. Until-payday calculation
       ↓
21. Spending pace
       ↓
22. Cash balance forecast
       ↓
23. Safe-to-spend warnings
       ↓
24. Explanation system
       ↓
25. Dashboard integration
       ↓
26. Testing
```

---

# 62. PHASE 4 TEST SCENARIO

Create a fake user:

```text
CURRENT MONEY

GCash      ₱8,500
Cash       ₱2,000
BPI       ₱15,000

Total:
₱25,500
```

Expected income:

```text
Salary
₱30,000
Sep 15
```

Bills:

```text
Internet       ₱1,699
Credit Card    ₱2,500
Electricity    ₱2,100
```

Goals:

```text
Gaming PC
Required contribution:
₱8,750
```

Emergency reserve:

```text
₱10,000
```

Then verify:

```text
Available Money
₱25,500

+ Expected Income
₱30,000

- Bills
₱6,299

- Goal Contribution
₱8,750

- Emergency Reserve
₱10,000

= Flexible Money
₱30,451
```

Then test:

```text
30,451 / planning_days
```

and verify the daily/weekly/until-payday values.

---

# 63. EDGE CASES

You need to explicitly test these.

### No goals

```text
Goal Contributions = ₱0
```

---

### No bills

```text
Upcoming Bills = ₱0
```

---

### No expected income

Don't assume future income.

```text
Expected Income = ₱0
```

---

### No emergency reserve

If the user chooses:

```text
Reserve = ₱0
```

allow it, but make the setting visible.

---

### Overdue bills

Overdue bills should remain obligations until resolved.

---

### Goal deadline passed

```text
deadline < today
AND
status != COMPLETED
```

→

```text
OVERDUE
```

---

### Negative flexible money

Example:

```text
Flexible Money = -₱4,000
```

Display:

```text
SAFE TO SPEND

₱0

⚠ You're projected to be
₱4,000 short after obligations.
```

---

### Expected income already received

Don't double-count it.

---

### Transfer between own money sources

This is particularly important from Phase 2.

```text
GCash → BPI
₱5,000
```

should **not**:

```text
+₱5,000 income
```

and:

```text
+₱5,000 available money
```

It only changes the distribution:

```text
GCash -₱5,000
BPI   +₱5,000
```

Total remains unchanged.

---

# 64. PHASE 4 DEFINITION OF DONE

### Goals

- [ ] Create goal
- [ ] Edit goal
- [ ] Delete goal
- [ ] Target amount
- [ ] Current amount
- [ ] Deadline
- [ ] Priority
- [ ] Status
- [ ] Progress %
- [ ] Remaining amount
- [ ] Contributions
- [ ] Contribution history
- [ ] Required contribution
- [ ] Contribution pace
- [ ] On-track detection
- [ ] At-risk detection
- [ ] Goal forecast

### Bills

- [ ] Add bill
- [ ] Edit bill
- [ ] Delete bill
- [ ] Amount
- [ ] Due date
- [ ] Category
- [ ] Recurring bill
- [ ] Frequency
- [ ] Mark paid
- [ ] Payment history
- [ ] Upcoming bills
- [ ] Overdue detection
- [ ] Bill calendar
- [ ] Bill totals

### Expected Income

- [ ] Add expected income
- [ ] Amount
- [ ] Frequency
- [ ] Next date
- [ ] Active/inactive
- [ ] Prevent double counting
- [ ] Payday detection

### Safe-to-Spend

- [ ] Available money
- [ ] Expected income
- [ ] Upcoming bills
- [ ] Required payments
- [ ] Goal contributions
- [ ] Emergency reserve
- [ ] Flexible money
- [ ] Daily safe-to-spend
- [ ] Weekly safe-to-spend
- [ ] Until-payday
- [ ] Spending pace
- [ ] Forecast
- [ ] Overspending warning
- [ ] Explanation/breakdown

---

# 65. PHASE 4 ARCHITECTURE

At the end of Phase 4, your system should look like:

```text
                    ┌───────────────┐
                    │  TRANSACTIONS │
                    └───────┬───────┘
                            │
                            ↓
                    FINANCIAL ENGINE
                            │
           ┌────────────────┼────────────────┐
           ↓                ↓                ↓
       ANALYTICS         GOALS             BILLS
       PHASE 3          PHASE 4           PHASE 4
           │                │                │
           └────────────────┼────────────────┘
                            ↓
                    EXPECTED CASH FLOW
                            │
                     ┌──────┴──────┐
                     ↓             ↓
               EXPECTED INCOME   OBLIGATIONS
                     │             │
                     └──────┬──────┘
                            ↓
                    SAFE-TO-SPEND
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
           TODAY          WEEK          PAYDAY
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                       USER ACTION
```

## The major difference from Phase 3

```text
PHASE 3
"What happened?"

Transactions
      ↓
Analysis
      ↓
Financial Health
```

```text
PHASE 4
"What can I safely do?"

Current Money
      +
Expected Money
      -
Future Obligations
      -
Goals
      -
Reserve
      ↓
Safe-to-Spend
      ↓
Action
```

That distinction is important. **Phase 3 is descriptive; Phase 4 becomes predictive and decision-oriented.**

And this gives you a strong foundation for the next major phase: **automation**—SMS/notification parsing, receipt OCR, automatic transaction detection, recurring transaction recognition, and eventually having **Ciel** explain and act on the financial intelligence rather than being responsible for the underlying calculations.
