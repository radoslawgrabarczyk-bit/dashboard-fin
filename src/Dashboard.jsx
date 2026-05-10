import { useState, useEffect, useRef, useCallback } from "react";

// ─── Zmień na URL z Railway po deploymencie ───────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SECTORS = {
  "Big Tech":       ["AAPL","MSFT","GOOGL","META","AMZN"],
  "AI":             ["NVDA","PLTR","SNOW"],
  "Półprzewodniki": ["AMD","INTC","TSM","ASML","QCOM","AVGO"],
  "Chmura":         ["ORCL","NET"],
  "Energetyka":     ["VST","CEG","ETN","VRT","GEV"],
  "Data Centers":   ["EQIX","DLR","IRM"],
};
const ALL_SYMBOLS = Object.values(SECTORS).flat();
const SECTOR_COLORS = {
  "Big Tech":"#00d4ff","AI":"#a855f7","Półprzewodniki":"#f59e0b",
  "Chmura":"#10b981","Energetyka":"#ef4444","Data Centers":"#6366f1",
};
const SECTOR_ICONS = {
  "Big Tech":"◉","AI":"◈","Półprzewodniki":"◧",
  "Chmura":"◌","Energetyka":"◎","Data Centers":"◫",
};
const STOCK_NAMES = {
  AAPL:"Apple Inc.",MSFT:"Microsoft Corp.",GOOGL:"Alphabet Inc.",META:"Meta Platforms",
  AMZN:"Amazon.com",NVDA:"NVIDIA Corp.",PLTR:"Palantir Tech.",SNOW:"Snowflake Inc.",
  AMD:"Advanced Micro Dev.",INTC:"Intel Corp.",TSM:"Taiwan Semicon.",ASML:"ASML Holding",
  QCOM:"Qualcomm Inc.",AVGO:"Broadcom Inc.",ORCL:"Oracle Corp.",NET:"Cloudflare Inc.",
  VST:"Vistra Corp.",CEG:"Constellation Energy",ETN:"Eaton Corp.",VRT:"Vertiv Holdings",
  GEV:"GE Vernova",EQIX:"Equinix Inc.",DLR:"Digital Realty",IRM:"Iron Mountain",
};

// ─── NEWS DATA ────────────────────────────────────────────────────────────────
const NEWS = [
  { id:1,sector:"AI",title:"OpenAI releases GPT-5.5 Instant as new default ChatGPT model",
    description:"OpenAI wydał GPT-5.5 Instant jako domyślny model ChatGPT. Skupia się na redukcji halucynacji w prawie, medycynie i finansach, osiągając 81.2 pkt na AIME 2025 i 76 pkt na MMMU-Pro.",
    source:"TechStartups / CNBC",publishedAt:"2026-05-05T12:00:00Z",url:"https://techstartups.com" },
  { id:2,sector:"AI",title:"Anthropic wins 70% of head-to-head deals against OpenAI among enterprise buyers",
    description:"Anthropic wygrywa ~70% bezpośrednich starć z OpenAI wśród firm kupujących AI po raz pierwszy. Przychody z Claude Code przekroczyły 2.5 mld USD do lutego 2026.",
    source:"TLDL / CNN Business",publishedAt:"2026-05-05T08:00:00Z",url:"https://www.tldl.io" },
  { id:3,sector:"Big Tech",title:"Microsoft adds 1 GW of datacenter capacity in Q3 FY2026, revenue hits $82.9B",
    description:"Microsoft dodał ok. 1 gigawata nowej pojemności centrów danych w Q3 FY2026. Przychody kwartalne wyniosły 82.9 mld USD, Azure urósł o 34% r/r, capex osiągnął 28.7 mld USD.",
    source:"Windows News",publishedAt:"2026-05-04T20:00:00Z",url:"https://windowsnews.ai" },
  { id:4,sector:"Big Tech",title:"Pentagon signs AI deals with 8 Big Tech firms, excludes Anthropic",
    description:"Pentagon zawarł umowy z OpenAI, Google, Microsoft, Nvidia, AWS, Oracle, SpaceX i Reflection na użycie AI w sieciach tajnych. Anthropic wykluczone po odmowie rezygnacji z klauzul bezpieczeństwa.",
    source:"CNN Business",publishedAt:"2026-05-04T14:00:00Z",url:"https://cnn.com" },
  { id:5,sector:"Półprzewodniki",title:"TSMC Q1 2026: revenue $35.9B, up 40.6% YoY — AI chip demand accelerates",
    description:"TSMC odnotował rekordowe przychody 35.9 mld USD w Q1 2026 (+40.6% r/r), z marżą netto 50.5%. Procesory 3nm stanowiły 25% przychodów.",
    source:"SEC / TSMC Earnings",publishedAt:"2026-04-16T10:00:00Z",url:"https://www.sec.gov" },
  { id:6,sector:"Półprzewodniki",title:"Nvidia set to overtake Apple as TSMC's largest customer in 2026",
    description:"Nvidia zmierza do zostania największym klientem TSMC pod względem przychodów w 2026 roku, wyprzedzając Apple. Nvidia kontroluje 92% rynku GPU dla centrów danych.",
    source:"Motley Fool / Nasdaq",publishedAt:"2026-05-02T11:00:00Z",url:"https://www.fool.com" },
  { id:7,sector:"Chmura",title:"Cloud war 2026: AWS holds 31%, Azure 24%, Google Cloud 12% market share",
    description:"Trzej hiperscalerzy planują łącznie ponad 500 mld USD capexu w latach 2025-2027. AWS utrzymuje pozycję lidera z 31% rynku.",
    source:"IBTimes",publishedAt:"2026-04-29T15:00:00Z",url:"https://www.ibtimes.com" },
  { id:8,sector:"Energetyka",title:"Google signs 1 GW data center deal with DTE Energy in Michigan",
    description:"DTE Energy podpisało umowę z Google na obsługę centrum danych o mocy 1 GW. Oracle zawarło wcześniej umowę na 1.4 GW.",
    source:"SEC / DTE Energy 8-K",publishedAt:"2026-04-28T09:00:00Z",url:"https://www.sec.gov" },
  { id:9,sector:"Energetyka",title:"Global data center electricity demand to double to 134.4 GW by 2030",
    description:"Globalne zapotrzebowanie na energię elektryczną centrów danych ma wzrosnąć z 61.8 GW (2025) do 134.4 GW do 2030 roku. Rynek infrastruktury zasilania DC rośnie w tempie CAGR 13.2%.",
    source:"SEC Filing",publishedAt:"2026-05-01T12:00:00Z",url:"https://www.sec.gov" },
  { id:10,sector:"Data Centers",title:"JPMorgan reclassifies AI as core infrastructure — $19.8B tech budget",
    description:"JPMorgan Chase formalnie przeklasyfikował inwestycje w AI z eksperymentalnego R&D na infrastrukturę podstawową. Budżet technologiczny 2026: 19.8 mld USD, 2000 pracowników AI.",
    source:"Crescendo AI / WSJ",publishedAt:"2026-05-04T11:00:00Z",url:"https://www.crescendo.ai" },
  { id:11,sector:"Data Centers",title:"Microsoft, AWS, Google hyperscalers to invest $500B+ in capex 2025–2027",
    description:"Trójka największych hiperscalerów łącznie zainwestuje ponad 500 mld USD w infrastrukturę w latach 2025-2027.",
    source:"Windows News / IBTimes",publishedAt:"2026-04-29T16:00:00Z",url:"https://windowsnews.ai" },
  { id:12,sector:"AI",title:"AWS launches AI agent identities for WorkSpaces virtual desktops",
    description:"Amazon Web Services uruchomił preview funkcji pozwalającej agentom AI uzyskiwać dostęp do wirtualnych pulpitów WorkSpaces. Sygnał wejścia agentów AI do środowisk enterprise.",
    source:"TechStartups / The Register",publishedAt:"2026-05-06T09:00:00Z",url:"https://techstartups.com" },
];

const DAILY_SUMMARY = `Środa, 6 maja 2026 — rynek technologiczny pozostaje pod silną presją popytu na infrastrukturę AI. Microsoft opublikował wyniki Q3 FY2026 z rekordowym capexem 28.7 mld USD i wzrostem Azure o 34% r/r.

W segmencie półprzewodników TSMC utrzymuje silny momentum — Q1 2026 przyniósł 35.9 mld USD przychodów (+40.6% r/r) przy marży netto 50.5%. Nvidia zmierza do zostania największym klientem TSMC, wyprzedzając Apple.

Sentyment w sektorze AI pozostaje pozytywny. Anthropic wygrywa ok. 70% przetargów enterprise przeciw OpenAI. Energetyka i data centers to najgorętszy megatrend — popyt na moc elektryczną dla DC ma się podwoić do 2030 roku.`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff/60)}m temu`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h temu`;
  return `${Math.floor(diff/86400)}d temu`;
}

const SEEDS = ALL_SYMBOLS.reduce((acc,sym) => {
  acc[sym] = Array.from({length:12},()=>Math.random()); return acc;
},{});

function Sparkline({pct, seed}) {
  const pts = (seed||Array(12).fill(0.5)).map((r,i)=>50-(pct/12)*i+(r-0.5)*2).reverse();
  const min=Math.min(...pts), max=Math.max(...pts);
  const norm=pts.map(p=>((p-min)/(max-min+0.001))*24+3);
  const path=norm.map((y,i)=>`${i===0?"M":"L"} ${(i/11)*58} ${28-y}`).join(" ");
  const color=pct>=0?"#22c55e":"#ef4444";
  return (
    <svg width="58" height="28" viewBox="0 0 58 28" style={{opacity:.8}}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── STOCK ROW ────────────────────────────────────────────────────────────────
function StockRow({stock, sectorColor, index}) {
  const [hov,setHov]=useState(false);
  const isAlert=Math.abs(stock.changePercent)>=5;
  const isPos=stock.changePercent>=0;
  const cc=isPos?"#22c55e":"#ef4444";
  const bg=hov?"rgba(255,255,255,0.05)":isAlert
    ?`linear-gradient(90deg,${isPos?"rgba(34,197,94,0.07)":"rgba(239,68,68,0.07)"} 0%,transparent 50%)`
    :index%2===0?"rgba(255,255,255,0.013)":"transparent";
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:"grid",gridTemplateColumns:"2fr 3fr 1.4fr 1.4fr 1fr",
      alignItems:"center",padding:"9px 14px",
      borderBottom:"1px solid rgba(255,255,255,0.04)",
      background:bg,borderLeft:isAlert?`3px solid ${cc}`:"3px solid transparent",
      transition:"background 0.15s",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:sectorColor,boxShadow:`0 0 5px ${sectorColor}`,flexShrink:0}}/>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#e2e8f0",letterSpacing:"0.04em"}}>
          {stock.symbol}
          {isAlert&&<span style={{marginLeft:5,fontSize:8,padding:"1px 4px",background:isPos?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)",color:cc,borderRadius:3,border:`1px solid ${cc}40`,fontWeight:800}}>⚡</span>}
        </span>
      </div>
      <div style={{fontSize:10,color:"#3d5066",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stock.name}</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#c8d8e8",textAlign:"right"}}>${stock.price.toFixed(2)}</div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:cc}}>{isPos?"+":""}{stock.changePercent.toFixed(2)}%</div>
        <div style={{fontSize:9,color:isPos?"#14532d":"#7f1d1d"}}>{isPos?"+":""}{stock.change.toFixed(2)}</div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Sparkline pct={stock.changePercent} seed={SEEDS[stock.symbol]}/></div>
    </div>
  );
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function NewsCard({article, index}) {
  const [expanded,setExpanded]=useState(false);
  const color=SECTOR_COLORS[article.sector]||"#00d4ff";
  const icon=SECTOR_ICONS[article.sector]||"◆";
  return (
    <div style={{
      background:"rgba(10,12,20,0.9)",border:"1px solid rgba(255,255,255,0.07)",
      borderLeft:`3px solid ${color}`,borderRadius:8,padding:"13px 15px",marginBottom:8,
      transition:"background 0.15s",
    }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(22,26,42,0.97)"}
    onMouseLeave={e=>e.currentTarget.style.background="rgba(10,12,20,0.9)"}
    >
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap"}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color,fontFamily:"monospace",background:`${color}18`,padding:"2px 7px",borderRadius:3}}>
          {icon} {article.sector.toUpperCase()}
        </span>
        <span style={{fontSize:9,color:"#3a4a5e",fontFamily:"monospace",background:"rgba(255,255,255,0.04)",padding:"2px 6px",borderRadius:3}}>
          {article.source}
        </span>
        <span style={{fontSize:9,color:"#2d3f52",marginLeft:"auto",fontFamily:"monospace"}}>{timeAgo(article.publishedAt)}</span>
      </div>
      <div style={{margin:"0 0 6px",fontSize:13,fontWeight:600,lineHeight:1.45,color:"#e2e8f0",fontFamily:"'Crimson Text',Georgia,serif"}}>
        {article.title}
      </div>
      <p style={{margin:0,fontSize:11.5,color:"#4a5e72",lineHeight:1.55,maxHeight:expanded?"none":"2.8em",overflow:"hidden"}}>
        {article.description}
      </p>
      <div style={{marginTop:8,display:"flex",gap:6}}>
        <button onClick={()=>setExpanded(e=>!e)} style={{fontSize:9.5,fontFamily:"monospace",padding:"3px 9px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#3a4a5e",borderRadius:3,cursor:"pointer"}}>
          {expanded?"▲ ZWIŃ":"▼ ROZWIŃ"}
        </button>
        <a href={article.url} target="_blank" rel="noreferrer" style={{fontSize:9.5,fontFamily:"monospace",padding:"3px 9px",background:`${color}10`,border:`1px solid ${color}30`,color,borderRadius:3,textDecoration:"none"}}>
          → ŹRÓDŁO
        </a>
      </div>
    </div>
  );
}

// ─── LOADING BAR ─────────────────────────────────────────────────────────────
function LoadingBar({loaded, total}) {
  const pct = total>0 ? Math.round((loaded/total)*100) : 5;
  return (
    <div style={{padding:"60px 20px",textAlign:"center"}}>
      <div style={{fontSize:11,color:"#00d4ff",letterSpacing:"0.2em",marginBottom:20,fontFamily:"'JetBrains Mono',monospace"}}>
        ⟳ POBIERANIE DANYCH RYNKOWYCH
      </div>
      <div style={{width:280,margin:"0 auto",background:"rgba(255,255,255,0.05)",borderRadius:2,height:3}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00d4ff,#a855f7)",transition:"width 0.4s",boxShadow:"0 0 10px #00d4ff60",borderRadius:2}}/>
      </div>
      <div style={{marginTop:12,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#2a3f52"}}>{loaded} / {total} spółek</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stocks,setStocks]=useState({});
  const [loading,setLoading]=useState(true);
  const [loadedCount,setLoadedCount]=useState(0);
  const [error,setError]=useState(null);
  const [activeSector,setActiveSector]=useState("All");
  const [newsFilter,setNewsFilter]=useState("Wszystkie");
  const [sortBy,setSortBy]=useState("sector");
  const [lastUpdate,setLastUpdate]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const [activeTab,setActiveTab]=useState("market");
  const [showSummary,setShowSummary]=useState(true);
  const [searchQuery,setSearchQuery]=useState("");
  const intervalRef=useRef(null);

  const loadData=useCallback(async(isRefresh=false)=>{
    if(isRefresh) setRefreshing(true);
    else {setLoading(true); setLoadedCount(0);}
    setError(null);
    try {
      // Pobieramy w dwóch batchach żeby pokazać postęp
      const half=Math.ceil(ALL_SYMBOLS.length/2);
      const batch1=ALL_SYMBOLS.slice(0,half).join(",");
      const batch2=ALL_SYMBOLS.slice(half).join(",");

      const [r1,r2]=await Promise.all([
        fetch(`${API_BASE}/api/quotes?symbols=${batch1}`).then(r=>r.json()),
        fetch(`${API_BASE}/api/quotes?symbols=${batch2}`).then(r=>r.json()),
      ]);
      setLoadedCount(ALL_SYMBOLS.length);

      const merged={...r1,...r2};
      const result={};
      Object.entries(merged).forEach(([sym,q])=>{
        if(q) result[sym]={...q, name:STOCK_NAMES[sym]};
      });

      if(!Object.keys(result).length) throw new Error("Backend nie zwrócił danych — sprawdź FINNHUB_KEY");
      setStocks(result);
      setLastUpdate(new Date());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },[]);

  useEffect(()=>{
    loadData(false);
    intervalRef.current=setInterval(()=>loadData(true),60000);
    return ()=>clearInterval(intervalRef.current);
  },[loadData]);

  const allStocks=Object.values(stocks);
  const filteredStocks=activeSector==="All"?allStocks:allStocks.filter(s=>SECTORS[activeSector]?.includes(s.symbol));
  const sortedStocks=[...filteredStocks].sort((a,b)=>{
    if(sortBy==="change") return b.changePercent-a.changePercent;
    if(sortBy==="changeAsc") return a.changePercent-b.changePercent;
    if(sortBy==="price") return b.price-a.price;
    return 0;
  });
  const topGainers=[...allStocks].sort((a,b)=>b.changePercent-a.changePercent).slice(0,3);
  const topLosers=[...allStocks].sort((a,b)=>a.changePercent-b.changePercent).slice(0,3);
  const alertCount=allStocks.filter(s=>Math.abs(s.changePercent)>=5).length;
  const gainers=allStocks.filter(s=>s.changePercent>0).length;
  const getSector=sym=>Object.entries(SECTORS).find(([,arr])=>arr.includes(sym))?.[0];
  const newsCategories=["Wszystkie",...Object.keys(SECTOR_COLORS)];
  const filteredNews=NEWS.filter(a=>{
    if(newsFilter!=="Wszystkie"&&a.sector!==newsFilter) return false;
    const q=searchQuery.toLowerCase();
    return !q||a.title.toLowerCase().includes(q)||a.description.toLowerCase().includes(q);
  });

  return (
    <div style={{minHeight:"100vh",background:"#050a14",color:"#e2e8f0",fontFamily:"'Inter',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes fadeInRow{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0f1e}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
        a:hover{opacity:0.8} input::placeholder{color:#1e3040} input:focus{outline:none;border-color:rgba(0,212,255,0.3)!important}
        .shdr:hover{color:#94a3b8!important} .sbtn:hover{background:rgba(255,255,255,0.06)!important}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:`linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
      <div style={{position:"fixed",left:0,right:0,height:1,zIndex:1,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.06),transparent)",animation:"scanline 12s linear infinite"}}/>

      <div style={{position:"relative",zIndex:2,maxWidth:1400,margin:"0 auto",padding:"0 18px 40px"}}>

        {/* ── HEADER ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 14px",borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,212,255,0.04))",border:"1px solid rgba(0,212,255,0.35)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#00d4ff"}}>◈</div>
            <div>
              <div style={{fontSize:16,fontWeight:600,color:"#f1f5f9"}}>Market Terminal <span style={{color:"#00d4ff",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>v2</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:error?"#ef4444":"#22c55e",boxShadow:`0 0 5px ${error?"#ef4444":"#22c55e"}`,animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:9,color:"#1e3040",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>
                  {error?"BŁĄD POŁĄCZENIA":refreshing?"ODŚWIEŻAM...":lastUpdate?`LIVE · ${lastUpdate.toLocaleTimeString("pl-PL")}`:"ŁĄCZENIE..."}
                </span>
              </div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>!refreshing&&!loading&&loadData(true)} style={{
              padding:"5px 12px",borderRadius:4,border:"1px solid rgba(255,255,255,0.08)",
              background:"transparent",color:"#2a4050",fontSize:9,letterSpacing:"0.1em",
              cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",transition:"all 0.15s",
              display:"flex",alignItems:"center",gap:5,
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";e.currentTarget.style.color="#00d4ff";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="#2a4050";}}
            >
              <span style={{display:"inline-block",animation:refreshing?"spin 1s linear infinite":"none"}}>⟳</span> ODŚWIEŻ
            </button>

            <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.04)",borderRadius:7,padding:3,border:"1px solid rgba(255,255,255,0.07)"}}>
              {[["market","📈 RYNEK"],["news","📰 NEWSY"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                  padding:"5px 16px",borderRadius:5,border:"none",
                  background:activeTab===tab?"rgba(0,212,255,0.12)":"transparent",
                  color:activeTab===tab?"#00d4ff":"#2a4050",
                  fontSize:9.5,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",
                  fontFamily:"'JetBrains Mono',monospace",transition:"all 0.15s",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TAB: RYNEK ══ */}
        {activeTab==="market"&&(
          <>
            {loading&&<LoadingBar loaded={loadedCount} total={ALL_SYMBOLS.length}/>}

            {!loading&&error&&(
              <div style={{padding:"60px 20px",textAlign:"center"}}>
                <div style={{color:"#ef4444",fontSize:13,marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>⚠ {error}</div>
                <div style={{fontSize:11,color:"#334155",marginBottom:20}}>
                  Sprawdź czy backend działa: <span style={{color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace"}}>{API_BASE}</span>
                </div>
                <button onClick={()=>loadData(false)} style={{padding:"7px 18px",borderRadius:4,border:"1px solid #ef444440",background:"rgba(239,68,68,0.1)",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {!loading&&!error&&(
              <>
                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,margin:"14px 0"}}>
                  {[
                    {label:"SPÓŁKI",value:allStocks.length,unit:"śledzone",color:"#00d4ff"},
                    {label:"WZROSTY",value:gainers,unit:`/ ${allStocks.length}`,color:"#22c55e"},
                    {label:"SPADKI",value:allStocks.length-gainers,unit:`/ ${allStocks.length}`,color:"#ef4444"},
                    {label:"ALERTY ±5%",value:alertCount,unit:"aktywnych",color:"#f59e0b"},
                  ].map(s=>(
                    <div key={s.label} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"11px 14px",borderTop:`2px solid ${s.color}25`}}>
                      <div style={{fontSize:8,color:"#1e3040",letterSpacing:"0.15em",marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>{s.label}</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:700,color:s.color}}>{s.value}</span>
                        <span style={{fontSize:9,color:"#1e3040"}}>{s.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ranking */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  {[{title:"▲ TOP WZROSTY",data:topGainers,color:"#22c55e"},{title:"▼ TOP SPADKI",data:topLosers,color:"#ef4444"}].map(({title,data,color})=>(
                    <div key={title} style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"11px 14px"}}>
                      <div style={{fontSize:8,color:"#1e3040",letterSpacing:"0.15em",marginBottom:9,fontFamily:"'JetBrains Mono',monospace"}}>{title}</div>
                      {data.map((s,i)=>(
                        <div key={s.symbol} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<2?8:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:8,color:"#0f1f2c",fontFamily:"'JetBrains Mono',monospace"}}>#{i+1}</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#c8d8e8",fontWeight:700}}>{s.symbol}</span>
                            <span style={{fontSize:9,color:"#1e3040"}}>{getSector(s.symbol)}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color}}>{s.changePercent>=0?"+":""}{s.changePercent.toFixed(2)}%</div>
                            <div style={{fontSize:9,color:"#1e3040"}}>${s.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Sector filter */}
                <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  {["All",...Object.keys(SECTORS)].map(sector=>{
                    const active=activeSector===sector;
                    const color=sector==="All"?"#00d4ff":SECTOR_COLORS[sector];
                    return (
                      <button key={sector} className="sbtn" onClick={()=>setActiveSector(sector)} style={{
                        padding:"5px 12px",borderRadius:4,fontFamily:"'JetBrains Mono',monospace",
                        border:`1px solid ${active?color:"rgba(255,255,255,0.06)"}`,
                        background:active?`${color}12`:"transparent",
                        color:active?color:"#1e3040",fontSize:9.5,fontWeight:700,letterSpacing:"0.08em",
                        cursor:"pointer",transition:"all 0.15s",
                      }}>
                        {sector==="All"?"ALL":sector.toUpperCase()}
                        {sector!=="All"&&<span style={{marginLeft:4,opacity:0.4}}>({SECTORS[sector].length})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:8,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 3fr 1.4fr 1.4fr 1fr",padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.3)"}}>
                    {[{l:"TICKER",k:null,a:"left"},{l:"NAZWA",k:null,a:"left"},{l:"CENA",k:"price",a:"right"},{l:"ZMIANA %",k:"change",a:"right"},{l:"TREND",k:null,a:"right"}].map(({l,k,a})=>(
                      <div key={l} className={k?"shdr":""} onClick={()=>{if(!k)return;if(k==="change")setSortBy(sortBy==="change"?"changeAsc":"change");else setSortBy(k);}}
                        style={{fontSize:8,letterSpacing:"0.15em",color:"#1a2d3d",cursor:k?"pointer":"default",textAlign:a,userSelect:"none",fontFamily:"'JetBrains Mono',monospace",transition:"color 0.15s"}}>
                        {l}{k==="change"&&sortBy==="change"&&" ▼"}{k==="change"&&sortBy==="changeAsc"&&" ▲"}{k==="price"&&sortBy==="price"&&" ▼"}
                      </div>
                    ))}
                  </div>

                  {activeSector==="All"?(
                    Object.entries(SECTORS).map(([sector,syms])=>{
                      const ss=syms.map(s=>stocks[s]).filter(Boolean);
                      const avg=ss.reduce((a,s)=>a+s.changePercent,0)/(ss.length||1);
                      const col=SECTOR_COLORS[sector];
                      return (
                        <div key={sector}>
                          <div style={{padding:"7px 17px 5px",background:"rgba(0,0,0,0.18)",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:9}}>
                            <span style={{fontSize:9,color:"#1a2d3d"}}>{SECTOR_ICONS[sector]}</span>
                            <span style={{fontSize:9,color:col,fontWeight:700,letterSpacing:"0.12em",fontFamily:"'JetBrains Mono',monospace"}}>{sector.toUpperCase()}</span>
                            <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:avg>=0?"#22c55e":"#ef4444",marginLeft:"auto"}}>avg {avg>=0?"+":""}{avg.toFixed(2)}%</span>
                          </div>
                          {ss.map((s,i)=><StockRow key={s.symbol} stock={s} sectorColor={col} index={i}/>)}
                        </div>
                      );
                    })
                  ):(
                    sortedStocks.map((s,i)=><StockRow key={s.symbol} stock={s} sectorColor={SECTOR_COLORS[activeSector]||"#00d4ff"} index={i}/>)
                  )}
                </div>

                <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:8,color:"#0a1520",fontFamily:"'JetBrains Mono',monospace"}}>FINNHUB.IO · DANE MOGĄ BYĆ OPÓŹNIONE DO 15 MIN · {ALL_SYMBOLS.length} SYMBOLI</div>
                  <div style={{display:"flex",gap:12}}>
                    {[["#22c55e","wzrost"],["#ef4444","spadek"],["#f59e0b","alert ±5%"]].map(([c,l])=>(
                      <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>
                        <span style={{fontSize:8,color:"#1a2d3d",fontFamily:"'JetBrains Mono',monospace"}}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ TAB: NEWSY ══ */}
        {activeTab==="news"&&(
          <div style={{paddingTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:10,flexWrap:"wrap"}}>
              <div style={{fontSize:9,color:"#1e3040",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>6 MAJA 2026 · {NEWS.length} ARTYKUŁÓW</div>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Szukaj w newsach…" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:6,padding:"5px 12px",fontSize:11,color:"#94a3b8",fontFamily:"'JetBrains Mono',monospace",width:180,transition:"border-color 0.2s"}}/>
            </div>

            {/* Summary */}
            <div style={{background:"rgba(0,212,255,0.03)",border:"1px solid rgba(0,212,255,0.14)",borderRadius:10,padding:"14px 16px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-25,right:-25,width:140,height:140,background:"radial-gradient(circle,rgba(0,212,255,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8}}>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace"}}>◈ DZIENNE PODSUMOWANIE — 6 MAJA 2026</span>
                <button onClick={()=>setShowSummary(s=>!s)} style={{fontSize:8.5,fontFamily:"'JetBrains Mono',monospace",padding:"2px 9px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",color:"#00d4ff88",borderRadius:3,cursor:"pointer"}}>
                  {showSummary?"▲ ZWIŃ":"▼ ROZWIŃ"}
                </button>
              </div>
              {showSummary&&DAILY_SUMMARY.split("\n\n").map((para,i)=>(
                <p key={i} style={{margin:"0 0 8px",fontSize:12,color:"#64748b",lineHeight:1.68}}>{para}</p>
              ))}
            </div>

            {/* News filter tabs */}
            <div style={{display:"flex",gap:0,marginBottom:12,borderBottom:"1px solid rgba(255,255,255,0.06)",overflowX:"auto"}}>
              {newsCategories.map(s=>{
                const active=newsFilter===s;
                const color=SECTOR_COLORS[s]||"#00d4ff";
                const count=s==="Wszystkie"?NEWS.length:NEWS.filter(a=>a.sector===s).length;
                return (
                  <button key={s} onClick={()=>setNewsFilter(s)} style={{
                    padding:"6px 11px",background:"transparent",border:"none",
                    borderBottom:active?`2px solid ${s==="Wszystkie"?"#00d4ff":color}`:"2px solid transparent",
                    color:active?(s==="Wszystkie"?"#00d4ff":color):"#1e3040",
                    fontSize:9,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.09em",
                    cursor:"pointer",whiteSpace:"nowrap",transition:"color 0.15s",marginBottom:-1,
                  }}>
                    {s!=="Wszystkie"&&SECTOR_ICONS[s]+" "}{s.toUpperCase()} <span style={{opacity:0.5}}>{count}</span>
                  </button>
                );
              })}
            </div>

            {searchQuery&&<div style={{fontSize:9,color:"#1e3040",fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>{filteredNews.length} wyników dla „{searchQuery}"</div>}
            {filteredNews.length===0
              ?<div style={{textAlign:"center",padding:48,color:"#1e3040",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>Brak wyników.</div>
              :filteredNews.map((a,i)=><NewsCard key={a.id} article={a} index={i}/>)
            }

            <div style={{marginTop:20,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
              <span style={{fontSize:8,fontFamily:"'JetBrains Mono',monospace",color:"#0a1520"}}>◈ MARKET TERMINAL v2 · 6 MAJA 2026</span>
              <span style={{fontSize:8,fontFamily:"'JetBrains Mono',monospace",color:"#0a1520"}}>ŹRÓDŁA: TECHSTARTUPS · CNN · TSMC · WINDOWSNEWS · SEC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
