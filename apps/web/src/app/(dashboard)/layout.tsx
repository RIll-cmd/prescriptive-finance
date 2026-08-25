'use client';

import React from 'react';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    </div>
  );
}
