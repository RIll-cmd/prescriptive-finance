'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/stores/tutorial-store';
import { TUTORIAL_DEFINITIONS, TutorialStep } from './tutorial-data';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const TutorialOverlay: React.FC = () => {
  const {
    activeTutorial,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorialStore();

  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; position: string }>({
    top: 0,
    left: 0,
    position: 'bottom',
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tutorialDef = activeTutorial ? TUTORIAL_DEFINITIONS[activeTutorial] : null;
  const currentStep: TutorialStep | null =
    tutorialDef && tutorialDef.steps[currentStepIndex]
      ? tutorialDef.steps[currentStepIndex]
      : null;

  const totalSteps = tutorialDef?.steps.length || 0;

  // Calculate Target Coordinates & Dynamic Positioning
  const updatePositions = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      // Fallback if target element is temporarily hidden or missing
      setTargetRect({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        width: 300,
        height: 140,
        bottom: window.innerHeight / 2 + 40,
        right: window.innerWidth / 2 + 150,
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const computedRect: TargetRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      bottom: rect.bottom + padding,
      right: rect.right + padding,
    };

    setTargetRect(computedRect);

    // Compute Tooltip position
    const tooltipWidth = 380;
    const tooltipHeight = 220; // approximate estimated height
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let pos = currentStep.preferredPosition || 'bottom';
    let top = 0;
    let left = 0;

    // Check vertical positioning
    if (pos === 'bottom' || pos === 'auto') {
      if (computedRect.bottom + tooltipHeight + margin < vh) {
        top = computedRect.bottom + margin;
        left = Math.min(
          Math.max(margin, computedRect.left + computedRect.width / 2 - tooltipWidth / 2),
          vw - tooltipWidth - margin
        );
        pos = 'bottom';
      } else if (computedRect.top - tooltipHeight - margin > 0) {
        top = computedRect.top - tooltipHeight - margin;
        left = Math.min(
          Math.max(margin, computedRect.left + computedRect.width / 2 - tooltipWidth / 2),
          vw - tooltipWidth - margin
        );
        pos = 'top';
      } else {
        // Fallback inside center
        top = Math.max(margin, Math.min(vh - tooltipHeight - margin, computedRect.bottom + margin));
        left = Math.min(Math.max(margin, computedRect.left), vw - tooltipWidth - margin);
        pos = 'bottom';
      }
    } else if (pos === 'top') {
      if (computedRect.top - tooltipHeight - margin > 0) {
        top = computedRect.top - tooltipHeight - margin;
        left = Math.min(
          Math.max(margin, computedRect.left + computedRect.width / 2 - tooltipWidth / 2),
          vw - tooltipWidth - margin
        );
      } else {
        top = computedRect.bottom + margin;
        left = Math.min(
          Math.max(margin, computedRect.left + computedRect.width / 2 - tooltipWidth / 2),
          vw - tooltipWidth - margin
        );
        pos = 'bottom';
      }
    }

    setTooltipPos({ top, left, position: pos });
  }, [currentStep]);

  // Scroll element into view smoothly when step changes
  useEffect(() => {
    if (!currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }

    // Allow time for smooth scroll to finish before calculating final rect
    const timer = setTimeout(updatePositions, 350);
    return () => clearTimeout(timer);
  }, [currentStep, currentStepIndex, updatePositions]);

  // Listen to resize, scroll, and animation frames
  useEffect(() => {
    if (!activeTutorial) return;

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [activeTutorial, updatePositions]);

  // Keyboard navigation
  useEffect(() => {
    if (!activeTutorial) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTutorial();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTutorial, nextStep, prevStep, skipTutorial]);

  if (!mounted || !activeTutorial || !currentStep || !tutorialDef) {
    return null;
  }

  const isLastStep = currentStepIndex === totalSteps - 1;

  const overlayContent = (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      {/* 1. Dark Backdrop with Cutout Spotlight Mask */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
        style={{ filter: 'drop-shadow(0 0 16px rgba(0,0,0,0.8))' }}
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White base fills everything */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout reveals targeted element underneath */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 2, 8, 0.78)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* 2. Spotlight Animated Glow Border Ring */}
      {targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: '16px',
            boxShadow:
              '0 0 0 1.5px rgba(197, 124, 249, 0.8), 0 0 28px rgba(197, 124, 249, 0.35), 0 0 50px rgba(56, 105, 210, 0.2)',
          }}
        >
          {/* Subtle pulse animation element inside */}
          <div className="absolute inset-0 rounded-[16px] border border-white/40 animate-ping opacity-20 pointer-events-none" />
        </div>
      )}

      {/* 3. Financial OS Native Floating Glassmorphism Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute transition-all duration-300 ease-out w-[min(380px,calc(100vw-32px))] pointer-events-auto"
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
        }}
      >
        <div className="relative rounded-[22px] bg-[#09091a]/95 backdrop-blur-[28px] border border-white/[0.12] p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)_inset]">
          {/* Ambient Top Glow inside card */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#C57CF9] to-transparent opacity-80" />

          {/* Header Strip: Icon, Badge, Step Counter, Close */}
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3869D2]/30 to-[#C57CF9]/30 border border-white/10 flex items-center justify-center text-white shadow-[0_2px_12px_rgba(197,124,249,0.25)]">
                <span className="material-symbols-rounded text-[18px] text-[#C57CF9]">
                  {currentStep.icon}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider bg-white/[0.06] border border-white/[0.08] text-white/80">
                {currentStep.badge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold text-white/40 tabular-nums">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                title="Skip Tour (Esc)"
                aria-label="Close tutorial"
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <span className="material-symbols-rounded text-[15px]">close</span>
              </button>
            </div>
          </div>

          {/* Step Title */}
          <h2 className="text-[1.1rem] font-extrabold text-white tracking-tight mb-2">
            {currentStep.title}
          </h2>

          {/* Step Description */}
          <p className="text-[0.80rem] text-white/70 leading-relaxed mb-5">
            {currentStep.description}
          </p>

          {/* Footer: Progress Dots + Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] gap-3">
            {/* Step indicator dots */}
            <div className="flex items-center gap-1.5">
              {tutorialDef.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-6 bg-gradient-to-r from-[#3869D2] to-[#C57CF9] shadow-[0_0_8px_rgba(197,124,249,0.5)]'
                      : idx < currentStepIndex
                      ? 'w-2 bg-emerald-400/60'
                      : 'w-2 bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-3 py-1.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-[0.78rem] font-semibold transition-all border border-white/[0.06] cursor-pointer"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-1.5 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:opacity-95 text-white text-[0.78rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                <span>{isLastStep ? 'Got it!' : 'Next'}</span>
                <span className="material-symbols-rounded text-[16px]">
                  {isLastStep ? 'check' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};
