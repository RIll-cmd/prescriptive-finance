'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { CustomizeDashboardModal } from '@/components/dashboard/CustomizeDashboardModal';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';
import { useAuthStore } from '@/stores/auth-store';
import { useTutorialStore } from '@/stores/tutorial-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, checkAuth } = useAuthStore();
  const { fetchProgress } = useTutorialStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-9 h-9 rounded-full border-2 border-[#C57CF9]/20 border-t-[#C57CF9] animate-spin" />
        <span className="text-[0.8rem] text-white/40 font-medium tracking-wide">
          Verifying credentials...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
      <CustomizeDashboardModal />
      <TutorialOverlay />

      {/* Onboarding Wizard for new accounts */}
      {user && !user.is_onboarded && <OnboardingModal />}
    </div>
  );
}
