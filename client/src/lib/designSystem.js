// Editorial design system tokens.
// Fraunces + Inter only. No third family. Keep this file lean.
//
// Hard rules:
//   - Never use Fraunces below 18px (mushy) — use Inter instead.
//   - Never use Inter above 32px for hero/page headlines — use Fraunces instead.
//   - Never use font-bold for body — use font-semibold (600).
//   - Always give Fraunces a serif fallback ("Fraunces, Georgia, serif").

export const ACCENT = '#FF4800';

// Display serif — use on h1/h2/h3 at >=18px, wordmarks, stat numbers.
export const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

// Body stack — already the default; included for the rare inline override.
export const BODY = {
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

export const SOFT_BG = '#FAFAF9';
export const SOFT_BG_WARM = '#FBFAF7';
