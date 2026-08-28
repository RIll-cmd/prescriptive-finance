'use client';

import React from 'react';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { FastTransfer } from '@/components/dashboard/FastTransfer';
import { GoalsList } from '@/components/dashboard/GoalsList';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { SafeToSpendWidget } from '@/components/dashboard/SafeToSpendWidget';
import { UpcomingBillsWidget } from '@/components/dashboard/UpcomingBillsWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-[18px]">
      {/* Top Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.9fr] gap-[18px]">
        {/* 1. Balance Card with 3D Animated Card */}
        <BalanceCard />

        {/* 2. My Activity Chart */}
        <ActivityChart />

        {/* 3. Safe-to-Spend Widget */}
        <SafeToSpendWidget />
      </div>

      {/* Secondary Intelligence & Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] gap-[18px]">
        {/* 4. Upcoming Bills */}
        <UpcomingBillsWidget />

        {/* 5. Fast Transfer */}
        <FastTransfer />

        {/* 6. My Goals */}
        <GoalsList />
      </div>

      {/* 7. Transactions Ledger */}
      <TransactionsTable />
    </div>
  );
}
