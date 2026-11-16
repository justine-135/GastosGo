import { create } from "zustand";

export type PaymentMethod = "Cash" | "GCash" | "Card" | "Others";

interface AddExpenseState {
  step: 1 | 2 | 3 | 4;
  categoryId: string | null;
  amount: string;
  paymentMethod: PaymentMethod | null;
  merchant: string;
  notes: string;
  isRecurring: boolean;
  frequency: "daily" | "weekly" | "monthly" | "yearly" | null;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setCategoryId: (id: string) => void;
  setAmount: (amount: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setMerchant: (merchant: string) => void;
  setNotes: (notes: string) => void;
  setIsRecurring: (on: boolean) => void;
  setFrequency: (freq: "daily" | "weekly" | "monthly" | "yearly") => void;
  reset: () => void;
}

const initial = {
  step: 1 as const,
  categoryId: null,
  amount: "",
  paymentMethod: null,
  merchant: "",
  notes: "",
  isRecurring: false,
  frequency: null,
};

export const useAddExpenseStore = create<AddExpenseState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setAmount: (amount) => set({ amount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setMerchant: (merchant) => set({ merchant }),
  setNotes: (notes) => set({ notes }),
  setIsRecurring: (isRecurring) => set({ isRecurring }),
  setFrequency: (frequency) => set({ frequency }),
  reset: () => set(initial),
}));
