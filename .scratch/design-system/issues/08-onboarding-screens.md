# 08: Onboarding screens

**What to build:** All three onboarding screens (Welcome, Income Mode, Income Entry) are restyled to match the design spec, including the gradient background, logo, feature pills, mode cards with staggered enter animation, step dots, and the full field layout per income mode.

**Blocked by:** 01

**Status:** done

- [ ] **Welcome screen** — full-screen gradient bg (`linear-gradient(165deg, #EEF1FE 0%, #F7F7F9 50%, #EEF1FE 100%)`); logo: 64×64 brand gradient square, `border-radius: 20px`, 💸 32px, coral shadow (`0 8px 24px rgba(255,99,72,0.32)`); eyebrow 13px/700 brand uppercase; headline 36px/800 navy with brand-colored span; sub 16px gray; feature pills (white bg, `sep` border, pill shape, 13px/500); primary "Get Started" button; "No account · Your data stays on your phone" 13px gray below; staggered enter: logo 100ms, eyebrow 160ms, title 200ms, sub 240ms, pills 300ms
- [ ] **Income Mode screen** — same gradient bg; transparent nav bar (no blur, no border) with back button; "Step 1 of 2" eyebrow (13px/700 brand); 28px/800 title; 3 mode cards (`border-radius: 16px`, white bg, `sh-sm`, `padding: 20px`; selected: 2px brand border + `brand-bg` bg; 44×44 icon slot `border-radius: 12px`; 16px/700 title + 13px gray desc); `cardEnter` stagger (`index × 70ms`): `opacity 0→1, translateY(12px)→0, scale(0.97)→1`, 400ms; 2 step dots (active: 20px wide brand pill, inactive: 6px `gray-2`; spring transition 250ms); Continue button disabled until mode selected
- [ ] **Income Entry screen** — same pattern, "Step 2 of 2"; fields vary by mode: Salary → Monthly Salary + Expected Savings; Mixed → Monthly Salary + Freelance/Other + Expected Savings; Target → Savings Target only; CTA "Start Tracking 🎉"; styled using the input field component from ticket 07
- [ ] Mode card press: `scale(0.98)` (120ms `ease-out`)
