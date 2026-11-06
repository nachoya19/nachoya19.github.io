---
name: bespoke-one-page-websites
description: Design and build modern, original, high-craft one-page websites and landing pages free of generic AI design cliches. Use when the user asks to create, design, or code a one-page website, landing page, single-page portfolio, product launch page, event page, or microsite.
---

# Bespoke One-Page Websites

Create distinctive, art-directed single-page websites with intentional typography, asymmetric layouts, refined color systems, and tactile interactions instead of generic AI templates.

## When to Use

- The user asks to build a one-page website, landing page, microsite, or single-page portfolio.
- The user wants a modern, original web design without "AI-slop" or cookie-cutter SaaS templates.
- The user requests a complete HTML/CSS/JS or React single-page implementation with strong visual identity.

## Steps

### 1. Establish an Intentional Aesthetic Direction

Pick one cohesive visual archetype that fits the subject matter before writing code. Avoid blending unrelated styles.

- **Editorial / Swiss Grid**: Exposed 1px hairlines, oversized serif or grotesque display type, high-contrast monochrome with a single bold accent color (such as international orange, acid lime, or cobalt), and strict modular alignment.
- **Warm Tactile Studio**: Paper-toned backgrounds (`#F6F4F0` or `#EFECE6`), deep charcoal ink (`#18181B`), organic easing, subtle grain texture overlays, and generous editorial whitespace.
- **Technical Industrial**: Dark obsidian surfaces (`#0B0C0E`), monospace metadata labels, crisp `1px solid rgba(255,255,255,0.08)` borders, tabular numerals (`font-variant-numeric: tabular-nums`), and precision data-sheet layouts.
- **Expressive Brutalist / Neo-Poster**: Bold color blocking, asymmetric split-screen sections, kinetic typography, and stark geometric framing.

### 2. Configure Distinctive Typography

Default system stacks and overused fonts (`Inter`, `Roboto`, `Arial`) make pages feel generic. Load expressive Google Fonts pairs that create clear hierarchy.

- Pair a characterful display font (`Instrument Serif`, `Syne`, `Space Grotesk`, `Fraunces`, `Playfair Display`, or `Plus Jakarta Sans`) with a clean body font (`DM Sans` or `Work Sans`) and a monospace font (`JetBrains Mono` or `Space Mono`) for indices, tags, and specs.
- Use fluid sizing with `clamp()` for hero headlines (for example, `clamp(2.75rem, 6vw + 1rem, 5.5rem)`) with tight line-height (`0.95` to `1.08`) and negative letter-spacing (`-0.03em`).
- Restrict paragraph measure to `55ch-68ch` so long-form copy stays readable.

### 3. Architect a Non-Formulaic Layout

Standard AI pages repeat the same centered hero followed by three identical shadow cards. Replace that formula with varied spatial rhythm across the scroll journey.

1. **Navigation**: Build a minimal top bar, floating pill nav, or corner-anchored index with smooth-scroll anchor links (`#work`, `#process`, `#specs`, `#contact`) and a single high-contrast CTA.
2. **Hero Section**: Use an asymmetric split layout, an editorial masthead with numbered metadata, or a full-viewport typographic statement paired with an interactive preview or bespoke SVG illustration.
3. **Asymmetric Showcase**: Use an asymmetric bento grid (mixing 2-column and 1-column spans) or an editorial index list instead of 3 equal cards.
4. **Sticky Narrative or Interactive Module**: Include a sticky-header split section where one column stays pinned while the other scrolls through numbered steps, or add a high-density specification table and interactive switcher to break up vertical monotony.
5. **Conversion Footer**: End with a decisive, full-width closing statement, an interactive contact or booking module, and structured colophon metadata.

### 4. Apply Color, Depth, and Micro-Interactions

Visual polish comes from restraint and realistic surface physics rather than heavy neon glows.

- **Color Discipline**: Define CSS custom properties (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`). Keep 85% of the viewport in neutral tones and reserve `--accent` for primary interactive elements and focal indicators.
- **Surface Framing**: Prefer crisp `1px` borders and subtle background luminance shifts over blurry drop shadows.
- **Purposeful Motion**: Use `cubic-bezier(0.22, 1, 0.36, 1)` for transitions. Implement at least one interactive JavaScript detail that serves the content, such as a live scope calculator, tabbed showcase, interactive filter, or scroll-triggered section indicator.
- **Bespoke Visuals**: Never use broken external image URLs. Use curated inline SVG art, CSS architectural grids, interactive canvas elements, or reliable topic-matched photography with proper `aspect-ratio` and `object-fit: cover`.

### 5. Verify Anti-Slop Quality Before Delivering

Check the generated code against these criteria before presenting it:

- Zero purple-to-blue or cyan-to-magenta neon gradients on dark backgrounds.
- Zero rows of three identical icon-on-top cards with generic emojis (`🚀`, `💡`, `✨`, `⚡`).
- Zero cliche AI marketing copy ("Unleash the power of...", "Elevate your workflow", "Revolutionize the future", "Seamless integration"). Write specific, concrete copy tailored to the brand.
- Fully responsive layout that adapts cleanly to mobile (`< 768px`) without horizontal overflow.
- Self-contained, runnable code with all styles and interactive scripts wired up.

## Gotchas

- **Over-animating everything**: Adding bounce effects or heavy parallax to every paragraph makes a site feel cheap. Keep motion fast (`200ms-400ms`), subtle, and tied to user interaction or key structural reveals.
- **Floating badges and glowing blobs**: Blurred background gradient orbs are the biggest visual giveaway of AI-generated landing pages. Use structural grid lines, subtle noise textures, or stark solid contrast instead.
- **Unreadable low-contrast muted text**: Ensure secondary text meets at least a 4.5:1 contrast ratio against its surface background.
- **Dead interactive elements**: Every button, tab, accordion, or form input on the one-page site must have working hover/focus states and functional JavaScript behavior.