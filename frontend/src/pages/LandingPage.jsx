import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* =====================================================
   NEXIE LANDING PAGE — OBSIDIAN INTELLIGENCE THEME
   ===================================================== */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  :root {
    --void: #080a0f;
    --surface: #0d1117;
    --surface-2: #111827;
    --surface-3: #1a2235;
    --border: rgba(255,255,255,0.06);
    --border-bright: rgba(255,255,255,0.12);
    --jade: #00e5a0;
    --jade-dim: rgba(0,229,160,0.12);
    --jade-glow: rgba(0,229,160,0.4);
    --amber: #f59e0b;
    --amber-dim: rgba(245,158,11,0.1);
    --sky: #38bdf8;
    --sky-dim: rgba(56,189,248,0.1);
    --text-1: #f8fafc;
    --text-2: #94a3b8;
    --text-3: #475569;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-body: 'Instrument Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .nx-root {
    background: var(--void);
    color: var(--text-1);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  /* ---- NOISE OVERLAY ---- */
  .nx-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* ---- AMBIENT ORBS ---- */
  .nx-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(130px);
    pointer-events: none;
    z-index: 0;
  }
  .nx-orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(0,229,160,0.08), transparent 70%);
    top: -200px; right: -100px;
  }
  .nx-orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(56,189,248,0.06), transparent 70%);
    bottom: 0; left: -150px;
  }

  /* ---- NAV ---- */
  .nx-nav {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 4rem;
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(10px);
    background: rgba(8,10,15,0.6);
    position: sticky;
    top: 0;
  }
  .nx-logo {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nx-logo-dot {
    width: 8px; height: 8px;
    background: var(--jade);
    border-radius: 50%;
    box-shadow: 0 0 12px var(--jade-glow);
    animation: nx-pulse 2s infinite;
  }
  @keyframes nx-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
  }

  .nx-nav-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nx-btn {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.01em;
  }
  .nx-btn-ghost {
    background: transparent;
    color: var(--text-2);
    border: 1px solid var(--border-bright);
  }
  .nx-btn-ghost:hover { background: var(--surface-3); color: var(--text-1); }
  .nx-btn-solid {
    background: var(--jade);
    color: var(--void);
    border: 1px solid transparent;
    box-shadow: 0 0 20px rgba(0,229,160,0.2);
  }
  .nx-btn-solid:hover { background: #00ffb0; box-shadow: 0 0 30px rgba(0,229,160,0.4); transform: translateY(-1px); }

  /* ---- HERO ---- */
  .nx-hero {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8rem 4rem 7rem;
    max-width: 700px;
    margin: 0 auto;
  }
  .nx-hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .nx-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--jade-dim);
    border: 1px solid rgba(0,229,160,0.2);
    border-radius: 100px;
    padding: 0.35rem 0.9rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--jade);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.75rem;
  }
  .nx-badge-blink {
    width: 6px; height: 6px;
    background: var(--jade);
    border-radius: 50%;
    animation: nx-blink 1.2s infinite;
  }
  @keyframes nx-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .nx-hero-title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 3.2vw, 3.8rem);
    font-weight: 800;
    font-optical-sizing: auto;
    line-height: 1.08;
    letter-spacing: -0.025em;
    margin-bottom: 1.25rem;
    color: var(--text-1);
    max-width: 560px;
  }
  .nx-hero-title em {
    font-style: normal;
    color: var(--jade);
  }

  .nx-hero-sub {
    font-size: 1rem;
    color: var(--text-2);
    line-height: 1.75;
    max-width: 460px;
    margin: 0 auto 2.5rem;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .nx-hero-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .nx-btn-hero {
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 700;
    padding: 0.9rem 2rem;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.25s;
    background: var(--jade);
    color: var(--void);
    box-shadow: 0 4px 30px rgba(0,229,160,0.25);
    letter-spacing: -0.01em;
  }
  .nx-btn-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,229,160,0.4); filter: brightness(1.05); }

  .nx-hero-link {
    font-size: 0.9rem;
    color: var(--text-2);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: color 0.2s;
    font-weight: 500;
  }
  .nx-hero-link:hover { color: var(--text-1); }
  .nx-hero-link svg { transition: transform 0.2s; }
  .nx-hero-link:hover svg { transform: translateX(3px); }

  /* ---- TERMINAL CARD ---- */
  .nx-terminal {
    background: var(--surface);
    border: 1px solid var(--border-bright);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,160,0.05);
    position: relative;
  }
  .nx-terminal::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--jade), transparent);
    opacity: 0.6;
  }
  .nx-term-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  .nx-term-dot {
    width: 11px; height: 11px; border-radius: 50%;
  }
  .nx-term-dot-r { background: #ff5f57; }
  .nx-term-dot-y { background: #febc2e; }
  .nx-term-dot-g { background: #28c840; }
  .nx-term-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-3);
    margin-left: auto;
    letter-spacing: 0.05em;
  }
  .nx-term-body {
    padding: 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    line-height: 1.9;
    min-height: 280px;
  }
  .nx-term-line { display: flex; gap: 0.75rem; }
  .nx-term-prompt { color: var(--jade); user-select: none; flex-shrink: 0; }
  .nx-term-cmd { color: var(--text-2); }
  .nx-term-out { color: var(--text-3); margin-left: 1.5rem; }
  .nx-term-highlight { color: var(--jade); }
  .nx-term-amber { color: var(--amber); }
  .nx-term-sky { color: var(--sky); }
  .nx-term-cursor {
    display: inline-block;
    width: 7px;
    height: 1em;
    background: var(--jade);
    vertical-align: middle;
    margin-left: 2px;
    animation: nx-blink 1s infinite;
  }

  /* ---- STATS BAR ---- */
  .nx-stats {
    position: relative;
    z-index: 2;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(13,17,23,0.8);
    backdrop-filter: blur(10px);
  }
  .nx-stats-inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 4rem;
  }
  .nx-stat {
    padding: 2.5rem 2rem;
    border-right: 1px solid var(--border);
  }
  .nx-stat:last-child { border-right: none; }
  .nx-stat-num {
    font-family: var(--font-display);
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-1);
    margin-bottom: 0.25rem;
  }
  .nx-stat-num span { color: var(--jade); }
  .nx-stat-label {
    font-size: 0.8rem;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-family: var(--font-mono);
  }

  /* ---- FEATURES ---- */
  .nx-features {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 8rem 4rem;
  }
  .nx-section-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--jade);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nx-section-tag::before {
    content: '';
    display: block;
    width: 24px; height: 1px;
    background: var(--jade);
  }
  .nx-section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-weight: 800;
    font-optical-sizing: auto;
    letter-spacing: -0.025em;
    color: var(--text-1);
    margin-bottom: 4rem;
    max-width: 520px;
    line-height: 1.1;
  }
  .nx-section-title em {
    font-style: normal;
    color: var(--text-3);
  }

  .nx-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }
  .nx-feat {
    background: var(--surface);
    padding: 2.5rem;
    transition: background 0.25s;
    position: relative;
    cursor: default;
  }
  .nx-feat:hover { background: var(--surface-3); }
  .nx-feat-star {
    background: var(--surface-3);
    border: 1px solid rgba(0,229,160,0.2);
    position: relative;
  }
  .nx-feat-star::before {
    content: 'NEW';
    position: absolute;
    top: 1.5rem; right: 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--jade);
    background: var(--jade-dim);
    border: 1px solid rgba(0,229,160,0.3);
    padding: 0.2rem 0.5rem;
    border-radius: 100px;
    letter-spacing: 0.1em;
  }
  .nx-feat-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
  }
  .nx-feat-icon-jade { background: var(--jade-dim); color: var(--jade); }
  .nx-feat-icon-amber { background: var(--amber-dim); color: var(--amber); }
  .nx-feat-icon-sky { background: var(--sky-dim); color: var(--sky); }

  .nx-feat-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
    color: var(--text-1);
  }
  .nx-feat-desc {
    font-size: 0.875rem;
    color: var(--text-2);
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-weight: 300;
  }
  .nx-feat-tag {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-3);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--border-bright);
    border-radius: 4px;
    display: inline-block;
  }

  /* ---- DEEP FEATURE (Local Machine) ---- */
  .nx-deep {
    position: relative;
    z-index: 2;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .nx-deep-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 8rem 4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
    align-items: center;
  }
  .nx-deep-visual {
    position: relative;
  }
  .nx-file-explorer {
    background: var(--surface-2);
    border: 1px solid var(--border-bright);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
  }
  .nx-fe-bar {
    padding: 0.875rem 1.25rem;
    background: var(--surface-3);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-3);
  }
  .nx-fe-icon { color: var(--jade); font-size: 0.9rem; }
  .nx-fe-body { padding: 1rem 0; }
  .nx-fe-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-2);
    transition: background 0.15s;
    cursor: default;
  }
  .nx-fe-row:hover { background: var(--surface-3); }
  .nx-fe-row-active { background: rgba(0,229,160,0.06) !important; color: var(--jade); }
  .nx-fe-type-dir { color: var(--sky); }
  .nx-fe-type-file { color: var(--text-3); }
  .nx-fe-indent { padding-left: 2.5rem; }
  .nx-fe-action {
    margin: 1rem 1.25rem 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--jade-dim);
    border: 1px solid rgba(0,229,160,0.2);
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--jade);
    line-height: 1.6;
  }
  .nx-floating-chip {
    position: absolute;
    right: -1.5rem;
    bottom: 2rem;
    background: var(--void);
    border: 1px solid var(--border-bright);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  .nx-floating-chip strong { color: var(--jade); display: block; margin-bottom: 0.15rem; }

  /* ---- MEMORY SECTION ---- */
  .nx-memory {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 8rem 4rem;
  }
  .nx-mem-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 3rem;
  }
  .nx-mem-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .nx-mem-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
  }
  .nx-mem-card-short::before { background: linear-gradient(90deg, var(--sky), transparent); }
  .nx-mem-card-long::before { background: linear-gradient(90deg, var(--amber), transparent); }
  .nx-mem-label {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nx-mem-label::before {
    content: '';
    display: block;
    width: 6px; height: 6px;
    border-radius: 50%;
  }
  .nx-mem-short .nx-mem-label::before { background: var(--sky); box-shadow: 0 0 8px var(--sky); }
  .nx-mem-long .nx-mem-label::before { background: var(--amber); box-shadow: 0 0 8px var(--amber); }
  .nx-mem-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }
  .nx-mem-desc {
    font-size: 0.875rem;
    color: var(--text-2);
    line-height: 1.7;
    font-weight: 300;
  }
  .nx-mem-items {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .nx-mem-item {
    background: var(--surface-2);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nx-mem-item::before { content: '›'; color: var(--jade); }

  /* ---- INTERNET SECTION ---- */
  .nx-internet {
    position: relative;
    z-index: 2;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .nx-internet-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 8rem 4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
    align-items: center;
  }
  .nx-search-demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .nx-search-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--surface-3);
    border: 1px solid var(--border-bright);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }
  .nx-search-bar-icon { color: var(--sky); }
  .nx-result-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: border-color 0.2s;
  }
  .nx-result-card:hover { border-color: var(--border-bright); }
  .nx-result-num {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--jade);
    padding-top: 0.15rem;
    flex-shrink: 0;
  }
  .nx-result-title {
    font-size: 0.82rem;
    color: var(--text-1);
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .nx-result-url {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--sky);
  }

  /* ---- CTA ---- */
  .nx-cta {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 8rem 4rem;
    text-align: center;
  }
  .nx-cta-box {
    background: var(--surface);
    border: 1px solid var(--border-bright);
    border-radius: 20px;
    padding: 5rem;
    position: relative;
    overflow: hidden;
  }
  .nx-cta-box::before {
    content: '';
    position: absolute;
    top: 0; left: 50%; transform: translateX(-50%);
    width: 60%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--jade), transparent);
  }
  .nx-cta-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-1);
    margin-bottom: 1rem;
    line-height: 1.1;
  }
  .nx-cta-sub {
    font-size: 1rem;
    color: var(--text-2);
    max-width: 480px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
    font-weight: 300;
  }
  .nx-cta-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .nx-cta-note {
    margin-top: 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-3);
    letter-spacing: 0.05em;
  }

  /* ---- FOOTER ---- */
  .nx-footer {
    position: relative;
    z-index: 2;
    border-top: 1px solid var(--border);
    padding: 2rem 4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1280px;
    margin: 0 auto;
  }
  .nx-footer-logo {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-3);
  }
  .nx-footer-copy {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-3);
    letter-spacing: 0.05em;
  }

  /* ---- ANIMATIONS ---- */
  @keyframes nx-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .nx-animate { animation: nx-fade-up 0.6s ease both; }
  .nx-d1 { animation-delay: 0.1s; }
  .nx-d2 { animation-delay: 0.2s; }
  .nx-d3 { animation-delay: 0.3s; }
  .nx-d4 { animation-delay: 0.4s; }
  .nx-d5 { animation-delay: 0.5s; }

  /* ---- RESPONSIVE ---- */
  @media (max-width: 1024px) {
    .nx-nav { padding: 1.5rem 2rem; }
    .nx-hero, .nx-deep-inner, .nx-internet-inner { padding: 5rem 2rem; gap: 3rem; }
    .nx-features, .nx-memory, .nx-cta { padding: 5rem 2rem; }
    .nx-stats-inner { padding: 0 2rem; }
    .nx-footer { padding: 2rem; }
  }

  @media (max-width: 768px) {
    .nx-hero { padding: 5rem 1.5rem 4rem; }
    .nx-deep-inner, .nx-internet-inner { grid-template-columns: 1fr; padding: 4rem 1.5rem; }
    .nx-features-grid { grid-template-columns: 1fr; }
    .nx-stats-inner { grid-template-columns: 1fr 1fr; }
    .nx-mem-grid { grid-template-columns: 1fr; }
    .nx-features, .nx-memory, .nx-cta { padding: 4rem 1.5rem; }
    .nx-cta-box { padding: 3rem 1.5rem; }
    .nx-nav { padding: 1.25rem 1.5rem; }
    .nx-footer { padding: 1.5rem; flex-direction: column; gap: 0.5rem; text-align: center; }
    .nx-floating-chip { display: none; }
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();

  const login = () => navigate('/login');
  const register = () => navigate('/register');

  return (
    <>
      <style>{styles}</style>
      <div className="nx-root">
        <div className="nx-orb nx-orb-1" />
        <div className="nx-orb nx-orb-2" />

        {/* NAV */}
        <nav className="nx-nav">
          <div className="nx-logo">
            Nexie
            <span className="nx-logo-dot" />
          </div>
          <div className="nx-nav-links">
            <button className="nx-btn nx-btn-ghost" onClick={login}>Sign in</button>
            <button className="nx-btn nx-btn-solid" onClick={register}>Get started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="nx-hero">
          <div className="nx-hero-content">
            <div className="nx-badge nx-animate nx-d1">
              <span className="nx-badge-blink" />
              Local machine access · Now live
            </div>
            <h1 className="nx-hero-title nx-animate nx-d2">
              The AI that<br />
              <em>actually does things.</em>
            </h1>
            <p className="nx-hero-sub nx-animate nx-d3">
              Nexie searches the web, remembers your preferences, and operates directly on your local machine — all in one intelligent conversation.
            </p>
            <div className="nx-hero-actions nx-animate nx-d4">
              <button className="nx-btn-hero" onClick={register}>Start for free →</button>
              <button className="nx-hero-link" onClick={login}>
                Already have an account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="nx-stats">
          <div className="nx-stats-inner">
            {[
              { num: '3', unit: 'x', label: 'Core capabilities' },
              { num: '<0.5', unit: 's', label: 'Avg search latency' },
              { num: '∞', unit: '', label: 'Long-term memory' },
              { num: '100', unit: '%', label: 'Local file access' },
            ].map((s, i) => (
              <div key={i} className="nx-stat">
                <div className="nx-stat-num">{s.num}<span>{s.unit}</span></div>
                <div className="nx-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES GRID */}
        <section className="nx-features">
          <div className="nx-section-tag">Capabilities</div>
          <h2 className="nx-section-title">Everything you need,<br /><em>nothing you don't.</em></h2>
          <div className="nx-features-grid">
            {[
              {
                icon: '🖥️', iconClass: 'nx-feat-icon-jade', star: true,
                title: 'Local Machine Access',
                desc: 'Nexie reaches into your filesystem, reads your code, and executes commands — securely, within defined boundaries. Your machine becomes an extension of the conversation.',
                tag: 'shell · filesystem · execution',
              },
              {
                icon: '🌐', iconClass: 'nx-feat-icon-sky', star: false,
                title: 'Live Internet Search',
                desc: 'No stale training data. Nexie pulls real-time results from the web, synthesises sources, and delivers answers grounded in what\'s happening right now.',
                tag: 'real-time · multi-source · cited',
              },
              {
                icon: '🧠', iconClass: 'nx-feat-icon-amber', star: false,
                title: 'Persistent Memory',
                desc: 'Short-term context keeps your conversation coherent. Long-term memory ensures Nexie knows your preferences, projects, and patterns — every single session.',
                tag: 'short-term · long-term · adaptive',
              },
            ].map((f, i) => (
              <div key={i} className={`nx-feat ${f.star ? 'nx-feat-star' : ''}`}>
                <div className={`nx-feat-icon ${f.iconClass}`}>{f.icon}</div>
                <div className="nx-feat-title">{f.title}</div>
                <p className="nx-feat-desc">{f.desc}</p>
                <span className="nx-feat-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* LOCAL MACHINE DEEP DIVE */}
        <section className="nx-deep">
          <div className="nx-deep-inner">
            <div className="nx-deep-visual">
              <div className="nx-file-explorer">
                <div className="nx-fe-bar">
                  <span className="nx-fe-icon">◈</span>
                  ~/projects/my-app
                </div>
                <div className="nx-fe-body">
                  {[
                    { icon: '📁', name: 'src/', type: 'dir', indent: false, active: false },
                    { icon: '📄', name: 'App.jsx', type: 'file', indent: true, active: false },
                    { icon: '📄', name: 'index.css', type: 'file', indent: true, active: false },
                    { icon: '📁', name: 'components/', type: 'dir', indent: true, active: false },
                    { icon: '📄', name: 'LandingPage.jsx', type: 'file', indent: true, active: true },
                    { icon: '📁', name: 'styles/', type: 'dir', indent: false, active: false },
                    { icon: '📄', name: 'package.json', type: 'file', indent: false, active: false },
                  ].map((r, i) => (
                    <div key={i} className={`nx-fe-row ${r.indent ? 'nx-fe-indent' : ''} ${r.active ? 'nx-fe-row-active' : ''}`}>
                      <span className={r.type === 'dir' ? 'nx-fe-type-dir' : 'nx-fe-type-file'}>{r.icon}</span>
                      {r.name}
                    </div>
                  ))}
                  <div className="nx-fe-action">
                    ✦ Nexie: Detected unused imports in LandingPage.jsx<br />
                    → Cleaned 4 lines · Saved automatically
                  </div>
                </div>
              </div>
              <div className="nx-floating-chip">
                <strong>✓ Access granted</strong>
                sandbox mode · read + write
              </div>
            </div>
            <div>
              <div className="nx-section-tag">Local Access</div>
              <h2 className="nx-section-title" style={{ marginBottom: '1.5rem' }}>
                Your files. Your tools.<br />Nexie's intelligence.
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '2rem' }}>
                Grant Nexie access to your local machine and unlock a new class of tasks: refactoring code across directories, reading config files, running scripts, and generating reports based on your actual data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Read, write & execute in defined directories',
                  'Understand your full project context at once',
                  'Run terminal commands with your approval',
                  'Generate file diffs before any changes are saved',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--jade)', flexShrink: 0 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MEMORY SECTION */}
        <section className="nx-memory">
          <div className="nx-section-tag">Memory</div>
          <h2 className="nx-section-title">An AI that<br />actually remembers.</h2>
          <div className="nx-mem-grid">
            <div className="nx-mem-card nx-mem-card-short nx-mem-short">
              <div className="nx-mem-label">Short-term memory</div>
              <div className="nx-mem-title">Contextual clarity,<br />every message.</div>
              <p className="nx-mem-desc">Within a session, Nexie tracks everything — your tone, your goals, the files you mentioned, the decisions you made. No repetition required.</p>
              <div className="nx-mem-items">
                {['Tracks conversation context across long threads', 'Recalls earlier decisions mid-conversation', 'Adapts tone based on session signals'].map((m, i) => (
                  <div key={i} className="nx-mem-item">{m}</div>
                ))}
              </div>
            </div>
            <div className="nx-mem-card nx-mem-card-long nx-mem-long">
              <div className="nx-mem-label">Long-term memory</div>
              <div className="nx-mem-title">Knows you. Stays knowing.</div>
              <p className="nx-mem-desc">Preferences, project names, code style, shortcuts you like — Nexie stores what matters and surfaces it when relevant, automatically.</p>
              <div className="nx-mem-items">
                {['Persists preferences across all sessions', 'Learns your project structure over time', 'Zero-prompt recall of past context'].map((m, i) => (
                  <div key={i} className="nx-mem-item">{m}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INTERNET SECTION */}
        <section className="nx-internet">
          <div className="nx-internet-inner">
            <div>
              <div className="nx-section-tag">Internet Search</div>
              <h2 className="nx-section-title" style={{ marginBottom: '1.5rem' }}>
                Always current.<br />Always cited.
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '2rem' }}>
                Nexie doesn't rely on training data alone. It searches the live web, reads multiple sources, and synthesises a clean answer — with links so you can verify everything.
              </p>
              {['Pulls from 12+ sources per query', 'Cites every claim with a source URL', 'Runs follow-up searches automatically when needed'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--sky)', flexShrink: 0 }}>→</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="nx-search-demo">
              <div className="nx-search-bar">
                <span className="nx-search-bar-icon">⌕</span>
                best React state management 2025
                <span style={{ marginLeft: 'auto', color: 'var(--jade)', fontSize: '0.65rem' }}>LIVE</span>
              </div>
              {[
                { title: 'Zustand vs Redux Toolkit in 2025 — A Deep Dive', url: 'blog.devtools.io' },
                { title: 'React State Management: The Definitive Guide', url: 'react.dev/learn' },
                { title: 'Why Teams Are Switching to Jotai', url: 'medium.com/frontend' },
              ].map((r, i) => (
                <div key={i} className="nx-result-card">
                  <div className="nx-result-num">0{i + 1}</div>
                  <div>
                    <div className="nx-result-title">{r.title}</div>
                    <div className="nx-result-url">{r.url}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="nx-cta">
          <div className="nx-cta-box">
            <h2 className="nx-cta-title">
              Stop switching tools.<br />Start using Nexie.
            </h2>
            <p className="nx-cta-sub">
              One conversation layer across your machine, the web, and your memory. Built for people who get things done.
            </p>
            <div className="nx-cta-actions">
              <button className="nx-btn-hero" onClick={register}>Create free account</button>
              <button className="nx-btn nx-btn-ghost" onClick={login}>Sign in</button>
            </div>
            <p className="nx-cta-note">no credit card · no setup · production-ready in minutes</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="nx-footer">
          <div className="nx-footer-logo">Nexie</div>
          <div className="nx-footer-copy">© {new Date().getFullYear()} Nexie. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}