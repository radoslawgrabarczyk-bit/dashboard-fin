import React, { useState, useEffect } from 'react';
import { RefreshCcw, Zap } from 'lucide-react';

const SECTORS = {
  "BIG TECH": ["AAPL", "MSFT", "GOOGL", "META", "AMZN"],
  "AI": ["NVDA", "PLTR", "SNOW"],
  "PÓŁPRZEWODNIKI": ["AMD", "INTC", "TSM", "ASML", "QCOM", "AVGO"]
};

export default function MarketDashboard() {
  const [marketData, setMarketData] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  // WPISZ SWÓJ ADRES RAILWAY PONIŻEJ:
  const API_URL = 'https://fin-production-75a5.up.railway.app';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quotes?symbols=${Object.values(SECTORS).flat().join(',')}`);
        const data = await response.json();
        if (data.results) {
          const formatted = {};
          data.results.forEach(q => { formatted[q.symbol] = q; });
          setMarketData(formatted);
          setLastUpdate(new Date());
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#050505', color: '#0FFFD1', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>TERMINAL V2 [POLYGON]</h1>
        <span style={{ fontSize: '12px', color: '#088080' }}>
          {lastUpdate ? `LIVE: ${lastUpdate.toLocaleTimeString()}` : 'ŁĄCZENIE...'}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#088080', textAlign: 'left', fontSize: '12px' }}>
            <th style={{ padding: '10px 0' }}>TICKER</th>
            <th>CENA</th>
            <th style={{ textAlign: 'right' }}>ZMIANA %</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(SECTORS).map(([sector, symbols]) => (
            <React.Fragment key={sector}>
              <tr><td colSpan="3" style={{ padding: '15px 0 5px 0', color: '#fff', borderBottom: '1px solid #111', fontSize: '11px' }}>{sector}</td></tr>
              {symbols.map(s => (
                <tr key={s} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '10px 0' }}>{s}</td>
                  <td style={{ color: '#fff' }}>{marketData[s] ? `$${marketData[s].price}` : '...'}</td>
                  <td style={{ textAlign: 'right', color: marketData[s]?.changePercent >= 0 ? '#4ade80' : '#ef4444' }}>
                    {marketData[s] ? `${marketData[s].changePercent}%` : '--'}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
