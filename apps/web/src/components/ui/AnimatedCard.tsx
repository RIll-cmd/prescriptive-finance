'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface AnimatedCardProps {
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  cardNumber = '4218 •••• •••• 1208',
  cardHolder = 'ALYA GARRISON',
  expiry = '09/28',
  className = '',
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Physics state stored in refs to avoid React re-render overhead in the 60/120fps animation loop
  const stateRef = useRef({
    current: { rx: 0, ry: 0, gx: 50, gy: 50 },
    target: { rx: 0, ry: 0, gx: 50, gy: 50 },
    hovering: false,
    smoothing: 0.08,
    glowOpacity: 0.35,
  });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const s = stateRef.current;
      const sm = s.hovering ? s.smoothing : 0.05;

      s.current.rx = lerp(s.current.rx, s.target.rx, sm);
      s.current.ry = lerp(s.current.ry, s.target.ry, sm);
      s.current.gx = lerp(s.current.gx, s.target.gx, sm * 1.5);
      s.current.gy = lerp(s.current.gy, s.target.gy, sm * 1.5);

      // Smooth glow intensity transition
      const targetGlow = s.hovering ? 0.7 : 0.35;
      s.glowOpacity = lerp(s.glowOpacity, targetGlow, 0.04);

      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${s.current.rx.toFixed(2)}deg) rotateY(${s.current.ry.toFixed(2)}deg)`;

        const shadowX = -s.current.ry * 0.8;
        const shadowY = s.current.rx * 0.5 + 12;
        const spread = s.hovering ? 55 : 30;

        // Dual-tone shadow: purple ambient + blue directional
        cardRef.current.style.boxShadow = `
          ${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${spread}px rgba(0, 0, 0, 0.45),
          ${(shadowX * 0.3).toFixed(1)}px ${(shadowY * 0.5).toFixed(1)}px 18px rgba(168, 85, 247, ${s.hovering ? 0.14 : 0.04}),
          ${(shadowX * 0.2).toFixed(1)}px ${(shadowY * 0.3).toFixed(1)}px 25px rgba(59, 130, 246, ${s.hovering ? 0.08 : 0}),
          0 0 0 1px rgba(255, 255, 255, ${s.hovering ? 0.1 : 0.06}) inset
        `;
      }

      if (glareRef.current) {
        glareRef.current.style.setProperty('--glare-x', `${s.current.gx.toFixed(1)}%`);
        glareRef.current.style.setProperty('--glare-y', `${s.current.gy.toFixed(1)}%`);
      }

      if (glowRef.current) {
        glowRef.current.style.opacity = `${s.glowOpacity.toFixed(3)}`;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseEnter = useCallback(() => {
    stateRef.current.hovering = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    stateRef.current.target.ry = nx * 25;  // left/right tilt
    stateRef.current.target.rx = -ny * 20; // up/down tilt
    stateRef.current.target.gx = (nx + 0.5) * 100;
    stateRef.current.target.gy = (ny + 0.5) * 100;
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.hovering = false;
    stateRef.current.target.rx = 0;
    stateRef.current.target.ry = 0;
    stateRef.current.target.gx = 50;
    stateRef.current.target.gy = 50;
  }, []);

  const numberGroups = cardNumber.split(/\s+/);

  return (
    <div
      ref={sceneRef}
      className={`stripe-card-scene ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient outer glow — pulses gently, intensifies on hover */}
      <div ref={glowRef} className="card-outer-glow" />

      <div ref={cardRef} className="stripe-card" id="stripeCard">
        {/* Fluid animated mesh gradient background */}
        <div className="card-mesh-gradient">
          <div className="mesh-blob blob-a" />
          <div className="mesh-blob blob-b" />
          <div className="mesh-blob blob-c" />
          <div className="mesh-blob blob-d" />
          <div className="mesh-blob blob-e" />
          <div className="mesh-blob blob-f" />
          {/* Holographic light streak */}
          <div className="card-light-streak" />
        </div>

        {/* Surface glare overlay (follows cursor) */}
        <div ref={glareRef} className="card-glare" id="cardGlare" />

        {/* Specular edge highlight */}
        <div className="card-edge-light" />

        {/* Card content */}
        <div className="card-face relative z-[6] p-[20px_22px] h-full flex flex-col justify-between select-none">
          {/* Top Row: Chip & Contactless */}
          <div className="flex items-center justify-between">
            {/* Premium metallic chip with gradient fill */}
            <div className="chip-container w-[42px] h-[32px]">
              <svg className="chip-svg w-full h-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 225, 140, 0.35)" />
                    <stop offset="50%" stopColor="rgba(255, 210, 110, 0.2)" />
                    <stop offset="100%" stopColor="rgba(255, 235, 160, 0.3)" />
                  </linearGradient>
                </defs>
                <rect x="1" y="1" width="48" height="38" rx="6" stroke="rgba(255,220,160,0.35)" strokeWidth="0.8" fill="url(#chipGrad)" />
                <rect x="1" y="15.5" width="48" height="0.7" fill="rgba(255,220,140,0.25)" />
                <rect x="1" y="24" width="48" height="0.7" fill="rgba(255,220,140,0.25)" />
                <rect x="17" y="1" width="0.7" height="38" fill="rgba(255,220,140,0.2)" />
                <rect x="33" y="1" width="0.7" height="38" fill="rgba(255,220,140,0.2)" />
                <rect x="18" y="16.2" width="14" height="7.5" rx="1.5" fill="rgba(255,230,170,0.1)" stroke="rgba(255,220,160,0.12)" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="contactless-icon rotate-90">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M7.5 18.5c2.5-2.5 2.5-8 0-11" opacity="0.45" />
                <path d="M11 18.5c2.5-2.5 2.5-8 0-11" opacity="0.65" />
                <path d="M14.5 18.5c2.5-2.5 2.5-8 0-11" />
              </svg>
            </div>
          </div>

          {/* Middle Row: Card Number */}
          <div className="card-num-row flex gap-[14px] mt-auto mb-[14px]">
            {numberGroups.map((group, idx) => (
              <span
                key={idx}
                className="card-num-group text-[0.92rem] font-semibold text-white/90 tracking-[0.16em] tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
              >
                {group}
              </span>
            ))}
          </div>

          {/* Bottom Row: Card Holder, Expiry, Visa Logo */}
          <div className="card-bottom-row flex items-end justify-between">
            <div className="card-holder-block flex flex-col gap-[1px]">
              <span className="card-label text-[0.5rem] font-semibold tracking-[0.12em] text-white/40 uppercase">
                CARD HOLDER
              </span>
              <span className="card-holder-name text-[0.7rem] font-semibold text-white/85 tracking-[0.06em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] uppercase">
                {cardHolder}
              </span>
            </div>

            <div className="card-expiry-block flex flex-col gap-[1px]">
              <span className="card-label text-[0.5rem] font-semibold tracking-[0.12em] text-white/40 uppercase">
                EXPIRES
              </span>
              <span className="card-expiry-val text-[0.7rem] font-semibold text-white/85 tracking-[0.06em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                {expiry}
              </span>
            </div>

            <div className="visa-logo flex items-end">
              <svg viewBox="0 0 100 32" width="60" height="20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M40.4 1.2L35.2 30.8H29L34.2 1.2H40.4ZM67.2 20.2L70 12.2L71.6 20.2H67.2ZM73.4 30.8H79L74.2 1.2H68.8C67.4 1.2 66.2 2 65.6 3.2L56 30.8H62.2L63.4 27.2H71L71.8 30.8H73.4ZM56.8 21C56.8 13.4 46.2 13 46.2 9.6C46.2 8.4 47.4 7.2 49.8 6.8C51 6.6 54.2 6.6 57.8 8.2L59 2.2C57 1.4 54.6 0.8 51.6 0.8C45.8 0.8 41.6 4 41.6 8.6C41.6 12 44.6 13.8 46.8 15C49.2 16.2 50 17 50 18.2C50 20 47.8 20.8 45.8 20.8C41.8 20.8 39.6 19.8 37.8 19L36.6 25.2C38.6 26 41.6 26.8 44.8 26.8C51 26.8 55 23.8 56.8 21ZM27 1.2L17.4 30.8H11L6.2 5.6C5.8 4 5.6 3.4 4 2.4C1.4 1.2 0 0.8 0 0.8L0.2 0H10C11.6 0 13 1 13.4 2.8L15.6 18.6L21.6 1.2H27Z"
                  fill="rgba(255,255,255,0.85)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard;
