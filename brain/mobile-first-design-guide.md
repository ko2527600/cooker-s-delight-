# Mobile-First Design Guide

_Distilled from the Figma Resource Library: "Mobile-First Design: Examples + Strategies for Modern Web Development"_

---

## What Is Mobile-First Design?

Mobile-first design flips the traditional web development approach. Instead of starting with a
desktop layout and scaling down, you begin with a mobile layout and scale up. This prioritizes
smaller screens, slower internet connections, and on-the-go users.

**Key fact:** Almost 96% of internet users go online with their phones at least some of the time,
and mobile devices account for 62% of all web traffic.

Mobile-first ≠ responsive design. Responsive design adapts layouts to fit any screen (often
starting desktop-down). Mobile-first starts small and adds complexity for larger screens — yielding
leaner, faster experiences where most users actually are.

---

## Core Principles

### 1. Content Inventory & Prioritization

Start with a content audit. Ask: _what does the user absolutely need on a small screen right now?_
Build around that. Every element that doesn't serve the primary goal is a candidate for
progressive enhancement (add it for larger screens) or elimination.

- Identify the most important content and features for on-the-go users
- Prioritize clarity, utility, and speed above aesthetics
- Organize content around a clear user flow — from first tap to goal completion

### 2. Design for Small Screens First

Write styles for mobile as the baseline. Use responsive breakpoints as **enhancements**, not
overrides. In Tailwind CSS: write unprefixed classes for mobile, use `sm:`, `md:`, `lg:` to add
to larger viewports.

```css
/* Wrong — desktop first */
.card { display: flex; flex-direction: row; }
@media (max-width: 640px) { .card { flex-direction: column; } }

/* Right — mobile first */
.card { display: flex; flex-direction: column; }
@media (min-width: 640px) { .card { flex-direction: row; } }
```

In Tailwind: `flex-col sm:flex-row`

### 3. Simplified Navigation

Mobile users navigate with thumbs. Navigation should be:

- **Hamburger menus**: collapse all links behind a toggle; open menu covers full width
- **Bottom navigation bars**: place the most important 3–5 destinations in a fixed bottom bar
  (thumb-reachable zone)
- **Back-to-top**: provide easy access to return to the top without excessive scrolling
- **Visual hierarchy**: one clear primary action per screen; secondary actions are smaller or hidden

### 4. Touch-Friendly Elements

Every interactive element must be comfortably tappable with a thumb:

| Standard | Minimum tap target |
|----------|--------------------|
| Apple HIG | 44 × 44 pt |
| Google Material | 48 × 48 dp |
| W3C WCAG 2.5.5 (AAA) | 44 × 44 px |

Implementation rules:
- Buttons and links need `min-height: 44px` and sufficient `padding`
- Spacing between adjacent tap targets should be ≥ 8px to prevent mis-taps
- Add `touch-action: manipulation` on interactive elements to eliminate the 300ms tap delay on
  older Android browsers
- Avoid hover-only interactions — `hover:` states are invisible on touch screens; pair them with
  focus and active states

### 5. Optimized Performance

Every kilobyte counts on mobile networks. Targets: First Contentful Paint < 1.8s, LCP < 2.5s.

- **Images**: use `loading="lazy"` on below-fold images, `loading="eager"` only for hero/LCP
  images; use `decoding="async"`; serve WebP/AVIF; size images appropriately (don't serve 2000px
  wide images for 400px slots)
- **Fonts**: limit font weights loaded; use `font-display: swap`
- **JavaScript**: minimize third-party scripts; use dynamic imports for heavy components
- **CSS**: avoid complex animations on low-end devices; respect `prefers-reduced-motion`
- Use `content-visibility: auto` on long, off-screen sections to defer rendering

### 6. Scalable Typography

Text must be readable without zooming on any device:

| Rule | Value |
|------|-------|
| Base body font size | ≥ 16px (prevents iOS auto-zoom on input focus) |
| Minimum readable text | ≥ 14px (use sparingly) |
| Line height (body) | 1.5–1.7 |
| Line height (headings) | 1.0–1.2 |
| Column max-width | 60–75 characters (about 600px) |

Use fluid typography with `clamp()` or Tailwind responsive text utilities (`text-lg md:text-xl`)
so headings scale smoothly between breakpoints without jarring jumps.

### 7. Testing & Iteration

- Test on **real devices** — browser DevTools simulation misses touch handling, font rendering,
  scroll inertia, and performance on low-end hardware
- Test in varying network conditions (throttle to "Slow 3G" in DevTools)
- Test with one hand, thumb-only navigation
- Gather feedback early; mobile UX problems found late are expensive to fix

---

## Benefits of Mobile-First Design

| Benefit | Why it matters |
|---------|---------------|
| **Accessibility** | Smaller screens + slow networks → design works for everyone |
| **Faster load times** | Leaner layouts and smaller assets |
| **Better UX** | Limited space forces simplicity and clarity |
| **SEO** | Google uses mobile-first indexing — your mobile site is ranked |
| **Scalability** | Easier to enhance for desktop than to strip back |
| **Streamlined development** | Fewer distractions → cleaner code, faster builds |

---

## 7 Best-Practice Tips

1. **Prioritize content** — core content first; use strong UX writing and SEO to make it findable
2. **Keep your user in mind** — build personas; use empathy maps; map the full journey
3. **Consider accessibility** — WCAG color contrast (4.5:1 for normal text); readable fonts;
   alt text; tap-friendly buttons; screen-reader-compatible navigation
4. **Avoid pop-ups** — they frustrate mobile users; if required, ensure they're easy to close
   and don't obscure critical content
5. **Keep branding consistent** — same colors, typefaces, and tone from mobile to desktop
6. **Conduct user testing** — run usability tests on actual mobile devices; watch for pain points
7. **Monitor performance** — track load time, Time to Interactive, CLS, LCP; slow mobile design
   drives users away before they see your content

---

## Cookers Delight — Project-Specific Guidelines

These rules apply this guide to the Cookers Delight React + Tailwind codebase.

### Breakpoint Strategy

| Breakpoint | Usage |
|------------|-------|
| (default, no prefix) | Mobile phones ≤ 639px — **baseline** |
| `sm:` (≥ 640px) | Large phones / small tablets |
| `md:` (≥ 768px) | Tablets |
| `lg:` (≥ 1024px) | Desktop |

Always write mobile styles first. Add `sm:` / `md:` / `lg:` prefixes only to _enhance_.

### Touch Targets

All interactive elements must meet 44px minimum in both height and width:

```tsx
// Buttons
<button className="min-h-[44px] px-6 py-3 ...">

// Icon-only buttons
<button className="w-11 h-11 flex items-center justify-center ...">

// Links styled as nav items
<a className="block py-3 px-4 ...">
```

Add `touch-action: manipulation` to prevent double-tap zoom:

```css
/* index.css */
a, button, [role="button"], input, label, select, textarea {
  touch-action: manipulation;
}
```

### Typography Baseline

```css
/* Prevent iOS auto-zoom on input focus */
input, select, textarea {
  font-size: 1rem; /* ≥ 16px */
}
```

The project uses:
- **Display/headings**: Cormorant Garamond (`font-display`) — elegant, high contrast
- **Body/UI**: Syne (`font-body`) — modern, geometric, readable at small sizes

Minimum sizes in practice:
- Body text: `text-sm` (14px) minimum; prefer `text-base` (16px) for paragraphs
- Labels: `text-xs` (12px) acceptable for uppercase labels with wide tracking
- Headings on mobile: use `clamp` or responsive classes (`text-4xl md:text-6xl`)

### Image Guidelines

```tsx
// Hero / above-fold images — load eagerly
<img loading="eager" decoding="async" ... />

// All other images — lazy load
<img loading="lazy" decoding="async" ... />

// Always specify dimensions to prevent layout shift
<img className="w-full h-full object-cover" ... />
```

### Navigation Pattern

The app uses a top hamburger menu (Navbar.tsx). On mobile:
- Hamburger toggle button: minimum 44×44px tap target
- Menu links in the open drawer: minimum 44px height per link
- Primary CTA ("Order Online"): full-width with minimum 56px height on mobile
- Close menu automatically on route change (already implemented)

### Forms (BookingsPage, Contact, Footer newsletter)

```tsx
// Always use semantic input types for mobile keyboard hints
<input type="email" />   // shows email keyboard
<input type="tel" />     // shows phone keyboard
<input type="date" />    // shows date picker
<input type="number" />  // shows numeric keyboard

// Minimum font size to prevent iOS zoom
<input className="text-base ..." />  // = 16px

// Touch-friendly size
<input className="min-h-[44px] p-4 ..." />
```

### Performance Checklist

- [ ] Hero image uses `loading="eager"`, all others `loading="lazy"`
- [ ] All images use `decoding="async"`
- [ ] `@media (prefers-reduced-motion: reduce)` disables animations (already in index.css)
- [ ] `content-visibility: auto` applied to long sections (`.optimize-render` class exists)
- [ ] No large JS bundles blocking initial render — use dynamic `import()` for heavy pages
- [ ] WhatsApp FAB is positioned within thumb reach (`bottom-6 right-4` on mobile)

### Accessibility Minimum Requirements

- Color contrast: ≥ 4.5:1 for normal text, ≥ 3:1 for large text (≥ 18px bold or ≥ 24px normal)
- All images have descriptive `alt` text (or `alt=""` for decorative images)
- All form inputs have associated `<label>` elements
- Interactive elements are keyboard-focusable
- `aria-label` on icon-only buttons

---

## Quick Reference Checklist

Before shipping any new page or component, verify:

```
Touch targets
[ ] All buttons/links ≥ 44px height
[ ] Adjacent targets ≥ 8px apart
[ ] touch-action: manipulation on interactive elements

Typography
[ ] No text below 14px (12px only for uppercase labels)
[ ] All inputs ≥ 16px font-size (prevents iOS zoom)
[ ] Line height ≥ 1.5 for body text

Images
[ ] Above-fold: loading="eager"; all others: loading="lazy"
[ ] All have decoding="async"
[ ] Width/height or aspect-ratio set to prevent layout shift

Navigation
[ ] Hamburger tap target ≥ 44×44px
[ ] Drawer links ≥ 44px height
[ ] Primary CTA visible without scrolling on mobile

Performance
[ ] prefers-reduced-motion respected
[ ] No blocking third-party scripts in <head>

Accessibility
[ ] All images have alt text
[ ] All form inputs have labels
[ ] Sufficient color contrast
```
