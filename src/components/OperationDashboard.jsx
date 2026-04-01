import React from 'react';
import { AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OperationDashboard({ data }) {
  if (!data || !data.operations) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    
    // Title
    doc.setFontSize(18);
    doc.text('Live Operation Analysis Report', 14, 22);
    
    // Subtitle (Date)
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${currentDate}`, 14, 30);
    
    // Table Structure
    const tableColumn = ["Operation Name", "SAM (Mins)", "Capacity (pcs/hr)", "Normal Time (NT)", "Status"];
    const tableRows = [];

    data.operations.forEach(op => {
      const opData = [
        op.name,
        op.sam.toFixed(3),
        op.capacity,
        op.nt.toFixed(2),
        op.status.charAt(0).toUpperCase() + op.status.slice(1)
      ];
      tableRows.push(opData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const fileDate = new Date().toISOString().split('T')[0];
    doc.save(`Operation_Analysis_${fileDate}.pdf`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'green': return <span className="status-badge normal"><CheckCircle size={14} style={{marginRight: '6px'}}/> Normal</span>;
      case 'yellow': return <span className="status-badge attention"><AlertCircle size={14} style={{marginRight: '6px'}}/> Needs Attention</span>;
      case 'red': return <span className="status-badge critical"><Clock size={14} style={{marginRight: '6px'}}/> Bottleneck</span>;
      default: return null;
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Live Operation Analysis</h2>
          <button 
            onClick={handleDownloadPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 'bold' }}
            title="Download PDF"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--status-green)' }}></div>
            <span>0.2 - 0.5</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--status-yellow)' }}></div>
            <span>0.5 - 0.7</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 'bold' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--status-red)', boxShadow: '0 0 8px var(--status-red)' }}></div>
            <span style={{ color: 'var(--status-red)' }}>≥ 0.8</span>
          </div>
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Operation Name</th>
              <th>SAM (Mins)</th>
              <th>Capacity (pcs/hr)</th>
              <th>Normal Time (NT)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.operations.map((op, idx) => (
              <tr key={idx} style={{ 
                background: op.status === 'red' ? 'var(--status-red-bg)' : 
                           op.status === 'yellow' ? 'var(--status-yellow-bg)' : 'transparent',
                borderLeft: `4px solid var(--status-${op.status})` 
              }}>
                <td style={{ fontWeight: '500', color: op.status === 'red' ? '#fff' : 'inherit' }}>{op.name}</td>
                <td style={{ fontWeight: '600' }}>{op.sam.toFixed(3)}</td>
                <td style={{ fontWeight: '600', color: 'var(--accent)' }}>{op.capacity}</td>
                <td>{op.nt.toFixed(2)}</td>
                <td>{getStatusBadge(op.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
