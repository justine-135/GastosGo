# 07: Add Expense sheet + Category Picker

**What to build:** The Add Expense bottom sheet is restyled to match the spec and gains proper drag-to-dismiss behaviour. The Category field opens a full-screen Category Picker push screen (above the sheet) where tapping a category returns to the sheet.

**Blocked by:** 01, 02

**Status:** done

- [ ] Bottom sheet container — `border-radius: 20px 20px 0 0`, white bg, `sh-lg`; handle: 36×4px `gray-2` centered, 10px top margin; header: 20px/700 title + 30×30 close button (circle, `gray-light` bg, gray `✕`)
- [ ] Drag-to-dismiss: velocity > 0.4px/ms OR drag > 100px → dismiss; rubberband resistance on upward drag (via `@gorhom/bottom-sheet` snap points + `overDragResistanceFactor`)
- [ ] Overlay: `rgba(0,0,0,0.42)` when open; tap overlay to dismiss
- [ ] **Form fields** styled per spec input field component: `gray-light` bg wrap, `border-radius: 10px`, `padding: 14px 16px`; focus → white bg + 2px brand ring (150ms); `₱` prefix (20px/300 gray) on Amount; 20px/500 navy input text; 13px/600 uppercase gray label above each field
- [ ] Payment Method: segmented control (`gray-light` bg, `border-radius: 10px`, 2px padding; active segment white bg + `sh-sm`; 13px/500 inactive, 13px/600 active navy)
- [ ] Save button: primary button style (brand gradient, 17px/600 white, `border-radius: 16px`); disabled until `amount > 0 && category` (opacity 0.38); press → `scale(0.97)` (120ms)
- [ ] **Category Picker** (`app/category-picker.tsx`) — full-screen push (renders above the open sheet); NavBar "Category" + back; list of all categories as list rows; selected row shows brand `✓`; tap → navigate back and set category in sheet state
- [ ] Input focus ring animation: 150ms `ease-out` transition
