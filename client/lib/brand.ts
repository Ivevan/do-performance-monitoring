/**
 * DOST XI Brand Palette
 * --------------------------------------------
 * Canonical color reference for the DOST XI brand.
 *
 * IMPORTANT: Components should NOT import these hex values directly.
 * Use the semantic Tailwind tokens defined in `tailwind.config.ts`
 * and `src/index.css` instead, e.g.:
 *
 *   bg-dost-blue        text-dost-blue-foreground
 *   bg-dost-red         text-dost-red-foreground
 *   bg-dost-yellow      text-dost-yellow-foreground
 *   bg-primary          text-primary-foreground   (alias of dost-blue)
 *   bg-accent           text-accent-foreground    (alias of dost-red)
 *
 * This file exists as documentation + a single source of truth
 * for the raw brand values (e.g. for charts, emails, OG images).
 */

export const dostBrand = {
  blue: {
    hex: "#1B3D8F",
    hsl: "220 68% 33%",
    description: "Primary DOST blue — used for headers, primary buttons, branding surfaces.",
  },
  red: {
    hex: "#D8232A",
    hsl: "358 72% 50%",
    description: "DOST red — used for accents, alerts, and call-to-action highlights.",
  },
  yellow: {
    hex: "#FFC72C",
    hsl: "44 100% 59%",
    description: "DOST yellow — used sparingly for highlights and decorative accents.",
  },
  white: {
    hex: "#FFFFFF",
    hsl: "0 0% 100%",
    description: "Surface / foreground on dark brand colors.",
  },
} as const;

export type DostBrandColor = keyof typeof dostBrand;
