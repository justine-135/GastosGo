import { create } from 'zustand';

interface UIState {
  selectedMonth: number;   // 1–12
  selectedYear: number;
  activeCategoryFilter: string | null; // null = "All"
  setSelectedMonth: (month: number, year: number) => void;
  setActiveCategoryFilter: (categoryId: string | null) => void;
  navigatePreviousMonth: () => void;
  navigateNextMonth: () => void;
}

const now = new Date();

export const useUIStore = create<UIState>((set, get) => ({
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  activeCategoryFilter: null,

  setSelectedMonth: (month, year) => set({ selectedMonth: month, selectedYear: year }),

  setActiveCategoryFilter: (categoryId) => set({ activeCategoryFilter: categoryId }),

  navigatePreviousMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 1) {
      set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
    } else {
      set({ selectedMonth: selectedMonth - 1 });
    }
  },

  navigateNextMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 12) {
      set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
    } else {
      set({ selectedMonth: selectedMonth + 1 });
    }
  },
}));
