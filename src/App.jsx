import React, { useState } from 'react';
import './index.css';
import { Upload, BarChart2, Activity, Users, Lightbulb, Target } from 'lucide-react';

import InputScreen from './components/InputScreen';
import OperationDashboard from './components/OperationDashboard';
import VisualCharts from './components/VisualCharts';
import LineBalancing from './components/LineBalancing';
import Recommendations from './components/Recommendations';
import OperationDeepDive from './components/OperationDeepDive';

function App() {
  const [activeTab, setActiveTab] = useState('input');
  
  // Holds the processed payload returned from utils/calculations.js
  const [lineData, setLineData] = useState(null);
  const [activeLineName, setActiveLineName] = useState("No Line Selected");
  
  const handleDataLoaded = (processedData, lineName) => {
    setLineData(processedData);
    setActiveLineName(lineName);
    setActiveTab('dashboard'); // Auto-switch to dash on load
  };

  // Removed renderContent since we will conditionally display items inline
  // to preserve local state in the InputScreen component across tab switches.

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="glass-panel" style={{ width: '280px', margin: '16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 12px var(--accent-glow)' }}>
            <Activity color="#fff" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>AeroSew</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>Decision Support</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavButton icon={<Upload size={20}/>} label="Data Input" active={activeTab === 'input'} onClick={() => setActiveTab('input')} />
          <NavButton icon={<Activity size={20}/>} label="Operation Analysis" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} disabled={!lineData} />
          <NavButton icon={<Target size={20}/>} label="Operation Deep Dive" active={activeTab === 'deepdive'} onClick={() => setActiveTab('deepdive')} disabled={!lineData} />
          <NavButton icon={<BarChart2 size={20}/>} label="Visual Charts" active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} disabled={!lineData} />
          <NavButton icon={<Users size={20}/>} label="Line Balancing" active={activeTab === 'balancing'} onClick={() => setActiveTab('balancing')} disabled={!lineData} />
          <NavButton icon={<Lightbulb size={20}/>} label="Recommendations" active={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')} disabled={!lineData} />
        </div>
        
        {/* Footer info in sidebar */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          System is {lineData ? 'Online' : 'Awaiting Data'}
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="main-content">
        <header className="glass-panel fade-in" style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff' }}>
               {activeTab === 'input' && "Data Initialization"}
               {activeTab === 'dashboard' && "Operation Live Analysis"}
               {activeTab === 'deepdive' && "Specific Operation Analytics"}
               {activeTab === 'charts' && "Production Visualizations"}
               {activeTab === 'balancing' && "Operator Line Balancing"}
               {activeTab === 'recommendations' && "AI Recommendations"}
            </h1>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              {activeLineName}
            </p>
          </div>

          {lineData && (
             <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Efficiency</p>
                 <h2 style={{ color: 'var(--status-green)', fontSize: '1.75rem' }}>{lineData.efficiency}%</h2>
               </div>
               <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }}></div>
               <div style={{ textAlign: 'left' }}>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Output</p>
                 <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>{lineData.targetOutput}/hr</h2>
               </div>
             </div>
          )}
        </header>

        <section className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: activeTab === 'input' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%' }}>
             <InputScreen onDataLoaded={handleDataLoaded} />
           </div>
           
           {activeTab === 'dashboard' && <OperationDashboard data={lineData} />}
           {activeTab === 'deepdive' && <OperationDeepDive data={lineData} />}
           {activeTab === 'charts' && <VisualCharts data={lineData} />}
           {activeTab === 'balancing' && <LineBalancing data={lineData} />}
           {activeTab === 'recommendations' && <Recommendations data={lineData} />}
        </section>
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, disabled }) {
  return (
    <button 
      onClick={disabled ? null : onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: active ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        fontWeight: active ? '600' : '500',
        textAlign: 'left'
      }}
      onMouseOver={(e) => { 
        if (!active && !disabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseOut={(e) => { 
        if (!active && !disabled) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      <span style={{ color: active ? 'var(--accent)' : 'inherit' }}>{icon}</span>
      {label}
    </button>
  );
}

export default App;
