import { useState, useEffect } from 'react';
import { Activity, X, Dumbbell, Zap, Home, Calendar as CalendarIcon, Trophy, Clock, Target } from 'lucide-react';
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
  };
});

// Generate rich daily details
const MOCK_DAILY_DATA = {};
workoutDays.forEach(day => {
  const isPushDay = day % 2 === 0;
  
  MOCK_DAILY_DATA[day] = {
    dateString: `August ${day}, 2026`,
    title: isPushDay ? "Heavy Push Day" : "Pull & Core Focus",
    duration: isPushDay ? "55 min" : "48 min",
    totalReps: isPushDay ? 142 : 115,
    imbalance: isPushDay ? "14% L" : "5% R",
    imbalanceInsight: isPushDay 
      ? "Left chest fatigue set in early. Focus on unilateral presses next week." 
      : "Lats are pulling symmetrically, slight right trap overcompensation.",
    pumpIndex: isPushDay ? 92 : 85,
    fatigue: isPushDay ? "High" : "Moderate",
    exercises: isPushDay ? [
      { name: "Barbell Bench Press", sets: 4, detail: "4x8 @ 185lbs" },
      { name: "Incline DB Press", sets: 3, detail: "3x10 @ 70lbs" },
      { name: "Tricep Pushdowns", sets: 4, detail: "4x12 @ 65lbs" },
      { name: "Lateral Raises", sets: 4, detail: "4x15 @ 25lbs" }
    ] : [
      { name: "Pull-ups", sets: 4, detail: "4x8 @ Bodyweight" },
      { name: "Barbell Rows", sets: 4, detail: "4x10 @ 135lbs" },
      { name: "Face Pulls", sets: 3, detail: "3x15 @ 40lbs" },
      { name: "Hanging Leg Raises", sets: 3, detail: "3x12" }
    ],
    sensorData: isPushDay ? {
      L_CHEST: 95, R_CHEST: 80, L_DELT: 85, R_DELT: 88, L_BICEP: 30, R_BICEP: 32, CORE: 60, L_LAT: 20, R_LAT: 22, L_TRAP: 40, R_TRAP: 45, L_TRICEP: 90, R_TRICEP: 92
    } : {
      L_CHEST: 20, R_CHEST: 22, L_DELT: 40, R_DELT: 42, L_BICEP: 85, R_BICEP: 82, CORE: 80, L_LAT: 95, R_LAT: 92, L_TRAP: 80, R_TRAP: 88, L_TRICEP: 25, R_TRICEP: 24
    },
    // Mini heart-rate / effort chart for the workout duration
    chartData: Array.from({ length: 6 }, (_, i) => ({ time: `${i*10}m`, pump: 50 + Math.random() * 50 }))
  };
});

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
    const val = data[key] || 0;
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
  const [selectedDayId, setSelectedDayId] = useState(null);
  
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
                      if (day.hasWorkout) {
                        setSelectedDayId(day.dayNumber);
                      } else {
                        alert("Rest Day: No workout logged.");
                      }
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

  const selectedData = selectedDayId ? MOCK_DAILY_DATA[selectedDayId] : null;

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
          onClick={() => { setActiveTab('home'); setSelectedDayId(null); }}
        >
          <Home size={24} />
          <span>Live</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => { setActiveTab('calendar'); setSelectedDayId(null); }}
        >
          <CalendarIcon size={24} />
          <span>History</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('leaderboard'); setSelectedDayId(null); }}
        >
          <Trophy size={24} />
          <span>Rankings</span>
        </button>
      </nav>

      {/* Full-screen popup modal for DAILY data */}
      {selectedData && (
        <div className="modal-overlay" onClick={() => setSelectedDayId(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDayId(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-secondary)', zIndex: 10 }}>
              <X size={24} />
            </button>
            
            <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h2 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedData.title}</h2>
              <div className="modal-subtitle" style={{ color: 'var(--accent-rose-light)', fontSize: '0.9rem' }}>{selectedData.dateString}</div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16}/> {selectedData.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={16}/> {selectedData.totalReps} Reps</span>
              </div>
            </div>
            
            <div className="historical-split">
              <div className="historical-mannequin-wrap">
                 <Mannequin data={selectedData.sensorData} isLive={false} scale={0.7} />
              </div>
              
              <div className="historical-data-wrap">
                <div className="metrics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 0 }}>
                  <div className="metric-card glass-panel" style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{selectedData.imbalance}</div>
                    <div className="metric-label" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asymmetry</div>
                  </div>
                  <div className="metric-card glass-panel" style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{selectedData.pumpIndex}</div>
                    <div className="metric-label" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Peak Pump</div>
                  </div>
                  <div className="metric-card glass-panel" style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{selectedData.fatigue}</div>
                    <div className="metric-label" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fatigue</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-box" style={{ background: 'rgba(225, 29, 72, 0.1)', borderLeft: '4px solid var(--accent-rose)', padding: '1rem', borderRadius: '0 8px 8px 0', marginTop: '1rem' }}>
              <div className="insight-title" style={{ fontWeight: 700, color: 'var(--accent-rose-light)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Smart Coach Insight</div>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>{selectedData.imbalanceInsight}</p>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1rem' }}>Exercises Logged</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {selectedData.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ex.detail}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-rose)' }}>{ex.sets} Sets</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container" style={{ marginTop: '2rem', height: '180px' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1rem' }}>Pump Output Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedData.chartData}>
                  <defs>
                    <linearGradient id="colorPump" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-rose)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-rose)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} width={30} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-rose)', borderRadius: '8px', fontSize: '0.8rem' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="pump" stroke="var(--accent-rose)" strokeWidth={2} fillOpacity={1} fill="url(#colorPump)" />
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
