import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { calculateRMD } from './utils/rmdTable';
import { calculateTax, FilingStatus } from './utils/taxUtils';

interface ProjectionData {
  year: number;
  age: number;
  balance: number;
  rmd: number;
  tax: number;
  netRmd: number;
}

const App: React.FC = () => {
  const [portfolioSize, setPortfolioSize] = useState<number>(500000);
  const [currentAge, setCurrentAge] = useState<number>(65);
  const [growthRate, setGrowthRate] = useState<number>(5);
  const [annualWithdrawal, setAnnualWithdrawal] = useState<number>(20000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  const projection = useMemo(() => {
    const data: ProjectionData[] = [];
    let currentBalance = portfolioSize;
    const startYear = new Date().getFullYear();

    for (let age = currentAge; age <= 100; age++) {
      const year = startYear + (age - currentAge);
      const rmd = calculateRMD(age, currentBalance);
      const tax = calculateTax(rmd, filingStatus, age);
      const netRmd = rmd - tax;

      data.push({
        year,
        age,
        balance: Math.round(currentBalance),
        rmd: Math.round(rmd),
        tax: Math.round(tax),
        netRmd: Math.round(netRmd),
      });

      // Simplified gross withdrawal: the greater of the user spending amount or RMD
      const actualWithdrawal = Math.max(rmd, annualWithdrawal);
      // Growth model: actual withdrawal is taken out, then growth is applied to the remainder
      currentBalance = (currentBalance - actualWithdrawal) * (1 + growthRate / 100);

      if (currentBalance <= 0) break;
    }
    return data;
  }, [portfolioSize, currentAge, growthRate, filingStatus, annualWithdrawal]);

  const totalRMD = projection.reduce((sum: number, d: ProjectionData) => sum + d.rmd, 0);
  const totalTax = projection.reduce((sum: number, d: ProjectionData) => sum + d.tax, 0);
  const rmdStartYear = projection.find((d: ProjectionData) => d.rmd > 0)?.year;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="container">
      <header>
        <h1>RMD Projector</h1>
        <p className="subtitle">Project your required minimum distributions, estimated taxes, and portfolio health.</p>
      </header>

      <div className="grid">
        <aside className="card">
          <div className="input-group">
            <label htmlFor="portfolio">Initial Portfolio Size ($)</label>
            <input
              id="portfolio"
              type="number"
              value={portfolioSize}
              onChange={(e) => setPortfolioSize(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label htmlFor="age">Current Age</label>
            <input
              id="age"
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label htmlFor="growth">Assumed Annual Growth (%)</label>
            <input
              id="growth"
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label htmlFor="withdrawal">Annual Withdrawal ($)</label>
            <input
              id="withdrawal"
              type="number"
              value={annualWithdrawal}
              onChange={(e) => setAnnualWithdrawal(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label htmlFor="status">Filing Status</label>
            <select
              id="status"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '1rem'
              }}
            >
              <option value="single">Single</option>
              <option value="mfj">Married Filing Jointly</option>
            </select>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}>
            <div className="stat-card">
              <div className="stat-label">RMD Start Year</div>
              <div className="stat-value">{rmdStartYear || 'N/A'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Projected RMDs</div>
              <div className="stat-value">{formatCurrency(totalRMD)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Projected Taxes</div>
              <div className="stat-value" style={{ color: '#f87171' }}>{formatCurrency(totalTax)}</div>
            </div>
          </div>
        </aside>

        <main className="card">
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Portfolio Balance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f87171' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Yearly RMD</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="age"
                  stroke="#64748b"
                  label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  formatter={(value: any, name?: string) => [formatCurrency(Number(value)), name === 'rmd' ? 'Gross RMD' : name === 'tax' ? 'Estimated Tax' : 'Balance']}
                  labelFormatter={(age) => `Age: ${age}`}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="balance"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="rmd"
                  name="rmd"
                  stroke="#f87171"
                  fill="#f87171"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Year</th>
                  <th style={{ padding: '0.75rem' }}>Balance</th>
                  <th style={{ padding: '0.75rem' }}>Gross RMD</th>
                  <th style={{ padding: '0.75rem' }}>Est. Tax</th>
                </tr>
              </thead>
              <tbody>
                {projection.map((d: ProjectionData) => (
                  <tr
                    key={d.age}
                    style={{
                      borderBottom: '1px solid #0f172a',
                      backgroundColor: d.rmd > annualWithdrawal ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>{d.age}</td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{d.year}</td>
                    <td style={{ padding: '0.75rem' }}>{formatCurrency(d.balance)}</td>
                    <td style={{ padding: '0.75rem', color: d.rmd > 0 ? '#f87171' : '#94a3b8' }}>
                      {d.rmd > 0 ? formatCurrency(d.rmd) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', color: d.tax > 0 ? '#f87171' : '#94a3b8' }}>
                      {d.tax > 0 ? formatCurrency(d.tax) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
