import { create } from 'zustand';

interface TaxProfile {
  documentType: "RUC" | "DNI";
  document: string;
  username?: string;
  solkey: string; // Guardamos como solKey genérico, luego lo mapeamos
}

interface CalculationState {
  taxProfile: TaxProfile | null;
  setTaxProfile: (data: TaxProfile) => void;
  reset: () => void;
}

export const useCalculationStore = create<CalculationState>((set) => ({
  taxProfile: null,
  setTaxProfile: (data) => set({ taxProfile: data }),
  reset: () => set({ taxProfile: null }),
}));