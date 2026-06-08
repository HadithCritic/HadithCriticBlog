# HadithCriticBlog Source Export

This file bundles the requested project files so they can be shared as one Markdown document.

## Table of Contents
- [Emblem.astro](#emblem-astro)
- [BaseLayout.astro](#baselayout-astro)
- [index.astro](#index-astro)
- [global.css](#global-css)
- [content.config.ts](#content-config-ts)
- [astro.config.mjs](#astro-config-mjs)

## Emblem.astro

Path: `src\components\Emblem.astro`

```astro
---
export interface Props {
  variant?: 'primary' | 'monochrome' | 'inverse' | 'ghost' | 'simplified';
  size?: 'sm' | 'md' | 'lg' | 'hero' | string;
  className?: string;
}

const { 
  variant = 'primary', 
  size = 'md',
  className = ''
} = Astro.props;

// Determine width based on size prop
let width;
if (size === 'sm') width = '24px';
else if (size === 'md') width = '36px';
else if (size === 'lg') width = '56px';
else if (size === 'hero') width = '104px';
else width = size;

// Setup stroke styles depending on variant
let strokeColor = 'url(#emblemGold)';
let fillPath = 'none';
let opacity = '1';

if (variant === 'monochrome') {
  strokeColor = 'currentColor';
} else if (variant === 'inverse') {
  strokeColor = 'var(--bg-primary)';
} else if (variant === 'ghost') {
  strokeColor = 'currentColor';
  opacity = '0.3';
} else if (variant === 'simplified') {
  strokeColor = 'currentColor';
}

---

<svg viewBox="0 0 100 180" class={`hc-emblem hc-emblem-${variant} hc-emblem-${size} ${className}`} aria-label="HadithCritic: fractured chain of narration" style={`width: ${width}; opacity: ${opacity};`}>
  <defs>
    <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--accent-primary, #D8B761)"/>
      <stop offset="50%" stop-color="var(--hc-gold, #9A7B28)"/>
      <stop offset="100%" stop-color="var(--accent-primary, #D8B761)"/>
    </linearGradient>
  </defs>
  
  {variant !== 'simplified' && (
    <!-- Top hexagon: intact -->
    <path d="M50 4 L88 26 L88 58 L50 80 L12 58 L12 26 Z" 
          fill={fillPath} stroke={strokeColor} stroke-width="2.5" stroke-linejoin="round"/>
  )}

  <!-- Middle hexagon: BROKEN -->
  <g class="middle-link">
    <!-- Top half -->
    <path d="M50 54 L88 76 L88 92 L50 92" 
          fill={fillPath} stroke={strokeColor} stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Bottom half -->
    <path d="M50 92 L12 92 L12 76 L50 54" 
          fill={fillPath} stroke={strokeColor} stroke-width="2.5" stroke-linejoin="round"/>
  </g>
  
  {variant !== 'simplified' && (
    <!-- Bottom hexagon: intact -->
    <path d="M50 98 L88 120 L88 152 L50 174 L12 152 L12 120 Z" 
          fill={fillPath} stroke={strokeColor} stroke-width="2.5" stroke-linejoin="round"/>
  )}
</svg>

<style>
  .hc-emblem {
    height: auto;
    display: inline-block;
    vertical-align: middle;
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .hc-emblem:hover {
    transform: scale(1.05);
  }

  @media (prefers-color-scheme: dark) {
    .hc-emblem-primary {
      filter: drop-shadow(0 0 8px rgba(216, 183, 97, 0.15));
    }
  }
</style>
```

## BaseLayout.astro

Path: `src\layouts\BaseLayout.astro`

```astro
---
import '../styles/global.css';
import Emblem from '../components/Emblem.astro';

interface Props {
  title?: string;
  description?: string;
}

const { 
  title = "HadithCritic", 
  description = "Historical Criticism & Quranic Scholarship" 
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <!-- Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
    
    <!-- Theme Script (Blocking to prevent FOUC) -->
    <script is:inline>
      const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    </script>
  </head>
  <body class="app-container">
    <!-- Decorative backgrounds from globals(1).css -->
    <div class="page-bg-container">
      <div class="page-bg-image"></div>
      <div class="static-overlay"></div>
      <div class="grain-overlay"></div>
    </div>
    
    <!-- Header -->
    <header class="site-header">
      <div class="wrap site-header-inner">
        <a class="site-brand" href="/">
          <img class="site-brand-mark" src="/geometric_emblem_transparent.png" alt="HadithCritic Emblem" />
          <span class="site-brand-name">HadithCritic</span>
        </a>
        
        <nav class="site-nav" aria-label="Main Navigation">
          <a href="/research">Research</a>
          <a href="/listen">Listen</a>
          <a href="/dossiers">Dossiers</a>
          <a href="/books">Books</a>
          <a href="/methodology">Methodology</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="site-actions">
          <button type="button" class="header-icon-btn" aria-label="Search">
            <i class="fa-solid fa-search" aria-hidden="true"></i>
          </button>
          
          <button type="button" class="toggle-switch" id="theme-toggle" aria-label="Toggle dark mode">
            <div class="toggle-knob">
              <i class="fa-solid fa-moon" style="font-size: 0.5rem; display: none;" id="dark-icon" aria-hidden="true"></i>
              <i class="fa-solid fa-sun" style="font-size: 0.5rem;" id="light-icon" aria-hidden="true"></i>
            </div>
          </button>

          <button type="button" class="header-icon-btn header-menu-btn" id="menu-open-btn" aria-label="Open menu">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Full-screen Overlay Menu -->
    <div id="mobile-menu-overlay" class="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation">
      <div class="menu-header px-4 px-md-5 py-3 d-flex justify-content-between align-items-center" style="height: 72px;">
        <h1 class="m-0" style="font-family: var(--font-display); font-size: clamp(1.2rem, 3vw, 1.8rem);">
          <span class="text-uppercase" style="font-weight: 700; letter-spacing: 0.05em; color: var(--ink-1);">HadithCritic</span>
        </h1>
        <button type="button" class="menu-close-wrapper d-flex align-items-center justify-content-center" id="menu-close-btn" aria-label="Close menu">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      
      <nav class="menu-nav px-4 px-md-5 flex-grow-1 d-flex flex-column" style="overflow-y: auto;">
        <ul class="list-unstyled menu-link-list mx-auto w-100 mt-4 mt-md-5 pt-2">
          <li><a href="/research"><span class="menu-bullet"></span>Read</a></li>
          <li><a href="/listen"><span class="menu-bullet"></span>Listen</a></li>
          <li><a href="/dossiers"><span class="menu-bullet"></span>Dossiers</a></li>
          <li><a href="/books"><span class="menu-bullet"></span>Books</a></li>
          <li><a href="/methodology"><span class="menu-bullet"></span>Methodology</a></li>
          <li><a href="/about"><span class="menu-bullet"></span>About</a></li>
        </ul>
        
        <div class="menu-footer mx-auto w-100 mt-auto pt-4 pb-4 border-top" style="max-width: 520px; border-color: var(--border) !important;">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <span style="font-size: 0.7rem; font-family: var(--sans); text-transform: uppercase; letter-spacing: 0.22em; color: var(--ink-3); font-weight: 600;">Theme</span>
            <div class="menu-theme-pill" role="group" aria-label="Theme">
               <button type="button" class="theme-opt" id="menu-opt-light"><i class="fa-solid fa-sun"></i> Light</button>
               <button type="button" class="theme-opt" id="menu-opt-dark"><i class="fa-solid fa-moon"></i> Dark</button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center">
             <span style="font-size: 0.7rem; font-family: var(--sans); text-transform: uppercase; letter-spacing: 0.22em; color: var(--ink-3); font-weight: 600;">Notifications</span>
             <button type="button" class="menu-notif-btn"><i class="fa-solid fa-bell-slash me-2"></i> OFF</button>
          </div>
        </div>
      </nav>
    </div>

    <div class="layout-root">
      <main class="main-content">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="wrap footer-inner">
        <div class="footer-brand">
          <a href="/" class="footer-logo">
            <img src="/geometric_emblem_transparent.png" alt="" class="footer-mark" />
            <span>HadithCritic</span>
          </a>
          <p>Quran-centered hadith criticism, transmitter history, and textual analysis.</p>
        </div>

        <nav class="footer-links" aria-label="Footer">
          <a href="/research">Research</a>
          <a href="/methodology">Methodology</a>
          <a href="/dossiers">Dossiers</a>
          <a href="/books">Books</a>
          <a href="/about">About</a>
          <a href="https://www.youtube.com/@HadithCritic">YouTube</a>
        </nav>
      </div>

      <div class="wrap footer-bottom">
        <span>&copy; 2026 HadithCritic</span>
        <span>Verification over reputation.</span>
      </div>
    </footer>


  
<style is:global>
/* â”€â”€ Header Styling â”€â”€ */
.site-header {
  height: 64px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
}

.site-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: var(--ink-1);
}

.site-brand-mark {
  width: 30px;
  height: 42px;
  object-fit: contain;
}

.site-brand-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--ink-3);
  font-family: var(--sans);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color var(--t-fast);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.site-nav a:hover {
  color: var(--accent);
}

.site-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 960px) {
  .site-nav {
    display: none;
  }
}

@media (max-width: 640px) {
  .site-header {
    height: 56px;
  }
  .site-brand-mark {
    width: 24px;
    height: 34px;
  }
  .site-brand-name {
    font-size: 1.05rem;
  }
}

/* â”€â”€ Footer Styling â”€â”€ */
.site-footer {
  padding: 2.25rem 0 1.5rem;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
}

[data-theme="dark"] .site-footer {
  background:
    linear-gradient(180deg, rgba(216,183,97,0.035), transparent 45%),
    var(--bg-card);
}

.footer-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: start;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--ink-1);
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
}

.footer-mark {
  width: 24px;
  height: 34px;
  object-fit: contain;
}

.footer-brand p {
  max-width: 34rem;
  margin: 0.7rem 0 0;
  color: var(--ink-3);
  font-family: var(--serif);
  font-size: 0.98rem;
  line-height: 1.55;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem 1rem;
  max-width: 28rem;
}

.footer-links a {
  color: var(--ink-3);
  font-family: var(--sans);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--accent);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-3);
  color: var(--ink-5);
  font-family: var(--sans);
  font-size: 0.72rem;
}

@media (max-width: 720px) {
  .footer-inner,
  .footer-bottom {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .footer-links {
    justify-content: flex-start;
  }
}

.header-icon-btn,
.menu-close-wrapper {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--ink-1);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
}

.header-icon-btn:hover,
.menu-close-wrapper:hover {
  background: var(--bg-raised);
  border-color: var(--border);
  color: var(--accent);
}

.header-menu-btn {
  font-size: 1.35rem;
}

.toggle-switch {
  min-height: 32px;
  border: 1px solid var(--border);
}

.menu-header {
  font-family: var(--sans);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-4);
  font-weight: 600;
  margin-bottom: var(--s4);
}

/* â”€â”€ Mobile Menu â”€â”€ */
.mobile-menu-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 1050;
  background: var(--bg);
  backdrop-filter: blur(30px);
  display: flex;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}
.mobile-menu-overlay.active { opacity: 1; pointer-events: auto; }
.menu-link-list { max-width: 520px; display: flex; flex-direction: column; gap: 0.5rem; }
.menu-link-list a {
  display: flex; align-items: center; gap: 0.8rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 2.5rem);
  color: var(--ink-2);
  text-decoration: none;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.02em;
  transition: color 0.2s;
}
.menu-link-list a:hover { color: var(--ink-1); }
.menu-bullet {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.2s;
}
.menu-link-list a:hover .menu-bullet { opacity: 1; }
[data-theme="dark"] .input {
  background: rgba(21, 19, 15, 0.86);
  border-color: rgba(216,183,97,0.16);
  color: var(--ink-1);
  backdrop-filter: blur(20px);
}
[data-theme="dark"] .input::placeholder {
  color: rgba(200,191,176,0.52);
  font-style: normal;
}
[data-theme="dark"] .article-card-tag {
  background: rgba(21,19,15,0.85);
  border-color: rgba(255,255,255,0.1);
  color: var(--ink-3);
}
[data-theme="dark"] .video-card-duration { background: rgba(0,0,0,0.85); }

/* â”€â”€ Utilities â”€â”€ */
.text-balance { text-wrap: balance; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* â”€â”€ Horizontal Scroll Container â”€â”€ */
.h-scroll {
  display: flex;
  gap: var(--s5);
  overflow-x: auto;
  padding-bottom: var(--s4);
  scrollbar-width: thin;
  scrollbar-color: var(--border-2) transparent;
  margin: 0 calc(-1 * var(--s6));
  padding-left: var(--s6);
  padding-right: var(--s6);
}
.h-scroll::-webkit-scrollbar { height: 4px; }
.h-scroll::-webkit-scrollbar-track { background: transparent; }
.h-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 2px; }


</style>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     SCRIPTS
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script>
  // â”€â”€ Theme Toggle â”€â”€
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const darkIcon = document.getElementById('dark-icon');
  const lightIcon = document.getElementById('light-icon');
  const optLight = document.getElementById('menu-opt-light');
  const optDark = document.getElementById('menu-opt-dark');

  function updateIcons(theme) {
    if (theme === 'dark') {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
      if(optDark) optDark.classList.add('active');
      if(optLight) optLight.classList.remove('active');
    } else {
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
      if(optLight) optLight.classList.add('active');
      if(optDark) optDark.classList.remove('active');
    }
  }

  updateIcons(html.getAttribute('data-theme') || 'light');

  function setTheme(newTheme) {
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
  }

  toggle.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  if (optLight && optDark) {
    optLight.addEventListener('click', () => setTheme('light'));
    optDark.addEventListener('click', () => setTheme('dark'));
  }

  // â”€â”€ Mobile Menu â”€â”€
  const overlay = document.getElementById('mobile-menu-overlay');
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const body = document.body;

  if (openBtn && closeBtn && overlay) {
    openBtn.addEventListener('click', () => { overlay.classList.add('active'); body.style.overflow = 'hidden'; });
    closeBtn.addEventListener('click', () => { overlay.classList.remove('active'); body.style.overflow = ''; });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.classList.remove('active'); body.style.overflow = ''; } });
  }

  // â”€â”€ Tab Switching â”€â”€
  function initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('.seg-control-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        // Update all tab containers (desktop + mobile)
        document.querySelectorAll('.seg-control-btn').forEach(b => {
          if (b.dataset.tab === tab) b.classList.add('active');
          else b.classList.remove('active');
        });
        // Show/hide panels
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById('tab-' + tab);
        if (panel) panel.style.display = 'block';
      });
    });
  }
  initTabs('content-tabs');
  initTabs('content-tabs-mobile');

  // â”€â”€ Swiper â”€â”€
  document.addEventListener('DOMContentLoaded', () => {
    const initSwiper = () => {
      if (typeof window.Swiper !== 'undefined') {
        new window.Swiper('.video-swiper', {
          slidesPerView: 'auto',
          spaceBetween: 24,
          freeMode: true,
          grabCursor: true,
          breakpoints: {
            768: { spaceBetween: 28 },
            1200: { spaceBetween: 32 }
          }
        });
      } else {
        setTimeout(initSwiper, 100);
      }
    };
    initSwiper();
  });

  // â”€â”€ Intersection Observer for fade-up animations â”€â”€
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
</script>
</body>
</html>
```

## index.astro

Path: `src\pages\index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Emblem from '../components/Emblem.astro';
---

<BaseLayout
  title="HadithCritic | Verification Over Reputation"
  description="Historical criticism, Quranic scholarship, and source-level analysis of hadith traditions."
>
  <section class="home-hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="hero-kicker">Quran-centered hadith criticism</p>
        <h1>Verification over reputation.</h1>
        <p class="hero-lede">
          HadithCritic examines inherited reports through source criticism, transmitter history,
          sectarian context, and the Quranic demand for evidence.
        </p>
        <div class="hero-actions" aria-label="Primary">
          <a href="/research" class="btn btn-primary">Read research</a>
          <a href="/methodology" class="btn btn-ghost">Study the method</a>
        </div>
      </div>

      <div class="hero-art" aria-label="HadithCritic emblem and research notes">
        <div class="hero-art-mark">
          <Emblem variant="primary" size="hero" />
        </div>
        <div class="source-sheet">
          <span>Common link analysis</span>
          <strong>Abu Tufayl dossier</strong>
          <p>Transmission clusters, political setting, and late attribution patterns.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="topic-band" aria-label="Research categories">
    <div class="wrap topic-grid">
      <a href="/category/prophecies">Prophecies and apocalyptic reports</a>
      <a href="/category/isnad">Isnad and transmitter forensics</a>
      <a href="/category/quranic-theology">Quranic theology and law</a>
      <a href="/category/philosophy">Philosophy of hadith</a>
      <a href="/category/comparative-religion">Scriptural history</a>
    </div>
  </section>

  <section class="section latest-section">
    <div class="wrap latest-grid">
      <div class="section-copy-block">
        <p class="small-label">Latest work</p>
        <h2>New arguments, dated and traceable.</h2>
        <p>
          Each article should make the chain of reasoning visible: what the report claims,
          who carried it, where it appears, and what pressure the evidence can bear.
        </p>
        <a href="/research" class="btn-text">Browse the archive</a>
      </div>

      <div class="article-list" aria-label="Latest articles">
        <a href="/research/kaysani-origins-abu-tufayl" class="article-row">
          <time datetime="2026-06-08">Jun 8, 2026</time>
          <span>The Kaysani origins of Abu Tufayl's traditions</span>
        </a>
        <a href="/research/adala-sahaba-textual-study" class="article-row">
          <time datetime="2026-06-05">Jun 5, 2026</time>
          <span>Reassessing the 'adala of the Sahaba: a textual study</span>
        </a>
        <a href="/research/umayyad-influence-early-jurisprudence" class="article-row">
          <time datetime="2026-06-02">Jun 2, 2026</time>
          <span>Umayyad influence on early jurisprudence</span>
        </a>
        <a href="/research/furqan-principle-verification" class="article-row">
          <time datetime="2026-05-28">May 28, 2026</time>
          <span>The Furqan principle in hadith verification</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section evidence-section">
    <div class="wrap evidence-grid">
      <figure class="feature-image">
        <img src="/images/RefutationKJI_FC.png" alt="Cover for a HadithCritic refutation publication" loading="lazy" />
      </figure>

      <div class="evidence-panel">
        <p class="small-label">Research library</p>
        <h2>Books, dossiers, and long-form refutations.</h2>
        <p>
          The library gives longer arguments room to breathe. Use it for full refutations,
          transmitter profiles, bibliography work, and source-by-source investigations.
        </p>
        <div class="library-links">
          <a href="/books">Books and PDFs</a>
          <a href="/dossiers">Transmitter dossiers</a>
          <a href="/bibliography">Bibliography</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section dossier-section">
    <div class="wrap">
      <div class="section-heading">
        <p class="small-label">Dossiers</p>
        <h2>Profiles built around evidence, not inherited rank.</h2>
      </div>

      <div class="dossier-grid" aria-label="Key transmitter dossiers">
        <a href="/dossiers/abu-hurayra" class="dossier-link">
          <strong>Abu Hurayra</strong>
          <span>Medinan reports, volume anomalies, legal narratives</span>
        </a>
        <a href="/dossiers/aisha" class="dossier-link">
          <strong>Aisha</strong>
          <span>Domestic reports, legal memory, disputed attributions</span>
        </a>
        <a href="/dossiers/al-zuhri" class="dossier-link">
          <strong>Al-Zuhri</strong>
          <span>Umayyad patronage, compilation history, common links</span>
        </a>
        <a href="/dossiers/abu-tufayl" class="dossier-link">
          <strong>Abu Tufayl</strong>
          <span>Kaysani material, late survival claims, sectarian setting</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section method-section">
    <div class="wrap method-grid">
      <div>
        <p class="small-label">Method</p>
        <h2>How a report gets tested.</h2>
      </div>
      <ol class="method-list">
        <li>
          <div>
            <strong>Locate the earliest forms.</strong>
            <span>Map the report across collections before treating any single wording as original.</span>
          </div>
        </li>
        <li>
          <div>
            <strong>Reconstruct the transmission path.</strong>
            <span>Track clusters, common links, regional patterns, and suspicious bottlenecks.</span>
          </div>
        </li>
        <li>
          <div>
            <strong>Read the historical setting.</strong>
            <span>Ask who benefits from the report, where the claim appears, and when it becomes useful.</span>
          </div>
        </li>
        <li>
          <div>
            <strong>Test it by the Quran.</strong>
            <span>Use the Quran as criterion when inherited reports make theological or legal claims.</span>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <section class="section media-section">
    <div class="wrap media-grid">
      <div class="section-copy-block">
        <p class="small-label">Video lectures</p>
        <h2>Watch the argument unfold.</h2>
        <p>
          Short lectures and longer debates turn the written method into a visible research process.
        </p>
        <a href="https://www.youtube.com/@HadithCritic" target="_blank" rel="noreferrer" class="btn-text">
          View the channel
        </a>
      </div>

      <div class="video-strip" aria-label="Selected video lectures">
        <a href="https://youtu.be/CG5i14GAZTQ" target="_blank" rel="noreferrer" class="video-card">
          <img src="https://img.youtube.com/vi/CG5i14GAZTQ/hqdefault.jpg" alt="The Broken Chain video thumbnail" loading="lazy" />
          <span>The Broken Chain: an introduction to isnad criticism</span>
        </a>
        <a href="https://youtu.be/boG5JTD5yXU" target="_blank" rel="noreferrer" class="video-card">
          <img src="https://img.youtube.com/vi/boG5JTD5yXU/hqdefault.jpg" alt="Quranic Supremacy video thumbnail" loading="lazy" />
          <span>Quranic supremacy over hadith: a methodological framework</span>
        </a>
        <a href="https://youtu.be/3B0rnPGWgKU" target="_blank" rel="noreferrer" class="video-card">
          <img src="https://img.youtube.com/vi/3B0rnPGWgKU/hqdefault.jpg" alt="Abu Hurayra dossier video thumbnail" loading="lazy" />
          <span>Dossier: Abu Hurayra and the narration explosion</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section newsletter-section">
    <div class="wrap newsletter-panel">
      <div>
        <p class="small-label">Research updates</p>
        <h2>New work when the evidence is ready.</h2>
        <p>Articles, dossiers, and video lectures. No filler.</p>
      </div>
      <form class="newsletter-form" action="/subscribe" method="post">
        <label class="sr-only" for="newsletter-email">Email address</label>
        <input id="newsletter-email" class="input" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form>
    </div>
  </section>

  <style>
    .home-hero {
      position: relative;
      overflow: hidden;
      padding: clamp(3.75rem, 6vw, 5.75rem) 0 clamp(3rem, 5vw, 4.75rem);
      background:
        linear-gradient(115deg, var(--bg) 0%, var(--bg-card) 54%, var(--bg-raised) 100%);
      border-bottom: 1px solid var(--border);
    }

    .home-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent calc(50% - 376px), var(--border-3) calc(50% - 376px), var(--border-3) calc(50% - 375px), transparent calc(50% - 375px), transparent calc(50% + 375px), var(--border-3) calc(50% + 375px), var(--border-3) calc(50% + 376px), transparent calc(50% + 376px));
      pointer-events: none;
    }

    .hero-grid {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.55fr);
      gap: clamp(2rem, 4.5vw, 4rem);
      align-items: center;
    }

    .hero-copy {
      max-width: 720px;
    }

    .hero-kicker,
    .small-label {
      margin: 0 0 var(--s4);
      color: var(--accent);
      font-family: var(--sans);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .hero-copy h1,
    .section-copy-block h2,
    .section-heading h2,
    .evidence-panel h2,
    .method-grid h2,
    .newsletter-panel h2 {
      margin: 0;
      color: var(--ink-1);
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.04;
      text-wrap: balance;
    }

    .hero-copy h1 {
      max-width: 13ch;
      font-size: clamp(2.65rem, 5vw, 4.6rem);
      line-height: 0.98;
      letter-spacing: -0.025em;
    }

    .section-copy-block p,
    .evidence-panel p,
    .newsletter-panel p {
      max-width: 62ch;
      margin: var(--s5) 0 0;
      color: var(--ink-2);
      font-family: var(--serif);
      font-size: clamp(1.08rem, 1vw + 0.9rem, 1.3rem);
      line-height: 1.78;
      text-wrap: pretty;
    }

    .hero-lede {
      max-width: 56ch;
      margin: var(--s5) 0 0;
      color: var(--ink-2);
      font-family: var(--serif);
      font-size: clamp(1.03rem, 0.55vw + 0.95rem, 1.18rem);
      line-height: 1.68;
      text-wrap: pretty;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s3);
      margin-top: var(--s7);
    }

    .hero-art {
      display: grid;
      gap: var(--s5);
      justify-items: center;
    }

    .hero-art-mark {
      width: min(13.5rem, 46vw);
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border: 1px solid var(--border);
      background:
        radial-gradient(circle at 50% 44%, var(--accent-muted), transparent 58%),
        var(--bg-card);
      box-shadow: var(--shadow-lg);
    }

    .hero-art-mark .hc-emblem {
      width: min(7rem, 26vw) !important;
    }

    .source-sheet {
      width: min(18rem, 80vw);
      padding: var(--s4);
      background: var(--bg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .source-sheet span {
      display: block;
      color: var(--ink-4);
      font-family: var(--sans);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .source-sheet strong {
      display: block;
      margin-top: var(--s2);
      color: var(--ink-2);
      font-family: var(--font-display);
      font-size: 1.1rem;
      line-height: 1.2;
    }

    .source-sheet p {
      margin: var(--s3) 0 0;
      color: var(--ink-3);
      font-size: 0.88rem;
      line-height: 1.5;
    }

    .topic-band {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
    }

    .latest-section,
    .method-section,
    .newsletter-section {
      background: var(--bg);
    }

    .topic-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    .topic-grid a {
      min-height: 4.5rem;
      display: flex;
      align-items: center;
      padding: var(--s3) var(--s4);
      color: var(--ink-2);
      font-family: var(--sans);
      font-size: 0.78rem;
      font-weight: 700;
      line-height: 1.35;
      text-decoration: none;
      border-left: 1px solid var(--border-3);
      transition: background var(--t-fast), color var(--t-fast);
    }

    .topic-grid a:last-child {
      border-right: 1px solid var(--border-3);
    }

    .topic-grid a:hover {
      background: var(--bg-raised);
      color: var(--accent);
    }

    .latest-grid,
    .evidence-grid,
    .method-grid,
    .media-grid {
      display: grid;
      grid-template-columns: minmax(240px, 0.75fr) minmax(0, 1.25fr);
      gap: clamp(2rem, 5vw, 5rem);
      align-items: start;
    }

    .section-copy-block h2,
    .section-heading h2,
    .evidence-panel h2,
    .method-grid h2,
    .newsletter-panel h2 {
      font-size: clamp(1.85rem, 3.3vw, 2.85rem);
    }

    .article-list {
      border-top: 1px solid var(--border);
    }

    .article-row {
      display: grid;
      grid-template-columns: 8rem minmax(0, 1fr);
      gap: var(--s5);
      padding: var(--s5) 0;
      color: var(--ink-1);
      text-decoration: none;
      border-bottom: 1px solid var(--border);
      transition: color var(--t-fast), background var(--t-fast), padding var(--t-fast);
    }

    .article-row:hover {
      color: var(--accent);
      background: var(--bg-card);
      padding-left: var(--s4);
      padding-right: var(--s4);
    }

    .article-row time {
      color: var(--ink-4);
      font-family: var(--sans);
      font-size: 0.8rem;
      line-height: 1.5;
    }

    .article-row span {
      font-family: var(--font-display);
      font-size: clamp(1.2rem, 2vw, 1.7rem);
      line-height: 1.2;
      text-wrap: pretty;
    }

    .evidence-section,
    .media-section {
      background: var(--bg-raised);
      border-top: 1px solid var(--border-3);
      border-bottom: 1px solid var(--border-3);
    }

    .feature-image {
      margin: 0 auto;
      max-width: 360px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
    }

    .feature-image img {
      width: 100%;
      display: block;
      aspect-ratio: 3 / 4;
      object-fit: cover;
    }

    .evidence-panel {
      align-self: center;
    }

    .library-links {
      display: grid;
      gap: var(--s3);
      margin-top: var(--s7);
      border-top: 1px solid var(--border);
    }

    .library-links a {
      display: flex;
      min-height: 3.8rem;
      align-items: center;
      justify-content: space-between;
      color: var(--ink-1);
      font-family: var(--sans);
      font-weight: 700;
      text-decoration: none;
      border-bottom: 1px solid var(--border);
    }

    .library-links a::after {
      content: ">";
      color: var(--accent);
    }

    .dossier-section {
      background: var(--bg);
    }

    .section-heading {
      max-width: 760px;
      margin-bottom: var(--s10);
    }

    .dossier-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
    }

    .dossier-link {
      display: flex;
      min-height: 15rem;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--s6);
      background: var(--bg-card);
      color: var(--ink-1);
      text-decoration: none;
      transition: background var(--t-fast), color var(--t-fast);
    }

    .dossier-link:hover {
      background: var(--bg-raised);
      color: var(--accent);
    }

    .dossier-link strong {
      font-family: var(--font-display);
      font-size: 1.4rem;
      line-height: 1.15;
    }

    .dossier-link span {
      color: var(--ink-3);
      font-family: var(--serif);
      font-size: 1rem;
      line-height: 1.6;
    }

    .method-list {
      display: grid;
      gap: var(--s5);
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: method;
    }

    .method-list li {
      display: grid;
      grid-template-columns: 3rem minmax(0, 1fr);
      gap: var(--s4);
      padding-bottom: var(--s5);
      border-bottom: 1px solid var(--border);
      counter-increment: method;
    }

    .method-list li::before {
      content: counter(method);
      width: 2.3rem;
      height: 2.3rem;
      display: inline-grid;
      place-items: center;
      color: var(--accent);
      font-family: var(--sans);
      font-weight: 800;
      border: 1px solid var(--border);
      background: var(--bg-card);
    }

    .method-list strong {
      display: block;
      color: var(--ink-1);
      font-family: var(--font-display);
      font-size: 1.25rem;
      line-height: 1.25;
    }

    .method-list span {
      display: block;
      margin-top: var(--s2);
      color: var(--ink-3);
      font-size: 1rem;
      line-height: 1.65;
    }

    .video-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s4);
    }

    .video-card {
      display: grid;
      gap: var(--s3);
      color: var(--ink-1);
      text-decoration: none;
    }

    .video-card img {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border: 1px solid var(--border);
      filter: saturate(0.82) contrast(1.04);
      transition: filter var(--t-fast), transform var(--t-fast);
    }

    .video-card:hover img {
      filter: saturate(1) contrast(1.08);
      transform: translateY(-2px);
    }

    .video-card span {
      font-family: var(--font-display);
      font-size: 1.05rem;
      line-height: 1.25;
    }

    .newsletter-section {
      padding-top: var(--s16);
    }

    .newsletter-panel {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, 0.8fr);
      gap: var(--s8);
      align-items: end;
      padding: clamp(2rem, 5vw, 4rem);
      background: var(--bg-card);
      border: 1px solid var(--border);
    }

    .newsletter-form {
      display: flex;
      gap: var(--s3);
      align-items: stretch;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 960px) {
      .hero-grid,
      .latest-grid,
      .evidence-grid,
      .method-grid,
      .media-grid,
      .newsletter-panel {
        grid-template-columns: 1fr;
      }

      .topic-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .video-strip {
        grid-template-columns: 1fr;
      }

      .hero-art {
        justify-items: start;
      }

      .feature-image {
        max-width: 300px;
        margin: 0 auto var(--s6);
      }
    }

    @media (max-width: 640px) {
      .home-hero {
        padding: 3rem 0 3.25rem;
      }

      .topic-grid {
        grid-template-columns: 1fr;
      }

      .topic-grid a {
        min-height: 4rem;
        border-right: 1px solid var(--border-3);
      }

      .article-row {
        grid-template-columns: 1fr;
        gap: var(--s2);
      }

      .newsletter-form {
        flex-direction: column;
      }
    }
  </style>
</BaseLayout>
```

## global.css

Path: `src\styles\global.css`

```css

/* â”€â”€â”€ Design Tokens (Impeccable Scholarly Style) â”€â”€â”€ */
:root {
  /* Palette: OKLCH-adjacent (impeccable: no pure black/gray) */
  --bg:           oklch(96% 0.01 85);
  --bg-raised:    oklch(93% 0.012 85);
  --bg-card:      oklch(98% 0.008 85);
  --bg-muted:     oklch(90% 0.014 85);
  --bg-subtle:    oklch(88% 0.016 85);
  --bg-inset:     oklch(85% 0.018 85);
  --bg-ink:       oklch(15% 0.02 260);

  --ink-1:        oklch(18% 0.02 260);   /* headings */
  --ink-2:        oklch(35% 0.025 260);  /* body */
  --ink-3:        oklch(50% 0.02 260);   /* metadata */
  --ink-4:        oklch(60% 0.018 260);  /* timestamps */
  --ink-5:        oklch(70% 0.015 260);  /* citations */

  --accent:       oklch(35% 0.08 250);   /* scholarly navy */
  --accent-hover: oklch(25% 0.1 250);
  --accent-muted: oklch(35% 0.08 250 / 0.08);
  --accent-dim:   oklch(35% 0.08 250 / 0.12);

  --gold:         oklch(55% 0.12 85);    /* decorative gold */
  --gold-light:   oklch(65% 0.14 85);
  --glow:         oklch(35% 0.08 250 / 0.15);
  --accent-gold:  var(--gold);
  --accent-gold-dim: oklch(55% 0.12 85 / 0.14);
  --accent-cyan-dim: oklch(65% 0.14 220 / 0.16);

  --border:       oklch(18% 0.02 260 / 0.10);
  --border-2:     oklch(18% 0.02 260 / 0.14);
  --border-3:     oklch(18% 0.02 260 / 0.06);

  /* Typography (impeccable: no Inter for everything) */
  --font-display: 'Playfair Display', Georgia, serif;
  --serif:        'EB Garamond', Georgia, serif;
  --sans:         'Inter', system-ui, sans-serif;
  --font-arabic:  'Amiri', serif;
  --mono:         'Cormorant Garamond', 'Baskerville', serif;

  /* Fluid Scale (impeccable: modular, viewport-aware) */
  --text-xs:  clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm:  clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg:  clamp(1.125rem, 1rem + 0.65vw, 1.375rem);
  --text-xl:  clamp(1.5rem, 1.2rem + 1.5vw, 2.75rem);
  --text-hero: clamp(3.2rem, 5vw + 1rem, 7.5rem);

  /* Spacing (8px base grid) */
  --s1: 0.25rem;  --s2: 0.5rem;   --s3: 0.75rem;
  --s4: 1rem;     --s5: 1.25rem;  --s6: 1.5rem;
  --s7: 1.75rem;  --s8: 2rem;     --s10: 2.5rem;
  --s12: 3rem;    --s14: 3.5rem;  --s16: 4rem;
  --s20: 5rem;    --s24: 6rem;    --s32: 8rem;

  /* Radius (impeccable: sharp structural, subtle interactive) */
  --r-sharp: 0px;     /* panels, cards, images */
  --r-sm: 3px;        /* small elements */
  --r-md: 6px;        /* inputs */
  --r-pill: 999px;    /* pills, avatars */
  --r1: var(--r-sm);
  --r2: var(--r-md);
  --r3: 10px;
  --r-icon: var(--r-pill);

  /* Shadows (impeccable: no drop shadows, use borders) */
  --shadow-sm:  0 1px 2px oklch(18% 0.02 260 / 0.04);
  --shadow-md:  0 4px 12px oklch(18% 0.02 260 / 0.06);
  --shadow-lg:  0 12px 24px oklch(18% 0.02 260 / 0.08);
  --shadow-inset: inset 0 1px 0 oklch(100% 0 0 / 0.22), inset 0 -1px 0 oklch(18% 0.02 260 / 0.04);
  --shadow-raised-ctrl: 0 1px 2px oklch(18% 0.02 260 / 0.08);
  --nav-bg: oklch(98% 0.008 85 / 0.94);

  /* Motion (taste-skill: MOTION_INTENSITY=4, no bounce) */
  --t-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --t-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --t-slow: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --t-reveal: 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  
  --region-medina:  #047857;
  --region-basra:   #1E40AF;
  --region-kufa:    #B91C1C;
  --region-mecca:   #111827; 
  --region-baghdad: #B45309;
  --region-yemen:   #6D28D9;
  --region-sham:    #374151;
}

[data-theme="dark"] {
  --bg:           oklch(8% 0.01 85);    /* near-black, warm */
  --bg-raised:    oklch(12% 0.012 85);
  --bg-card:      oklch(15% 0.008 85);
  --bg-muted:     oklch(18% 0.014 85);
  --bg-subtle:    oklch(22% 0.016 85);
  --bg-inset:     oklch(10% 0.018 85);

  --ink-1:        oklch(94% 0.015 85); /* warm white */
  --ink-2:        oklch(85% 0.02 85);
  --ink-3:        oklch(65% 0.025 85);
  --ink-4:        oklch(50% 0.02 85);
  --ink-5:        oklch(40% 0.018 85);

  --accent:       oklch(75% 0.12 85);   /* warm gold */
  --accent-hover: oklch(85% 0.15 85);
  --accent-muted: oklch(75% 0.12 85 / 0.1);
  --accent-dim:   oklch(75% 0.12 85 / 0.08);

  --border:       oklch(94% 0.015 85 / 0.10);
  --border-2:     oklch(94% 0.015 85 / 0.18);
  --border-3:     oklch(94% 0.015 85 / 0.06);

  --shadow-sm:  0 1px 3px rgba(0,0,0,0.6);
  --shadow-md:  0 4px 20px rgba(0,0,0,0.7);
  --shadow-lg:  0 12px 48px rgba(0,0,0,0.8);

  --nav-bg: rgba(8, 8, 8, 0.96);
  --accent-gold:   oklch(75% 0.12 85);
  --accent-gold-dim: oklch(75% 0.12 85 / 0.15);

  --region-mecca:   #F9FAFB;
  --region-medina:  #34D399;
  --region-basra:   #60A5FA;
  --region-kufa:    #F87171;
  --region-baghdad: #FBBF24;
  --region-yemen:   #C084FC;
  --region-sham:    #94A3B8;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--serif);
  font-size: 1.0625rem;
  background: var(--bg);
  color: var(--ink-1);
  line-height: 1.75;
  transition: background-color var(--t-base), color var(--t-base), border-color var(--t-base);
}

.wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 var(--s6); }
.section { padding: clamp(3.5rem, 7vw, 5.75rem) 0; }
.section-sm { padding: var(--s12) 0; }

.t-display { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.t-heading { font-family: var(--font-display); font-weight: 500; line-height: 1.2; }
.t-label { font-family: var(--mono); font-size: 0.6875rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.t-arabic { font-family: var(--font-arabic); direction: rtl; font-size: 1.25em; line-height: 1.4; }
.t-ui { font-family: var(--sans); }

/* Academic prose â€” generous leading for serif reading */
.prose {
  font-family: var(--serif);
  font-size: 1.0625rem;
  line-height: 1.85;
  color: var(--ink-2);
}
.prose em { font-style: italic; }
.prose strong { font-weight: 600; color: var(--ink-1); }

/* Journal metadata line (authors Â· journal Â· year) */
.t-byline {
  font-family: var(--sans);
  font-size: 0.78rem;
  color: var(--ink-4);
  letter-spacing: 0.01em;
}

/* Inline citation / ref numbers */
.t-cite {
  font-family: var(--mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  color: var(--ink-5);
}

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--s2); padding: var(--s3) var(--s6);
  font-family: var(--mono); font-size: 0.8125rem; font-weight: 500;
  letter-spacing: 0.04em; border-radius: var(--r-sm);
  cursor: pointer; border: none; text-decoration: none;
  transition: all var(--t-fast);
}
.btn-primary { background: var(--accent); color: #FFFFFF; border: 1px solid var(--accent); box-shadow: var(--shadow-sm); }
.btn-primary:hover { opacity: 0.95; transform: translateY(-1px); box-shadow: var(--shadow-md); background: var(--accent-hover); }
.btn-primary:active { transform: none; }
.btn-ghost { background: transparent; color: var(--ink-3); border: 1px solid var(--border-2); }
.btn-ghost:hover { background: var(--bg-raised); color: var(--ink-1); border-color: var(--border-2); }
.btn-text {
  background: none; border: none; color: var(--accent);
  font-family: var(--mono); font-size: 0.8125rem; cursor: pointer;
  padding: var(--s1) 0; border-bottom: 2px solid transparent;
  transition: border-color var(--t-fast);
}
.btn-text:hover { border-color: var(--accent); }

.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 0; padding: var(--s6); box-shadow: var(--shadow-sm);
  transition: box-shadow var(--t-base), border-color var(--t-fast), transform var(--t-fast);
}
.card:hover { box-shadow: var(--shadow-md); border-color: var(--border-2); }
[data-theme="dark"] .card { border-color: rgba(255,255,255,0.05); }
[data-theme="dark"] .card:hover { border-color: rgba(255,255,255,0.1); }

.clip-panel {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 0; overflow: hidden; box-shadow: var(--shadow-lg); position: relative;
  backdrop-filter: blur(12px);
  transition: transform var(--t-base), box-shadow var(--t-base), border-color var(--t-base);
}
.clip-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  border-color: var(--accent-dim);
}
.clip-panel::before, .clip-panel::after {
  content: ''; position: absolute; width: 24px; height: 24px; pointer-events: none; opacity: 0.4; z-index: 5;
}
.clip-panel::before { 
  top: 0; left: 0; border-top: 1px solid var(--accent); border-left: 1px solid var(--accent); opacity: 0.6;
}
.clip-panel::after { 
  bottom: 0; right: 0; border-bottom: 1px solid var(--accent); border-right: 1px solid var(--accent); opacity: 0.6;
}
/* Inner top glow */
.clip-panel-glow {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  pointer-events: none;
  z-index: 6;
}
.clip-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--s3) var(--s5); background: var(--bg-raised); border-bottom: 1px solid var(--border);
}
.clip-dots { display: flex; gap: 6px; }
.clip-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-2); }
.clip-content { padding: 0; }
[data-theme="dark"] .clip-panel { 
  border-color: rgba(255,255,255,0.08); 
  background: rgba(10, 10, 12, 0.7); 
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.input {
  width: 100%; padding: var(--s3) var(--s4);
  font-family: var(--serif); font-size: 0.9375rem;
  background: var(--bg-card); border: 1px solid var(--border-2);
  border-radius: 0; color: var(--ink-1);
  transition: all var(--t-fast); outline: none;
}
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.input::placeholder { color: var(--ink-4); font-style: italic; opacity: 0.7; }

.nav-item {
  font-family: var(--mono); font-size: 0.8125rem; letter-spacing: 0.04em;
  padding: var(--s2) var(--s4); color: var(--ink-3);
  background: none; border: none; cursor: pointer;
  border-radius: var(--r1); transition: all var(--t-fast);
}
.nav-item:hover { color: var(--ink-1); background: var(--bg-muted); }
.nav-item.active { color: var(--accent); background: var(--accent-muted); }

.tag {
  display: inline-flex; align-items: center; padding: 2px 10px;
  font-family: var(--mono); font-size: 0.6875rem; letter-spacing: 0.06em;
  color: var(--ink-3); background: var(--bg-muted);
  border: 1px solid var(--border); border-radius: 4px;
}
.tag-accent { color: var(--accent); background: var(--accent-muted); border-color: var(--accent-dim); }
.tag-gold { color: var(--accent-gold); background: var(--accent-gold-dim); border-color: var(--accent-gold); }

.ornament {
  display: flex; align-items: center; gap: var(--s4);
  color: var(--ink-5); font-size: 0.625rem; letter-spacing: 0.2em;
}
.ornament::before, .ornament::after { content: ''; flex: 1; border-top: 1px solid var(--border); }

.bg-dot-grid {
  background-image: radial-gradient(var(--border) 1px, transparent 0);
  background-size: 24px 24px;
}

.bg-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
}

/* â”€â”€â”€ Book Portrait (compilation cover grid card) â”€â”€â”€ */
.book-portrait {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  transition: transform var(--t-fast);
}
.book-portrait:hover { transform: translateY(-5px); }
.book-portrait:hover .book-cover-wrap {
  box-shadow: 0 20px 40px rgba(0,0,0,0.18);
}
.book-cover-wrap {
  border-radius: var(--r2);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--t-base);
  background: var(--bg-card);
  border: 1px solid var(--border);
  aspect-ratio: 2/3;
  display: flex;
  align-items: stretch;
}
.book-cover-wrap img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* â”€â”€â”€ Chapter / Book row in table of contents â”€â”€â”€ */
.chapter-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--s6);
  padding: var(--s4) var(--s6);
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-align: left;
  transition: background var(--t-fast);
  color: inherit;
  font-size: inherit;
}
.chapter-row:last-child { border-bottom: none; }
.chapter-row:hover { background: var(--bg-raised); }
.chapter-row:hover .chapter-row-arrow { color: var(--accent); opacity: 1; }
.chapter-row-arrow { color: var(--border-2); font-size: 1rem; flex-shrink: 0; transition: color var(--t-fast), opacity var(--t-fast); opacity: 0.6; }

/* â”€â”€â”€ Hadith card â”€â”€â”€ */
.hadith-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0;
  overflow: hidden;
  transition: box-shadow var(--t-base), border-color var(--t-fast);
}
.hadith-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-2);
}
[data-theme="dark"] .hadith-card { border-color: rgba(255,255,255,0.06); }
[data-theme="dark"] .hadith-card:hover { border-color: rgba(255,255,255,0.12); }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
.d1 { animation-delay: 80ms; }
.d2 { animation-delay: 160ms; }
.d3 { animation-delay: 240ms; }
.d4 { animation-delay: 320ms; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}

/* â”€â”€â”€ Forensic Intelligence Utilities â”€â”€â”€ */
.scanline {
  position: relative; overflow: hidden;
}
.scanline::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
  background-size: 100% 3px, 3px 100%;
  z-index: 2; opacity: 0.15;
}

.hud-panel {
  position: relative; background: var(--bg-card); border: 1px solid var(--border);
  background-image: 
    radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
}
.hud-panel::before {
  content: ""; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px;
  border-top: 2px solid var(--accent-gold); border-left: 2px solid var(--accent-gold);
}
.hud-panel::after {
  content: ""; position: absolute; bottom: -1px; right: -1px; width: 100px; height: 1px;
  background: linear-gradient(to right, transparent, var(--accent-gold));
}

.data-mono {
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.05em;
  color: var(--ink-4); line-height: 1.4;
}

.glow-cyan { text-shadow: 0 0 10px var(--accent-cyan-dim); }
.glow-gold { text-shadow: 0 0 15px var(--accent-gold-dim); }

.intel-node {
  width: 8px; height: 8px; border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
  transition: all var(--t-fast);
}

/* Animations for the Intelligent Hub */
@keyframes pulse-intel {
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
  70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 10px rgba(0, 240, 255, 0); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
}
.animate-pulse-intel {
  animation: pulse-intel 2s infinite;
}

/* â”€â”€â”€ Hermes & Thumbnail Additions â”€â”€â”€ */
.bg-etching {
  background-image: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  mix-blend-mode: multiply;
  opacity: 0.04;
  filter: grayscale(1);
  pointer-events: none;
}

[data-theme='dark'] .bg-etching {
  mix-blend-mode: lighten;
  opacity: 0.06;
}

.grain-overlay {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  z-index: 2;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
  animation: grain-animation 4s steps(10) infinite;
  mix-blend-mode: overlay;
}

@keyframes grain-animation {
  0%, 100% { transform:translate(0, 0) }
  10% { transform:translate(-1%, -1%) }
  20% { transform:translate(-2%, 1%) }
  30% { transform:translate(1%, -2%) }
  40% { transform:translate(-1%, 2%) }
  50% { transform:translate(-2%, 1%) }
  60% { transform:translate(2%, 0%) }
  70% { transform:translate(0%, 2%) }
  80% { transform:translate(1%, 1%) }
  90% { transform:translate(-1%, 1%) }
}

.text-metallic {
  background: linear-gradient(180deg, var(--ink-1) 0%, var(--ink-3) 40%, var(--ink-5) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 4px 12px rgba(0,0,0,0.2));
}

.static-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.12;
  mix-blend-mode: overlay;
  animation: static-shift 0.1s steps(2) infinite;
}

@keyframes static-shift {
  0% { transform: translate(0,0) scale(1); }
  25% { transform: translate(-1%, 1%) scale(1.02); }
  50% { transform: translate(1%, -1%) scale(1.01); }
  75% { transform: translate(-0.5%, -0.5%) scale(1.03); }
  100% { transform: translate(0,0) scale(1); }
}

/* Scanline effect specifically for the static overlay */
.static-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%);
  background-size: 100% 4px;
  opacity: 0.15;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  padding: 2px;
  transition: background var(--t-base);
}
.toggle-knob {
  width: 18px;
  height: 18px;
  background: var(--accent);
  border-radius: 50%;
  transition: transform var(--t-base), background var(--t-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg);
  font-size: 10px;
}
[data-theme='dark'] .toggle-knob {
  transform: translateX(24px);
  background: #F3D382;
}

.page-bg-container {
  position: fixed;
  inset: 0;
  z-index: -10;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 18%, rgba(216,183,97,0.09), transparent 34rem),
    linear-gradient(180deg, #0b0a08 0%, var(--bg) 44%, #050504 100%);
  overflow: hidden;
}

.page-bg-container .static-overlay {
  opacity: 0.035;
  animation: none;
}

.page-bg-container .static-overlay::after {
  opacity: 0.05;
}

.page-bg-container .grain-overlay {
  opacity: 0.025;
}

.page-bg-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent calc(50% - 376px), rgba(216,183,97,0.13) calc(50% - 376px), rgba(216,183,97,0.13) calc(50% - 375px), transparent calc(50% - 375px), transparent calc(50% + 375px), rgba(216,183,97,0.13) calc(50% + 375px), rgba(216,183,97,0.13) calc(50% + 376px), transparent calc(50% + 376px)),
    radial-gradient(circle at 50% 28%, transparent 0%, rgba(0,0,0,0.42) 76%);
  z-index: 3;
}

[data-theme='dark'] .page-bg-container::after {
  background:
    linear-gradient(90deg, transparent calc(50% - 376px), rgba(216,183,97,0.13) calc(50% - 376px), rgba(216,183,97,0.13) calc(50% - 375px), transparent calc(50% - 375px), transparent calc(50% + 375px), rgba(216,183,97,0.13) calc(50% + 375px), rgba(216,183,97,0.13) calc(50% + 376px), transparent calc(50% + 376px)),
    radial-gradient(circle at 50% 28%, transparent 0%, rgba(0,0,0,0.54) 78%);
}

.app-container {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink-1);
  position: relative;
  transition: background var(--t-base);
}

.app-container.home-page {
  background: transparent;
}

.page-bg-image {
  position: absolute;
  inset: 0;
  background-image: url("/geometric_emblem_transparent.png");
  background-size: min(720px, 80vw) auto;
  background-repeat: no-repeat;
  background-position: center 18vh;
  opacity: 0.025;
  mix-blend-mode: multiply;
  filter: grayscale(1) contrast(0.95) saturate(0.6);
  z-index: 1;
}

[data-theme='dark'] .page-bg-image {
  opacity: 0.025;
  mix-blend-mode: screen; 
  filter: grayscale(1) contrast(1.05) brightness(0.7);
}

@media (max-width: 640px) {
  .page-bg-image {
    background-size: 420px auto;
    background-position: center 12vh;
    opacity: 0.018;
  }
}

.layout-grid {
  position: fixed;
  inset: 0;
  z-index: -5;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr 1180px 1fr;
}
.layout-grid-line {
  border-left: 1px solid var(--border-2);
  border-right: 1px solid var(--border-2);
  height: 100%;
  opacity: 0.8;
}
.layout-grid-horizontal {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-2);
  opacity: 0.5;
}

.layout-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.research-hero {
  isolation: isolate;
}

.research-hero::before {
  content: "";
  position: absolute;
  inset: 84px 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  opacity: 0.75;
}

.research-hero-rail {
  position: absolute;
  top: 84px;
  bottom: 0;
  left: 50%;
  width: min(752px, calc(100vw - 48px));
  transform: translateX(-50%);
  border-left: 1px dotted var(--border);
  border-right: 1px dotted var(--border);
  opacity: 0.55;
  pointer-events: none;
}

.research-mark {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  box-shadow: var(--shadow-inset);
}

.brand-title {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s3);
}

.brand-title-eyebrow {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  line-height: 1.2;
  text-transform: uppercase;
}

.brand-title-heading {
  display: flex;
  justify-content: center;
  gap: 0.01em;
  margin: 0;
  color: var(--ink-1);
  font-family: var(--font-display);
  font-size: clamp(4.6rem, 10vw, 7rem);
  font-weight: 300;
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.brand-title-heading span:first-child {
  font-weight: 500;
}

[data-theme="dark"] .input {
  background: rgba(21, 19, 15, 0.86);
  border-color: rgba(216,183,97,0.16);
  color: var(--ink-1);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .input::placeholder {
  color: rgba(200,191,176,0.52);
  font-style: normal;
}

/* Blink cursor override */
input, textarea, [contenteditable="true"] {
  caret-color: var(--accent);
  outline: none !important;
}

@media (min-width: 768px) {
  .hero-grid {
    grid-template-columns: 1.6fr 1fr;
  }
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
  padding: var(--s8);
  position: relative;
  overflow: hidden;
  background: var(--bg-card);
  border-radius: var(--r3);
  transition: transform var(--t-base), box-shadow var(--t-base), border-color var(--t-base);
  border: 1px solid var(--border);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-dim);
}

/* â”€â”€â”€ Segmented / pill control system â”€â”€â”€ */
.seg-control {
  display: inline-flex;
  align-items: center;
  background: var(--bg-inset);
  border-radius: var(--r-pill);
  padding: 3px;
  gap: 2px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-inset);
}

.seg-control-btn {
  flex: 1;
  padding: 6px 16px;
  background: none;
  border: none;
  border-radius: var(--r-pill);
  cursor: pointer;
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-4);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.seg-control-btn.active {
  background: var(--bg-card);
  color: var(--ink-1);
  box-shadow: var(--shadow-raised-ctrl);
}

/* Pill chip â€” for quick-select tags */
.chip-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  cursor: pointer;
  font-family: var(--serif);
  font-size: 0.875rem;
  color: var(--ink-3);
  transition: all 0.15s;
  box-shadow: var(--shadow-raised-ctrl);
}

.chip-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Icon circle button */
.btn-icon-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--r-icon);
  background: var(--bg-card);
  border: 1px solid var(--border);
  cursor: pointer;
  color: var(--ink-3);
  font-size: 0.875rem;
  line-height: 1;
  transition: all 0.15s;
  box-shadow: var(--shadow-raised-ctrl);
  flex-shrink: 0;
}

.btn-icon-circle:hover {
  background: var(--bg-raised);
  color: var(--ink-1);
  border-color: var(--border-2);
}

.btn-icon-circle:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Status / number badge â€” pill */
.nav-dock-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--ink-2);
  font-family: var(--sans);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  box-shadow: var(--shadow-inset);
  border: none;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: var(--r-pill);
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  box-shadow: var(--shadow-inset);
  border: none;
}

.badge-pill-accent {
  background: rgba(45,106,92,0.08);
  color: var(--accent);
}

[data-theme="dark"] .badge-pill-accent {
  background: rgba(243,211,130,0.1);
  color: var(--accent);
}

/* Layout Utilities for Sections */
.section-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--s12);
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: var(--s4);
}

.section-title {
  color: var(--ink-1);
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 3.3vw, 2.85rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.1;
  margin: 0 0 var(--s4) 0;
}

.section-copy {
  color: var(--ink-3);
  font-family: var(--serif);
  font-size: 1.0625rem;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}


/* Nav Dock & Precision Shells */
.precision-shell {
  background: var(--bg-card);
  border: 1px solid var(--border-2);
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  display: inline-flex;
  padding: 4px;
}

.nav-dock {
  display: inline-flex;
  gap: 2px;
}

.nav-dock-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  color: var(--ink-2);
  font-family: var(--sans);
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  transition: color var(--t-fast);
  z-index: 1;
}

.nav-dock-link:hover {
  color: var(--ink-1);
}

.nav-dock-link.is-active {
  color: var(--ink-1);
  font-weight: 600;
}

.nav-dock-active {
  position: absolute;
  inset: 0;
  background: var(--bg-raised);
  border: 1px solid var(--border-2);
  border-radius: 999px;
  box-shadow: var(--shadow-inset);
  z-index: -1;
}

.precision-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  font-family: var(--mono);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--bg-inset);
  color: var(--ink-3);
  border: 1px solid var(--border-2);
}



/* â”€â”€â”€ Impeccable Skill Overrides â”€â”€â”€ */
:focus-visible {
  outline: 2px solid var(--accent) !important;
  outline-offset: 2px !important;
}

button, .btn, .pill, .nav-link, .seg-control-btn, .nav-item, a.quick-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

## content.config.ts

Path: `src\content.config.ts`

```ts
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const articleCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    author: z.string().default('HadithCritic'),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  'articles': articleCollection,
};
```

## astro.config.mjs

Path: `astro.config.mjs`

```js
// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://hadithcriticblog.com',
  integrations: [mdx(), sitemap()]
});
```

