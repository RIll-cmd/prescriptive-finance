# Engines Specification & Mathematical Models — Financial OS

## 1. Executive Summary

Financial OS replaces subjective budgeting guesswork with **deterministic mathematical models**. All core financial calculations are computed via pure, stateless functions with 100% unit-testable invariance.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      DETERMINISTIC ENGINES SUITE                        │
├───────────────────────────────────┬─────────────────────────────────────┤
│ 1. Financial Health Engine        │ Multi-Pillar Weighted Score (0–100) │
│ 2. Safe-to-Spend Engine           │ Dynamic Daily Spending Allowance    │
│ 3. Spending Velocity Engine       │ Burn Rate & Payday Runway Predictor │
│ 4. Adaptive Savings Engine        │ Fluid Non-Linear Goal Allocator     │
│ 5. What-If Simulation Engine      │ Multi-Scenario Macro Impact Matrix  │
└───────────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. Engine 1: Financial Health Engine (0–100 Score)

### Composite Formula
$$\text{Health Score} = \text{round}\Big(0.30 \cdot C + 0.25 \cdot E + 0.20 \cdot D + 0.15 \cdot S + 0.10 \cdot R\Big)$$

### Pillar Sub-Score Formulations

#### 1. Cash Flow Resiliency ($C \in [0, 100]$) — 30% Weight
Measures the net monthly income retention after accounting for fixed and variable expenses:
$$\text{Net Cash Flow Ratio} (\text{NCFR}) = \frac{\text{Monthly Income} - \text{Total Monthly Outflows}}{\text{Monthly Income}}$$
$$C = \begin{cases} 
100 & \text{if } \text{NCFR} \ge 0.30 \\
50 + \Big(\frac{\text{NCFR}}{0.30}\Big) \cdot 50 & \text{if } 0 \le \text{NCFR} < 0.30 \\
\max\Big(0, 50 + \Big(\frac{\text{NCFR}}{0.20}\Big) \cdot 50\Big) & \text{if } \text{NCFR} < 0 
\end{cases}$$

#### 2. Emergency Liquidity ($E \in [0, 100]$) — 25% Weight
Measures months of essential baseline living expenses ($M_{\text{essential}}$) covered by liquid accounts:
$$\text{Months Covered} (L) = \frac{\sum \text{Liquid Balances}}{\text{Monthly Fixed Bills} + \text{Essential Groceries/Transport}}$$
$$E = \begin{cases}
100 & \text{if } L \ge 6.0 \\
70 + \Big(\frac{L - 3.0}{3.0}\Big) \cdot 30 & \text{if } 3.0 \le L < 6.0 \\
40 + \Big(\frac{L - 1.0}{2.0}\Big) \cdot 30 & \text{if } 1.0 \le L < 3.0 \\
\max\Big(0, L \cdot 40\Big) & \text{if } L < 1.0
\end{cases}$$

#### 3. Debt-to-Income Ratio ($D \in [0, 100]$) — 20% Weight
Measures the monthly debt servicing pressure ($P_{\text{debt}}$) relative to gross income:
$$\text{DTI} = \frac{\sum \text{Monthly Minimum Debt Payments}}{\text{Gross Monthly Income}}$$
$$D = \begin{cases}
100 & \text{if } \text{DTI} \le 0.10 \\
80 + \Big(\frac{0.20 - \text{DTI}}{0.10}\Big) \cdot 20 & \text{if } 0.10 < \text{DTI} \le 0.20 \\
50 + \Big(\frac{0.36 - \text{DTI}}{0.16}\Big) \cdot 30 & \text{if } 0.20 < \text{DTI} \le 0.36 \\
\max\Big(0, 50 - \Big(\frac{\text{DTI} - 0.36}{0.24}\Big) \cdot 50\Big) & \text{if } \text{DTI} > 0.36
\end{cases}$$

#### 4. Savings Consistency ($S \in [0, 100]$) — 15% Weight
Evaluates historical target contribution completion rate over the trailing 90 days:
$$S = \min\Big(100, \frac{\sum \text{Actual Savings Transfers}}{\sum \text{Target Savings Commitments}} \times 100\Big)$$

#### 5. Discretionary Restraint ($R \in [0, 100]$) — 10% Weight
Penalizes high variance and impulse spikes against the 3-month trailing discretionary spending baseline ($\mu_{\text{discretionary}}$):
$$\text{Spend Variance Ratio} (V) = \frac{\text{Current Month Discretionary Spend}}{\mu_{\text{discretionary}}}$$
$$R = \begin{cases}
100 & \text{if } V \le 1.00 \\
\max\Big(0, 100 - (V - 1.00) \times 150\Big) & \text{if } V > 1.00
\end{cases}$$

---

## 3. Engine 2: Real-Time Safe-to-Spend Engine

The Safe-to-Spend Engine calculates the exact amount of money a user can safely spend *today* without causing overdrafts or missing bills before their next payday.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       SAFE-TO-SPEND CALCULATION                         │
├─────────────────────────────────────────────────────────────────────────┤
│   Total Liquid Balances (Checking + E-Wallets + Cash)                   │
│ - Unpaid Bills Remaining in Current Cycle                               │
│ - Mandatory Debt Amortization Payments                                  │
│ - Prorated Goal Savings Contributions                                   │
│ - User-Defined Safety Floor (e.g., ₱2,000 baseline reserve)            │
│ ─────────────────────────────────────────────────────────────────────   │
│ = Net Spendable Pool for Current Cycle                                  │
│ ÷ Days Remaining until Next Payday (e.g., 7 days)                       │
│ ─────────────────────────────────────────────────────────────────────   │
│ = Safe-to-Spend Today                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Python Implementation Reference

```python
from datetime import date
from typing import List

def calculate_safe_to_spend(
    liquid_balance: float,
    upcoming_bills: float,
    debt_payments_due: float,
    cycle_savings_target: float,
    safety_floor: float,
    days_remaining_in_cycle: int
) -> float:
    days = max(1, days_remaining_in_cycle)
    discretionary_pool = (
        liquid_balance
        - upcoming_bills
        - debt_payments_due
        - cycle_savings_target
        - safety_floor
    )
    if discretionary_pool <= 0:
        return 0.00
    return round(discretionary_pool / days, 2)
```

---

## 4. Engine 3: Spending Velocity & End-of-Month Forecast

### Spending Velocity Index
$$\text{Velocity} = \frac{\text{Actual Cumulative Spend on Day } t}{\text{Expected Linear Cumulative Spend on Day } t}$$

* **$\text{Velocity} \le 0.90$**: 🟢 *Frugal Pace (Opportunity to accelerate savings).*
* **$0.90 < \text{Velocity} \le 1.10$**: 🟢 *On Track (Normal burn rate).*
* **$1.10 < \text{Velocity} \le 1.25$**: 🟡 *Elevated Burn (Warning: Will exhaust discretionary buffer early).*
* **$\text{Velocity} > 1.25$**: 🔴 *Critical Overspend (Safe-to-Spend throttling engaged).*

---

## 5. Engine 4: Adaptive Savings Flex Algorithm

Standard apps fail because they demand static contributions regardless of income shocks. The Adaptive Savings Engine dynamically scales contributions:

$$\text{Contribution}_{\text{Recommended}} = \text{Target}_{\text{Base}} \times \Big(1.0 + \text{clamp}\big(\text{NCFR}_{\text{Current}} - \text{NCFR}_{\text{Historical}}, -0.5, +0.5\big)\Big)$$

* If cash flow is $+20\%$ higher than average $\rightarrow$ recommends allocating $20\%$ more to goal to shorten deadline.
* If utility bills surge $\rightarrow$ automatically reduces recommendation by up to $50\%$ to prevent credit card debt incurrence.

---

## 6. Engine 5: "What-If" Purchase & Scenario Matrix

Evaluates the prospective state vector:

$$\mathbf{S}_{\text{post}} = f\big(\mathbf{S}_{\text{current}}, \Delta \text{Cost}, \text{Method}, \text{Term}\big)$$

| Simulation Output Parameter | Calculation Logic |
| :--- | :--- |
| **New Health Score** | Re-runs Health Engine with adjusted liquidity and debt vector. |
| **New Emergency Runway** | $\frac{\text{Liquid Balances} - \Delta \text{Upfront Cash}}{\text{Monthly Baseline Living Cost}}$ |
| **Goal Delay Impact** | $\Delta t = \text{ceil}\Big(\frac{\Delta \text{Cost}}{\text{Monthly Savings Rate}}\Big)\text{ months}$ |
| **Installment DTI Impact** | $\text{DTI}_{\text{post}} = \frac{\text{Existing Debt Payment} + \frac{\Delta \text{Cost}}{\text{Term}}}{\text{Gross Income}}$ |
