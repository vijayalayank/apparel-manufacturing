import React from 'react';
import { Network, PlusCircle, SplitSquareVertical, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Recommendations({ data }) {
  if (!data || !data.operations) return null;

  const getRecommendations = () => {
    const recs = [];
    
    data.operations.forEach(op => {
      // Rule 1: Split Operation
      if (op.status === 'red') {
         recs.push({
           type: 'split',
           icon: <SplitSquareVertical size={24} color="var(--status-red)" />,
           text: `Split Operation: "${op.name}"`,
           detail: `The SAM of ${op.sam.toFixed(3)} mins exceeds the critical bottleneck threshold (0.8). Break this sequence into multiple smaller sub-operations.`,
           color: 'var(--status-red)'
         });
         
         // Rule 2: Add operator based on Takt time
         const additionalOps = Math.ceil(op.operatorsReq) - 1;
         if (additionalOps > 0) {
             recs.push({
               type: 'add',
               icon: <PlusCircle size={24} color="var(--accent)" />,
               text: `Allocate Manpower: Add ${additionalOps} Operator(s) to "${op.name}"`,
               detail: `To maintain the target Takt time of ${data.taktTime} mins, you must allocate a total of ${Math.ceil(op.operatorsReq)} operators to this station.`,
               color: 'var(--accent)'
             });
         }
      }
    });

    // Rule 3: Combine operations
    const lowSams = data.operations.filter(op => op.status === 'green' && op.sam <= 0.3);
    for (let i = 0; i < lowSams.length - 1; i += 2) {
       recs.push({
         type: 'combine',
         icon: <Network size={24} color="var(--status-yellow)" />,
         text: `Combine Operations: "${lowSams[i].name}" + "${lowSams[i+1].name}"`,
         detail: `Merge these sequential low-SAM operations (${lowSams[i].sam.toFixed(2)}m and ${lowSams[i+1].sam.toFixed(2)}m) into a single workstation to prevent operator idling.`,
         color: 'var(--status-yellow)'
       });
    }

    if (recs.length === 0) {
      recs.push({
         type: 'optimal',
         icon: <CheckCircle size={24} color="var(--status-green)" />,
         text: `Line is Running Optimally`,
         detail: `No critical bottlenecks detected. Monitor performance closely.`,
         color: 'var(--status-green)'
      })
    }
    
    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
       <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Automated IE Recommendations</h2>
            <p style={{ color: 'var(--text-muted)' }}>Proactive intelligence derived from the Time Study analysis engine.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
             {recommendations.map((rec, i) => (
                <div key={i} style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: `1px solid ${rec.color.replace('var(--', '').replace(')', '') === 'accent' ? 'rgba(59, 130, 246, 0.3)' : `rgba(${rec.color.replace('var(--status-', '').replace(')', '') === 'red' ? '239, 68, 68' : '245, 158, 11'}, 0.3)`}`,
                    // Hacking the color rgba string dynamically here is tricky, let's just use a glass border
                    border: '1px solid var(--glass-border)',
                    borderTop: `4px solid ${rec.color}`,
                    borderRadius: 'var(--radius-md)', 
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.2s'
                }}
                className="hover-card"
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                   <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                      {rec.icon}
                   </div>
                   <div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '8px', color: '#fff' }}>{rec.text}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>{rec.detail}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
       
       <div className="glass-panel fade-in" style={{ padding: '24px', animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertTriangle size={18} color="var(--status-yellow)" /> 
             Action Formulae Applied
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li>• Capacity = 60 / SAM</li>
            <li>• Operators Required = SAM / Takt Time</li>
            <li>• Takt Time = 60 / Target Output</li>
            <li>• Overall Efficiency = [Total SAM / (Stations × Maximum SAM)] × 100</li>
          </ul>
       </div>
    </div>
  );
}
