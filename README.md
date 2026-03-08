# RMD Projector

A React-based web application for projecting Required Minimum Distributions (RMDs) over time. This tool helps users visualize their future RMDs and portfolio balances based on IRS rules, growth rates, and annual spending.

## Features

- **RMD Calculation:** Accurately calculates Required Minimum Distributions based on IRS Uniform Lifetime Table.
- **Portfolio Projection:** Projects future retirement portfolio balances taking into account growth, withdrawals, and RMDs.
- **Tax Estimation:** Estimates income taxes owed on RMDs.
- **Interactive Visualization:** Displays interactive charts and tabular data to break down projections year by year.
- **Responsive Design:** Optimized for both desktop and mobile viewing with responsive layouts and scrollable tables.

## Technologies Used

- React (v18)
- TypeScript
- Vite
- Recharts (for data visualization)
- Lucide React (for icons)

## Getting Started

### Prerequisites

- Node.js

### Installation

1. Clone this repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd rmd-projector
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To build the application for production, run:
```bash
npm run build
```

This will create an optimized build in the `dist` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
