import React, { useState, useEffect } from 'react';

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "META", "AMZN", "NVDA", "PLTR", "AMD", "INTC"];

export default function MarketDashboard() {
  const [prices, setPrices] = useState({});
  const API_URL = 'https://fin-production-75a5.up.railway.app';

  useEffect(() => {
    const fetchOneByOne = async () => {
      for (const symbol of SYMBOLS) {
        try {
          const res = await fetch(`${API_URL}/api/quotes?symbols=${symbol}`);
          const data = await res.json();
          if (data.results && data.results[0]) {
            setPrices(prev => ({ ...prev, [symbol]: data.results[0] }));
          }
          // Czekamy 13 sekund między spółkami we frontendzie, żeby Polygon nas nie zbanował
          await new Promise(r => setTimeout(r, 13000));
        } catch (e) { console.error("Błąd dla " + symbol, e); }
      }
    };
    fetchOneByOne();
  }, []);

  return (
    <div style={{ backgroundColor: '#050505', color: '#0FFFD1', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <h2>TERMINAL [SINGLE-STREAM]</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {SYMBOLS.map(s => (
          <tr key={s} style={{ borderBottom: '1px solid #111' }}>
            <td style={{ padding: '10px 0' }}>{s}</td>
            <td style={{ color: '#fff' }}>{prices[s] ? `$${prices[s].price}` : 'OCZEKIWANIE...'}</td>
            <td style={{ textAlign: 'right', color: prices[s]?.changePercent >= 0 ? '#4ade80' : '#ef4444' }}>
              {prices[s] ? `${prices[s].changePercent}%` : '--'}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
