import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function VisualCharts({ data }) {
  if (!data || !data.operations) return null;

  // Enhance data for chart rendering
  const chartData = data.operations.map(op => ({
    name: op.name,
    shortName: op.name.length > 20 ? op.name.substring(0, 20) + '...' : op.name,
    sam: op.sam,
    capacity: op.capacity,
    status: op.status
  }));

  const getColor = (status) => {
    switch(status) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxWidth: '300px' }}>
          <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>{data.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              SAM: <span style={{ color: getColor(data.status), fontWeight: 'bold', fontSize: '1rem' }}>{data.sam.toFixed(3)} mins</span>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Capacity: <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.capacity} pcs/hr</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
      
      <div className="glass-panel fade-in" style={{ flex: 1, minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>SAM Comparison Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Visualize time allowance allocations to easily spot operational bottlenecks.</p>
        </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="shortName" 
                stroke="#64748b" 
                fontSize={11} 
                angle={-45} 
                textAnchor="end" 
                tickMargin={10} 
              />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val}m`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="sam" name="Standard Allowed Minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel fade-in" style={{ flex: 1, minHeight: '450px', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Operation Capacity Constraint</h2>
          <p style={{ color: 'var(--text-muted)' }}>Displays the maximum pieces per hour each operational station can process.</p>
        </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="shortName" 
                stroke="#64748b" 
                fontSize={11} 
                angle={-45} 
                textAnchor="end" 
                tickMargin={10}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="capacity" name="Capacity (pcs/hr)" fill="url(#colorCapacity)" radius={[6, 6, 0, 0]} />
              
              <defs>
                <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
