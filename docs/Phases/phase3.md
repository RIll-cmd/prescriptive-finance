# PHASE 3 — FINANCIAL INTELLIGENCE ENGINE

### Goal

Phase 2 answers:

> **"What happened to my money?"**

Phase 3 should answer:

> **"What does my financial data mean?"**

This is the phase where your app stops being just a transaction tracker and starts acting like a **personal financial analysis system**.

The core pipeline should be:

```text
                    TRANSACTIONS
                         │
                         ↓
                 DATA AGGREGATION
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
         Cash Flow    Spending    Financial
          Engine      Intelligence  Metrics
             │           │           │
             └───────────┼───────────┘
                         ↓
                 FINANCIAL HEALTH
                    SCORE ENGINE
                         │
                         ↓
                EXPLANATION ENGINE
                         │
                         ↓
                  USER INSIGHTS
```

---

# 1. PHASE 3 SCOPE

Build:

```text
FINANCIAL INTELLIGENCE
│
├── Cash Flow Engine
│   ├── Monthly cash flow
│   ├── Weekly cash flow
│   ├── Daily cash flow
│   ├── Income trends
│   ├── Expense trends
│   └── Cash-flow stability
│
├── Spending Intelligence
│   ├── Top categories
│   ├── Spending trends
│   ├── Spending changes
│   ├── Average daily spending
│   ├── Average weekly spending
│   ├── Average monthly spending
│   └── Discretionary spending
│
├── Financial Metrics
│   ├── Savings rate
│   ├── Expense ratio
│   ├── Income consistency
│   ├── Liquidity
│   └── Debt indicators
│
├── Financial Health Score
│   ├── Cash Flow
│   ├── Liquidity
│   ├── Debt
│   ├── Savings
│   └── Spending
│
└── Explanation Engine
    ├── Score explanation
    ├── Positive factors
    ├── Negative factors
    ├── Changes
    └── Recommendations
```

---

# 2. IMPORTANT ARCHITECTURE DECISION

Don't make the Financial Health Score directly read individual transactions.

Instead:

```text
Transactions
     ↓
Aggregation Layer
     ↓
Financial Metrics
     ↓
Score Components
     ↓
Final Score
```

For example:

```text
Transactions
     ↓
₱30,000 income
₱18,000 expenses
₱12,000 net cash flow
     ↓
Savings Rate = 40%
Expense Ratio = 60%
     ↓
Savings Component = 85
Cash Flow Component = 90
     ↓
Financial Health = 82
```

This makes the system much easier to maintain and explain.

---

# 3. CREATE A FINANCIAL PERIOD SYSTEM

Almost everything in Phase 3 depends on comparing periods.

Create a standard period abstraction:

```text
Period
├── start_date
├── end_date
├── previous_start_date
└── previous_end_date
```

For example:

```text
CURRENT MONTH

Aug 1 → Aug 28
```

Previous comparison:

```text
PREVIOUS MONTH

Jul 1 → Jul 31
```

Then your engine can ask:

```text
Current:
₱18,500 expenses

Previous:
₱15,000 expenses
```

and calculate the change.

---

# 4. CASH FLOW ENGINE

The Cash Flow Engine is the first major component.

Basic relationship:

```text
Income
-
Expenses
=
Net Cash Flow
```

But don't stop at one number.

The engine should produce a complete cash-flow snapshot.

---

# 5. CASH FLOW SNAPSHOT

For a selected period:

```text
Cash Flow
────────────────────────

Income
₱30,000

Expenses
₱18,500

Net Cash Flow
+₱11,500

Savings Rate
38.3%
```

Internally:

```text
CashFlowSnapshot
│
├── income
├── expenses
├── net_cash_flow
├── savings_rate
├── income_transaction_count
└── expense_transaction_count
```

---

# 6. MONTHLY CASH FLOW

Example:

```text
MONTHLY CASH FLOW

March      +₱8,200
April      +₱11,400
May        +₱7,500
June       +₱13,200
July       +₱5,800
August     +₱11,500
```

This immediately lets you identify:

```text
Positive months
Negative months
Most profitable month
Worst month
Average monthly cash flow
```

---

# 7. WEEKLY CASH FLOW

Break the current month into weeks:

```text
AUGUST

Week 1    +₱2,500
Week 2    +₱4,100
Week 3    +₱1,800
Week 4    +₱3,100
```

This is particularly useful because monthly data can hide sudden spending spikes.

---

# 8. DAILY CASH FLOW

For more detailed analysis:

```text
Aug 25    +₱1,000
Aug 26      -₱250
Aug 27      -₱800
Aug 28    +₱2,000
```

This data later becomes useful for:

- spending behavior
- forecasting
- Ciel
- anomaly detection

---

# 9. INCOME TREND

Calculate:

```text
Current income
vs
Previous period income
```

Example:

```text
July:
₱25,000

August:
₱30,000

Change:
+₱5,000
+20%
```

Display:

> **Income increased 20% compared with last month.**

---

# 10. EXPENSE TREND

Same principle:

```text
July:
₱15,000

August:
₱18,450
```

Difference:

```text
+₱3,450
+23%
```

Your system can produce:

> **Your expenses increased 23% compared with last month.**

This is one of the most important intelligence features.

---

# 11. CASH-FLOW STABILITY

This needs more thought than simply:

> Positive = good.

Consider:

### User A

```text
+₱10,000
+₱10,000
+₱10,000
+₱10,000
```

Very stable.

### User B

```text
+₱30,000
-₱15,000
+₱25,000
-₱10,000
```

Same general income level, but much more volatile.

Your engine should detect this difference.

---

# 12. STABILITY METRIC

Use a statistical measure of variation in periodic net cash flow.

For example:

```text
Cash Flow Stability
=
1 - normalized variability
```

Then convert to:

```text
0–100
```

Example:

```text
Cash Flow Stability
82 / 100
```

You can internally use standard deviation or coefficient of variation.

The exact formula can be tuned after testing with sample users.

---

# 13. STABILITY CLASSIFICATION

Instead of only displaying a number:

```text
82
```

classify:

```text
80–100 → Very Stable
60–79  → Stable
40–59  → Variable
20–39  → Unstable
0–19   → Highly Unstable
```

Then:

> **Your cash flow is stable. Your monthly income and spending have remained relatively consistent.**

---

# 14. SPENDING INTELLIGENCE

Now analyze expenses beyond simple totals.

The system should answer:

```text
Where is my money going?
What is changing?
What categories are growing?
What do I spend most on?
How much do I spend on average?
```

---

# 15. TOP SPENDING CATEGORIES

Example:

```text
TOP SPENDING

1. Food
   ₱5,200 — 32%

2. Transportation
   ₱3,100 — 19%

3. Bills
   ₱2,800 — 17%

4. Shopping
   ₱1,900 — 12%
```

The percentage:

```text
Category Spending
────────────────── × 100
Total Expenses
```

---

# 16. SPENDING RANKING

Don't hard-code:

> Food is your highest category.

Calculate it.

```text
expenses
 ↓
GROUP BY category
 ↓
SUM(amount)
 ↓
SORT DESC
 ↓
Top categories
```

This gives you a reusable intelligence function.

---

# 17. SPENDING CHANGE DETECTION

Compare category spending against the previous period.

Example:

```text
Food

July:
₱4,000

August:
₱5,000

Change:
+₱1,000
+25%
```

Generate:

> **Food spending increased 25% compared with last month.**

---

# 18. CATEGORY CHANGE PRIORITY

Not every change deserves an alert.

For example:

```text
Entertainment
₱100 → ₱150
```

That's:

```text
+50%
```

but only:

```text
+₱50
```

You don't want the app screaming:

> 🚨 Your entertainment spending increased 50%!

Therefore consider both:

```text
Percentage change
+
Absolute change
```

Example rule:

```text
Significant if:

percentage change ≥ 20%
AND
absolute change ≥ ₱500
```

The thresholds should eventually be configurable.

---

# 19. SPENDING VELOCITY

This is a useful metric to add.

Instead of only:

> You spent ₱10,000 this month.

Calculate:

```text
Average spending per day
```

Example:

```text
₱10,000 / 20 days
=
₱500/day
```

Then you can estimate:

> At your current spending pace, you're averaging about ₱500 per day.

This becomes extremely valuable in Phase 4 when you build forecasting/Safe-to-Spend.

---

# 20. AVERAGE DAILY SPENDING

Formula:

```text
Total Expenses
÷
Number of days in period
```

But be careful.

There are two valid interpretations:

### Calendar-day average

```text
₱15,000 / 30 days
=
₱500/day
```

### Active-spending-day average

```text
₱15,000 / 20 spending days
=
₱750/spending day
```

I'd calculate **both internally**, but display calendar-day average as the primary metric.

---

# 21. AVERAGE WEEKLY SPENDING

Example:

```text
Monthly expenses:
₱20,000

Average:
₱4,667/week
```

Use the actual number of days in the selected period rather than simply:

```text
monthly / 4
```

for better accuracy.

---

# 22. AVERAGE MONTHLY SPENDING

If six months of history exists:

```text
₱18,000
₱20,000
₱16,500
₱21,000
₱19,000
₱22,000
```

Calculate:

```text
Average = ₱19,416.67
```

This becomes your baseline.

---

# 23. SPENDING BASELINE

This is important.

The app should eventually learn:

```text
Typical monthly spending
Typical weekly spending
Typical category spending
```

For example:

```text
Food baseline:
₱4,200/month

Current:
₱5,200/month
```

Then:

```text
+₱1,000 above baseline
```

This is more useful than comparing every month only against the previous month.

---

# 24. DISCRETIONARY SPENDING

This needs a clear definition.

Create two broad expense classifications:

```text
ESSENTIAL
DISCRETIONARY
```

Example:

### Essential

```text
Food
Bills
Transportation
Healthcare
Debt
```

### Discretionary

```text
Entertainment
Shopping
Hobbies
Dining out
Gaming
Subscriptions
```

But don't permanently hard-code all categories into one group.

Allow category metadata:

```text
category
├── type
├── spending_class
└── ...
```

where:

```text
spending_class:
ESSENTIAL
DISCRETIONARY
UNCATEGORIZED
```

---

# 25. DISCRETIONARY SPENDING METRIC

Example:

```text
Total Expenses
₱20,000

Essential
₱14,000

Discretionary
₱6,000
```

Therefore:

```text
Discretionary Ratio
=
6,000 / 20,000
=
30%
```

Display:

> **30% of your spending this month was discretionary.**

Avoid labeling discretionary spending as automatically "bad."

The app should remain analytical rather than judgmental.

---

# 26. FINANCIAL METRICS LAYER

Before calculating the Health Score, create standardized metrics.

```text
FinancialMetrics
│
├── net_cash_flow
├── savings_rate
├── expense_ratio
├── discretionary_ratio
├── income_stability
├── expense_stability
├── cash_flow_stability
└── liquidity_ratio
```

Debt metrics can initially be unavailable if the app doesn't yet have a proper debt system.

---

# 27. SAVINGS RATE

One of the most important metrics.

```text
Savings Rate
=
Net Cash Flow
÷
Income
× 100
```

Example:

```text
Income:
₱30,000

Expenses:
₱18,000

Net:
₱12,000

Savings Rate:
40%
```

Important:

> Don't count transfers between a user's own sources as savings.

---

# 28. EXPENSE RATIO

```text
Expense Ratio
=
Expenses
÷
Income
× 100
```

Example:

```text
₱18,000 / ₱30,000
=
60%
```

This tells you how much of income is being consumed by expenses.

---

# 29. LIQUIDITY

This measures accessible money relative to recent spending.

Example:

```text
Accessible Money:
₱25,000

Average Monthly Expenses:
₱10,000
```

Approximate:

```text
Liquidity Coverage
=
₱25,000 / ₱10,000
=
2.5 months
```

Display:

> **Your current tracked money covers about 2.5 months of your average expenses.**

Be careful to call it **tracked money**, because your app isn't connected to financial institutions.

---

# 30. IMPORTANT: DATA CONFIDENCE

This is a feature I'd strongly recommend.

Your app doesn't actually know someone's complete financial situation.

The user might have:

```text
₱20,000 tracked
+
₱50,000 in an untracked account
```

Your system only knows about:

```text
₱20,000
```

Therefore your financial intelligence should know when its data is incomplete.

Create:

```text
Data Confidence
```

Example:

```text
FINANCIAL HEALTH
82 / 100

Data Confidence
● High
```

or:

```text
Data Confidence
● Limited

You have only 12 days of transaction history.
```

This prevents the app from pretending its score is objectively perfect.

---

# 31. FINANCIAL HEALTH SCORE

Now build the centerpiece.

```text
FINANCIAL HEALTH

82 / 100
GOOD
```

Your proposed categories:

```text
Cash Flow
Liquidity
Debt
Savings
Spending
```

I would structure the engine like:

```text
                  HEALTH SCORE
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
   Cash Flow       Liquidity        Savings
       │               │               │
       └───────────────┼───────────────┘
                       ↓
                 Spending
                       │
                       ↓
                     Debt
                       │
                       ↓
                 FINAL SCORE
```

---

# 32. SCORE COMPONENTS

A possible initial weighting:

```text
Cash Flow      25%
Savings        25%
Spending       20%
Liquidity      20%
Debt           10%
```

Total:

```text
100%
```

However, **Debt should not be given a fake score when no debt data exists**.

That's important.

---

# 33. MISSING DATA HANDLING

Suppose a new user has no debt information.

Don't do:

```text
Debt Score = 100
```

because that falsely improves the user's score.

Instead:

```text
Debt
N/A
```

and dynamically redistribute its weight:

```text
Cash Flow
27.8%

Savings
27.8%

Spending
22.2%

Liquidity
22.2%

Debt
N/A
```

This makes your scoring system much more defensible.

---

# 34. CASH FLOW SCORE

Potential factors:

```text
Positive net cash flow
Cash-flow consistency
Income vs expenses
Negative months
```

Example:

```text
Positive monthly cash flow
✓

Consistent cash flow
✓

No negative months
✓
```

Score:

```text
91 / 100
```

---

# 35. SAVINGS SCORE

Possible factors:

```text
Savings rate
Savings consistency
Trend
```

Example:

```text
Savings rate:
40%

Previous:
32%

Trend:
↑
```

Score:

```text
88 / 100
```

Avoid using arbitrary financial advice thresholds without documenting why they exist. Keep the scoring rules configurable so you can tune them based on research/user testing.

---

# 36. SPENDING SCORE

Possible factors:

```text
Expense ratio
Spending volatility
Discretionary ratio
Recent spending trend
```

Example:

```text
Expenses increased
↑

Discretionary spending increased
↑

Spending volatility
Low
```

Score:

```text
76 / 100
```

---

# 37. LIQUIDITY SCORE

Potential inputs:

```text
Current tracked money
Average monthly expenses
Liquidity coverage
```

Example:

```text
Tracked money:
₱25,000

Average monthly expenses:
₱10,000

Coverage:
2.5 months
```

Score:

```text
78 / 100
```

Again, explicitly call it **tracked liquidity**.

---

# 38. DEBT SCORE

This should be implemented carefully.

Phase 3 may not have enough debt information.

Therefore:

```text
Debt
N/A
```

until the app has actual debt-related data.

Later, when you build debt tracking:

```text
Debt balance
Monthly debt payments
Debt-to-income
Interest rates
```

can feed this component.

---

# 39. SCORE LEVELS

Example:

```text
90–100
Excellent

80–89
Good

70–79
Fair

50–69
Needs Attention

0–49
Critical
```

The exact labels can be adjusted during user testing.

---

# 40. SCORE SHOULD NEVER BE JUST A NUMBER

This is one of the most important parts of Phase 3.

Bad:

```text
Financial Health
72 / 100
```

Good:

```text
Financial Health
72 / 100
FAIR

Your score decreased this month because
expenses increased 18% while your savings
rate declined from 32% to 25%.
```

Then:

```text
What's going well

✓ Income increased 8%
✓ Cash flow remains positive

Needs attention

⚠ Food spending increased 23%
⚠ Savings rate decreased 7 percentage points
```

---

# 41. EXPLANATION ENGINE

Build this as its own backend service.

```text
ExplanationEngine
```

Input:

```text
FinancialMetrics
PreviousMetrics
ScoreComponents
```

Output:

```text
Explanation
├── summary
├── positive_factors[]
├── negative_factors[]
├── changes[]
└── suggestions[]
```

---

# 42. EXPLANATION EXAMPLE

Input:

```text
Income:
+8%

Expenses:
+23%

Savings:
-7 percentage points
```

Output:

```text
summary:

Your financial health declined slightly because
your expenses grew faster than your income.

positive_factors:

Income increased 8%.

negative_factors:

Expenses increased 23%.

Savings rate declined from 32% to 25%.

suggestions:

Review your Food and Shopping spending.
```

Notice:

**This does not require an AI model.**

You can build this using deterministic rules first.

That is actually preferable for your core financial calculations.

---

# 43. RULE-BASED INSIGHT ENGINE

Create rules like:

```text
IF expense_change >= 20%
AND absolute_change >= threshold

THEN:
"Your expenses increased significantly."
```

Another:

```text
IF food_change >= 20%

THEN:
"Food spending increased significantly."
```

Another:

```text
IF savings_rate decreases

THEN:
"Your savings rate declined."
```

Another:

```text
IF net_cash_flow < 0

THEN:
"Your expenses exceeded your income during this period."
```

---

# 44. INSIGHT PRIORITY

You don't want 20 notifications.

Rank insights:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFO
```

Example:

```text
CRITICAL
Net cash flow is negative.

HIGH
Expenses increased 31%.

MEDIUM
Food spending increased 18%.

INFO
Income increased 5%.
```

Then only show the top 3–5.

---

# 45. INSIGHT TYPES

Create standardized types:

```text
EXPENSE_INCREASE
EXPENSE_DECREASE
CATEGORY_INCREASE
CATEGORY_DECREASE
INCOME_INCREASE
INCOME_DECREASE
SAVINGS_INCREASE
SAVINGS_DECREASE
NEGATIVE_CASH_FLOW
POSITIVE_CASH_FLOW
HIGH_DISCRETIONARY_SPENDING
LOW_LIQUIDITY
STABLE_CASH_FLOW
```

This will make your frontend much easier to build.

---

# 46. INSIGHT DATA MODEL

You could create:

```text id="8zq2v4"
financial_insights
──────────────────────────────
id
user_id
type
priority
title
description
metric
current_value
previous_value
percentage_change
created_at
```

However, you don't necessarily need to permanently store every generated insight.

A good approach is:

```text
Metrics → Generate insights dynamically
```

and only store user-dismissed/acknowledged insights if needed.

---

# 47. FINANCIAL INTELLIGENCE DASHBOARD

Your Phase 3 dashboard could become:

```text
┌──────────────────────────────────────┐
│ FINANCIAL HEALTH                     │
│                                      │
│          82 / 100                    │
│             GOOD                     │
│                                      │
│ ↑ Income increased 8%               │
│ ⚠ Expenses increased 23%            │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│ CASH FLOW                            │
│                                      │
│ Income       ₱30,000                 │
│ Expenses     ₱18,500                 │
│ Net          +₱11,500                │
│                                      │
│       [Cash Flow Chart]              │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│ SPENDING INTELLIGENCE                │
│                                      │
│ Food             ₱5,200  ↑23%       │
│ Transport        ₱2,400  ↓8%        │
│ Shopping         ₱1,800  ↑15%       │
└──────────────────────────────────────┘
```

---

# 48. FINANCIAL HEALTH PAGE

I'd make a dedicated page:

```text
/financial-health
```

Structure:

```text
Financial Health
│
├── Overall Score
│
├── Score Breakdown
│   ├── Cash Flow
│   ├── Savings
│   ├── Spending
│   ├── Liquidity
│   └── Debt
│
├── What's Going Well
│
├── Needs Attention
│
├── Spending Trends
│
└── Financial Insights
```

---

# 49. SCORE BREAKDOWN UI

Example:

```text
FINANCIAL HEALTH

82 / 100
GOOD

──────────────────────

Cash Flow
██████████████████░░
91

Savings
█████████████████░░░
88

Spending
███████████████░░░░░
76

Liquidity
███████████████░░░░░
78

Debt
N/A
```

Clicking each component:

```text
Cash Flow → Why 91?
```

Then:

> Your cash flow is strong because your income has consistently exceeded your expenses over the last 3 months.

---

# 50. FINANCIAL HEALTH HISTORY

Don't only show today's score.

Track:

```text
May     74
June    79
July    85
August  82
```

Chart:

```text
Health Score

90 │
85 │        ●
80 │    ●       ●
75 │ ●
70 │
   └────────────────
     May Jun Jul Aug
```

Now the user can see:

> My financial health is improving.

---

# 51. SCORE CHANGE EXPLANATION

If:

```text
July:
85

August:
82
```

show:

> **Your score decreased 3 points this month.**

Then:

```text
Main reasons

↓ Savings rate
32% → 25%

↑ Expenses
₱15,000 → ₱18,500

✓ Income
₱28,000 → ₱30,000
```

This is far more useful than simply showing 82.

---

# 52. API ARCHITECTURE

Add:

```text id="q4s0c1"
/api/v1/financial
│
├── /summary
├── /cash-flow
├── /spending
├── /metrics
├── /health
├── /health/history
└── /insights
```

For example:

```text
GET /financial/summary
```

returns:

```json
{
  "income": 30000,
  "expenses": 18500,
  "net_cash_flow": 11500,
  "savings_rate": 38.33
}
```

---

# 53. FINANCIAL HEALTH API

```text
GET /api/v1/financial/health
```

Could return:

```json
{
  "score": 82,
  "label": "GOOD",
  "confidence": "HIGH",
  "components": {
    "cash_flow": 91,
    "savings": 88,
    "spending": 76,
    "liquidity": 78,
    "debt": null
  }
}
```

---

# 54. INSIGHTS API

```text
GET /api/v1/financial/insights
```

Response:

```json
{
  "insights": [
    {
      "type": "CATEGORY_INCREASE",
      "priority": "HIGH",
      "title": "Food spending increased",
      "description": "Food spending increased 23% compared with last month.",
      "change": 23
    }
  ]
}
```

---

# 55. BACKEND STRUCTURE

Phase 3 should expand your backend to:

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
│       └── financial.py
│
├── services/
│   ├── transaction_service.py
│   ├── money_source_service.py
│   │
│   └── financial/
│       ├── cash_flow.py
│       ├── spending.py
│       ├── metrics.py
│       ├── health_score.py
│       ├── insights.py
│       └── explanations.py
│
├── schemas/
│   └── financial.py
│
└── models/
    └── financial.py
```

---

# 56. FRONTEND STRUCTURE

```text
features/
│
├── financial/
│   │
│   ├── api.ts
│   ├── types.ts
│   ├── hooks.ts
│   │
│   ├── health/
│   │   ├── HealthScore.tsx
│   │   ├── ScoreBreakdown.tsx
│   │   ├── ScoreHistory.tsx
│   │   └── HealthExplanation.tsx
│   │
│   ├── cash-flow/
│   │   ├── CashFlowCard.tsx
│   │   ├── CashFlowChart.tsx
│   │   └── CashFlowBreakdown.tsx
│   │
│   ├── spending/
│   │   ├── SpendingOverview.tsx
│   │   ├── CategoryTrends.tsx
│   │   └── SpendingVelocity.tsx
│   │
│   └── insights/
│       ├── InsightCard.tsx
│       ├── InsightList.tsx
│       └── InsightDetails.tsx
```

---

# 57. DATA PIPELINE

The most important architecture in Phase 3 is:

```text
                TRANSACTIONS
                     │
                     ↓
             TRANSACTION QUERY
                     │
                     ↓
              AGGREGATION LAYER
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Income     Expenses    Transfers
          │          │          │
          └──────────┼──────────┘
                     ↓
             FINANCIAL METRICS
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Cash Flow      Spending      Liquidity
       │             │             │
       └─────────────┼─────────────┘
                     ↓
              HEALTH SCORE
                     │
                     ↓
             EXPLANATION ENGINE
                     │
                     ↓
                  INSIGHTS
```

This is essentially your **Financial Intelligence Engine**.

---

# 58. DON'T USE AI YET

This is a very important architectural decision.

Your Phase 3 intelligence should primarily be:

```text
DETERMINISTIC
```

not:

```text
LLM
```

For example:

```text
Transactions
 ↓
SQL aggregation
 ↓
Mathematical calculations
 ↓
Rules
 ↓
Insight
```

NOT:

```text
Transactions
 ↓
Send everything to AI
 ↓
"AI, tell me my financial health."
```

The first approach is:

- cheaper
- predictable
- testable
- explainable
- faster
- safer

Then **Ciel in a later phase can communicate these results conversationally.**

---

# 59. TESTING THE INTELLIGENCE ENGINE

Create synthetic financial datasets.

### Test User A

```text
Income: ₱30,000
Expenses: ₱15,000
```

Expected:

```text
Net:
₱15,000

Savings:
50%
```

### Test User B

```text
Income: ₱30,000
Expenses: ₱35,000
```

Expected:

```text
Net:
-₱5,000

Savings:
Negative
```

### Test User C

```text
Income: ₱30,000
Expenses: ₱10,000
```

Expected:

```text
Net:
₱20,000
```

Then test:

```text
Transfers
```

to ensure they don't artificially increase income or expenses.

---

# 60. EDGE CASES

You need to explicitly handle:

```text
No transactions
```

Result:

> Not enough data to calculate your financial health.

---

```text
Only expenses
```

Don't automatically assume:

> Income = ₱0

and judge the user.

Instead:

> Your income data is incomplete.

---

```text
Only one month of data
```

Don't claim:

> Your spending trend is improving.

You need enough history.

---

```text
No debt data
```

Show:

```text
Debt
N/A
```

rather than:

```text
Debt
100/100
```

---

# 61. DATA CONFIDENCE LEVELS

I'd implement:

```text
LOW
MEDIUM
HIGH
```

Example:

### LOW

```text
< 30 days
```

> Limited financial history.

### MEDIUM

```text
30–90 days
```

> Enough data for basic trends.

### HIGH

```text
90+ days
```

> Stronger historical basis for comparisons.

These are **product heuristics**, not guarantees of actual financial completeness.

---

# 62. PHASE 3 DEVELOPMENT ORDER

Build it in this order:

```text
1. Financial period system
        ↓
2. Aggregation queries
        ↓
3. Cash-flow engine
        ↓
4. Income trends
        ↓
5. Expense trends
        ↓
6. Spending intelligence
        ↓
7. Spending baselines
        ↓
8. Discretionary spending
        ↓
9. Financial metrics
        ↓
10. Data confidence
        ↓
11. Health score components
        ↓
12. Health score engine
        ↓
13. Score history
        ↓
14. Explanation engine
        ↓
15. Insight rules
        ↓
16. Insight prioritization
        ↓
17. Financial dashboard
        ↓
18. Financial Health page
        ↓
19. Testing
        ↓
20. Phase 3 completion
```

---

# 63. PHASE 3 DEFINITION OF DONE

### Cash Flow

- [ ] Monthly cash flow
- [ ] Weekly cash flow
- [ ] Daily cash flow
- [ ] Income trend
- [ ] Expense trend
- [ ] Cash-flow stability
- [ ] Period comparison

### Spending Intelligence

- [ ] Top categories
- [ ] Category spending changes
- [ ] Spending trends
- [ ] Daily average
- [ ] Weekly average
- [ ] Monthly average
- [ ] Spending baseline
- [ ] Discretionary spending
- [ ] Essential spending

### Financial Metrics

- [ ] Savings rate
- [ ] Expense ratio
- [ ] Discretionary ratio
- [ ] Liquidity coverage
- [ ] Income consistency
- [ ] Expense consistency
- [ ] Cash-flow stability

### Financial Health

- [ ] Overall score
- [ ] Cash Flow score
- [ ] Savings score
- [ ] Spending score
- [ ] Liquidity score
- [ ] Debt score/N/A
- [ ] Dynamic weighting for unavailable data
- [ ] Score classification
- [ ] Score history

### Explanation

- [ ] Explain score
- [ ] Explain score changes
- [ ] Positive factors
- [ ] Negative factors
- [ ] Significant changes
- [ ] Recommendations
- [ ] Insight priority

### Data Quality

- [ ] Low-data handling
- [ ] Missing income handling
- [ ] Missing debt handling
- [ ] Data confidence
- [ ] No false-positive trends

### Testing

- [ ] Cash-flow tests
- [ ] Spending tests
- [ ] Metric tests
- [ ] Score tests
- [ ] Transfer tests
- [ ] Edge-case tests

---

# 64. THE FINAL PHASE 3 EXPERIENCE

The user opens the app and sees:

```text
                    FINANCIAL HEALTH

                       82 / 100
                          GOOD

        Your financial health is good, but
        spending has increased this month.

────────────────────────────────────────────

CASH FLOW

Income                 ₱30,000
Expenses               ₱18,500
Net Cash Flow          +₱11,500

Cash Flow Stability       84 / 100

────────────────────────────────────────────

SPENDING

Food                    ₱5,200   ↑23%
Transportation          ₱2,400    ↓8%
Bills                   ₱2,800    ↑4%
Shopping                ₱1,900   ↑15%

Average Daily Spending     ₱660

────────────────────────────────────────────

SAVINGS

Savings Rate               38%

Previous Month             44%

↓ 6 percentage points

────────────────────────────────────────────

INSIGHTS

⚠ Food spending increased 23%.

✓ Income increased 8%.

⚠ Your savings rate decreased
  from 44% to 38%.

────────────────────────────────────────────

DATA CONFIDENCE

● HIGH
Based on 5 months of transaction history.
```

And now the app can genuinely answer:

> **"How am I doing financially?"**

without needing an LLM.

The next phase can then build on this foundation rather than replacing it:

```text
PHASE 1
Identity + Database
        ↓
PHASE 2
Transactions + Money Tracking
        ↓
PHASE 3
Financial Intelligence
        ↓
PHASE 4
Financial Planning
        ↓
Safe-to-Spend
Goals
Budgets
Bills
Forecasting
        ↓
PHASE 5
Automation
        ↓
SMS / Notifications / Receipt OCR
        ↓
PHASE 6
Ciel
        ↓
Conversational Financial Assistant
```

**The key idea:** Phase 3 shouldn't just add more charts. It should create the **intelligence layer** that converts transaction data into standardized metrics, detects meaningful changes, calculates a transparent health score, and explains _why_ the user's financial situation looks the way it does.
