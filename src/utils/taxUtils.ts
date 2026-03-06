export type FilingStatus = 'single' | 'mfj';

interface TaxBracket {
  rate: number;
  threshold: number;
}

export const TAX_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, threshold: 0 },
    { rate: 0.12, threshold: 12400 },
    { rate: 0.22, threshold: 50400 },
    { rate: 0.24, threshold: 105700 },
    { rate: 0.32, threshold: 201775 },
    { rate: 0.35, threshold: 256225 },
    { rate: 0.37, threshold: 640600 },
  ],
  mfj: [
    { rate: 0.10, threshold: 0 },
    { rate: 0.12, threshold: 24800 },
    { rate: 0.22, threshold: 100800 },
    { rate: 0.24, threshold: 211400 },
    { rate: 0.32, threshold: 403550 },
    { rate: 0.35, threshold: 512450 },
    { rate: 0.37, threshold: 768700 },
  ],
};

export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
};

export const ADDITIONAL_65_PLUS_2026: Record<FilingStatus, number> = {
  single: 2050,
  mfj: 1650, // per person, assuming both are 65+ for simplicity in MFJ context
};

export function calculateTax(income: number, status: FilingStatus, age: number): number {
  let deduction = STANDARD_DEDUCTION_2026[status];
  if (age >= 65) {
    deduction += ADDITIONAL_65_PLUS_2026[status];
  }

  const taxableIncome = Math.max(0, income - deduction);
  const brackets = TAX_BRACKETS_2026[status];
  let tax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const currentBracket = brackets[i];
    const nextBracket = brackets[i + 1];
    const upperLimit = nextBracket ? nextBracket.threshold : Infinity;

    if (taxableIncome > currentBracket.threshold) {
      const taxableInThisBracket = Math.min(taxableIncome, upperLimit) - currentBracket.threshold;
      tax += taxableInThisBracket * currentBracket.rate;
    } else {
      break;
    }
  }

  return tax;
}
