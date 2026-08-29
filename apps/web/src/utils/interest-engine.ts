/**
 * Comprehensive Ledger & Interest Simulation Engine
 * Predicts Gross Interest, 20% Withholding Tax, and Net Earnings
 * with daily/monthly/quarterly crediting, tiered interest rates, and compounding.
 */

export interface BankPreset {
  id: string;
  name: string;
  ratePct: number;
  creditingFrequency: 'daily' | 'monthly' | 'quarterly';
  taxRatePct: number;
  tierThreshold?: number;
  tierRatePct?: number; // Rate if below/above tierThreshold
  boostedRatePct?: number;
  description?: string;
  isCustom?: boolean;
}

export const DEFAULT_BANK_PRESETS: BankPreset[] = [
  {
    id: 'uno_ready',
    name: 'UNO Digital Bank (#UNOready)',
    ratePct: 3.50,
    tierThreshold: 5000,
    tierRatePct: 3.00,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.50% p.a. for balance ≥ ₱5,000 (3.00% for < ₱5,000). Daily crediting.',
  },
  {
    id: 'seabank_maribank',
    name: 'MariBank / SeaBank',
    ratePct: 3.25,
    tierThreshold: 1000000,
    tierRatePct: 3.75,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.25% p.a. on first ₱1,000,000; 3.75% on excess. Credited daily.',
  },
  {
    id: 'ownbank',
    name: 'OwnBank (Own It)',
    ratePct: 3.80,
    boostedRatePct: 5.20,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.80% p.a. standard (up to 5.20% Time Deposit). Daily crediting.',
  },
  {
    id: 'maya_base',
    name: 'Maya Savings (Base Rate)',
    ratePct: 3.00,
    boostedRatePct: 15.00,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.00% p.a. base rate (up to 15.00% with spending missions). Daily crediting.',
  },
  {
    id: 'maya_goals',
    name: 'Maya Personal Goals',
    ratePct: 4.00,
    boostedRatePct: 8.00,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '4.00% p.a. guaranteed (up to 8.00% promo). Monthly crediting.',
  },
  {
    id: 'tonik_stash',
    name: 'Tonik Bank (Solo Stash)',
    ratePct: 4.00,
    boostedRatePct: 4.50,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '4.00% p.a. Solo Stash (4.50% Group Stash). Monthly crediting.',
  },
  {
    id: 'banko_todo',
    name: 'BPI BanKo (TODO Savings)',
    ratePct: 5.00,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '5.00% p.a. high-yield savings. Monthly crediting.',
  },
  {
    id: 'gotyme',
    name: 'GoTyme Bank (Go Save)',
    ratePct: 3.00,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '3.00% p.a. on up to 5 Go Save stashes. Monthly crediting.',
  },
  {
    id: 'diskartech',
    name: 'RCBC DiskarTech',
    ratePct: 4.00,
    tierThreshold: 50000,
    tierRatePct: 0.00,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '4.00% p.a. on first ₱50,000. Monthly crediting.',
  },
  {
    id: 'cimb_upsave',
    name: 'CIMB Bank (UpSave / GSave)',
    ratePct: 2.50,
    boostedRatePct: 7.00,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '2.50% p.a. base rate (up to 7.00% with ADB growth). Monthly crediting.',
  },
  {
    id: 'netbank',
    name: 'NetBank Mobile',
    ratePct: 3.25,
    boostedRatePct: 5.00,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.25% p.a. flexible savings, up to 5.00% Time Deposit. Daily crediting.',
  },
  {
    id: 'uniondigital',
    name: 'UnionDigital Bank (Ubeh Save)',
    ratePct: 3.00,
    tierThreshold: 5000000,
    tierRatePct: 3.25,
    creditingFrequency: 'daily',
    taxRatePct: 20,
    description: '3.00% p.a. (< ₱5M), 3.25% (≥ ₱5M). Daily crediting.',
  },
  {
    id: 'komo',
    name: 'Komo by EastWest',
    ratePct: 2.50,
    creditingFrequency: 'monthly',
    taxRatePct: 20,
    description: '2.50% p.a. digital banking. Monthly crediting.',
  },
  {
    id: 'traditional',
    name: 'Traditional Banks (BPI, BDO, Metrobank)',
    ratePct: 0.125,
    creditingFrequency: 'quarterly',
    taxRatePct: 20,
    description: '0.05% - 0.125% regular savings. Quarterly crediting.',
  },
];

export interface DailyPredictionResult {
  day: number;
  date: string;
  eodBalance: number;
  grossInterest: number;
  tax: number;
  netInterest: number;
  creditedNet: number;
  cumulativeNet: number;
}

export interface SimulationSummary {
  initialBalance: number;
  daysProjected: number;
  effectiveRatePct: number;
  taxRatePct: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  finalBalance: number;
  dailyAverageNet: number;
  monthlyEquivalentNet: number;
  yearlyEquivalentNet: number;
  traditionalBankNet: number;
  netAdvantageOverTraditional: number;
  milestones: {
    target: number;
    daysToReach: number | null;
    dateReached: string | null;
  }[];
}

export interface SimulationOptions {
  initialBalance: number;
  annualRatePct: number;
  daysToProject: number;
  taxRatePct?: number; // default 20
  creditingFrequency?: 'daily' | 'monthly' | 'quarterly';
  compounding?: boolean; // default true
  monthlyContribution?: number; // optional recurring deposit per month
  tierThreshold?: number;
  tierRatePct?: number;
  startDate?: Date;
}

/**
 * Checks if a given year is a leap year (366 days).
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Executes a high-precision deterministic ledger simulation for interest & withholding tax.
 */
export function simulateEarnings(options: SimulationOptions): {
  summary: SimulationSummary;
  schedule: DailyPredictionResult[];
} {
  const {
    initialBalance,
    annualRatePct,
    daysToProject,
    taxRatePct = 20,
    creditingFrequency = 'daily',
    compounding = true,
    monthlyContribution = 0,
    tierThreshold,
    tierRatePct,
    startDate = new Date(),
  } = options;

  let currentBalance = Math.max(0, initialBalance);
  let totalGross = 0;
  let totalTax = 0;
  let totalNet = 0;
  let accruedNetBucket = 0;

  const schedule: DailyPredictionResult[] = [];
  const taxDecimal = taxRatePct / 100;

  // Milestone targets
  const milestoneTargets = [100, 500, 1000, 5000, 10000, 50000, 100000];
  const milestones: SimulationSummary['milestones'] = milestoneTargets.map((target) => ({
    target,
    daysToReach: null,
    dateReached: null,
  }));

  for (let d = 1; d <= daysToProject; d++) {
    const currentDate = new Date(startDate.getTime() + d * 86400000);
    const daysInYear = isLeapYear(currentDate.getFullYear()) ? 366 : 365;

    // Determine applicable rate (handling tiered rates if defined)
    let effectiveRate = annualRatePct;
    if (tierThreshold !== undefined && tierRatePct !== undefined) {
      if (tierThreshold === 5000) {
        // UNO bank style: if balance >= 5000, rate is 3.5%, else 3.0%
        effectiveRate = currentBalance >= 5000 ? annualRatePct : tierRatePct;
      } else if (tierThreshold === 50000) {
        // DiskarTech style: up to 50k earns 4.0%, portion above earns 0%
        effectiveRate = annualRatePct;
      } else if (tierThreshold === 1000000) {
        // SeaBank style: first 1M at 3.25%, above 1M at 3.75%
        if (currentBalance > 1000000) {
          const basePortion = 1000000 * (annualRatePct / 100);
          const excessPortion = (currentBalance - 1000000) * (tierRatePct / 100);
          effectiveRate = ((basePortion + excessPortion) / currentBalance) * 100;
        }
      }
    }

    const rateDecimal = effectiveRate / 100;
    const gross = (currentBalance * rateDecimal) / daysInYear;
    const tax = gross * taxDecimal;
    const net = gross - tax;

    totalGross += gross;
    totalTax += tax;
    totalNet += net;
    accruedNetBucket += net;

    let creditedToday = 0;

    // Crediting rules
    if (creditingFrequency === 'daily') {
      creditedToday = net;
      if (compounding) {
        currentBalance += creditedToday;
      }
      accruedNetBucket = 0;
    } else if (creditingFrequency === 'monthly') {
      // Credit every 30 days or on the last day of simulation
      if (d % 30 === 0 || d === daysToProject) {
        creditedToday = accruedNetBucket;
        if (compounding) {
          currentBalance += creditedToday;
        }
        accruedNetBucket = 0;
      }
    } else if (creditingFrequency === 'quarterly') {
      // Credit every 90 days or on the last day of simulation
      if (d % 90 === 0 || d === daysToProject) {
        creditedToday = accruedNetBucket;
        if (compounding) {
          currentBalance += creditedToday;
        }
        accruedNetBucket = 0;
      }
    }

    // Add recurring monthly deposit contribution if specified (every 30 days)
    if (monthlyContribution > 0 && d % 30 === 0) {
      currentBalance += monthlyContribution;
    }

    // Check milestones
    milestones.forEach((m) => {
      if (m.daysToReach === null && totalNet >= m.target) {
        m.daysToReach = d;
        m.dateReached = currentDate.toISOString().split('T')[0];
      }
    });

    schedule.push({
      day: d,
      date: currentDate.toISOString().split('T')[0],
      eodBalance: Number(currentBalance.toFixed(2)),
      grossInterest: Number(gross.toFixed(4)),
      tax: Number(tax.toFixed(4)),
      netInterest: Number(net.toFixed(4)),
      creditedNet: Number(creditedToday.toFixed(2)),
      cumulativeNet: Number(totalNet.toFixed(2)),
    });
  }

  // Calculate traditional bank benchmark (0.125% p.a., 20% tax) for comparison
  const tradRate = 0.00125;
  const tradGross = (initialBalance * tradRate * daysToProject) / 365;
  const tradTax = tradGross * 0.20;
  const traditionalBankNet = tradGross - tradTax;

  const dailyAvg = totalNet / Math.max(1, daysToProject);
  const monthlyEq = dailyAvg * 30.4167;
  const yearlyEq = dailyAvg * 365;

  return {
    summary: {
      initialBalance: Number(initialBalance.toFixed(2)),
      daysProjected: daysToProject,
      effectiveRatePct: annualRatePct,
      taxRatePct,
      totalGross: Number(totalGross.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalNet: Number(totalNet.toFixed(2)),
      finalBalance: Number(currentBalance.toFixed(2)),
      dailyAverageNet: Number(dailyAvg.toFixed(2)),
      monthlyEquivalentNet: Number(monthlyEq.toFixed(2)),
      yearlyEquivalentNet: Number(yearlyEq.toFixed(2)),
      traditionalBankNet: Number(traditionalBankNet.toFixed(2)),
      netAdvantageOverTraditional: Number((totalNet - traditionalBankNet).toFixed(2)),
      milestones,
    },
    schedule,
  };
}

/**
 * Runs a multi-bank comparative ranking simulation for a given principal amount.
 */
export function compareBankPresets(
  balance: number,
  presets: BankPreset[],
  days: number = 365
) {
  return presets.map((preset) => {
    const result = simulateEarnings({
      initialBalance: balance,
      annualRatePct: preset.ratePct,
      daysToProject: days,
      taxRatePct: preset.taxRatePct,
      creditingFrequency: preset.creditingFrequency,
      compounding: true,
      tierThreshold: preset.tierThreshold,
      tierRatePct: preset.tierRatePct,
    });

    const oneDayResult = simulateEarnings({
      initialBalance: balance,
      annualRatePct: preset.ratePct,
      daysToProject: 1,
      taxRatePct: preset.taxRatePct,
      creditingFrequency: preset.creditingFrequency,
    });

    const monthlyResult = simulateEarnings({
      initialBalance: balance,
      annualRatePct: preset.ratePct,
      daysToProject: 30,
      taxRatePct: preset.taxRatePct,
      creditingFrequency: preset.creditingFrequency,
    });

    return {
      preset,
      dailyNet: oneDayResult.summary.totalNet,
      dailyGross: oneDayResult.summary.totalGross,
      dailyTax: oneDayResult.summary.totalTax,
      monthlyNet: monthlyResult.summary.totalNet,
      monthlyGross: monthlyResult.summary.totalGross,
      monthlyTax: monthlyResult.summary.totalTax,
      yearlyNet: result.summary.totalNet,
      yearlyGross: result.summary.totalGross,
      yearlyTax: result.summary.totalTax,
      finalBalance: result.summary.finalBalance,
      netAdvantage: result.summary.netAdvantageOverTraditional,
    };
  }).sort((a, b) => b.yearlyNet - a.yearlyNet);
}
