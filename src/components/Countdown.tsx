"use client";

import { useState, useEffect } from "react";

export default function Countdown({ targetDate = "2026-10-31T20:00:00" }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculate() {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const items = [
    { label: "DÍAS", val: timeLeft.days },
    { label: "HORAS", val: timeLeft.hours },
    { label: "MIN", val: timeLeft.minutes },
    { label: "SEG", val: timeLeft.seconds },
  ];

  return (
    <div className="inline-flex items-center gap-3 sm:gap-6 py-3 px-5 sm:px-7 rounded-2xl bg-[#0d0c14]/90 border border-zinc-800/80 backdrop-blur-xl shadow-2xl shadow-black/80">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-none">
              {String(item.val).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-400 uppercase mt-1.5 font-semibold">
              {item.label}
            </span>
          </div>
          {index < items.length - 1 && (
            <span className="text-zinc-600 text-lg sm:text-2xl font-light font-mono select-none -translate-y-1">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
