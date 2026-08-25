'use client';

import React, { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  progress: number;
  icon: string;
  iconClass: string;
  fillClass: string;
}

const goals: Goal[] = [
  {
    id: 'macbook',
    name: 'Macbook',
    current: 320,
    target: 1000,
    progress: 30,
    icon: 'laptop_mac',
    iconClass: 'bg-[#C57CF9]/[0.12] text-[#d9a4ff]',
    fillClass: 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] shadow-[0_0_8px_rgba(197,124,249,0.4)]',
  },
  {
    id: 'travel',
    name: 'Travel',
    current: 2000,
    target: 2500,
    progress: 70,
    icon: 'flight',
    iconClass: 'bg-[#3869D2]/[0.12] text-[#5a8aee]',
    fillClass: 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] shadow-[0_0_8px_rgba(56,105,210,0.4)]',
  },
  {
    id: 'emergency',
    name: 'Emergency fund',
    current: 1000,
    target: 5000,
    progress: 20,
    icon: 'savings',
    iconClass: 'bg-[#eda04a]/[0.12] text-[#eda04a]',
    fillClass: 'bg-gradient-to-r from-[#eda04a] to-[#C57CF9] shadow-[0_0_8px_rgba(237,160,74,0.3)]',
  },
];

export const GoalsList: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="glass-card goals-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            My goals
          </h2>
          <div className="flex gap-0.5">
            <button
              aria-label="Add goal"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/30 hover:text-[#C57CF9] hover:bg-[#C57CF9]/[0.06] hover:scale-110 flex items-center justify-center transition-all duration-200"
            >
              <span className="material-symbols-rounded text-[20px]">add_circle</span>
            </button>
            <button
              aria-label="More options"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/30 hover:text-[#C57CF9] hover:bg-[#C57CF9]/[0.06] hover:scale-110 flex items-center justify-center transition-all duration-200"
            >
              <span className="material-symbols-rounded text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Goals List */}
        <div className="flex flex-col gap-1.5">
          {goals.map((goal, idx) => (
            <div
              key={goal.id}
              className="group flex gap-3.5 items-start p-2.5 rounded-[8px] hover:bg-white/[0.04] hover:translate-x-1 transition-all duration-250 cursor-default"
            >
              {/* Goal Icon */}
              <div
                className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${goal.iconClass}`}
              >
                <span className="material-symbols-rounded text-[20px]">{goal.icon}</span>
              </div>

              {/* Goal Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.88rem] font-semibold text-white mb-0.5">
                  {goal.name}
                </h3>
                <p className="text-[0.75rem] text-white/30 mb-1.5 tabular-nums">
                  <strong className="text-white/70 font-semibold">
                    ${goal.current.toLocaleString()}
                  </strong>
                  /${goal.target.toLocaleString()}
                </p>

                <div className="mb-1.5">
                  <span className="text-[0.65rem] text-white/30 font-medium">
                    Progress: {goal.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    style={{
                      width: animated ? `${goal.progress}%` : '0%',
                      transitionDelay: `${idx * 150}ms`,
                    }}
                    className={`relative h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${goal.fillClass}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] bg-[length:200%_100%] animate-[progressShimmer_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoalsList;
