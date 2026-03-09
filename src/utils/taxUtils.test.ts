import { describe, it, expect } from 'vitest';
import { calculateTax } from './taxUtils';

describe('taxUtils', () => {
    describe('calculateTax', () => {
        it('calculates tax for single filer under 65 correctly', () => {
            // Standard deduction 2026: 16100
            // Taxable income = 50000 - 16100 = 33900
            // 10% on first 12400 = 1240
            // 12% on remaining 21500 = 2580
            // Total tax = 3820
            expect(calculateTax(50000, 'single', 60)).toBeCloseTo(3820);
        });

        it('calculates tax for single filer 65+ correctly', () => {
            // Standard deduction: 16100 + 2050 = 18150
            // Taxable income = 50000 - 18150 = 31850
            // 10% on first 12400 = 1240
            // 12% on remaining 19450 = 2334
            // Total tax = 3574
            expect(calculateTax(50000, 'single', 65)).toBeCloseTo(3574);
        });

        it('calculates tax for mfj filer under 65 correctly', () => {
            // Standard deduction: 32200
            // Taxable income = 100000 - 32200 = 67800
            // 10% on first 24800 = 2480
            // 12% on remaining 43000 = 5160
            // Total tax = 7640
            expect(calculateTax(100000, 'mfj', 60)).toBeCloseTo(7640);
        });

        it('calculates tax for mfj filer 65+ correctly', () => {
            // Standard deduction: 32200 + 1650 = 33850
            // Taxable income = 100000 - 33850 = 66150
            // 10% on first 24800 = 2480
            // 12% on remaining 41350 = 4962
            // Total tax = 7442
            expect(calculateTax(100000, 'mfj', 70)).toBeCloseTo(7442);
        });

        it('returns 0 if income is less than standard deduction', () => {
            expect(calculateTax(15000, 'single', 60)).toBe(0);
            expect(calculateTax(30000, 'mfj', 60)).toBe(0);
        });
    });
});
