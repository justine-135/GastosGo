---
name: project-theme-tokens
description: Full inventory of theme/index.ts tokens after the FE-05 design-token sweep, including new tokens added in that pass.
metadata:
  type: project
---

After FE-05 (2026-11-10), `theme/index.ts` exports the following tokens. Always import from here — never use hardcoded hex/numeric values.

## Colors (`colors.light` / `colors.dark`)

| Token | Light value | Purpose |
|---|---|---|
| `primary` | `#F4A261` | Main brand orange, buttons, active states |
| `secondary` | `#A8DADC` | Sea glass teal |
| `accent` | `#E9C46A` | Golden yellow, warning/near-limit |
| `background` | `#FFF8F0` | Screen backgrounds |
| `surface` | `#FFECD2` | Peach card surface |
| `surfaceMuted` | `#F0EAE0` | Segment/tab/key backgrounds, dividers |
| `surfaceInput` | `#F9F5F0` | Text input background |
| `primaryTint` | `#FFF3E8` | Selected row/chip highlight |
| `borderSoft` | `#F5EDE0` | Softer row divider |
| `foreground` | `#2D3047` | Deep navy text |
| `destructive` | `#E76F51` | Coral red |
| `muted` | `#81B29A` | Sage green (success/under-budget) |
| `mutedForeground` | `#6B7280` | Secondary text |
| `subtleForeground` | `#9CA3AF` | Sub-labels, disabled text, placeholder color for small inputs |
| `disabledForeground` | `#C4B4A0` | Placeholder color for large/hero inputs (e.g. amount field) |
| `border` | `#E5D5C0` | Default border |
| `success` | `#81B29A` | Same as `muted` |
| `warning` | `#E9C46A` | Same as `accent` |
| `error` | `#E76F51` | Same as `destructive` |

## Spacing (`spacing`)
`xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48`

## Radius (`radius`)
`sm: 6, md: 12, lg: 16, xl: 24, full: 9999`

## Typography (`typography`)
Sizes: `xs:11, sm:13, base:15, md:17, lg:20, xl:24, xxl:32, xxxl:40`
Weights: `regular:'400', medium:'500', semibold:'600', bold:'700'`

## Opacity (`opacity`)
`dim: 0.4` (unselected pie slices), `disabled: 0.5` (disabled buttons/keys)

## White (`white`)
`'#FFFFFF'` — use for text/icons on colored backgrounds (buttons, badges).

## Shadow color
`'#000'` is intentionally left as a literal in `shadowColor` — it is not a design token and matches RN convention.

**Why:** Keeping all values in tokens enables future dark-mode support and ensures visual consistency across screens.

**How to apply:** When writing or reviewing any `.styles.ts` file, check that every color, spacing, radius, and opacity value references a token from this list.
