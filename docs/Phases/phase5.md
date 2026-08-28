# PHASE 5 — FORECASTING + WHAT-IF SIMULATOR

### Goal

Phase 4 answers:

> **"How much can I safely spend?"**

Phase 5 answers:

> **"What will my finances look like in the future?"**

and, more importantly:

> **"What happens if I make this decision?"**

This is where your app starts behaving like a **financial planning system**, rather than simply a budgeting/tracking app.

The architecture should be:

```text
                    HISTORICAL DATA
                          │
                    TRANSACTIONS
                          │
                          ↓
                 FINANCIAL ENGINE
                          │
          ┌───────────────┴───────────────┐
          ↓                               ↓
    CURRENT STATE                    FUTURE INPUTS
          │                               │
          │                    ┌──────────┼──────────┐
          │                    ↓          ↓          ↓
          │                 Income      Bills      Goals
          │
          └───────────────┬───────────────┘
                          ↓
                 FORECASTING ENGINE
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
       FINANCIAL FORECAST       WHAT-IF ENGINE
                                      │
                              ┌───────┼────────┐
                              ↓       ↓        ↓
                           Purchase Income   Expense
                              │       │        │
                              └───────┼────────┘
                                      ↓
                              SCENARIO RESULTS
                                      │
                                      ↓
                              RECOMMENDATION
```

---

# 1. PHASE 5 FEATURE MAP

```text
PHASE 5
│
├── Financial Forecast
│   ├── Forecast period
│   ├── Income forecast
│   ├── Expense forecast
│   ├── Cash balance forecast
│   ├── Savings forecast
│   ├── Cash-flow forecast
│   ├── Month-end forecast
│   ├── Multi-month forecast
│   ├── Goal completion forecast
│   ├── Shortage detection
│   └── Confidence indicator
│
├── Spending Forecast
│   ├── Category forecast
│   ├── Monthly expense forecast
│   ├── Spending trajectory
│   ├── Spending pace
│   └── End-of-period projection
│
├── What-If Simulator
│   ├── Purchase scenario
│   ├── Income scenario
│   ├── Expense scenario
│   ├── Savings scenario
│   ├── Debt scenario
│   └── Custom scenario
│
├── Scenario Comparison
│   ├── Compare scenarios
│   ├── Cash flow
│   ├── Savings
│   ├── Financial health
│   ├── Emergency coverage
│   ├── Goal impact
│   ├── Debt impact
│   └── Risk
│
└── Decision Analysis
    ├── Impact summary
    ├── Risk level
    ├── Goal delay
    ├── Cash-flow impact
    ├── Recommendation
    └── Explanation
```

---

# 2. FIRST: BUILD THE FORECASTING FOUNDATION

Before creating the fancy simulator UI, create a proper forecasting engine.

The engine needs to understand:

```text
CURRENT STATE
+
KNOWN FUTURE EVENTS
+
HISTORICAL BEHAVIOR
=
PROJECTED FUTURE
```

Current state comes from:

- Money sources
- Transactions
- Goals
- Bills
- Expected income
- Emergency reserve

Historical behavior comes from:

- Average spending
- Category spending
- Income history
- Spending trends
- Recurring transactions

Known future events come from:

- Upcoming bills
- Expected income
- Planned goal contributions
- Scheduled payments

---

# 3. FORECAST PERIODS

Allow the user to choose:

```text
7 DAYS
30 DAYS
END OF MONTH
3 MONTHS
6 MONTHS
12 MONTHS
CUSTOM
```

For the MVP, prioritize:

```text
30 DAYS
END OF MONTH
3 MONTHS
```

Then expand later.

---

# 4. FORECAST DATA MODEL

You don't necessarily need to store every forecast result in the database.

Most forecasts can be generated dynamically.

Create something like:

```text
forecast/
├── calculator.py
├── income_forecast.py
├── expense_forecast.py
├── balance_forecast.py
├── goal_forecast.py
├── cashflow_forecast.py
└── confidence.py
```

The backend calculates the forecast using existing financial data.

---

# 5. END-OF-MONTH FORECAST

Example:

```text
MONTH-END FORECAST

Expected income
₱30,000

Expected expenses
₱22,400

Expected savings
₱5,600

Projected remaining
₱7,600
```

But internally you should calculate:

```text
Current Money
+
Expected Income
-
Expected Expenses
=
Projected Money
```

---

# 6. FORECAST CURRENT MONEY

Example:

```text
GCash
₱8,500

Cash
₱2,000

BPI
₱15,000

────────────────
Current Money
₱25,500
```

This comes directly from Phase 2.

---

# 7. FORECAST EXPECTED INCOME

Use the expected income system from Phase 4.

Example:

```text
Salary
₱30,000
Sep 15
```

If the forecast period includes September 15:

```text
Expected Income
+₱30,000
```

If it doesn't:

```text
Expected Income
₱0
```

This makes the forecast date-aware.

---

# 8. FORECAST KNOWN EXPENSES

Known future expenses include:

```text
Upcoming Bills
+
Required Payments
+
Planned Goal Contributions
```

Example:

```text
Internet       ₱1,699
Electricity    ₱2,100
Credit Card    ₱2,500
Goal           ₱5,000
```

Known obligations:

```text
₱11,299
```

---

# 9. FORECAST VARIABLE EXPENSES

This is where historical behavior becomes useful.

Suppose the user historically spends:

```text
Food
₱7,500/month

Transportation
₱3,000/month

Entertainment
₱2,000/month
```

The forecast can estimate:

```text
Expected variable spending
₱12,500
```

So the total projected expense becomes:

```text
Known expenses
+
Expected variable spending
```

---

# 10. DO NOT ASSUME PERFECT PREDICTIONS

Your app should never tell the user:

> "You will have ₱7,600."

Instead:

> **"Based on your recent spending patterns and upcoming obligations, we estimate you'll have around ₱7,600 remaining."**

This distinction matters because forecasting is inherently uncertain.

---

# 11. FORECAST CONFIDENCE

Add:

```text
HIGH
MEDIUM
LOW
```

Example:

```text
MONTH-END FORECAST

₱7,600 projected remaining

Confidence:
HIGH
```

Why?

Because:

- income is regular
- bills are known
- transaction history is sufficient

---

# 12. LOW-CONFIDENCE EXAMPLE

If the user only has 5 days of transaction history:

```text
MONTH-END FORECAST

₱8,200 projected remaining

Confidence:
LOW

Your forecast is based on limited
spending history.
```

This is much more responsible than pretending the prediction is highly accurate.

---

# 13. SPENDING FORECAST

Create:

```text
Expected spending
```

based on historical spending.

Example:

```text
Last 3 months

June     ₱19,500
July     ₱21,200
August   ₱22,100
```

Trend:

```text
↑ Increasing
```

Projected:

```text
September
≈ ₱23,000
```

---

# 14. CATEGORY FORECAST

Break it down:

```text
SEPTEMBER FORECAST

Food
₱7,800

Transportation
₱3,100

Shopping
₱4,000

Entertainment
₱2,200

Bills
₱6,299

Other
₱1,500
```

Total:

```text
≈ ₱24,899
```

This connects directly to Phase 3 spending intelligence.

---

# 15. SPENDING TRAJECTORY

Create a chart:

```text
SPENDING TRAJECTORY

₱25k ┤                 ●
₱20k ┤          ●──────
₱15k ┤    ●─────
₱10k ┤
      └──────────────────
       Jun   Jul   Aug   Sep
                         ↑
                     Forecast
```

Clearly distinguish:

```text
Historical
Forecast
```

Don't make the forecast look like confirmed data.

---

# 16. CASH BALANCE FORECAST

This is one of the most useful features.

Example:

```text
CURRENT
Aug 28
₱25,500

        ↓

Sep 02
₱23,801

        ↓

Sep 05
₱21,301

        ↓

Sep 07
₱19,201

        ↓

Sep 15
+₱30,000

        ↓

Sep 30
₱34,000
```

The system should identify important events.

---

# 17. CASH-FLOW SHORTAGE DETECTION

Example:

```text
Current Money
₱10,000

Upcoming Bills
₱8,500

Expected Income
Sep 15
```

But bills are due before Sep 15.

The engine detects:

```text
⚠ CASH-FLOW RISK
```

And explains:

> You may have enough money for the month overall, but your current balance could fall below your required reserve before your next income.

That's a much more sophisticated insight.

---

# 18. LIQUIDITY WARNING

Example:

```text
Current balance
₱8,000

Upcoming obligations
₱9,500

Expected salary
₱30,000
```

The user isn't necessarily financially insolvent.

But they have a **timing problem**.

Display:

```text
⚠ TEMPORARY CASH SHORTAGE

Projected shortfall:
₱1,500

Expected income:
Sep 15
```

---

# 19. GOAL COMPLETION FORECAST

Phase 4 calculated:

```text
Required contribution
```

Phase 5 goes further.

Example:

```text
Gaming PC

Target:
₱70,000

Current:
₱35,000

Average contribution:
₱7,500/month
```

Remaining:

```text
₱35,000
```

Estimated completion:

```text
≈ 4.7 months
```

Display:

> **Estimated completion: January 2027**

---

# 20. GOAL DEADLINE RISK

Suppose:

```text
Deadline:
December 2026
```

but forecast says:

```text
January 2027
```

Display:

```text
⚠ GOAL AT RISK

At your current contribution pace,
you may miss your target by ~1 month.
```

Then:

> Increase your monthly contribution by approximately ₱1,200 to stay on schedule.

This is a strong example of actionable intelligence.

---

# 21. FORECAST API

Create:

```text
GET /api/v1/forecast
```

Parameters:

```text
period
start_date
end_date
```

Example:

```text
GET /api/v1/forecast?period=month_end
```

Response:

```json
{
  "current_money": 25500,
  "expected_income": 30000,
  "expected_expenses": 22400,
  "projected_savings": 5600,
  "projected_remaining": 33100,
  "cash_flow_status": "HEALTHY",
  "confidence": "HIGH"
}
```

---

# 22. NOW BUILD THE WHAT-IF ENGINE

This should **not modify the user's actual financial data**.

This is extremely important.

If the user asks:

> What if I buy a ₱50,000 laptop?

you should create a temporary scenario.

Never insert:

```text
₱50,000 expense
```

into the real transaction database.

Instead:

```text
REAL FINANCES
       │
       ├───────────────┐
       │               │
       ↓               ↓
  Current Data     Scenario
                    +₱50,000
                       │
                       ↓
                  Simulation
                       │
                       ↓
                 Scenario Result
```

---

# 23. SCENARIO OBJECT

You can represent a scenario internally as:

```text
Scenario
├── name
├── type
├── start_date
├── duration
└── changes
```

Example:

```text
name:
Buy Gaming Laptop

type:
PURCHASE

amount:
50000

date:
September 10
```

---

# 24. PURCHASE SCENARIO

User:

> What if I buy a ₱50,000 laptop?

System calculates:

```text
CURRENT MONEY
₱75,000

PURCHASE
-₱50,000

REMAINING
₱25,000
```

But don't stop there.

Calculate impact on:

```text
Cash flow
Savings
Emergency reserve
Goals
Safe-to-spend
Financial health
```

---

# 25. PURCHASE IMPACT

Example:

```text
WHAT IF?

Buy laptop
₱50,000

──────────────────

Cash
₱75,000 → ₱25,000

Emergency coverage
4.2 months → 1.4 months

Gaming PC goal
Dec 2026 → Feb 2027

Financial Health
82 → 68

Risk
LOW → HIGH
```

This is much more useful than simply saying:

> "You will have ₱25,000 left."

---

# 26. INCOME SCENARIO

User:

> What if my income decreases by ₱5,000?

Create:

```text
Current expected income
₱30,000

Scenario income
₱25,000
```

Recalculate:

```text
Cash flow
Savings
Safe-to-spend
Goals
Financial health
```

Example:

```text
Expected savings

Current:
₱8,000

Scenario:
₱3,000

Difference:
-₱5,000
```

---

# 27. EXPENSE SCENARIO

User:

> What if rent increases by ₱3,000?

Scenario:

```text
Rent
₱10,000
↓
₱13,000
```

Impact:

```text
Monthly expenses
+₱3,000

Monthly savings
-₱3,000

Goal completion
+1 month

Safe-to-spend
₱1,000/day
↓
₱900/day
```

---

# 28. SAVINGS SCENARIO

User:

> What if I save ₱5,000/month?

Create:

```text
Monthly goal contribution
+₱5,000
```

Then calculate:

```text
Goal completion date
Emergency fund growth
Remaining flexible money
Safe-to-spend
```

Example:

```text
Gaming PC

Current:
₱35,000

Monthly:
₱5,000

Estimated completion:
March 2027
```

Then try:

```text
₱8,000/month
```

Result:

```text
Estimated completion:
December 2026
```

---

# 29. DEBT SCENARIO

This requires careful design.

User:

> What if I take a ₱50,000 loan?

You need more information:

```text
Loan amount
₱50,000

Interest rate
10%

Term
12 months

Payment frequency
Monthly
```

Then calculate:

```text
Monthly payment
Total repayment
Total interest
Cash-flow impact
Debt burden
Goal impact
Emergency coverage
```

Example:

```text
Loan
₱50,000

Monthly payment
≈ ₱4,396

Total repayment
≈ ₱52,752

Interest
≈ ₱2,752
```

Use an appropriate amortization formula rather than simply dividing the principal if interest is involved.

---

# 30. CUSTOM SCENARIO

Eventually allow:

```text
CUSTOM SCENARIO
```

User can change:

```text
Income
Expenses
Bills
Goal contributions
Purchase
Debt
Savings
```

Example:

```text
Scenario:
Move to Manila

Income
+₱5,000

Rent
+₱8,000

Transportation
+₱2,000

Food
+₱1,500
```

Then simulate the combined effect.

---

# 31. SCENARIO TYPES

Backend enum:

```text
PURCHASE
INCOME_CHANGE
EXPENSE_CHANGE
SAVINGS_CHANGE
DEBT
CUSTOM
```

Later:

```text
JOB_CHANGE
MOVE
TUITION
EMERGENCY
MAJOR_PURCHASE
```

---

# 32. SCENARIO COMPARISON

This is where the feature becomes especially portfolio-worthy.

Suppose:

> I want a ₱50,000 laptop.

Create:

```text
OPTION A
Buy now

OPTION B
Buy in 3 months

OPTION C
Buy ₱35,000 model
```

Then compare them.

---

# 33. COMPARISON TABLE

```text
                         A          B          C

Cost                  ₱50k       ₱50k       ₱35k

Buy date              Now        +3 mo      Now

Remaining cash        ₱25k       ₱40k       ₱40k

Emergency coverage    1.4 mo     2.2 mo     2.2 mo

Goal completion       Feb        Dec        Jan

Health score          68         78         75

Risk                  HIGH       LOW        MEDIUM
```

---

# 34. FINANCIAL HEALTH IMPACT

Use the Phase 3 Financial Health Score.

Don't build a completely separate score.

Instead:

```text
Current Health
      ↓
Scenario changes financial data
      ↓
Recalculate Health
      ↓
Compare
```

Example:

```text
CURRENT

82 / 100
GOOD
```

Scenario:

```text
74 / 100
GOOD
```

Difference:

```text
-8
```

---

# 35. HEALTH SCORE BREAKDOWN

Example:

```text
                    CURRENT    SCENARIO

Cash Flow              85         72
Liquidity              80         60
Savings                84         75
Spending               82         80
Debt                   90         90

TOTAL                  82         74
```

This lets the user understand **why** the scenario changes their score.

---

# 36. GOAL IMPACT

Every scenario should check active goals.

Example:

```text
Gaming PC

Current target:
Dec 2026

After purchase:
Feb 2027

Delay:
2 months
```

Display:

> This purchase could delay your Gaming PC goal by approximately 2 months.

---

# 37. EMERGENCY RESERVE IMPACT

Example:

```text
Current reserve coverage:
3.5 months

After purchase:
1.2 months
```

Then:

```text
⚠ Your emergency buffer would decrease significantly.
```

This is much more meaningful than simply showing the remaining balance.

---

# 38. RISK ENGINE

Create a simple initial risk system:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Potential factors:

```text
Emergency reserve breach
Negative projected balance
Large cash-flow reduction
Goal deadline failure
Debt burden increase
Safe-to-spend reduction
```

Example:

```text
Purchase ₱10,000
→ LOW

Purchase ₱40,000
→ MEDIUM

Purchase ₱70,000
→ HIGH

Purchase ₱100,000
→ CRITICAL
```

The thresholds should be based on the user's financial situation rather than arbitrary fixed amounts wherever possible.

---

# 39. SCENARIO RESULT

After simulation:

```text
YOUR SCENARIO

Buy ₱50,000 Laptop

──────────────────────

Financial Impact
-₱50,000 cash

Cash Flow
⚠ Reduced

Emergency Coverage
2.8 → 1.3 months

Gaming PC Goal
Dec → Feb

Health Score
82 → 68

Risk
HIGH
```

Then:

> **Recommendation**

> This purchase is possible, but it would significantly reduce your emergency buffer and delay your Gaming PC goal by approximately two months.

---

# 40. DON'T MAKE THE APP DECIDE FOR THE USER

Avoid:

> **"You should not buy this."**

Instead:

> **"This purchase would reduce your emergency coverage and delay your goal. Consider waiting until your next income or choosing a lower-cost option."**

The app provides **decision support**, not absolute financial advice.

---

# 41. SCENARIO SAVE SYSTEM

Allow users to save scenarios.

Example:

```text
MY SCENARIOS

Laptop Purchase
₱50,000

New Apartment
₱15,000/month

Save ₱5,000/month

Lower Income
-₱5,000/month
```

Database:

```text
scenarios
────────────────────
id
user_id
name
type
description
created_at
```

Then:

```text
scenario_changes
────────────────────
id
scenario_id
field
operation
value
start_date
end_date
```

---

# 42. SHOULD SCENARIOS MODIFY REAL DATA?

**No.**

Keep this architecture:

```text
                    REAL DATABASE
                          │
                          ↓
                   USER FINANCIAL STATE
                          │
                          ↓
                  ┌───────────────┐
                  │ SCENARIO COPY │
                  └───────┬───────┘
                          ↓
                     SIMULATION
                          ↓
                     RESULTS
```

The scenario operates on a temporary copy/state.

---

# 43. WHAT-IF API

Create:

```text
POST /api/v1/simulations
```

Request:

```json
{
  "name": "Buy Laptop",
  "type": "PURCHASE",
  "changes": [
    {
      "amount": 50000,
      "date": "2026-09-10"
    }
  ]
}
```

Response:

```json
{
  "current": {
    "cash": 75000,
    "health_score": 82
  },
  "scenario": {
    "cash": 25000,
    "health_score": 68
  },
  "impact": {
    "cash_change": -50000,
    "health_change": -14
  },
  "risk": "HIGH"
}
```

---

# 44. SIMULATION ENGINE

Structure your backend:

```text
services/
│
├── forecasting/
│   ├── forecast_service.py
│   ├── income_forecast.py
│   ├── expense_forecast.py
│   ├── cashflow_forecast.py
│   ├── balance_forecast.py
│   ├── goal_forecast.py
│   └── confidence.py
│
└── simulation/
    ├── simulation_service.py
    ├── scenario_engine.py
    ├── purchase.py
    ├── income.py
    ├── expenses.py
    ├── savings.py
    ├── debt.py
    ├── comparison.py
    ├── impact.py
    └── risk.py
```

---

# 45. FRONTEND STRUCTURE

Add:

```text
features/
│
├── forecasting/
│   ├── api.ts
│   ├── types.ts
│   ├── hooks.ts
│   ├── ForecastCard.tsx
│   ├── ForecastChart.tsx
│   ├── CashBalanceForecast.tsx
│   ├── SpendingForecast.tsx
│   ├── GoalForecast.tsx
│   ├── ForecastBreakdown.tsx
│   └── ForecastConfidence.tsx
│
└── simulator/
    ├── api.ts
    ├── types.ts
    ├── hooks.ts
    ├── Simulator.tsx
    ├── ScenarioForm.tsx
    ├── PurchaseScenario.tsx
    ├── IncomeScenario.tsx
    ├── ExpenseScenario.tsx
    ├── SavingsScenario.tsx
    ├── DebtScenario.tsx
    ├── ScenarioResult.tsx
    ├── ScenarioComparison.tsx
    ├── ImpactBreakdown.tsx
    ├── RiskIndicator.tsx
    └── Recommendation.tsx
```

---

# 46. FORECAST DASHBOARD

Add a new section:

```text
FINANCIAL FORECAST

End of Month

┌─────────────────────────────┐
│ Projected Remaining         │
│                             │
│ ₱7,600                      │
│                             │
│ Expected Savings            │
│ ₱5,600                      │
│                             │
│ Confidence: HIGH            │
└─────────────────────────────┘
```

Then:

```text
Cash Balance Forecast

₱50k ┤                 ●
₱40k ┤             ●───
₱30k ┤       ●─────
₱20k ┤ ●─────
      └────────────────────
       Aug Sep Oct Nov
```

---

# 47. SIMULATOR UI

Create:

```text
/financial/simulator
```

Landing screen:

```text
WHAT IF?

Explore how a financial decision
could affect your future.

[ Buy something ]

[ Change my income ]

[ Change an expense ]

[ Change my savings ]

[ Take a loan ]

[ Custom scenario ]
```

---

# 48. PURCHASE FLOW

User clicks:

```text
Buy something
```

Show:

```text
WHAT ARE YOU BUYING?

Name
[ Gaming Laptop ]

Price
[ ₱50,000 ]

Purchase Date
[ Sep 10 ]

[ Simulate ]
```

Then:

```text
ANALYZING...

Current financial state
✓

Upcoming obligations
✓

Goals
✓

Emergency reserve
✓

Forecast
✓
```

Result:

```text
SCENARIO RESULT
```

---

# 49. COMPARE SCENARIOS UI

Allow:

```text
+ Add Scenario
```

Then:

```text
COMPARE OPTIONS

       Buy Now   Wait 3 Mo   Cheaper

Cash      ₱25k      ₱40k       ₱40k
Health      68        78         75
Goal      Feb       Dec        Jan
Risk      HIGH       LOW       MEDIUM
```

Highlight the differences.

---

# 50. PHASE 5 DEVELOPMENT ORDER

Build it sequentially:

```text
1. Forecasting architecture
        ↓
2. Forecast data aggregation
        ↓
3. Income forecasting
        ↓
4. Known expense forecasting
        ↓
5. Variable expense forecasting
        ↓
6. Cash balance forecasting
        ↓
7. Cash-flow forecasting
        ↓
8. Month-end forecast
        ↓
9. Spending trajectory
        ↓
10. Goal completion forecast
        ↓
11. Forecast confidence
        ↓
12. Forecast dashboard
        ↓
13. Simulation architecture
        ↓
14. Scenario state/copy
        ↓
15. Purchase simulation
        ↓
16. Income simulation
        ↓
17. Expense simulation
        ↓
18. Savings simulation
        ↓
19. Debt simulation
        ↓
20. Impact calculation
        ↓
21. Risk engine
        ↓
22. Goal impact
        ↓
23. Health score comparison
        ↓
24. Scenario comparison
        ↓
25. Save scenarios
        ↓
26. Recommendations
        ↓
27. Testing
```

---

# 51. TEST CASE 1 — NORMAL FORECAST

Create:

```text
Current money:
₱25,500

Expected income:
₱30,000

Bills:
₱6,299

Variable expenses:
₱12,000

Goal contribution:
₱5,000
```

Expected calculation:

```text
25,500
+30,000
-6,299
-12,000
-5,000
────────
32,201
```

The forecast should show approximately:

```text
Projected remaining:
₱32,201
```

---

# 52. TEST CASE 2 — CASH SHORTAGE

```text
Current:
₱8,000

Bills:
₱12,000

Income:
Sep 15
```

The engine should identify:

```text
⚠ TEMPORARY CASH SHORTAGE
```

rather than simply reporting:

```text
Monthly income > monthly expenses
```

---

# 53. TEST CASE 3 — LARGE PURCHASE

Current:

```text
₱75,000
```

Scenario:

```text
Laptop
₱50,000
```

Verify:

```text
Scenario cash:
₱25,000
```

Then verify:

```text
Emergency coverage ↓
Goal progress ↓
Health score ↓
Risk ↑
```

---

# 54. TEST CASE 4 — INCOME LOSS

Current:

```text
Income:
₱30,000
```

Scenario:

```text
Income:
₱25,000
```

Verify:

```text
Cash flow ↓
Savings ↓
Safe-to-spend ↓
Goal completion delayed
```

---

# 55. TEST CASE 5 — GOAL SCENARIO

Current:

```text
Goal:
₱70,000

Current:
₱35,000
```

Scenario A:

```text
Save ₱5,000/month
```

Scenario B:

```text
Save ₱10,000/month
```

Compare:

```text
Scenario A
completion ≈ 7 months

Scenario B
completion ≈ 4 months
```

The exact result depends on the starting date and contribution timing.

---

# 56. TEST CASE 6 — DEBT

Scenario:

```text
Loan:
₱50,000

Interest:
10%

Term:
12 months
```

Verify:

```text
Monthly payment
Total interest
Total repayment
Debt impact
Cash-flow impact
```

Also verify that the simulation **doesn't create a real debt transaction**.

---

# 57. PHASE 5 DEFINITION OF DONE

### Forecasting

- [ ] Forecast period
- [ ] Current financial state
- [ ] Expected income
- [ ] Known future expenses
- [ ] Variable expense prediction
- [ ] End-of-month forecast
- [ ] Projected remaining money
- [ ] Expected savings
- [ ] Cash-flow forecast
- [ ] Cash shortage detection
- [ ] Spending trajectory
- [ ] Category forecast
- [ ] Goal completion forecast
- [ ] Goal deadline risk
- [ ] Forecast confidence

### What-If

- [ ] Purchase scenario
- [ ] Income scenario
- [ ] Expense scenario
- [ ] Savings scenario
- [ ] Debt scenario
- [ ] Custom scenario
- [ ] Scenario doesn't modify real data
- [ ] Scenario results
- [ ] Financial health impact
- [ ] Cash-flow impact
- [ ] Savings impact
- [ ] Goal impact
- [ ] Emergency reserve impact
- [ ] Debt impact
- [ ] Safe-to-spend impact
- [ ] Risk level

### Comparison

- [ ] Multiple scenarios
- [ ] Side-by-side comparison
- [ ] Best/worst metric
- [ ] Goal comparison
- [ ] Health comparison
- [ ] Cash comparison
- [ ] Risk comparison
- [ ] Save scenario
- [ ] Delete scenario

---

# 58. THE BIG PICTURE AFTER PHASE 5

Your app's intelligence progression now becomes:

```text
PHASE 2
WHAT HAPPENED?

Transactions
     ↓
Money Tracking
```

```text
PHASE 3
HOW AM I DOING?

Transactions
     ↓
Analytics
     ↓
Financial Health
```

```text
PHASE 4
WHAT CAN I SAFELY SPEND?

Current Money
+
Future Obligations
+
Goals
+
Reserve
     ↓
Safe-to-Spend
```

```text
PHASE 5
WHAT WILL HAPPEN?

Historical Data
+
Current State
+
Known Future Events
     ↓
FORECAST
```

And:

```text
WHAT IF I DO THIS?

Current State
     ↓
Scenario
     ↓
Simulation
     ↓
Financial Impact
     ↓
Risk
     ↓
Goal Impact
     ↓
Decision Support
```

### Most importantly, keep the architecture deterministic.

**Don't make AI responsible for the math.**

Your backend should calculate:

```text
transactions
      ↓
financial engine
      ↓
forecast
      ↓
simulation
      ↓
results
```

Then, when you eventually introduce **Ciel**, Ciel can sit _on top_ of this engine:

> **User:** "Can I afford a ₱50,000 laptop?"

```text
Ciel
 ↓
Financial Engine
 ↓
Safe-to-Spend
 ↓
Forecast
 ↓
What-If Simulation
 ↓
Goal Impact
 ↓
Risk
 ↓
Ciel explains result
```

That separation will make the project significantly stronger from a **software-engineering perspective** because your financial calculations remain testable and deterministic, while AI becomes the natural-language interface to the system rather than an unreliable calculator.
