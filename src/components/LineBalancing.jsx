import React from 'react';

export default function LineBalancing({ data }) {
  if (!data || !data.operations) return null;

  return (
    <div className="glass-panel fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Operator Line Balancing</h2>
        <p style={{ color: 'var(--text-muted)' }}>Required headcount per station based on Target Output: {data.targetOutput} units/hr</p>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Operation Phase</th>
              <th>SAM (Mins)</th>
              <th>Theoretical Headcount</th>
              <th>Suggested Allocation</th>
              <th>Line Assessment</th>
            </tr>
          </thead>
          <tbody>
            {data.operations.map((op, idx) => {
               const suggestedOperators = Math.ceil(op.operatorsReq);
               return (
                  <tr key={idx} style={{ background: suggestedOperators >= 2 ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: '500' }}>{op.name}</td>
                    <td>{op.sam.toFixed(3)}</td>
                    <td>
                       <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
                         {op.operatorsReq.toFixed(2)}
                       </span>
                    </td>
                    <td>
                       <div style={{ background: 'var(--accent)', color: '#fff', display: 'inline-flex', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {suggestedOperators} Operator(s)
                       </div>
                    </td>
                    <td>
                      {suggestedOperators >= 2 
                         ? <span className="status-badge attention">Requires Team Load</span>
                         : <span className="status-badge normal">Optimal Solo Station</span>}
                    </td>
                  </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
