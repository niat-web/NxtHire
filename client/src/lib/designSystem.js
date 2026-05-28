// BRAVE design system tokens.
// Plus Jakarta Sans (body) + Supreme (display) + Geist Mono (numbers).
//
// Hard rules:
//   - Display: Supreme on h1/h2/h3 >= 18px, wordmarks, stat numbers.
//   - Body: Plus Jakarta Sans, 400/500/600. Never bold for body — use 600 semibold.
//   - Numbers/tickers: Geist Mono with tabular-nums.
//   - Brand accent dot: amber square (3px×3px or 2×2 in lucide units).
//
// Most components should read CSS variables (hsl(var(--primary)) etc.) so
// theming is one-shot. These exports are kept for the few inline cases.

// Primary brand color — BRAVE crimson
export const ACCENT = '#C0392B';

// Amber highlight (used for the small square dot next to the wordmark)
export const AMBER = '#EF9F27';

// Display serif/sans-display — use on h1/h2/h3 at >=18px, wordmarks, stat numbers.
export const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

// Body stack — already the default; included for the rare inline override.
export const BODY = {
  fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

// Mono — for numerals, tickers, code
export const MONO = { fontFamily: '"Geist Mono", ui-monospace, monospace' };

// Marketing display (landing/hero variants)
export const MARKETING = { fontFamily: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif' };

// Surfaces
export const SOFT_BG = 'hsl(45 60% 98%)';      // warm cream
export const SOFT_BG_WARM = 'hsl(40 50% 96%)'; // slightly warmer cream
