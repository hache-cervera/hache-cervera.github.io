---
name: frontend-design
description: Use this skill whenever building or editing UI (React/HTML/CSS components, pages, layouts). It enforces a consistent typography scale, 8px spacing grid, color token system, and component patterns, and steers away from the generic "AI-generated" look (default indigo gradients, overused rounded-xl everything, generic shadow-lg, Inter-everywhere with no hierarchy).
---

# Frontend Design Skill

Apply these rules to every UI change: new components, pages, redesigns, or styling tweaks.

## Typography scale

Use a fixed type scale — never pick font sizes ad hoc. Base scale (rem, 16px root):

| Role | Size | Weight | Line height |
|---|---|---|---|
| Display | 3rem (48px) | 700 | 1.1 |
| H1 | 2.25rem (36px) | 700 | 1.15 |
| H2 | 1.75rem (28px) | 600 | 1.2 |
| H3 | 1.375rem (22px) | 600 | 1.3 |
| Body large | 1.125rem (18px) | 400 | 1.5 |
| Body | 1rem (16px) | 400 | 1.5 |
| Small / caption | 0.875rem (14px) | 400 | 1.4 |
| Micro (labels, badges) | 0.75rem (12px) | 500 | 1.3 |

Rules:
- Max 2 font families per project (one for display/headings, one for body — or a single family with weight variation).
- Never use a font size that isn't in the scale.
- Headings get tighter line-height and often a negative letter-spacing (-0.01em to -0.02em) at large sizes.

## Spacing system (8px grid)

All margins, padding, and gaps must be multiples of 8px (or 4px for fine adjustments inside dense components): 4, 8, 12, 16, 24, 32, 48, 64, 96.

- Never use arbitrary values like `13px`, `22px`, `padding: 10px 17px`.
- Related elements sit closer together (4–8px); distinct sections get more separation (32–64px). Spacing itself communicates grouping — don't rely only on borders/dividers.

## Color tokens

Define a token system, never raw hex codes scattered through components:

- `--color-primary` / `--color-primary-hover` / `--color-primary-active`
- `--color-neutral-{50,100,200,...,900}` (a full neutral ramp for backgrounds, borders, text)
- `--color-accent` (used sparingly — one accent, not several competing ones)
- `--color-success` / `--color-warning` / `--color-danger`
- `--color-bg` / `--color-surface` / `--color-border` / `--color-text` / `--color-text-muted`

Rules:
- Pick ONE primary color with intention (not the default purple/indigo gradient every AI tool reaches for). Ground the palette in the product's actual brand or context.
- Text contrast must meet WCAG AA (4.5:1 for body text).
- Avoid rainbow UI — most of the interface should be neutral tones; color signals action or state, not decoration.

## Component patterns

**Buttons**: define primary / secondary / ghost / destructive variants, each with explicit default, hover, active, focus-visible, and disabled states. Consistent height per size tier (sm/md/lg), consistent border-radius across all buttons (pick one radius value, e.g. 6px or 8px — don't mix pill buttons with square ones in the same UI).

**Cards**: consistent internal padding (usually 16 or 24px), consistent border/shadow treatment across the app (pick either a border OR a shadow as the primary separation technique, not both stacked heavily).

**Forms**: label above input (not placeholder-as-label), visible focus states, inline validation messages with icon + color + text (never color alone), consistent input height matching button height at the same size tier.

**Layout**: establish a clear visual hierarchy — one primary action per screen, secondary actions visually subordinate. Use whitespace intentionally rather than filling every area.

## Avoid the generic AI aesthetic

Red flags to actively avoid:
- Purple-to-blue gradients as a default background or button treatment.
- `border-radius: 12px+` on literally everything (cards, buttons, inputs, badges) with no variation or intent.
- Heavy, indiscriminate `box-shadow: 0 10px 40px rgba(0,0,0,0.1)` on every element.
- Centered hero + 3 equal feature cards + testimonial carousel as the default page structure without a reason.
- Emoji used as icons instead of a proper icon set.
- Inter/system-ui with a single weight everywhere and no real type hierarchy.

Instead: make deliberate choices — a specific radius value used consistently, a restrained shadow/border strategy, an accent color that isn't the default indigo, layouts driven by the actual content instead of a generic template.

## Workflow

When building or modifying UI:
1. Check for existing tokens/theme (CSS variables, Tailwind config, theme file) before introducing new ones — reuse what's there.
2. If no system exists yet, define one (tokens above) before writing component markup.
3. Apply the type scale and 8px grid to every new element — no ad hoc values.
4. Review the result against the "avoid generic AI aesthetic" checklist before considering the task done.
