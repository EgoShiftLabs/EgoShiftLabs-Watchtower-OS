// Deterministic descriptive statistics and historical baselines; NO probability prediction.
function finite(v){return typeof v==="number"&&Number.isFinite(v);}
export function normalizePoints(raw){
 if(!Array.isArray(raw))return [];
 const byDate=new Map();
 for(const p of raw){
  if(!p||typeof p.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!finite(p.value))continue;
  const d=new Date(p.date+"T00:00:00Z");if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==p.date)continue;
  byDate.set(p.date,{date:p.date,value:p.value});
 }
 return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-366);
}
export function historyStats(raw,window=7){
 const pts=normalizePoints(raw);
 if(pts.length<2)return {count:pts.length,latest:pts.at(-1)||null,change:null,changePct:null,rollingMean:null,volatility:null,backtest:null};
 const latest=pts.at(-1),prior=pts.at(-2),change=latest.value-prior.value;
 const changePct=prior.value!==0?change/prior.value*100:null;
 const sample=pts.slice(-Math.max(2,Math.min(60,window)));
 const rollingMean=sample.reduce((a,p)=>a+p.value,0)/sample.length;
 const returns=[];
 for(let i=1;i<pts.length;i++){if(pts[i-1].value!==0)returns.push((pts[i].value-pts[i-1].value)/Math.abs(pts[i-1].value)*100);}
 const recent=returns.slice(-Math.min(20,returns.length));
 const avg=recent.reduce((a,b)=>a+b,0)/recent.length;
 const volatility=Math.sqrt(recent.reduce((a,b)=>a+(b-avg)**2,0)/recent.length);
 return {count:pts.length,latest,prior,change,changePct,rollingMean,volatility,backtest:walkForward(pts,window)};
}
export function walkForward(raw,window=7,minTrain=10){
 const pts=normalizePoints(raw),w=Math.max(2,Math.min(30,Math.trunc(window)));
 if(pts.length<minTrain+2)return {count:0,persistenceMae:null,rollingMae:null,window:w,note:"Not enough ordered history to evaluate."};
 let sumPersistence=0,sumRolling=0,n=0;
 for(let i=Math.max(minTrain,w);i<pts.length;i++){
  const actual=pts[i].value,persistence=pts[i-1].value;
  const rolling=pts.slice(i-w,i).reduce((a,p)=>a+p.value,0)/w;
  sumPersistence+=Math.abs(actual-persistence);sumRolling+=Math.abs(actual-rolling);n++;
 }
 return {count:n,persistenceMae:n?sumPersistence/n:null,rollingMae:n?sumRolling/n:null,window:w,
 note:"In-sample history-only one-step walk-forward errors. Not probabilities or guaranteed future performance."};
}
export function sparkline(raw,width=420,height=128){
 const pts=normalizePoints(raw).slice(-100);
 if(pts.length<2)return "";
 const values=pts.map(x=>x.value),min=Math.min(...values),max=Math.max(...values);
 const spread=max-min||1;
 return pts.map((p,i)=>{
  const x=8+i*(width-16)/(pts.length-1);
  const y=height-8-(p.value-min)/spread*(height-16);
  return x.toFixed(1)+","+y.toFixed(1);
 }).join(" ");
}
export function safeSeries(raw){
 if(!raw||typeof raw.id!=="string"||!/^[a-z0-9_-]{3,70}$/.test(raw.id))return false;
 if(!Array.isArray(raw.points)||raw.points.length<2||raw.points.length>366)return false;
 if(!["https:"].some(p=>{try{return new URL(raw.sourceUrl).protocol===p;}catch{return false;}}))return false;
 return typeof raw.label==="string"&&raw.label.length<=150&&typeof raw.unit==="string"&&raw.unit.length<=70
 &&raw.points.every(p=>p&&typeof p.date==="string"&&normalizePoints([p]).length===1);
}
export function csvPricePoints(csv){
 if(typeof csv!=="string"||csv.length>500000)throw Error("File exceeds 500 KB.");
 const lines=csv.trim().split(/\r?\n/);
 if(lines.length<4||lines.length>500)throw Error("CSV needs a header and at least 3 data rows (maximum 499).");
 const header=lines.shift().trim().toLowerCase().replace(/^\uFEFF/,"");
 if(!["date,value","date,price"].includes(header))throw Error("Expected exactly date,value or date,price headers.");
 const raw=lines.map(line=>{
  const cells=line.trim().split(",");if(cells.length!==2)throw Error("CSV must have exactly two columns.");
  const v=cells[1].trim();if(!/^-?\d+(\.\d+)?$/.test(v))throw Error("Non-numeric CSV value.");
  const value=Number(v);if(!Number.isFinite(value)||value<=0||value>1e7)throw Error("Price must be positive and finite.");
  return {date:cells[0].trim(),value};
 });
 const points=normalizePoints(raw);
 if(points.length!==raw.length)throw Error("Invalid or duplicate dates.");
 return points;
}
