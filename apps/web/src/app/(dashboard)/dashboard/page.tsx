'use client';

import React from 'react';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { FastTransfer } from '@/components/dashboard/FastTransfer';
import { GoalsList } from '@/components/dashboard/GoalsList';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.9fr] gap-[18px]">
      {/* 1. Balance Card with 3D Animated Card */}
      <BalanceCard />

      {/* 2. My Activity Chart */}
      <ActivityChart />

      {/* 3. Fast Transfer */}
      <FastTransfer />

      {/* 4. My Goals */}
      <GoalsList />

      {/* 5. Transactions (spans across 2 columns in lg grid) */}
      <TransactionsTable />
    </div>
  );
}
