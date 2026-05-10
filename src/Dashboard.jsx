import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, Bell, Search, Zap } from 'lucide-react';

const SECTORS = {
  "BIG TECH": ["AAPL", "MSFT", "GOOGL", "META", "AMZN"],
  "AI": ["NVDA", "PLTR", "SNOW"],
  "PÓŁPRZEWODNIKI": ["AMD", "INTC", "TSM", "ASML", "QCOM", "AVGO"],
  "CHMURA": ["ORCL", "NET"],
  "ENERGETYKA": ["VLO", "MPC", "XOM", "VST", "CEG"],
  "DATA CENTERS": ["EQIX", "DLR", "VRT"]
};

// --- STYL KOLORYSTYCZNY ---
// Zmieniamy kolory głównego tekstu na jasne
const STYLES = {
  bg: 'bg-black text-[#0FFFD1]', // Jasny cyjan na czarnym
  cardBg: 'bg-[#0A0A0A] border border-[#1A1A1A]',
  title: 'text-2xl font-bold text-white',
  label: 'text-xs text-[#0AA0A0] uppercase tracking-wider', // Ciemniejszy cyjan
  price: 'text-3xl font-light text-white',
  // Nowe jasne style dla tabeli
  tableText: 'text-[#0FFFD1] font-mono', // Głośny jasny cyjan
  tableName: 'text-[#088080] font-sans', // Ciemniejszy, ale czytelny cyjan
};

const MarketDashboard = () => {
  const [marketData, setMarketData] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://fin-production-75a5.up.railway.app'; // Twój adres z Railway

  const allSymbols = Object.values(SECTORS).flat();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quotes?symbols=${allSymbols.join(',')}`);
        const data = await response.json();
        
        if (data.results) {
          const formattedData = {};
          data.results.forEach(quote => {
            formattedData[quote.symbol] = quote;
          });
          setMarketData(formattedData);
          setLoadingProgress(allSymbols.length);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      }
    };

    fetchData();
    // Odświeżamy rzadziej, bo Polygon ma limit (raz na godzinę, bo pobranie zajmuje 5 min)
    const interval = setInterval(fetchData, 3600000); 
    return () => clearInterval(interval);
  }, [API_URL]);

  const Sparkline = ({ data, color }) => (
    <svg viewBox="0 0 100 20" className="w-16 h-4 opacity-70">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={data.map((val, index) => `${index * (100 / (data.length - 1))},${20 - (val / Math.max(...data) * 20)}`).join(' ')}
      />
    </svg>
  );

  return (
    <div className={`min-h-screen p-4 ${STYLES.bg} font-sans`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 mb-4 rounded-lg bg-[#050505] border border-[#111]">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-[#0FFFD1]" />
          <h1 className={STYLES.title}>Terminal Rynkowy <span className="text-[#088080] text-sm">vPolygon.io</span></h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#088080]">
          <RefreshCcw className="w-4 h-4" />
          <span>Odświeżono: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className={`p-4 rounded-xl ${STYLES.cardBg}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              <th className={`pb-2 text-left ${STYLES.label}`}>TICKER</th>
              <th className={`pb-2 text-left ${STYLES.label}`}>NAZWA</th>
              <th className={`pb-2 text-right ${STYLES.label}`}>CENA (C)</th>
              <th className={`pb-2 text-right ${STYLES.label}`}>ZMIANA (O->C)</th>
              <th className={`pb-2 text-right ${STYLES.label}`}>TREND</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(SECTORS).map(([sector, symbols]) => (
              <React.Fragment key={sector}>
                <tr><td colSpan="5" className={`py-4 pt-6 ${STYLES.label} text-[#0FFFD1] border-b border-[#1A1A1A]`}>{sector}</td></tr>
                {symbols.map(symbol => {
                  const data = marketData[symbol];
                  if (!data) return (
                    <tr key={symbol} className="border-b border-[#111]">
                      <td className="py-2 text-[#088080] font-mono">{symbol}</td>
                      <td className="text-[#044] colSpan-4">Ładowanie (Polygon Free)...</td>
                    </tr>
                  );
                  
                  const isUp = parseFloat(data.changePercent) > 0;
                  const color = isUp ? 'text-green-400' : 'text-red-500';
                  
                  return (
                    <tr key={symbol} className="border-b border-[#111] hover:bg-[#080808]">
                      {/* Ticker - Jasny cyjan */}
                      <td className={`py-3 font-mono ${STYLES.tableText}`}>• {symbol}</td>
                      {/* Nazwa - Ciemniejszy, ale czytelny cyjan */}
                      <td className={`text-[#088080]`}>{symbol} (US)</td> 
                      {/* Cena - Jasny cyjan */}
                      <td className={`text-right font-mono ${STYLES.tableText}`}>${data.price}</td>
                      {/* Zmiana - Zielona/Czerwona */}
                      <td className={`text-right font-mono ${color}`}>
                        {isUp ? '+' : ''}{data.changePercent}%
                      </td>
                      {/* Trend */}
                      <td className="p-3 pr-0 text-right">
                        <Sparkline data={data.trend} color={isUp ? '#4ade80' : '#ef4444'} />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketDashboard;
