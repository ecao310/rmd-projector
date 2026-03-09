import { describe, it, expect } from 'vitest';
import { getRMDStartAge, calculateRMD } from './rmdTable';

describe('rmdTable utils', () => {
    describe('getRMDStartAge', () => {
        it('returns 75 for birth year >= 1960', () => {
            const currentYear = new Date().getFullYear();
            const ageIn1960 = currentYear - 1960;
            expect(getRMDStartAge(ageIn1960)).toBe(75);
        });

        it('returns 73 for birth year between 1951 and 1959', () => {
            const currentYear = new Date().getFullYear();
            const ageIn1955 = currentYear - 1955;
            expect(getRMDStartAge(ageIn1955)).toBe(73);
        });

        it('returns 72 for birth year <= 1950', () => {
            const currentYear = new Date().getFullYear();
            const ageIn1940 = currentYear - 1940;
            expect(getRMDStartAge(ageIn1940)).toBe(72);
        });
    });

    describe('calculateRMD', () => {
        it('returns 0 if age is before RMD start age', () => {
            // 65 is definitely before the RMD start age
            expect(calculateRMD(65, 100000)).toBe(0);
        });

        it('calculates RMD correctly using UNIFORM_LIFETIME_TABLE', () => {
            // Age 75 divisor is 24.6
            expect(calculateRMD(75, 100000)).toBeCloseTo(100000 / 24.6);

            // Age 80 divisor is 20.2
            expect(calculateRMD(80, 200000)).toBeCloseTo(200000 / 20.2);
        });

        it('uses divisor for age 120 if age > 120', () => {
            // Age 120 divisor is 2.0
            expect(calculateRMD(125, 100000)).toBeCloseTo(100000 / 2.0);
        });
    });
});
