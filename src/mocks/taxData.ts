// Valor de la UIT 2024
export const UIT = 5150;

// Gastos deducibles mockeados (máximo 3 UIT)
export const mockDeductibleExpenses = {
  hotelesRestaurantes: 1200, // 15%
  serviciosProfesionales: 2500, // 30%
  arrendamiento: 800, // 30%
  trabajadorasHogar: 1000, // 100%
};

// Tramos del impuesto a la renta
export const taxBrackets = [
  { min: 0, max: 5, rate: 0.08 },
  { min: 5, max: 20, rate: 0.14 },
  { min: 20, max: 35, rate: 0.17 },
  { min: 35, max: 45, rate: 0.20 },
  { min: 45, max: Infinity, rate: 0.30 },
];

// Retenciones mockeadas
export const mockRetentions = {
  renta4ta: 800,
  renta5ta: 3500,
};

export interface TaxCalculationResult {
  renta4taAnual: number;
  renta5taAnual: number;
  deduccion4ta: number;
  deduccionFija: number;
  gastosDeducibles: {
    hotelesRestaurantes: number;
    serviciosProfesionales: number;
    arrendamiento: number;
    trabajadorasHogar: number;
    total: number;
  };
  rentaNetaImponible: number;
  impuestoCalculado: number;
  totalRetenciones: number;
  saldoFinal: number;
  tipoSaldo: 'favor' | 'contra';
}

export function calculateTax(
  renta4ta: number,
  renta5ta: number,
  periodo4ta: 'mensual' | 'anual',
  periodo5ta: 'mensual' | 'anual'
): TaxCalculationResult {
  // Convertir a anual
  const renta4taAnual = periodo4ta === 'mensual' ? renta4ta * 12 : renta4ta;
  const renta5taAnual = periodo5ta === 'mensual' ? renta5ta * 12 : renta5ta;

  // Deducción 4ta categoría (20%)
  const deduccion4ta = renta4taAnual * 0.2;

  // Deducción fija (7 UIT)
  const deduccionFija = 7 * UIT;

  // Gastos deducibles (máximo 3 UIT)
  const totalGastos = Object.values(mockDeductibleExpenses).reduce((a, b) => a + b, 0);
  const gastosDeduciblesTotal = Math.min(totalGastos, 3 * UIT);

  const gastosDeducibles = {
    ...mockDeductibleExpenses,
    total: gastosDeduciblesTotal,
  };

  // Renta neta de trabajo
  const rentaBruta = (renta4taAnual - deduccion4ta) + renta5taAnual;
  const rentaNetaImponible = Math.max(0, rentaBruta - deduccionFija - gastosDeduciblesTotal);

  // Calcular impuesto por tramos
  let impuestoCalculado = 0;
  let rentaRestante = rentaNetaImponible;

  for (const bracket of taxBrackets) {
    const minUIT = bracket.min * UIT;
    const maxUIT = bracket.max === Infinity ? Infinity : bracket.max * UIT;
    const rangoActual = maxUIT - minUIT;

    if (rentaRestante <= 0) break;

    const montoEnTramo = Math.min(rentaRestante, rangoActual);
    impuestoCalculado += montoEnTramo * bracket.rate;
    rentaRestante -= montoEnTramo;
  }

  // Total retenciones
  const totalRetenciones = mockRetentions.renta4ta + mockRetentions.renta5ta;

  // Saldo final
  const saldoFinal = impuestoCalculado - totalRetenciones;

  return {
    renta4taAnual,
    renta5taAnual,
    deduccion4ta,
    deduccionFija,
    gastosDeducibles,
    rentaNetaImponible,
    impuestoCalculado,
    totalRetenciones,
    saldoFinal: Math.abs(saldoFinal),
    tipoSaldo: saldoFinal <= 0 ? 'favor' : 'contra',
  };
}
