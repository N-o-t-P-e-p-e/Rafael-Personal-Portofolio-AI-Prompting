/**
 * ═══════════════════════════════════════════════════════════
 * ALEX NOVA PORTFOLIO — script.js
 * Modular JavaScript Architecture
 *
 * Modules:
 *  1. ThemeManager       — dark/light mode + LocalStorage
 *  2. NavigationManager  — navbar scroll, hamburger, smooth scroll
 *  3. CursorManager      — custom cursor + magnetic elements
 *  4. ParticleEngine     — canvas particle background
 *  5. AnimationController — Intersection Observer reveals
 *  6. TypingAnimation    — AI-like typewriter effect
 *  7. TiltCardEngine     — 3D glass tilt on project cards
 *  8. ProjectFilter      — filter tabs
 *  9. ModalEngine        — project preview modal
 * 10. SkillBarsController — animate skill progress bars
 * 11. TimelineController — gradual line drawing
 * 12. RippleEffect       — button ripple
 * 13. EasterEggManager   — Konami Code + logo clicks + cyber mode
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────
   UTILS
───────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

/* ─────────────────────────────────────
   1. THEME MANAGER
───────────────────────────────────── */
const ThemeManager = (() => {
  const HTML = document.documentElement;
  const btn = $('#themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  const getPreferred = () =>
    localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  const apply = (theme) => {
    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  const toggle = () => {
    const next = HTML.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  };

  const init = () => {
    apply(getPreferred());
    btn?.addEventListener('click', toggle);
  };

  return { init };
})();

/* ─────────────────────────────────────
   2. NAVIGATION MANAGER
───────────────────────────────────── */
const NavigationManager = (() => {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  let isOpen = false;

  const setScrolled = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  const toggleMenu = () => {
    isOpen = !isOpen;
    hamburger?.classList.toggle('open', isOpen);
    mobileMenu?.classList.toggle('open', isOpen);
    hamburger?.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const init = () => {
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();

    hamburger?.addEventListener('click', toggleMenu);

    // Close on link click
    $$('[data-close-menu]').forEach(el => el.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  };

  return { init };
})();

/* ─────────────────────────────────────
   3. CURSOR MANAGER
───────────────────────────────────── */
const CursorManager = (() => {
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let raf;

  const update = () => {
    // Ring smoothly follows cursor
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);

    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    }
    if (ring) {
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
    }

    raf = requestAnimationFrame(update);
  };

  const init = () => {
    // Only on pointer-fine devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Hover state on interactive elements
    const hoverEls = $$('a, button, .project-card, .tilt-card, [data-hover]');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring?.classList.add('is-hovered'));
      el.addEventListener('mouseleave', () => ring?.classList.remove('is-hovered'));
    });

    document.addEventListener('mousedown', () => ring?.classList.add('is-clicking'));
    document.addEventListener('mouseup', () => ring?.classList.remove('is-clicking'));

    raf = requestAnimationFrame(update);
  };

  return { init };
})();

/* ─────────────────────────────────────
   4. PARTICLE ENGINE
───────────────────────────────────── */
const ParticleEngine = (() => {
  const canvas = $('#particleCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let W, H;
  const PARTICLE_COUNT = 90;
  const CONNECT_DIST = 120;
  const MOUSE_RADIUS = 100;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.6 ? '#7c6aff' : Math.random() > 0.5 ? '#00d4ff' : '#ff6af0';
    }
    update() {
      // Mouse attraction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.vx += dx * force * 0.004;
        this.vy += dy * force * 0.004;
      }

      // Damping
      this.vx *= 0.99;
      this.vy *= 0.99;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = 1 - dist / CONNECT_DIST;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,106,255,${alpha * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  };

  const init = () => {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    animate();
  };

  return { init };
})();

/* ─────────────────────────────────────
   5. ANIMATION CONTROLLER
   Intersection Observer based reveal
───────────────────────────────────── */
const AnimationController = (() => {
  const init = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger based on DOM index within parent
            const siblings = [...entry.target.parentElement.children];
            const idx = siblings.indexOf(entry.target);
            const delay = idx * 80;

            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    $$('.reveal-item').forEach(el => observer.observe(el));
  };

  return { init };
})();

/* ─────────────────────────────────────
   6. TYPING ANIMATION
───────────────────────────────────── */
const TypingAnimation = (() => {
  const el = $('#typingText');
  const phrases = [
    'Hello, I build interactive digital experiences.',
    'I transform ideas into living interfaces.',
    'I architect systems that scale with grace.',
    'I make the web feel alive.',
    'I ship software that people love.'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let timeout;

  const type = () => {
    if (!el) return;
    const current = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    el.textContent = current.substring(0, charIdx);

    let speed = isDeleting ? 40 : 65;

    if (!isDeleting && charIdx === current.length) {
      // Pause at end
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      speed = 400;
    }

    timeout = setTimeout(type, speed);
  };

  const init = () => {
    if (!el) return;
    // Wait a moment for the hero to load
    setTimeout(type, 1200);
  };

  return { init };
})();

/* ─────────────────────────────────────
   7. TILT CARD ENGINE
   3D glass tilt effect on hover
───────────────────────────────────── */
const TiltCardEngine = (() => {
  const MAX_TILT = 12; // degrees

  const bindCard = (card) => {
    let raf;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;

      const rotateX = -yPct * MAX_TILT;
      const rotateY = xPct * MAX_TILT;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
        card.style.boxShadow =
          `${-rotateY * 1}px ${rotateX * 1}px 40px rgba(124,106,255,0.2), var(--shadow-card)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  };

  const init = () => {
    $$('.tilt-card').forEach(bindCard);
  };

  return { init };
})();

/* ─────────────────────────────────────
   8. PROJECT FILTER
───────────────────────────────────── */
const ProjectFilter = (() => {
  const init = () => {
    const filterBtns = $$('.filter-btn');
    const cards = $$('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active state
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter cards with animation
        cards.forEach(card => {
          const category = card.dataset.category;
          const show = filter === 'all' || category === filter;

          if (show) {
            card.classList.remove('hidden');
            card.style.animation = 'none';
            requestAnimationFrame(() => {
              card.style.animation = '';
              card.style.opacity = '1';
              card.style.transform = '';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.classList.add('hidden'), 300);
          }
        });
      });
    });
  };

  return { init };
})();

/* ─────────────────────────────────────
   9. MODAL ENGINE
───────────────────────────────────── */
const ModalEngine = (() => {
  const overlay = $('#modalOverlay');
  const contentEl = $('#modalContent');
  const closeBtn = $('#modalClose');

  // Project data
  const projects = {
    novadash: {
      title: 'NovaDash',
      category: 'Web Application',
      year: '2024',
      hue: 220,
      icon: '⬡',
      desc: 'A real-time analytics dashboard built for engineering teams at scale. Streams live telemetry via WebSocket and renders it as dynamic 3D data visualizations using Three.js.',
      features: [
        'WebSocket streaming with auto-reconnect and message queuing',
        '3D bar charts and network graphs using Three.js',
        'Custom alert system with email/Slack webhooks',
        'Multi-tenant architecture supporting 200+ organizations'
      ],
      stack: ['React', 'Three.js', 'WebSocket', 'Node.js', 'PostgreSQL', 'Redis'],
      github: '#',
      live: '#'
    },
    synthmind: {
      title: 'SynthMind',
      category: 'AI Platform',
      year: '2024',
      hue: 280,
      icon: '◈',
      desc: 'An AI-powered content generation platform with a visual prompt builder, fine-tuned model management, and team collaboration features.',
      features: [
        'Visual drag-and-drop prompt engineering studio',
        'Fine-tuned model versioning and A/B testing',
        'Batch generation with asynchronous job processing',
        'API marketplace for third-party model integrations'
      ],
      stack: ['Python', 'FastAPI', 'OpenAI', 'Celery', 'Next.js', 'Prisma'],
      github: '#',
      live: '#'
    },
    flowfit: {
      title: 'FlowFit',
      category: 'Mobile App',
      year: '2023',
      hue: 160,
      icon: '▲',
      desc: 'An adaptive fitness tracking app that uses on-device ML to analyze movement patterns and dynamically adjusts workout plans based on performance and recovery data.',
      features: [
        'On-device pose estimation using TFLite',
        'Adaptive algorithm that learns from 6 weeks of data',
        'Social challenges with real-time leaderboards',
        'Apple Health / Google Fit two-way sync'
      ],
      stack: ['React Native', 'TensorFlow Lite', 'Firebase', 'Expo', 'Node.js'],
      github: '#',
      live: '#'
    },
    prismatic: {
      title: 'Prismatic',
      category: 'Web Application',
      year: '2023',
      hue: 30,
      icon: '⬛',
      desc: 'A collaborative design system builder with real-time multiplayer editing powered by CRDTs. Teams can build, version, and export component libraries in one unified workspace.',
      features: [
        'Real-time multiplayer with presence indicators (Liveblocks)',
        'Full version history with branch + merge support',
        'One-click export to React, Vue, and Figma',
        'Design token management with auto CSS/SCSS generation'
      ],
      stack: ['Next.js', 'Liveblocks', 'PostgreSQL', 'Tailwind', 'TypeScript'],
      github: '#',
      live: '#'
    },
    echolens: {
      title: 'EchoLens',
      category: 'Computer Vision',
      year: '2023',
      hue: 190,
      icon: '◉',
      desc: 'Real-time scene understanding running entirely in the browser using WebGPU-accelerated YOLOv8. Powers accessibility tools that describe visual environments for visually impaired users.',
      features: [
        'WebGPU-accelerated inference at 30+ FPS in browser',
        'Custom YOLOv8 models fine-tuned on 50k scene images',
        'Spatial audio feedback for detected objects',
        'Works offline after initial model download'
      ],
      stack: ['Python', 'YOLOv8', 'WebGPU', 'ONNX', 'JavaScript', 'WebAudio'],
      github: '#',
      live: '#'
    },
    nebula: {
      title: 'NebulaWallet',
      category: 'FinTech / Web3',
      year: '2022',
      hue: 350,
      icon: '◇',
      desc: 'A non-custodial multi-chain crypto wallet with integrated DeFi aggregation, portfolio analytics, and hardware wallet support via WebUSB.',
      features: [
        'Multi-chain support: Ethereum, Polygon, Arbitrum, Solana',
        'DeFi yield optimizer scanning 15+ protocols',
        'Hardware wallet support via WebUSB (Ledger, Trezor)',
        'Gas fee optimization with EIP-1559 custom strategies'
      ],
      stack: ['React Native', 'Web3.js', 'Solidity', 'ethers.js', 'Hardhat'],
      github: '#',
      live: '#'
    }
  };

  const buildContent = (proj) => {
    const p = projects[proj];
    if (!p) return '<p>Project not found.</p>';

    const stackTags = p.stack.map(s => `<span class="stack-tag">${s}</span>`).join('');
    const features = p.features.map(f => `<div class="modal-feature">${f}</div>`).join('');

    return `
      <div class="modal-project-img">
        <div class="project-placeholder" style="--hue:${p.hue}">
          <span class="placeholder-icon">${p.icon}</span>
        </div>
      </div>
      <div class="project-meta">
        <span class="project-category">${p.category}</span>
        <span class="project-year">${p.year}</span>
      </div>
      <h2 class="project-title" style="font-size:1.6rem; margin-bottom:.5rem">${p.title}</h2>
      <p style="color:var(--c-text-2); line-height:1.7; margin-bottom:1rem">${p.desc}</p>
      <p style="font-family:var(--font-mono); font-size:.7rem; color:var(--c-accent); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem">Key Features</p>
      <div class="modal-features">${features}</div>
      <p style="font-family:var(--font-mono); font-size:.7rem; color:var(--c-accent); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem; margin-top:1rem">Tech Stack</p>
      <div class="modal-stack">${stackTags}</div>
      <div style="display:flex; gap:1rem; margin-top:1.5rem">
        <a href="${p.github}" class="btn btn-ghost" style="font-size:.85rem" aria-label="View ${p.title} on GitHub">GitHub ↗</a>
        <a href="${p.live}" class="btn btn-primary" style="font-size:.85rem" aria-label="View ${p.title} live demo">Live Demo ↗</a>
      </div>
    `;
  };

  const open = (projectKey) => {
    if (!overlay || !contentEl) return;
    contentEl.innerHTML = buildContent(projectKey);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const close = () => {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const init = () => {
    // Open on project button click
    $$('.project-view-btn').forEach(btn => {
      btn.addEventListener('click', () => open(btn.dataset.project));
    });

    // Close handlers
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };

  return { init };
})();

/* ─────────────────────────────────────
   10. SKILL BARS CONTROLLER
───────────────────────────────────── */
const SkillBarsController = (() => {
  const init = () => {
    const bars = $$('.skill-bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const targetWidth = bar.dataset.width;
            // Slight delay for visual appeal
            setTimeout(() => {
              bar.style.width = targetWidth + '%';
            }, 200);
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.5 }
    );

    bars.forEach(bar => observer.observe(bar));
  };

  return { init };
})();

/* ─────────────────────────────────────
   11. TIMELINE CONTROLLER
   Gradual line drawing on scroll
───────────────────────────────────── */
const TimelineController = (() => {
  const init = () => {
    const connectors = $$('.connector-line');
    if (!connectors.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('drawn');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    connectors.forEach(line => observer.observe(line));
  };

  return { init };
})();

/* ─────────────────────────────────────
   12. RIPPLE EFFECT
───────────────────────────────────── */
const RippleEffect = (() => {
  const createRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  const init = () => {
    $$('.ripple-btn').forEach(btn => {
      btn.addEventListener('click', createRipple);
    });
  };

  return { init };
})();

/* ─────────────────────────────────────
   13. MAGNETIC BUTTON EFFECT
───────────────────────────────────── */
const MagneticEffect = (() => {
  const STRENGTH = 0.35;

  const bindElement = (el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      el.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  };

  const init = () => {
    $$('.magnetic').forEach(bindElement);
  };

  return { init };
})();

/* ─────────────────────────────────────
   14. CONTACT FORM
───────────────────────────────────── */
const ContactForm = (() => {
  const init = () => {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalContent = btn.innerHTML;

      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;

      // Simulate async submit
      setTimeout(() => {
        btn.innerHTML = '<span>✓ Sent!</span>';
        btn.style.background = 'linear-gradient(135deg, #00d97e, #00a855)';
        form.reset();

        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  };

  return { init };
})();

/* ─────────────────────────────────────
   15. EASTER EGG MANAGER
   Konami Code + Logo clicks + Cyber Mode
───────────────────────────────────── */
const EasterEggManager = (() => {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  let logoClicks = 0;
  let logoTimer;
  let cyberModeActive = false;

  const eggOverlay = $('#easterEgg');
  const eggClose = $('#eggClose');
  const logoBtn = $('#logoBtn');
  const HTML = document.documentElement;

  const activateCyberMode = () => {
    if (cyberModeActive) return;
    cyberModeActive = true;

    // Show overlay briefly
    eggOverlay?.classList.add('visible');

    // Apply cyber theme
    setTimeout(() => {
      HTML.setAttribute('data-mode', 'cyber');
      eggOverlay?.classList.remove('visible');

      // Add scanlines overlay
      const scanlines = document.createElement('div');
      scanlines.id = 'cyberscanlines';
      scanlines.style.cssText = `
        position: fixed; inset: 0; z-index: 9000; pointer-events: none;
        background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.02) 2px, rgba(0,255,65,0.02) 4px);
      `;
      document.body.appendChild(scanlines);
    }, 2000);
  };

  const deactivateCyberMode = () => {
    cyberModeActive = false;
    HTML.removeAttribute('data-mode');
    eggOverlay?.classList.remove('visible');
    $('#cyberscanlines')?.remove();
  };

  const init = () => {
    // Konami Code
    document.addEventListener('keydown', (e) => {
      if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
          konamiIdx = 0;
          activateCyberMode();
        }
      } else {
        konamiIdx = 0;
      }
    });

    // Logo triple-click
    logoBtn?.addEventListener('click', () => {
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 600);

      if (logoClicks >= 5) {
        logoClicks = 0;
        activateCyberMode();
      }
    });

    // Close Easter Egg
    eggClose?.addEventListener('click', deactivateCyberMode);

    // Deactivate on double-click anywhere in cyber mode
    document.addEventListener('dblclick', () => {
      if (cyberModeActive) deactivateCyberMode();
    });
  };

  return { init };
})();

/* ─────────────────────────────────────
   16. PARALLAX MANAGER
   Subtle parallax on scroll
───────────────────────────────────── */
const ParallaxManager = (() => {
  const init = () => {
    const glows = $$('.glow-orb');
    if (!glows.length) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY;
          glows.forEach((glow, i) => {
            const speed = [0.3, -0.2, 0.15][i] || 0.1;
            glow.style.transform = `translateY(${sy * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  };

  return { init };
})();

/* ─────────────────────────────────────
   17. HERO NUMBER COUNTER
   Animate stat numbers
───────────────────────────────────── */
const CounterAnimation = (() => {
  const animateNumber = (el, target, duration = 1500) => {
    const start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const init = () => {
    const statNums = $$('.stat-num');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const raw = el.textContent;
            const num = parseInt(raw);
            const suffix = raw.replace(String(num), '');
            el.dataset.suffix = suffix;
            animateNumber(el, num);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.8 }
    );

    statNums.forEach(el => observer.observe(el));
  };

  return { init };
})();

/* ─────────────────────────────────────
   18. HOVER GLOW CARDS
   Spotlight effect on glass cards
───────────────────────────────────── */
const SpotlightEffect = (() => {
  const bindCard = (card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  };

  // Add spotlight CSS once
  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .glass-card {
        position: relative;
        overflow: hidden;
      }
      .glass-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle 200px at var(--mx, -9999px) var(--my, -9999px),
          rgba(255,255,255,0.05) 0%,
          transparent 100%
        );
        pointer-events: none;
        z-index: 0;
        transition: opacity 0.3s;
      }
    `;
    document.head.appendChild(style);
  };

  const init = () => {
    injectStyles();
    $$('.glass-card').forEach(bindCard);
  };

  return { init };
})();

/* ─────────────────────────────────────
   BOOT — Initialize Everything
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavigationManager.init();
  CursorManager.init();
  ParticleEngine.init();
  AnimationController.init();
  TypingAnimation.init();
  TiltCardEngine.init();
  ProjectFilter.init();
  ModalEngine.init();
  SkillBarsController.init();
  TimelineController.init();
  RippleEffect.init();
  MagneticEffect.init();
  ContactForm.init();
  EasterEggManager.init();
  ParallaxManager.init();
  CounterAnimation.init();
  SpotlightEffect.init();

  // Remove initial opacity lock once JS is loaded
  document.body.style.visibility = 'visible';

  console.log('%c🌐 Alex Nova Portfolio', 'color:#7c6aff; font-size:1.2rem; font-weight:bold;');
  console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'color:#00d4ff; font-size:.9rem;');
  console.log('%cOr click the logo 5 times fast!', 'color:#ff6af0; font-size:.9rem;');
});
