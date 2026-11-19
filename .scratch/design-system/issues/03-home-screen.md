# 03: Home screen — Savings Gap + Spending Cap cards

**What to build:** The Home tab renders two hero cards matching the design spec: a Savings Gap card with a ring decoration and animated status, and a Spending Cap card with an arc decoration and per-category mini bars. The Recent section below shows the last 5 expenses as styled rows.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] **Savings Gap card** — `border-radius: 24px`, `sh-md`, `margin: 60px 20px 0`; ring+dot background decoration (220×220px teal ring, 10px dot, opacity transitions on state change); 13px/600 uppercase label; 48px/800 hero amount (`letter-spacing: -2.5px`), teal (on-track) or red (at-risk), 400ms color transition; status pill (teal or red); 13px gray status text; detail rows with 0.5px top borders
- [ ] **Spending Cap card** — `border-radius: 16px`, `sh-sm`, `margin: 14px 20px 0`; arc decoration (180×180px circle, bottom-right, opacity 0.08); header with remaining amount (24px/800) + "of ₱X cap" label; 6px progress bar (spring-animated fill, color by %); per-category rows: emoji, name, inline mini progress bar, remaining (red if negative)
- [ ] **Recent section** — "Recent" section header (20px/700); card containing last 5 expense rows; each row: 40×40 category icon (`border-radius: 12px`, bg = `${color}22`), 15px/500 name, 12px gray meta, 15px/600 amount right-aligned with `−` prefix
- [ ] `gapEnter` enter animation on Savings Gap card (500ms, opacity+translateY+scale, 60ms delay) and Spending Cap card (120ms delay); first-load only
- [ ] Row press state: background → `gray-light` (120ms)
- [ ] Spending Cap card hidden when no budgeted categories exist (existing logic preserved)
