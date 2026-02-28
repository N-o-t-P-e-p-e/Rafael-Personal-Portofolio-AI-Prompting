# 🌐 Alex Nova — Personal Portfolio

A futuristic personal portfolio website built with pure **HTML5, CSS3, and Vanilla JavaScript**. No frameworks, no build tools — just clean, modular, performant code.

---

## ✨ Unique Features

### 🎨 Visual Design
- **Glassmorphism** — layered blur, transparency, depth with `backdrop-filter`
- **Neon gradient palette** — violet/cyan/magenta soft glows throughout
- **Dark / Light mode** — toggle with persistent `localStorage` state
- **Neon Cyber Mode** — secret Easter egg that turns the whole site green-on-black with scanlines

### 🖱️ Interactivity
- **Custom cursor** — dot + ring cursor that morphs on hover; tracks smoothly via lerp
- **Magnetic buttons** — elements gently attract toward the cursor
- **Button ripple** — Material-style click ripple on all CTAs
- **Spotlight effect** — radial glow follows mouse over glass cards

### 🌌 Hero Section
- **Particle canvas** — 90 connected particles that react to mouse proximity
- **AI typing animation** — cycles through 5 typewriter phrases with delete/retype
- **Parallax glow orbs** — ambient color blobs that shift on scroll

### 💫 Scroll Animations
- **Intersection Observer reveals** — every element fades + slides in with staggered delay
- **Glass refraction ripple** — cards emit a glow pulse on first reveal
- **Timeline line drawing** — career timeline connector lines animate from 0 to full height as you scroll
- **Skill bars** — progress bars animate to their target width when visible

### 🪐 Skill Galaxy
- **Orbiting icon system** — 6 tech icons orbit the avatar like a mini solar system
- Each orbit has unique radius, speed, and direction
- Icons counter-rotate to stay upright at all times

### 🃏 Project Cards
- **3D glass tilt** — cards tilt in 3D using mouse position (perspective transform)
- **Filter tabs** — filter projects by category with animated transitions
- **Preview modal** — click any project to open a blur-zoom modal with full details

### 🥚 Easter Eggs
| Trigger | Effect |
|---|---|
| Konami Code (`↑↑↓↓←→←→BA`) | Activates Neon Cyber Mode |
| Click logo 5× fast | Also activates Neon Cyber Mode |
| Double-click anywhere | Deactivates Cyber Mode |

---

## 🧱 Technical Architecture

```
portfolio/
├── index.html       — Semantic HTML5, ARIA labels, structured sections
├── style.css        — CSS variables theme system, responsive, animations
├── script.js        — 17 modular JS controllers (IIFE pattern)
└── README.md        — This file
```

### JavaScript Modules (all in `script.js`)
| Module | Responsibility |
|---|---|
| `ThemeManager` | Dark/light toggle + localStorage |
| `NavigationManager` | Scroll state, hamburger, smooth scroll |
| `CursorManager` | Custom cursor with lerp smoothing |
| `ParticleEngine` | Canvas particle system with mouse interaction |
| `AnimationController` | IntersectionObserver scroll reveals |
| `TypingAnimation` | AI typewriter effect with phrase rotation |
| `TiltCardEngine` | 3D perspective tilt on project cards |
| `ProjectFilter` | Category filtering with transitions |
| `ModalEngine` | Project detail modal with blur-zoom transition |
| `SkillBarsController` | Animate skill progress bars on reveal |
| `TimelineController` | Gradual line-drawing animation |
| `RippleEffect` | Click ripple on buttons |
| `MagneticEffect` | Cursor-attracting magnetic elements |
| `ContactForm` | Form submit simulation with feedback |
| `EasterEggManager` | Konami code + logo click + cyber mode |
| `ParallaxManager` | Subtle glow orb parallax on scroll |
| `CounterAnimation` | Animated stat number counting |
| `SpotlightEffect` | Radial spotlight inside glass cards |

---

## 🚀 Running Locally

No build step needed — just open the file:

```bash
# Option 1: Open directly
open index.html

# Option 2: Local server (recommended for best behavior)
npx serve .
# or
python3 -m http.server 8080
```

---

## 🌍 Deployment

### Vercel
```bash
npm i -g vercel
vercel
# Follow prompts — select root directory
```

### Netlify
```bash
# Drag & drop the portfolio/ folder to netlify.com/drop
# Or use CLI:
npm i -g netlify-cli
netlify deploy --dir=. --prod
```

### GitHub Pages
1. Push to a GitHub repo
2. Go to Settings → Pages → Source: Deploy from branch (main / root)
3. Site live at `https://username.github.io/portfolio`

---

## 🛠️ Customization Guide

### Change personal info
Edit `index.html` — update name, bio, stats, projects, and contact links.

### Change colors / theme
Edit CSS variables in `style.css` `:root` block:
```css
:root {
  --c-accent: #7c6aff;     /* Primary neon purple */
  --c-accent-2: #00d4ff;   /* Cyan */
  --c-accent-3: #ff6af0;   /* Magenta */
}
```

### Add a project
Add a new `<article class="project-card glass-card tilt-card">` in the `#projectGrid` and add corresponding data in the `projects` object in `script.js`.

### Change typing phrases
Edit the `phrases` array in the `TypingAnimation` module inside `script.js`.

---

## ♿ Accessibility
- Semantic HTML5 elements (`<nav>`, `<section>`, `<article>`, `<footer>`)
- All interactive elements have `aria-label`
- Custom cursor falls back gracefully on touch devices
- `prefers-reduced-motion` disables all animations
- Full keyboard navigation support
- `:focus-visible` outlines for keyboard users

---

## 📄 License
MIT — use freely, credit appreciated.
