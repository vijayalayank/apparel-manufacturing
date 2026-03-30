// Utility script for powerful client-side metric calculations

export const processTimeStudy = (rawData, targetOutput = 80, rating = 75, allowance = 15) => {
  const operations = [];
  
  rawData.forEach(row => {
    // Skip headers and footers
    if (!row["Column1"] || row["Column1"] === "Operation name" || row["Cycle time or no.of pieces"] === "(Numbers are in seconds)") {
      return;
    }
    
    // Extract the 15 cycle times
    const cycleTimes = [];
    const keys = ["Cycle time or no.of pieces", "Column3", "Column4", "Column5", "Column6", "Column7", "Column8", "Column9", "Column10", "Column11", "Column12", "Column13", "Column14", "Column15", "Column16"];
    
    keys.forEach(key => {
      if (typeof row[key] === 'number') {
        cycleTimes.push(row[key]);
      }
    });
    
    if (cycleTimes.length === 0) return;
    
    // Core Calculations based on provided formulas
    const totalTime = cycleTimes.reduce((a, b) => a + b, 0);
    const avgObservedTime = totalTime / cycleTimes.length;
    
    // Basic Time = Avg observed time * operator rating
    const basicTime = avgObservedTime * (rating / 100);
    
    // SAM = Basic Time * (1 + Allowance) / 60
    const sam = (basicTime * (1 + allowance / 100)) / 60;
    
    // Normal Time (NT)
    const nt = basicTime; // Typically NT is another term for Basic Time
    
    // Capacity = 60 / SAM
    const capacity = 60 / sam;
    
    // Takt Time = 60 / target output
    const taktTime = 60 / targetOutput;
    
    // Operators Required = SAM / Takt Time
    const operatorsReq = sam / taktTime;
    
    // Status Logic
    let status = 'green';
    if (sam >= 0.8) status = 'red';
    else if (sam >= 0.5) status = 'yellow';
    
    operations.push({
      id: Math.random().toString(36).substr(2, 9),
      name: row["Column1"],
      sam: parseFloat(sam.toFixed(4)),
      capacity: Math.floor(capacity),
      nt: parseFloat(nt.toFixed(2)),
      operatorsReq: parseFloat(operatorsReq.toFixed(2)),
      status,
      cycleTimes
    });
  });
  
  if (operations.length === 0) return null;
  
  const lineCapacity = Math.min(...operations.map(o => o.capacity));
  const totalSAM = operations.reduce((sum, o) => sum + o.sam, 0);
  const maxSAM = Math.max(...operations.map(o => o.sam));
  
  // Efficiency = (Total SAM / (No. of stations * max SAM)) * 100
  // Defaulting to 36 stations per line as noted
  const efficiency = (totalSAM / (36 * maxSAM)) * 100;
  
  return {
    operations,
    lineCapacity,
    totalSAM: parseFloat(totalSAM.toFixed(4)),
    efficiency: parseFloat(efficiency.toFixed(2)),
    taktTime: parseFloat((60 / targetOutput).toFixed(2)),
    targetOutput,
    bottlenecks: operations.filter(o => o.status === 'red')
  };
};
