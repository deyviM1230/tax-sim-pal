import { TaxCalculationResult } from "./taxData";

export interface SavedCalculation {
  id: string;
  year: number;
  date: string;
  renta4taAnual: number;
  renta5taAnual: number;
  saldoFinal: number;
  tipoSaldo: "favor" | "contra";
  result: TaxCalculationResult;
}

/** Determina el año fiscal: ene-feb → año anterior, mar+ → año actual */
export function getFiscalYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  return month <= 1 ? now.getFullYear() - 1 : now.getFullYear();
}

// In-memory mock store
let calculations: SavedCalculation[] = [];

export function getCalculations(): SavedCalculation[] {
  return [...calculations];
}

export function addCalculation(result: TaxCalculationResult): SavedCalculation {
  const entry: SavedCalculation = {
    id: crypto.randomUUID(),
    year: getFiscalYear(),
    date: new Date().toISOString(),
    renta4taAnual: result.renta4taAnual,
    renta5taAnual: result.renta5taAnual,
    saldoFinal: result.saldoFinal,
    tipoSaldo: result.tipoSaldo,
    result,
  };
  calculations = [entry, ...calculations];
  return entry;
}
