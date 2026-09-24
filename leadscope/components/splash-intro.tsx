'use client';

import { useState } from 'react';

export function SplashIntro() {
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <div
      className="splash-intro"
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setDone(true);
      }}
    >
      <div className="si-stack">
        <div className="si-glow" />
        <svg viewBox="0 0 24 24" fill="none" className="si-icon">
          <circle className="si-dot" cx="5" cy="19" r="1.7" fill="currentColor" />
          <path className="si-arc si-a1" pathLength="1" d="M5 13A6 6 0 0 1 11 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path className="si-arc si-a2" pathLength="1" d="M5 8A11 11 0 0 1 16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path className="si-arc si-a3" pathLength="1" d="M5 3A16 16 0 0 1 21 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.32" />
        </svg>
        <p className="si-word">LeadScope</p>
        <div className="si-bar">
          <span />
        </div>
      </div>
    </div>
  );
}
