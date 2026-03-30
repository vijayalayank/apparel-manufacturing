import React, { useState, useEffect } from 'react';
import { processTimeStudy } from '../utils/calculations';
import { PlusCircle, Trash2, ArrowRight, UploadCloud, FileJson, CheckCircle, AlertCircle, Save, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const DEFAULT_TEMPLATES = {
  "Line 1": [
     "Attaching two collar pieces on the wrong side",
     "Collar top stitch",
     "Front placket making",
     "Shoulder attach",
     "Sleeve attach",
     "Side seam joining",
     "Bottom hemming"
  ],
  "Line 2": [
     "Front pocket attach",
     "Back yoke attach",
     "Cuff making",
     "Cuff attaching",
     "Button hole making",
     "Button attaching",
     "Collar turning & pressing"
  ],
  "Line 3": [
     "Neck rib attach",
     "Armhole bindings",
     "Side seam overlock",
     "Waistband attach",
     "Label attach",
     "Thread trimming",
     "Final QC & Pressing"
  ]
};

export default function InputScreen({ onDataLoaded }) {
  const [inputType, setInputType] = useState('manual'); // 'manual', 'json', or 'xls'
  
  // File State (Shared for JSON and XLS)
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState('');
  
  // Manual Entry State
  const [savedLines, setSavedLines] = useState(() => {
    const local = localStorage.getItem('aeroSewTemplates');
    return local ? JSON.parse(local) : DEFAULT_TEMPLATES;
  });
  
  const [selectedLineKey, setSelectedLineKey] = useState('Line 1');
  const [lineName, setLineName] = useState('Line 1'); // Actual string
  const [operations, setOperations] = useState([]);

  // Variables
  const [targetOutput, setTargetOutput] = useState(80);
  const [operatorRating, setOperatorRating] = useState(75);
  const [allowance, setAllowance] = useState(15);
  
  // Load initial active template once on mount
  useEffect(() => {
    loadTemplate('Line 1');
  }, []);

  // Shared File Handlers...
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const handleChange = (e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  
  const handleFile = (file) => {
    setError('');
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
        reader.onload = (e) => {
          try { 
              setFileData(JSON.parse(e.target.result)); 
              setInputType('json'); // Auto-switch view if dropped while on wrong tab
          } catch (err) { setError('Invalid JSON file format.'); }
        };
        reader.readAsText(file);
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetsData = {};
            workbook.SheetNames.forEach(sheetName => {
               sheetsData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            });
            setFileData(sheetsData);
            setInputType('xls'); // Auto-switch view
          } catch (err) { setError('Failed to extract data from Excel file. Ensure it is not corrupted.'); }
        };
        reader.readAsArrayBuffer(file);
    } else {
        setError('Unsupported file format. Please upload a .json, .xls, or .xlsx file.');
    }
  };

  const loadParsedLine = (key) => {
    const processed = processTimeStudy(fileData[key], parseFloat(targetOutput), parseFloat(operatorRating), parseFloat(allowance));
    if (processed) onDataLoaded(processed, key);
    else setError('Could not process valid operations from this line data. Ensure standard column formatting.');
  };
  
  // Manual Template Handlers
  const loadTemplate = (key) => {
    setError('');
    setSelectedLineKey(key);
    
    if (key === 'NEW') {
      setLineName('Custom Line');
      setOperations([{ id: Date.now(), name: 'New Operation 1', times: Array(15).fill('') }]);
      return;
    }
    
    setLineName(key);
    const opsList = savedLines[key] || [];
    setOperations(opsList.map((name, idx) => ({
      id: Date.now() + idx, 
      name: name, 
      times: Array(15).fill('') 
    })));
  };

  const saveCurrentTemplate = () => {
    const currentOpNames = operations.map(op => op.name).filter(n => n.trim() !== '');
    if (!lineName.trim() || currentOpNames.length === 0) {
      setError('Cannot save an empty template or a template with no name.');
      return;
    }
    
    const newTemplates = { ...savedLines, [lineName]: currentOpNames };
    setSavedLines(newTemplates);
    localStorage.setItem('aeroSewTemplates', JSON.stringify(newTemplates));
    setSelectedLineKey(lineName);
    setError('');
    alert(`Template "${lineName}" saved successfully!`);
  };

  // Operation Add/Edit/Remove
  const addOperation = () => setOperations([...operations, { id: Date.now(), name: `Operation ${operations.length + 1}`, times: Array(15).fill('') }]);
  const removeOperation = (id) => { if (operations.length > 1) setOperations(operations.filter(op => op.id !== id)); };
  const updateOperationName = (id, newName) => setOperations(operations.map(op => op.id === id ? { ...op, name: newName } : op));
  const updateTime = (opId, timeIndex, value) => {
    setOperations(operations.map(op => {
      if (op.id === opId) {
        const newTimes = [...op.times];
        newTimes[timeIndex] = value;
        return { ...op, times: newTimes };
      }
      return op;
    }));
  };
  
  const processManualData = () => {
    const formattedData = operations.map(op => {
      const row = { "Column1": op.name };
      const keys = ["Cycle time or no.of pieces", "Column3", "Column4", "Column5", "Column6", "Column7", "Column8", "Column9", "Column10", "Column11", "Column12", "Column13", "Column14", "Column15", "Column16"];
      
      let hasData = false;
      keys.forEach((k, i) => {
        const val = parseFloat(op.times[i]);
        if (!isNaN(val)) {
            row[k] = val;
            hasData = true;
        }
      });
      return hasData ? row : null;
    }).filter(row => row !== null);
    
    if (formattedData.length === 0) {
      setError('Please fill in complete cycle times (numbers) for at least one operation to run the analysis.');
      return;
    }

    const processed = processTimeStudy(formattedData, parseFloat(targetOutput), parseFloat(operatorRating), parseFloat(allowance));
    if (processed) {
      setError('');
      onDataLoaded(processed, lineName);
    } else {
      setError('Failed to process heuristics. Ensure numeric cycle times are valid.');
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Line Initialization & Data Input</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Input or upload 15-cycle time study observations to generate live heuristics.</p>
        </div>
        
        {/* Toggle Mode (3-Way) */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
           <button 
             onClick={() => { setInputType('manual'); setFileData(null); setError(''); }}
             style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: inputType === 'manual' ? 'var(--accent)' : 'transparent', color: inputType === 'manual' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
           >Manual Entry</button>
           
           <button 
             onClick={() => { setInputType('json'); setFileData(null); setError(''); }}
             style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: inputType === 'json' ? 'var(--accent)' : 'transparent', color: inputType === 'json' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
           >JSON Upload</button>
           
           <button 
             onClick={() => { setInputType('xls'); setFileData(null); setError(''); }}
             style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: inputType === 'xls' ? 'var(--accent)' : 'transparent', color: inputType === 'xls' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
           >Excel (XLS) Upload</button>
        </div>
      </div>
      
      {/* Global Config */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '24px' }}>
         <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Target Line Output (units/hr)</label>
            <input type="number" value={targetOutput} onChange={e=>setTargetOutput(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '1rem' }} />
         </div>
         <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Assumed Operator Rating (%)</label>
            <input type="number" value={operatorRating} onChange={e=>setOperatorRating(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '1rem' }} />
         </div>
         <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Allowance Standard (%)</label>
            <input type="number" value={allowance} onChange={e=>setAllowance(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '1rem' }} />
         </div>
      </div>
      
      {/* File Loader UI (Shared for JSON & XLS) */}
      {(inputType === 'json' || inputType === 'xls') && (
         <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '32px' }}>
            <div 
              style={{ border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--glass-border)'}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent', padding: '48px', transition: 'all 0.2s', position: 'relative', minHeight: '300px' }}
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            >
              <input type="file" accept={inputType === 'xls' ? ".xls,.xlsx" : ".json"} onChange={handleChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}/>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '50%', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
                 {inputType === 'xls' ? <FileSpreadsheet size={48} color={dragActive ? "var(--accent)" : "var(--status-green)"} /> : <UploadCloud size={48} color={dragActive ? "var(--accent)" : "rgba(59, 130, 246, 0.8)"} />}
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Drag & Drop your {inputType === 'xls' ? 'Excel Spreadsheet' : 'JSON file'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or click anywhere to browse local files</p>
              
              {fileData && !error && (
                <div style={{ marginTop: '24px', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--status-green-bg)', padding: '12px 16px', borderRadius: '8px' }}>
                  <CheckCircle size={16} /> <span style={{ fontSize: '0.875rem' }}>File parsed naturally: {Object.keys(fileData).length} Sheet(s) ready.</span>
                </div>
              )}
            </div>
            
            <div>
              {fileData && (
                <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Execute Analysis</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {Object.keys(fileData).map(k => (
                      <button key={k} className="btn-primary" onClick={() => loadParsedLine(k)} style={{ width: '100%', justifyContent: 'center' }}>
                         {inputType === 'xls' ? <FileSpreadsheet size={16} /> : <FileJson size={16} />} Analyze Tab: {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
         </div>
      )}

      {/* Manual Entry Line Management UI */}
      {inputType === 'manual' && (
         <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) auto', gap: '24px', alignItems: 'end', background: 'rgba(59, 130, 246, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Load Operation Template:</label>
                  <select 
                     value={selectedLineKey} 
                     onChange={e => loadTemplate(e.target.value)}
                     style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', appearance: 'none', boxShadow: 'var(--shadow-sm)' }}
                  >
                     {Object.keys(savedLines).map(key => (
                       <option key={key} value={key}>{key}</option>
                     ))}
                     <option disabled>-----------</option>
                     <option value="NEW">+ Create Custom New Line</option>
                  </select>
               </div>

               {selectedLineKey === 'NEW' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.3s ease forwards' }}>
                     <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name Your New Line Configuration:</label>
                     <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="text" value={lineName} onChange={e => setLineName(e.target.value)} placeholder="e.g., Summer Polo Line 4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '1rem', flex: 1, minWidth: '250px' }} />
                     </div>
                  </div>
               )}

               <button onClick={saveCurrentTemplate} style={{ background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', height: '44px' }}
                       onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                       onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                  <Save size={18} /> Save Template Memory
               </button>
            </div>
            
            <div className="data-table-container" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
               <table className="data-table" style={{ width: '100%', minWidth: '1000px' }}>
                  <thead>
                     <tr>
                        <th style={{ minWidth: '200px' }}>Operation Description ({lineName})</th>
                        {[...Array(15)].map((_, i) => <th key={i} style={{ textAlign: 'center', width: '45px', color: 'var(--text-muted)' }}>{i + 1}</th>)}
                        <th style={{ width: '50px' }}>Act</th>
                     </tr>
                  </thead>
                  <tbody>
                     {operations.map((op, opIndex) => (
                        <tr key={op.id} style={{ background: opIndex % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                           <td style={{ padding: '8px' }}>
                              <input 
                                 type="text" 
                                 value={op.name} 
                                 onChange={e => updateOperationName(op.id, e.target.value)} 
                                 placeholder="Operation Name..."
                                 style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '10px', borderRadius: '4px' }}
                              />
                           </td>
                           {op.times.map((t, i) => (
                              <td key={i} style={{ padding: '8px 2px' }}>
                                 <input 
                                    type="number" 
                                    value={t} 
                                    onChange={e => updateTime(op.id, i, e.target.value)} 
                                    style={{ width: '100%', minWidth: '40px', background: t ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)', border: t ? '1px solid var(--accent)' : '1px solid var(--glass-border)', color: '#fff', padding: '10px 4px', borderRadius: '4px', textAlign: 'center' }}
                                 />
                              </td>
                           ))}
                           <td style={{ textAlign: 'center', padding: '8px' }}>
                              <button onClick={() => removeOperation(op.id)} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', opacity: operations.length===1 ? 0.3 : 1 }}>
                                 <Trash2 size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            {error && (
              <div style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--status-red-bg)', padding: '12px 16px', borderRadius: '8px' }}>
                <AlertCircle size={16} /> <span style={{ fontSize: '0.875rem' }}>{error}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
               <button onClick={addOperation} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px dashed var(--glass-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={18} /> Add New Row
               </button>
               
               <button className="btn-primary" onClick={processManualData} style={{ borderRadius: '24px', paddingLeft: '32px', paddingRight: '24px' }}>
                  Analyze Cycle Times <ArrowRight size={18} />
               </button>
            </div>
         </div>
      )}

    </div>
  );
}
