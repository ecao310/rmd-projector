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

interface ProjectionData {
  year: number;
  age: number;
  balance: number;
  rmd: number;
}

const App: React.FC = () => {
  const [portfolioSize, setPortfolioSize] = useState<number>(500000);
  const [currentAge, setCurrentAge] = useState<number>(65);
  const [growthRate, setGrowthRate] = useState<number>(5);

  const projection = useMemo(() => {
    const data: ProjectionData[] = [];
    let currentBalance = portfolioSize;
    const startYear = new Date().getFullYear();

    for (let age = currentAge; age <= 100; age++) {
      const year = startYear + (age - currentAge);
      const rmd = calculateRMD(age, currentBalance);

      data.push({
        year,
        age,
        balance: Math.round(currentBalance),
        rmd: Math.round(rmd),
      });

      // Simple growth model: RMD is taken out, then growth is applied to the remainder
      currentBalance = (currentBalance - rmd) * (1 + growthRate / 100);

      if (currentBalance <= 0) break;
    }
    return data;
  }, [portfolioSize, currentAge, growthRate]);

  const totalRMD = projection.reduce((sum: number, d: ProjectionData) => sum + d.rmd, 0);
  const rmdStartYear = projection.find((d: ProjectionData) => d.rmd > 0)?.year;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="container">
      <header>
        <h1>RMD Projector</h1>
        <p className="subtitle">MVP: Project your required minimum distributions and portfolio health.</p>
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

          <div className="stats-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}>
            <div className="stat-card">
              <div className="stat-label">RMD Start Year</div>
              <div className="stat-value">{rmdStartYear || 'N/A'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Projected RMDs (to 100)</div>
              <div className="stat-value">{formatCurrency(totalRMD)}</div>
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
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(age) => `Age: ${age}`}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="rmd"
                  stroke="#f87171"
                  fill="#f87171"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Year</th>
                  <th style={{ padding: '0.75rem' }}>Balance</th>
                  <th style={{ padding: '0.75rem' }}>Annual RMD</th>
                </tr>
              </thead>
              <tbody>
                {projection.map((d: ProjectionData) => (
                  <tr key={d.age} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '0.75rem' }}>{d.age}</td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{d.year}</td>
                    <td style={{ padding: '0.75rem' }}>{formatCurrency(d.balance)}</td>
                    <td style={{ padding: '0.75rem', color: d.rmd > 0 ? '#f87171' : '#94a3b8' }}>
                      {d.rmd > 0 ? formatCurrency(d.rmd) : '—'}
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
