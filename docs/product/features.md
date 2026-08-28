Since you **already have the main UI skeleton and login UI**, I would remove those from the roadmap and start from the point where the app becomes functional.

I’d use **8 development phases**. Each phase should produce a usable system before moving to the next.

# Financial OS — Development Phases

```text
PHASE 1
Core Data Foundation
        ↓
PHASE 2
Transaction & Money Tracking
        ↓
PHASE 3
Financial Intelligence
        ↓
PHASE 4
Goals, Bills & Safe-to-Spend
        ↓
PHASE 5
Forecasting & What-If Simulator
        ↓
PHASE 6
Ciel AI
        ↓
PHASE 7
Automation & Financial Autopilot
        ↓
PHASE 8
Security, Privacy & Polish
```

---

# PHASE 1 — CORE DATA FOUNDATION

**Goal:** Make the existing UI actually connected to a backend/database.

You already have:

- ✅ Main UI skeleton
- ✅ Login UI

Now build the underlying foundation.

### Authentication functionality

- [ ] Connect login to backend
- [ ] Registration
- [ ] Password hashing
- [ ] Sessions/JWT
- [ ] Protected routes
- [ ] Logout
- [ ] User profile

### Database

Create the fundamental tables:

```text
users
money_sources
transactions
categories
```

### Money Sources

Remember: **these are NOT connected bank accounts.**

They're simply labels for where money is tracked.

```text
GCash
Cash
Maya
BPI
Other
```

No API connection.

### Basic backend architecture

```text
Frontend
   ↓
FastAPI
   ↓
Services
   ↓
Database
```

### Phase 1 milestone

You should be able to:

> Register → Login → Enter dashboard → User data persists → Logout → Login again

---

# PHASE 2 — TRANSACTIONS & MONEY TRACKING

**Goal:** Make the app genuinely usable for everyday money tracking.

## Transactions

Build:

- [ ] Add expense
- [ ] Add income
- [ ] Add transfer
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Transaction history
- [ ] Search
- [ ] Filter
- [ ] Sort
- [ ] Date selection
- [ ] Notes
- [ ] Transaction details

### Categories

Start with:

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

Then:

- [ ] Create custom category
- [ ] Edit category
- [ ] Delete category
- [ ] Category icon

### Money source tracking

For example:

```text
GCash
₱8,500

Cash
₱2,000

BPI
₱15,000
```

Again, these are **manually maintained sources**, not linked accounts.

### Basic calculations

```text
Total Money
Total Income
Total Expenses
Net Cash Flow
```

### Basic analytics

- [ ] Spending by category
- [ ] Income vs expenses
- [ ] Monthly spending
- [ ] Daily spending
- [ ] Transaction trends

### Phase 2 milestone

You can now demonstrate:

> **"I can use this app every day to track my finances."**

---

# PHASE 3 — FINANCIAL INTELLIGENCE ENGINE

**Goal:** Transform raw transactions into useful financial information.

This is where the app starts becoming more than a tracker.

## Cash Flow Engine

Calculate:

```text
Income
-
Expenses
=
Net Cash Flow
```

Track:

- [ ] Monthly cash flow
- [ ] Weekly cash flow
- [ ] Income trend
- [ ] Expense trend
- [ ] Cash-flow stability

---

## Spending Intelligence

Detect:

- [ ] Highest spending categories
- [ ] Spending trends
- [ ] Spending changes
- [ ] Average daily spending
- [ ] Average weekly spending
- [ ] Average monthly spending
- [ ] Discretionary spending

Example:

> Food spending increased **23%** compared with your previous month.

---

# Financial Health Score

Create your main score.

```text
FINANCIAL HEALTH

82 / 100
GOOD
```

Possible components:

```text
Cash Flow
Liquidity
Debt
Savings
Spending
```

Then create the explanation engine.

Instead of:

> Score = 72

show:

> Your score decreased because your monthly expenses increased while your savings rate declined.

### Phase 3 milestone

The app can answer:

> **"How am I doing financially?"**

---

# PHASE 4 — GOALS + BILLS + SAFE-TO-SPEND

I'd combine these because they all affect the user's available money.

---

## Financial Goals

Build:

- [ ] Create goal
- [ ] Target amount
- [ ] Current amount
- [ ] Deadline
- [ ] Priority
- [ ] Goal progress
- [ ] Contribution
- [ ] Contribution history
- [ ] Goal status

Example:

```text
Gaming PC

₱35,000 / ₱70,000

50%

Target:
December 2026
```

---

## Bills

Build:

- [ ] Add bill
- [ ] Amount
- [ ] Due date
- [ ] Recurring bill
- [ ] Frequency
- [ ] Bill category
- [ ] Mark as paid
- [ ] Upcoming bills
- [ ] Bill history

Example:

```text
UPCOMING

Internet       ₱1,699
Due Sep 2

Credit Card    ₱2,500
Due Sep 5

Electricity    ₱2,100
Due Sep 7
```

---

# Safe-to-Spend Engine

This becomes one of your **signature features**.

Calculate:

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
       ↓
Flexible Money
       ↓
Safe-to-Spend
```

Display:

```text
SAFE TO SPEND

₱428

TODAY
```

Also:

- [ ] Daily safe-to-spend
- [ ] Weekly safe-to-spend
- [ ] Until-payday spending
- [ ] Spending pace
- [ ] Safe-to-spend forecast
- [ ] Overspending warning

### Phase 4 milestone

The user can ask:

> **"How much can I safely spend right now?"**

And your system calculates an answer.

---

# PHASE 5 — FORECASTING + WHAT-IF SIMULATOR

Now your app can move from:

> **What happened?**

to:

> **What will happen?**

and:

> **What if I do this?**

---

## Financial Forecast

Predict:

- [ ] End-of-month spending
- [ ] End-of-month remaining money
- [ ] Expected savings
- [ ] Cash-flow shortage
- [ ] Goal completion date
- [ ] Spending trajectory

Example:

```text
MONTH-END FORECAST

Expected income     ₱30,000
Expected expenses   ₱22,400
Expected savings     ₱5,600

Projected remaining
₱7,600
```

---

# What-If Simulator

### Purchase

> What if I buy a ₱50,000 laptop?

### Income

> What if my income decreases by ₱5,000?

### Expense

> What if rent increases by ₱3,000?

### Savings

> What if I save ₱5,000/month?

### Debt

> What if I take a ₱50,000 loan?

---

## Scenario Comparison

Allow:

```text
OPTION A
Buy now

OPTION B
Wait 3 months

OPTION C
Buy cheaper model
```

Compare:

- Financial health
- Cash flow
- Savings
- Emergency coverage
- Goal completion
- Debt
- Risk

### Phase 5 milestone

Your app can answer:

> **"What happens to my financial future if I make this decision?"**

This is a major portfolio-worthy feature.

---

# PHASE 6 — CIEL AI

**Do Ciel AFTER your financial engines.**

This is very important.

Ciel should not be responsible for doing financial mathematics itself.

Instead:

```text
                CIEL
                  ↓
           Understand user
                  ↓
            Call a tool
                  ↓
        Financial Engine
                  ↓
             Result
                  ↓
          Ciel explains
```

---

## Ciel Tools

Give Ciel access to:

```text
get_transactions()

get_financial_health()

get_safe_to_spend()

get_goals()

get_bills()

get_spending_analysis()

get_forecast()

simulate_purchase()

simulate_income_change()

simulate_expense_change()
```

---

## Questions Ciel should answer

### Money

> "Where did my money go?"

> "What am I spending the most on?"

### Financial health

> "Why is my score only 72?"

### Spending

> "Am I spending too much on food?"

### Goals

> "Can I reach ₱50,000 by December?"

### Safe-to-spend

> "Can I spend ₱1,000 today?"

### Simulator

> "Can I afford a ₱40k laptop?"

### Planning

> "How should I manage my money this month?"

---

# Ciel Daily Briefing

Eventually:

```text
GOOD MORNING 👋

Your Financial Briefing

💰 Safe to spend
₱428 today

📅 Upcoming
Internet bill in 3 days

🎯 Goal
Laptop — ON TRACK

⚠️ Watch
Food spending is 18% above normal

💡 Ciel recommends
Keep discretionary spending below ₱350 today.
```

### Phase 6 milestone

Ciel becomes:

> **The conversational interface for your entire Financial OS.**

---

# PHASE 7 — AUTOMATION + FINANCIAL AUTOPILOT

Now reduce manual work.

This is where your no-bank-linking philosophy becomes particularly useful.

---

# Transaction Capture

## SMS Parser

```text
SMS
 ↓
Parser
 ↓
Amount
Merchant
Date
Type
 ↓
Category
 ↓
User Confirmation
 ↓
Transaction
```

---

## Notification Parser

For supported notifications:

```text
GCash notification
       ↓
Detection
       ↓
Transaction extraction
       ↓
Confirmation
```

---

## Receipt Scanner

```text
Receipt
 ↓
OCR
 ↓
Merchant
Amount
Date
Items
 ↓
Category
 ↓
Transaction
```

---

## CSV Import

- [ ] Upload CSV
- [ ] Column mapping
- [ ] Detect duplicates
- [ ] Categorization
- [ ] Import preview
- [ ] Confirmation

---

# Financial Autopilot

Now the system continuously analyzes the user's data.

Detect:

### Spending

- [ ] Unusual spending
- [ ] Spending too fast
- [ ] Category spike
- [ ] Merchant anomaly

### Bills

- [ ] Upcoming bill
- [ ] Missed bill
- [ ] Bill increase

### Goals

- [ ] Goal at risk
- [ ] Goal ahead
- [ ] Recommended contribution

### Cash flow

- [ ] Projected shortage
- [ ] Excess available money
- [ ] Low reserve

Then proactively notify the user.

Example:

> ⚠️ You're spending 24% faster than your normal pace this week.

### Phase 7 milestone

The app doesn't just wait for the user to ask questions.

> **It watches the user's financial situation and brings important information to them.**

---

# PHASE 8 — SECURITY + PRIVACY + POLISH

This is the final major phase.

## Scam Detector

User:

> "Is this message a scam?"

System analyzes:

- [ ] Urgency
- [ ] Suspicious links
- [ ] Requests for credentials
- [ ] Threat language
- [ ] Social engineering
- [ ] Risk score
- [ ] Explanation

Example:

```text
HIGH RISK

94%

⚠️ Suspicious link
⚠️ Urgency language
⚠️ Requests sensitive information
```

---

## Transaction Anomaly Detection

Detect:

```text
Normal:
₱100–₱500

New:
₱8,500
```

Then:

> ⚠️ This transaction is significantly higher than your normal spending pattern.

Don't claim it is fraud—call it **unusual activity**.

---

# Privacy Center

This is especially important given your no-account-linking philosophy.

Show:

```text
YOUR FINANCIAL DATA

Bank credentials
✓ Never collected

GCash password
✓ Never collected

Transactions
✓ User controlled

Receipts
✓ User controlled

Imported data
✓ User controlled
```

Features:

- [ ] Export data
- [ ] Delete transactions
- [ ] Delete receipts
- [ ] Delete imported data
- [ ] Delete account
- [ ] AI privacy controls
- [ ] Data-processing controls

---

# Final Roadmap

So if you're **starting development now**, I'd follow this exact order:

```text
╔══════════════════════════════════════╗
║ PHASE 1 — CORE FOUNDATION            ║
║ Auth functionality + Database        ║
╚══════════════════════╤═══════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 2 — MONEY TRACKING             ║
║ Transactions + Categories            ║
║ Money Sources + Analytics             ║
╚══════════════════════╤═══════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 3 — FINANCIAL INTELLIGENCE     ║
║ Health Score + Spending Analysis     ║
║ Cash Flow + Explanations              ║
╚══════════════════════╤═══════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 4 — FINANCIAL PLANNING         ║
║ Goals + Bills + Safe-to-Spend        ║
║ Adaptive Savings                      ║
╚══════════════════════╤═══════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 5 — PREDICTION                 ║
║ Forecasting + What-If Simulator      ║
╚══════════════════════════════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 6 — CIEL AI                    ║
║ AI Assistant + Financial Tools       ║
╚══════════════════════════════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 7 — AUTOMATION                 ║
║ SMS + Notifications + OCR + CSV      ║
║ Financial Autopilot                   ║
╚══════════════════════════════════════╝
                       ↓
╔══════════════════════════════════════╗
║ PHASE 8 — SECURITY & POLISH          ║
║ Scam Detection + Anomalies           ║
║ Privacy + Performance + Testing      ║
╚══════════════════════════════════════╝
```

## What I would consider your MVP

Don't try to reach Phase 8 before calling it an MVP.

Your **strong MVP** should be:

**Phase 1 → Phase 5**

That gives you:

> **Track money → understand financial health → know what you can spend → plan goals → predict the future → simulate decisions.**

Then **Phase 6 (Ciel)** turns that into a very compelling AI portfolio project.

And **Phase 7–8** are your advanced differentiators.

The biggest architectural rule I'd follow throughout development is:

> **Build the financial engines first. Ciel sits on top of them.**

That prevents the common mistake of building an impressive-looking AI chatbot that doesn't actually understand the user's finances.
