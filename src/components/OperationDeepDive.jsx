import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Target } from 'lucide-react';

export default function OperationDeepDive({ data }) {
  if (!data || !data.operations || data.operations.length === 0) return null;

  const [selectedOpId, setSelectedOpId] = useState(data.operations[0].id);
  const selectedOp = data.operations.find(op => op.id === selectedOpId) || data.operations[0];
  
  // 1. Cycle Time Trend (Line Graph)
  const cycleTimeData = selectedOp.cycleTimes.map((time, idx) => ({
    cycle: `C-${idx + 1}`,
    time: time
  }));
  
  // 2. Time Breakdown (Pie Chart) converted to seconds for visualization scaling
  const samSeconds = selectedOp.sam * 60;
  const allowanceSeconds = Math.max(0, samSeconds - selectedOp.nt);
  const pieData = [
    { name: 'Basic Time (NT)', value: parseFloat(selectedOp.nt.toFixed(2)) },
    { name: 'Allowances (Buffer)', value: parseFloat(allowanceSeconds.toFixed(2)) }
  ];
  const pieColors = ['#3b82f6', '#f59e0b'];

  // 3. Comparison (Bar Chart)
  const lineAverageCapacity = data.operations.reduce((sum, op) => sum + op.capacity, 0) / data.operations.length;
  const barData = [
    { name: 'This Operation', capacity: selectedOp.capacity, fill: '#3b82f6' },
    { name: 'Line Average', capacity: Math.round(lineAverageCapacity), fill: '#64748b' },
    { name: 'Line Bottleneck', capacity: data.lineCapacity, fill: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ fontWeight: 'bold' }}>{label}</p>
          <p style={{ color: payload[0].color || 'var(--accent)' }}>{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      
      {/* Selection Header */}
      <div className="glass-panel fade-in" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
         <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '16px', borderRadius: '50%' }}>
            <Target size={32} color="var(--accent)" />
         </div>
         <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Targeted Operation Deep Dive</h2>
            <select 
               value={selectedOpId} 
               onChange={e => setSelectedOpId(e.target.value)}
               style={{ width: '100%', maxWidth: '400px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', appearance: 'none' }}
            >
               {data.operations.map(op => (
                  <option key={op.id} value={op.id} style={{ background: 'var(--bg-primary)' }}>
                     {op.name} (SAM: {op.sam.toFixed(3)})
                  </option>
               ))}
            </select>
         </div>
         <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
            <div>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</p>
               <h3 style={{ color: `var(--status-${selectedOp.status})`, textTransform: 'capitalize' }}>
                  {selectedOp.status === 'red' ? 'Bottleneck' : selectedOp.status === 'yellow' ? 'Attention' : 'Normal'}
               </h3>
            </div>
            <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
            <div>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacity</p>
               <h3>{selectedOp.capacity} pcs/hr</h3>
            </div>
         </div>
      </div>
      
      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', flex: 1 }}>
         
         <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '350px', animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Cycle Time Trend (15 Observations)</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleTimeData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                     <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} />
                     <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                     <Tooltip content={<CustomTooltip />} />
                     <Line type="monotone" dataKey="time" name="Cycle Time (sec)" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-primary)', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
         
         <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '350px', animationDelay: '0.2s' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>SAM Component Breakdown</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                     </Pie>
                     <Tooltip content={<CustomTooltip />} />
                     <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
         
         <div className="glass-panel fade-in" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: '300px', animationDelay: '0.3s' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Relative Capacity Mapping</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                     <XAxis type="number" stroke="#64748b" fontSize={11} />
                     <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                     <Tooltip content={<CustomTooltip />} />
                     <Bar dataKey="capacity" name="Capacity (pcs/hr)" barSize={40} radius={[0, 4, 4, 0]}>
                        {barData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         
      </div>
    </div>
  );
}
