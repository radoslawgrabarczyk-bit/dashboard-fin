import React, { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState([]);
  const symbols = ["AAPL", "MSFT", "NVDA", "AMD", "TSM"]; // Na początek kilka, żeby nie zabić limitu
  const API_URL = 'https://fin-production-75a5.up.railway.app';

  useEffect(() => {
    const fetchQuotes = async () => {
      // Pobieramy wszystko naraz, tak jak wcześniej u Ciebie działało
      try {
        const response = await fetch(`${API_URL}/api/quotes?symbols=${symbols.join(',')}`);
        const result = await response.json();
        if (result.results) setData(result.results);
      } catch (e) { console.error("Błąd połączenia:", e); }
    };
    fetchQuotes();
  }, []);

  return (
    <div style={{ backgroundColor: '#000', color: '#0FFFD1', minHeight: '100vh', padding: '40px', fontFamily: 'monospace' }}>
      <h1 style={{ borderBottom: '2px solid #0FFFD1', paddingBottom: '10px' }}>TERMINAL RYNKOWY</h1>
      <table style={{ width: '100%', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: '#088080' }}>
            <th>TICKER</th>
            <th>CENA</th>
            <th>ZMIANA %</th>
          </tr>
        </thead>
        <tbody>
          {data.map(stock => (
            <tr key={stock.symbol} style={{ borderBottom: '1px solid #111', height: '40px' }}>
              <td>{stock.symbol}</td>
              <td style={{ color: '#fff' }}>${stock.price}</td>
              <td style={{ color: stock.changePercent >= 0 ? '#0f0' : '#f00' }}>
                {stock.changePercent}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p>ŁĄCZENIE Z SERWEREM...</p>}
    </div>
  );
}
