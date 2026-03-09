import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock recharts because ResponsiveContainer doesn't work well in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: () => <div data-testid="area-chart"></div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
}));

describe('App Component', () => {
    it('renders correctly with default values', () => {
        render(<App />);
        expect(screen.getByText('RMD Projector')).toBeInTheDocument();

        // Check initial input values
        const portfolioInput = screen.getByLabelText(/Initial Portfolio Size/i) as HTMLInputElement;
        expect(portfolioInput.value).toBe('500000');

        const ageInput = screen.getByLabelText(/Current Age/i) as HTMLInputElement;
        expect(ageInput.value).toBe('65');

        const growthInput = screen.getByLabelText(/Assumed Annual Growth/i) as HTMLInputElement;
        expect(growthInput.value).toBe('5');

        const withdrawalInput = screen.getByLabelText(/Annual Withdrawal/i) as HTMLInputElement;
        expect(withdrawalInput.value).toBe('24000');

        // Chart should be rendered
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('updates the projection when portfolio size changes', () => {
        render(<App />);

        const portfolioInput = screen.getByLabelText(/Initial Portfolio Size/i);
        fireEvent.change(portfolioInput, { target: { value: '1000000' } });

        // The table shows the initial balance on the first row
        expect(screen.getAllByText('$1,000,000').length).toBeGreaterThan(0);
    });

    it('updates tax filing status standard deduction', () => {
        render(<App />);

        // Find the standard deduction value for single (16100)
        expect(screen.getByText('$16,100')).toBeInTheDocument();

        // Change to MFJ
        const mfjButton = screen.getByRole('button', { name: /Married \(MFJ\)/i });
        fireEvent.click(mfjButton);

        // Check if the standard deduction changes to the MFJ value (32200)
        expect(screen.getByText('$32,200')).toBeInTheDocument();
    });

    it('shows non-zero RMD in the table once the start age is reached', () => {
        // Current age is 65. RMD start age should be 75 for birth year >= 1960.
        render(<App />);

        // First, let's verify RMD is 0 (shown as '—') at age 65
        // Actually, checking the exact cell is tricky without test IDs.
        // Let's just check if we have a non-zero RMD value format in the document at all? Yes, we do later.
        // Setting current age closer to RMD start age to make it easier to find elements.
        const ageInput = screen.getByLabelText(/Current Age/i);
        fireEvent.change(ageInput, { target: { value: '75' } });

        // At age 75 with 500k, divisor is 24.6. RMD = 500000 / 24.6 = 20325
        expect(screen.getAllByText('$20,325').length).toBeGreaterThan(0);
    });
});
