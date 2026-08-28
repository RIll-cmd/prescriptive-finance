'use client';

import React, { useEffect } from 'react';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { ContributeGoalModal } from '@/components/goals/ContributeGoalModal';
import { AddBillModal } from '@/components/bills/AddBillModal';
import { PayBillModal } from '@/components/bills/PayBillModal';
import { SafeToSpendBreakdownModal } from '@/components/safe-to-spend/SafeToSpendBreakdownModal';
import { AddMoneySourceModal } from '@/components/money/AddMoneySourceModal';
import { AddCategoryModal } from '@/components/categories/AddCategoryModal';
import { CategoryManagementModal } from '@/components/categories/CategoryManagementModal';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="relative min-h-screen bg-black text-white flex">
      {/* Dynamic Background Particle & Mesh Canvas */}
      <ParticleBackground />

      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[70px] max-[860px]:ml-0 max-w-[calc(100vw-70px)] max-[860px]:max-w-full p-6 md:p-8 relative z-[1]">
        <Header />
        <main>{children}</main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal />
      <EditTransactionModal />
      <TransactionDetailsModal />
      <AddGoalModal />
      <ContributeGoalModal />
      <AddBillModal />
      <PayBillModal />
      <SafeToSpendBreakdownModal />
      <AddMoneySourceModal />
      <AddCategoryModal />
      <CategoryManagementModal />

      {/* Onboarding Wizard for new accounts */}
      {user && !user.is_onboarded && <OnboardingModal />}
    </div>
  );
}
