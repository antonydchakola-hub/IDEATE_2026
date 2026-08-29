import { useState, useEffect } from 'react';
import { Activity, X, Dumbbell, Zap, Home, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './App.css';

// --- MOCK CALENDAR DATA (August 2026) ---
const startOffset = 6;
const daysInMonth = 31;
const workoutDays = [2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30];

const calendarGrid = Array.from({ length: 42 }, (_, i) => {
  if (i < startOffset || i >= startOffset + daysInMonth) {
    return { id: `empty-${i}`, empty: true };
  }
  const dayNum = i - startOffset + 1;
  return {
    id: `day-${dayNum}`,
    dayNumber: dayNum,
    empty: false,
    hasWorkout: workoutDays.includes(dayNum),
    weekId: Math.floor((dayNum - 1) / 7),
  };
});

const MOCK_WEEKLY_DATA = {
  0: { 
    title: "Week of Aug 2 - Aug 8", imbalance: "14% L", imbalanceInsight: "Left lat lagging on rows", pumpIndex: "85", fatigue: "Moderate", 
    chartData: [{ day: 'Mon', pump: 60, effort: 70 }, { day: 'Tue', pump: 0, effort: 0 }, { day: 'Wed', pump: 85, effort: 80 }, { day: 'Thu', pump: 0, effort: 0 }, { day: 'Fri', pump: 90, effort: 95 }, { day: 'Sat', pump: 0, effort: 0 }, { day: 'Sun', pump: 0, effort: 0 }],
    sensorData: { L_CHEST: 80, R_CHEST: 82, L_DELT: 70, R_DELT: 75, L_BICEP: 65, R_BICEP: 68, CORE: 90, L_LAT: 45, R_LAT: 75, L_TRAP: 50, R_TRAP: 55, L_TRICEP: 60, R_TRICEP: 62 }
  },
  1: { 
    title: "Week of Aug 9 - Aug 15", imbalance: "8% L", imbalanceInsight: "Imbalance improving. Keep focus on left-side accessories.", pumpIndex: "92", fatigue: "High", 
    chartData: [{ day: 'Mon', pump: 75, effort: 80 }, { day: 'Tue', pump: 0, effort: 0 }, { day: 'Wed', pump: 88, effort: 85 }, { day: 'Thu', pump: 0, effort: 0 }, { day: 'Fri', pump: 95, effort: 100 }, { day: 'Sat', pump: 0, effort: 0 }, { day: 'Sun', pump: 0, effort: 0 }],
    sensorData: { L_CHEST: 85, R_CHEST: 86, L_DELT: 75, R_DELT: 78, L_BICEP: 70, R_BICEP: 72, CORE: 92, L_LAT: 65, R_LAT: 78, L_TRAP: 60, R_TRAP: 62, L_TRICEP: 65, R_TRICEP: 68 }
  },
  2: { 
    title: "Week of Aug 16 - Aug 22", imbalance: "4% R", imbalanceInsight: "Slight right overcompensation.", pumpIndex: "98", fatigue: "Very High", 
    chartData: [{ day: 'Mon', pump: 80, effort: 80 }, { day: 'Tue', pump: 0, effort: 0 }, { day: 'Wed', pump: 90, effort: 90 }, { day: 'Thu', pump: 0, effort: 0 }, { day: 'Fri', pump: 99, effort: 100 }, { day: 'Sat', pump: 0, effort: 0 }, { day: 'Sun', pump: 0, effort: 0 }],
    sensorData: { L_CHEST: 90, R_CHEST: 88, L_DELT: 85, R_DELT: 82, L_BICEP: 80, R_BICEP: 78, CORE: 95, L_LAT: 88, R_LAT: 84, L_TRAP: 80, R_TRAP: 75, L_TRICEP: 85, R_TRICEP: 82 }
  },
  3: { 
    title: "Week of Aug 23 - Aug 29", imbalance: "2% L", imbalanceInsight: "Nearly perfect symmetry achieved.", pumpIndex: "102", fatigue: "Moderate", 
    chartData: [{ day: 'Mon', pump: 85, effort: 85 }, { day: 'Tue', pump: 0, effort: 0 }, { day: 'Wed', pump: 95, effort: 95 }, { day: 'Thu', pump: 0, effort: 0 }, { day: 'Fri', pump: 105, effort: 100 }, { day: 'Sat', pump: 0, effort: 0 }, { day: 'Sun', pump: 0, effort: 0 }],
    sensorData: { L_CHEST: 95, R_CHEST: 96, L_DELT: 90, R_DELT: 92, L_BICEP: 88, R_BICEP: 89, CORE: 98, L_LAT: 94, R_LAT: 96, L_TRAP: 88, R_TRAP: 90, L_TRICEP: 92, R_TRICEP: 94 }
  },
  4: { 
    title: "Week of Aug 30 - Aug 31", imbalance: "1% L", imbalanceInsight: "Great finish to the month.", pumpIndex: "90", fatigue: "Low", 
    chartData: [{ day: 'Mon', pump: 90, effort: 90 }, { day: 'Tue', pump: 0, effort: 0 }],
    sensorData: { L_CHEST: 80, R_CHEST: 81, L_DELT: 75, R_DELT: 76, L_BICEP: 70, R_BICEP: 71, CORE: 85, L_LAT: 78, R_LAT: 80, L_TRAP: 75, R_TRAP: 76, L_TRICEP: 80, R_TRICEP: 81 }
  },
};

const MOCK_LEADERBOARD = [
  { id: 1, name: "Alex R.", points: 14250, streak: 12, isMe: false },
  { id: 2, name: "Sarah M.", points: 13800, streak: 8, isMe: false },
  { id: 3, name: "You", points: 12450, streak: 3, isMe: true },
  { id: 4, name: "David K.", points: 11200, streak: 5, isMe: false },
  { id: 5, name: "Emma W.", points: 9800, streak: 2, isMe: false },
];

function Mannequin({ data, isLive, scale = 1 }) {
  const [view, setView] = useState('front');

  const renderSensor = (key, top, left, label) => {
    const val = data[key];
    const intensity = Math.max(0.2, val / 100);
    const s = 1 + (val / 100) * 0.2;
    
    return (
      <div 
        key={key}
        className="sensor-node"
        style={{ 
          top: `${top}%`, 
          left: `${left}%`,
          backgroundColor: `rgba(225, 29, 72, ${intensity})`,
          borderColor: `rgba(225, 29, 72, ${Math.max(0.5, intensity)})`,
          transform: `translate(-50%, -50%) scale(${s * scale})`
        }}
      >
        <span className="sensor-value" style={{ fontSize: `${0.85 * scale}rem` }}>{val}</span>
        {scale > 0.6 && <span className="sensor-label">{label}</span>}
      </div>
    );
  };

  return (
    <div className="mannequin-container" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      <div className="mannequin-toggle">
        <button className={`toggle-btn ${view === 'front' ? 'active' : ''}`} onClick={() => setView('front')}>Front</button>
        <button className={`toggle-btn ${view === 'back' ? 'active' : ''}`} onClick={() => setView('back')}>Back</button>
      </div>
      
      <div className="mannequin-figure">
        <img 
          src="/mannequin.jpg" 
          alt="Torso" 
          className="mannequin-img"
          style={{ transform: view === 'back' ? 'scaleX(-1)' : 'none' }}
        />

        {view === 'front' && (
          <>
            {renderSensor('L_DELT', 22, 18, 'L Delt')}
            {renderSensor('R_DELT', 22, 82, 'R Delt')}
            {renderSensor('L_CHEST', 32, 32, 'L Chest')}
            {renderSensor('R_CHEST', 32, 68, 'R Chest')}
            {renderSensor('L_BICEP', 48, 12, 'L Bicep')}
            {renderSensor('R_BICEP', 48, 88, 'R Bicep')}
            {renderSensor('CORE', 68, 50, 'Core')}
          </>
        )}
        {view === 'back' && (
          <>
            {renderSensor('L_TRAP', 20, 38, 'L Trap')}
            {renderSensor('R_TRAP', 20, 62, 'R Trap')}
            {renderSensor('L_LAT', 45, 25, 'L Lat')}
            {renderSensor('R_LAT', 45, 75, 'R Lat')}
            {renderSensor('L_TRICEP', 55, 12, 'L Tricep')}
            {renderSensor('R_TRICEP', 55, 88, 'R Tricep')}
            <div className="sensor-node" style={{ top: '85%', left: '50%', borderRadius: '4px', background: '#eab308', borderColor: '#ca8a04', color: '#000', transform: `translate(-50%, -50%) scale(${scale})` }}>
              <span style={{ fontSize: `${0.7 * scale}rem` }}>HUB</span>
            </div>
          </>
        )}
      </div>
      
      {isLive && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>LIVE PUMP INDEX</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Broadcasting via BLE (UART)</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  
  const [liveSensorData, setLiveSensorData] = useState({
    L_CHEST: 45, R_CHEST: 42,
    L_DELT: 60, R_DELT: 58,
    L_BICEP: 30, R_BICEP: 32,
    CORE: 80,
    L_LAT: 20, R_LAT: 22,
    L_TRAP: 15, R_TRAP: 15,
    L_TRICEP: 25, R_TRICEP: 24,
  });

  useEffect(() => {
    if (activeTab !== 'home') return;
    const interval = setInterval(() => {
      setLiveSensorData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          let drift = Math.floor(Math.random() * 11) - 5;
          let val = newData[key] + drift;
          if (val < 0) val = 0;
          if (val > 100) val = 100;
          newData[key] = val;
        });
        return newData;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Mannequin data={liveSensorData} isLive={true} />;
      case 'calendar':
        const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
          <section className="dashboard">
            <h2 className="section-title">August 2026</h2>
            <div className="calendar-header">
              {weekdays.map((d, i) => (
                <div key={i} className="calendar-day-header">{d}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarGrid.map((day) => {
                if (day.empty) return <div key={day.id} className="calendar-day empty"></div>;
                return (
                  <div 
                    key={day.id} 
                    className={`calendar-day ${day.hasWorkout ? 'has-workout' : ''}`}
                    onClick={() => {
                      if (day.hasWorkout) setSelectedWeekId(day.weekId || 0);
                    }}
                  >
                    <span className="day-number">{day.dayNumber}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      case 'leaderboard':
        return (
          <section className="dashboard">
            <div className="leaderboard-header">
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Leaderboard</h2>
              <p>Ranked by Pump Points</p>
            </div>
            <div className="leaderboard-list">
              {MOCK_LEADERBOARD.map((user, index) => (
                <div key={user.id} className={`leaderboard-item ${user.isMe ? 'is-me' : ''}`}>
                  <div className={`rank rank-${index + 1}`}>{index + 1}</div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.name}
                      <span className="user-streak">{user.streak} wk 🔥</span>
                    </div>
                  </div>
                  <div className="points-wrap">
                    <div className="points">{user.points.toLocaleString()}</div>
                    <div className="points-label">PTS</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">PUMP</div>
      </header>

      <main>
        {renderContent()}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); setSelectedWeekId(null); }}
        >
          <Home size={24} />
          <span>Live</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => { setActiveTab('calendar'); setSelectedWeekId(null); }}
        >
          <CalendarIcon size={24} />
          <span>History</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('leaderboard'); setSelectedWeekId(null); }}
        >
          <Trophy size={24} />
          <span>Rankings</span>
        </button>
      </nav>

      {selectedWeekId !== null && MOCK_WEEKLY_DATA[selectedWeekId] && (
        <div className="modal-overlay" onClick={() => setSelectedWeekId(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedWeekId(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-secondary)', zIndex: 10 }}>
              <X size={24} />
            </button>
            
            <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h2 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Insights</h2>
              <div className="modal-subtitle" style={{ color: 'var(--accent-rose-light)', fontSize: '0.9rem' }}>{MOCK_WEEKLY_DATA[selectedWeekId].title}</div>
            </div>
            
            {/* Split View for Historical Data: Mannequin + Charts */}
            <div className="historical-split">
              <div className="historical-mannequin-wrap">
                 <Mannequin data={MOCK_WEEKLY_DATA[selectedWeekId].sensorData} isLive={false} scale={0.7} />
              </div>
              
              <div className="historical-data-wrap">
                <div className="metrics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 0 }}>
                  <div className="metric-card glass-panel" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{MOCK_WEEKLY_DATA[selectedWeekId].imbalance}</div>
                    <div className="metric-label" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asymmetry</div>
                  </div>
                  <div className="metric-card glass-panel" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{MOCK_WEEKLY_DATA[selectedWeekId].pumpIndex}</div>
                    <div className="metric-label" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Peak Pump</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-box" style={{ background: 'rgba(225, 29, 72, 0.1)', borderLeft: '4px solid var(--accent-rose)', padding: '1rem', borderRadius: '0 8px 8px 0', marginTop: '1rem' }}>
              <div className="insight-title" style={{ fontWeight: 700, color: 'var(--accent-rose-light)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Smart Coach Insight</div>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>{MOCK_WEEKLY_DATA[selectedWeekId].imbalanceInsight}</p>
            </div>

            <div className="chart-container" style={{ height: '150px' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Workload Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_WEEKLY_DATA[selectedWeekId].chartData}>
                  <defs>
                    <linearGradient id="colorPump" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-rose)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-rose)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} width={30} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-rose)', borderRadius: '8px', fontSize: '0.8rem' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="pump" stroke="var(--accent-rose)" fillOpacity={1} fill="url(#colorPump)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
