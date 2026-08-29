'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/* ─── Floating 3D Credit Card (reused from main UI aesthetic) ─── */
const FloatingCard: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    current: { rx: 0, ry: 0, gx: 50, gy: 50 },
    target: { rx: 0, ry: 0, gx: 50, gy: 50 },
    hovering: false,
    time: 0,
  });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    let raf: number;
    const loop = () => {
      const s = stateRef.current;
      const sm = s.hovering ? 0.08 : 0.04;
      s.time += 0.008;

      // Idle floating animation when not hovering
      if (!s.hovering) {
        s.target.rx = Math.sin(s.time * 1.2) * 8 + Math.cos(s.time * 0.7) * 3;
        s.target.ry = Math.cos(s.time * 0.9) * 10 + Math.sin(s.time * 1.4) * 4;
      }

      s.current.rx = lerp(s.current.rx, s.target.rx, sm);
      s.current.ry = lerp(s.current.ry, s.target.ry, sm);
      s.current.gx = lerp(s.current.gx, s.target.gx, sm * 1.5);
      s.current.gy = lerp(s.current.gy, s.target.gy, sm * 1.5);

      if (cardRef.current) {
        const shadowX = -s.current.ry * 0.6;
        const shadowY = s.current.rx * 0.4 + 16;
        cardRef.current.style.transform = `rotateX(${s.current.rx.toFixed(2)}deg) rotateY(${s.current.ry.toFixed(2)}deg)`;
        cardRef.current.style.boxShadow = `
          ${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 48px rgba(0, 0, 0, 0.55),
          0 0 0 1px rgba(255, 255, 255, 0.08) inset
        `;
      }
      if (glareRef.current) {
        glareRef.current.style.setProperty('--glare-x', `${s.current.gx.toFixed(1)}%`);
        glareRef.current.style.setProperty('--glare-y', `${s.current.gy.toFixed(1)}%`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onEnter = useCallback(() => { stateRef.current.hovering = true; }, []);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    stateRef.current.target.ry = nx * 28;
    stateRef.current.target.rx = -ny * 22;
    stateRef.current.target.gx = (nx + 0.5) * 100;
    stateRef.current.target.gy = (ny + 0.5) * 100;
  }, []);
  const onLeave = useCallback(() => {
    stateRef.current.hovering = false;
    stateRef.current.target.rx = 0;
    stateRef.current.target.ry = 0;
    stateRef.current.target.gx = 50;
    stateRef.current.target.gy = 50;
  }, []);

  return (
    <div
      ref={sceneRef}
      className="stripe-card-scene"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 1000 }}
    >
      <div
        ref={cardRef}
        className="stripe-card"
        style={{ width: 340, height: 214, borderRadius: 20 }}
      >
        <div className="card-mesh-gradient">
          <div className="mesh-blob blob-a" />
          <div className="mesh-blob blob-b" />
          <div className="mesh-blob blob-c" />
          <div className="mesh-blob blob-d" />
          <div className="mesh-blob blob-e" />
          <div className="mesh-blob blob-f" />
          <div className="card-light-streak" />
        </div>
        <div ref={glareRef} className="card-glare" />
        <div className="card-edge-light" />
        <div className="card-face relative z-[6] p-[24px_26px] h-full flex flex-col justify-between select-none">
          {/* Top */}
          <div className="flex items-center justify-between">
            <div className="w-[46px] h-[34px]">
              <svg className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" viewBox="0 0 50 40" fill="none">
                <rect x="1" y="1" width="48" height="38" rx="5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="rgba(255,215,100,0.15)" />
                <rect x="1" y="15" width="48" height="1" fill="rgba(255,215,100,0.2)" />
                <rect x="1" y="24" width="48" height="1" fill="rgba(255,215,100,0.2)" />
                <rect x="17" y="1" width="1" height="38" fill="rgba(255,215,100,0.15)" />
                <rect x="33" y="1" width="1" height="38" fill="rgba(255,215,100,0.15)" />
              </svg>
            </div>
            <div className="rotate-90">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M7.5 18.5c2.5-2.5 2.5-8 0-11" opacity="0.5" />
                <path d="M11 18.5c2.5-2.5 2.5-8 0-11" opacity="0.7" />
                <path d="M14.5 18.5c2.5-2.5 2.5-8 0-11" />
              </svg>
            </div>
          </div>
          {/* Number */}
          <div className="flex gap-[16px] mt-auto mb-[16px]">
            {['4218', '••••', '••••', '1208'].map((g, i) => (
              <span key={i} className="text-[1rem] font-semibold text-white/90 tracking-[0.18em] tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                {g}
              </span>
            ))}
          </div>
          {/* Bottom */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[1px]">
              <span className="text-[0.52rem] font-semibold tracking-[0.12em] text-white/40 uppercase">Card Holder</span>
              <span className="text-[0.78rem] font-semibold text-white/90 tracking-[0.05em] uppercase">FINANCIAL OS</span>
            </div>
            <div className="flex flex-col gap-[1px]">
              <span className="text-[0.52rem] font-semibold tracking-[0.12em] text-white/40 uppercase">Engine</span>
              <span className="text-[0.78rem] font-semibold text-white/90 tracking-[0.05em]">CIEL 2.0</span>
            </div>
            <svg viewBox="0 0 100 32" width="64" height="22" fill="white" className="opacity-80">
              <path d="M40.4 1.2L35.2 30.8H29L34.2 1.2H40.4ZM67.2 20.2L70 12.2L71.6 20.2H67.2ZM73.4 30.8H79L74.2 1.2H68.8C67.4 1.2 66.2 2 65.6 3.2L56 30.8H62.2L63.4 27.2H71L71.8 30.8H73.4ZM56.8 21C56.8 13.4 46.2 13 46.2 9.6C46.2 8.4 47.4 7.2 49.8 6.8C51 6.6 54.2 6.6 57.8 8.2L59 2.2C57 1.4 54.6 0.8 51.6 0.8C45.8 0.8 41.6 4 41.6 8.6C41.6 12 44.6 13.8 46.8 15C49.2 16.2 50 17 50 18.2C50 20 47.8 20.8 45.8 20.8C41.8 20.8 39.6 19.8 37.8 19L36.6 25.2C38.6 26 41.6 26.8 44.8 26.8C51 26.8 55 23.8 56.8 21ZM27 1.2L17.4 30.8H11L6.2 5.6C5.8 4 5.6 3.4 4 2.4C1.4 1.2 0 0.8 0 0.8L0.2 0H10C11.6 0 13 1 13.4 2.8L15.6 18.6L21.6 1.2H27Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Interactive Particle Canvas ─── */
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const count = Math.min(60, Math.floor((width * height) / 25000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.8,
      blue: Math.random() > 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let mx = -1000;
    let my = -1000;
    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) {
          const force = ((120 - dist) / 120) * 0.3;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue
          ? `rgba(56,105,210,${p.alpha})`
          : `rgba(197,124,249,${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(130,110,230,${(1 - d / 100) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="gradient-mesh">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
        <div className="mesh-orb orb-3" />
      </div>
    </>
  );
};

/* ─── Animated Controlled Input Field ─── */
const FloatingInput: React.FC<{
  id: string;
  label: string;
  type?: string;
  icon: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}> = ({ id, label, type = 'text', icon, value, onChange, required = false }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group">
      <div
        className={`
          relative flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${focused
            ? 'bg-[rgba(56,105,210,0.06)] border-[rgba(56,105,210,0.4)] shadow-[0_0_30px_rgba(56,105,210,0.08),0_0_60px_rgba(197,124,249,0.04)]'
            : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]'
          }
        `}
      >
        <span
          className={`material-symbols-rounded text-[20px] transition-colors duration-300 shrink-0 ${
            focused ? 'text-[#3869D2]' : 'text-white/25'
          }`}
        >
          {icon}
        </span>
        <div className="relative flex-1">
          <label
            htmlFor={id}
            className={`
              absolute left-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none origin-left
              ${focused || value
                ? 'text-[0.65rem] -top-[6px] font-semibold tracking-[0.08em] text-[#C57CF9]/80'
                : 'text-[0.88rem] top-1/2 -translate-y-1/2 text-white/30 font-medium'
              }
            `}
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent border-none outline-none text-white text-[0.88rem] font-medium pt-1"
            autoComplete={type === 'password' ? 'current-password' : 'email'}
          />
        </div>
        <div className={`absolute inset-0 rounded-2xl bg-gradient-r from-[#3869D2]/[0.04] to-[#C57CF9]/[0.04] blur-xl pointer-events-none transition-opacity duration-500 ${focused ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </div>
  );
};

/* ─── Main Login Page ─── */
export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!identifier.trim() || !password) {
      setLocalError('Please fill in both your username/email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username_or_email: identifier.trim(), password });
      router.push('/dashboard');
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#000000] text-white overflow-hidden selection:bg-[#C57CF9]/20 selection:text-[#C57CF9]">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-[1140px] min-h-[640px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* ─── Left Column: 3D Visual Showcase & Branding ─── */}
        <div className="hidden lg:flex flex-col justify-between h-full py-6 pr-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_4px_24px_rgba(56,105,210,0.35)]">
              <span className="material-symbols-rounded text-[22px] text-white">account_balance</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[1.35rem] font-extrabold tracking-[-0.03em] text-white">Financial</span>
              <span className="text-[1.35rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent">OS</span>
            </div>
          </div>

          <div className="my-auto py-8">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-bold tracking-[0.08em] uppercase bg-gradient-to-r from-[#3869D2]/10 to-[#C57CF9]/10 border border-[#C57CF9]/20 text-[#C57CF9] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-[statusPulse_2s_ease-in-out_infinite]" />
                Prescriptive Intelligence
              </span>
              <h2 className="text-[2.2rem] font-black tracking-[-0.04em] leading-[1.15] text-white mb-3">
                Decide with absolute{' '}
                <span className="bg-gradient-to-r from-[#3869D2] via-[#5a8aee] to-[#C57CF9] bg-clip-text text-transparent">
                  clarity.
                </span>
              </h2>
              <p className="text-[0.92rem] text-white/40 max-w-[380px] leading-relaxed">
                Know your true daily safe-to-spend, simulate major purchases before swiping, and keep 100% data sovereignty.
              </p>
            </div>

            <div className="flex justify-center py-2">
              <FloatingCard />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: 'lock_open', label: 'Zero Bank APIs', desc: 'No credential sharing' },
                { icon: 'psychology', label: 'CIEL AI CFO', desc: 'Deterministic math' },
                { icon: 'speed', label: 'Safe-to-Spend', desc: 'Real-time daily limit' },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <span className="material-symbols-rounded text-[18px] text-[#C57CF9]/70 mb-1.5 block">{feat.icon}</span>
                  <span className="text-[0.78rem] font-semibold text-white/80 block tracking-[-0.01em]">{feat.label}</span>
                  <span className="text-[0.68rem] text-white/30 block mt-0.5">{feat.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[0.75rem] text-white/20 pt-4 border-t border-white/[0.04]">
            <span>© 2026 Financial OS Inc.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white/40 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white/40 transition-colors">Security</Link>
              <Link href="#" className="hover:text-white/40 transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Login Card ─── */}
        <div className="w-full max-w-[460px] mx-auto lg:max-w-none">
          <div className="relative rounded-[28px] p-[1px] overflow-hidden">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#3869D2_350deg,#C57CF9_360deg)] login-border-spin opacity-40 pointer-events-none" />

            <div className="relative rounded-[27px] bg-[rgba(5,5,16,0.85)] backdrop-blur-[32px] border border-white/[0.08] shadow-[0_16px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset] overflow-hidden">
              <div className="p-8 sm:p-11">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_4px_20px_rgba(56,105,210,0.25)]">
                    <span className="material-symbols-rounded text-[20px] text-white">account_balance</span>
                  </div>
                  <span className="text-[1.2rem] font-extrabold tracking-[-0.03em]">
                    <span className="text-white">Financial</span>
                    <span className="bg-gradient-to-r from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent ml-1">OS</span>
                  </span>
                </div>

                <div className="mb-7">
                  <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em] text-white mb-1.5 flex items-center gap-2">
                    Welcome back
                    <span className="inline-block animate-[sparkleRotate_4s_ease-in-out_infinite] text-[1.1rem] bg-gradient-to-br from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent">✦</span>
                  </h1>
                  <p className="text-[0.85rem] text-white/35 font-medium">
                    Sign in to your private financial decision portal
                  </p>
                </div>

                {/* Error Banner */}
                {(localError || error) && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.82rem] flex items-center gap-2.5 animate-[cardReveal_0.3s_ease-out]">
                    <span className="material-symbols-rounded text-[18px] text-red-400 shrink-0">error</span>
                    <span>{localError || error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <FloatingInput
                    id="identifier"
                    label="Username or Email"
                    type="text"
                    icon="alternate_email"
                    value={identifier}
                    onChange={setIdentifier}
                    required
                  />
                  <FloatingInput
                    id="password"
                    label="Password"
                    type="password"
                    icon="lock"
                    value={password}
                    onChange={setPassword}
                    required
                  />

                  <div className="flex items-center justify-between text-[0.78rem] mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative w-[18px] h-[18px] rounded-[5px] border border-white/[0.12] bg-white/[0.03] flex items-center justify-center transition-all duration-300 group-hover:border-[#3869D2]/40 group-hover:bg-[#3869D2]/[0.06]">
                        <input type="checkbox" defaultChecked className="opacity-0 absolute inset-0 cursor-pointer" />
                        <span className="material-symbols-rounded text-[13px] text-[#C57CF9]">check</span>
                      </div>
                      <span className="text-white/35 font-medium group-hover:text-white/50 transition-colors">Remember me</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-white/35 font-medium hover:text-[#C57CF9] transition-colors no-underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group relative w-full mt-3 py-4 rounded-2xl font-bold text-[0.92rem] text-white tracking-[-0.01em] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] border-none cursor-pointer overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_8px_40px_rgba(56,105,210,0.3),0_8px_40px_rgba(197,124,249,0.2)] hover:scale-[1.02] active:scale-[0.98] ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="relative z-[2] flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <span className="material-symbols-rounded text-[20px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3869D2] to-[#C57CF9] blur-xl opacity-0 group-hover:opacity-40 -z-10 transition-opacity duration-400" />
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/[0.08]" />
                  <span className="text-[0.70rem] text-white/20 font-semibold tracking-[0.1em] uppercase">or continue with</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/[0.08]" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Google', icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )},
                    { label: 'Apple', icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    )},
                    { label: 'GitHub', icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    )},
                  ].map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={`Sign in with ${social.label}`}
                      className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>

                <p className="text-center text-[0.80rem] text-white/30 mt-7 font-medium">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-transparent bg-gradient-to-r from-[#3869D2] to-[#C57CF9] bg-clip-text font-bold hover:from-[#5a8aee] hover:to-[#d9a4ff] transition-all duration-300 no-underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes borderSpin {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .login-border-spin {
          animation: borderSpin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
