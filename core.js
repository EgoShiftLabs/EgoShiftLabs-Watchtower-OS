export const VERSION="0.3.0";
export const SCHEMA="watchtower-os-v1";
export const DOMAINS=["Geopolitics","Economy","Energy","Technology","Financial markets","Supply chains","Public policy","Resilience","Other"];
export const ROLES=[
{id:"chief",name:"CHIEF",mission:"Coordinates decisions and priorities",detail:"Synthesizes evidence, goals and tradeoffs into an owner-review brief. Never acts without authorization."},
{id:"watchtower",name:"WATCHTOWER",mission:"Monitors relevant signals",detail:"Tracks geopolitical, economic, energy, technology and resilience observations with timestamps and source provenance."},
{id:"redteam",name:"RED TEAM",mission:"Challenges assumptions",detail:"Produces counterarguments, falsifiers and alternate explanations; does not invent opposing evidence."},
{id:"treasury",name:"TREASURY",mission:"Models financial resilience",detail:"Reviews scenario exposure, optionality and risk constraints. No trades, transfers or brokerage access."},
{id:"builder",name:"BUILDER",mission:"Translates strategy into projects",detail:"Tracks dependencies, milestones, execution plans and owner-authorized actions."},
{id:"scout",name:"SCOUT",mission:"Explores emerging opportunities",detail:"Surfaces potential demand and hypothesis signals. A hypothesis is not proof of market demand."},
{id:"concierge",name:"CONCIERGE",mission:"Supports personal operations",detail:"Organizes optional goals, schedules and preparedness without account integrations in this prototype."},
{id:"archivist",name:"ARCHIVIST",mission:"Records outcomes and lessons",detail:"Keeps forecast resolutions, decision journals and evidence trails; never silently revises records."}
];
export const MODULES=[["command","Command Center"],["watch","Global Watch"],["brief","CHIEF Brief"],["energy","Energy Market Watch"],["patterns","Pattern Lab"],["causal","Causal Map"],["forecast","Forecast Lab"],["decisions","Decision Desk"],["projects","Project Desk"],["agents","Agent Room"],["settings","Settings"]];
export function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function text(x,max=2200){return String(x??"").trim().slice(0,max);}
export function safeUrl(x){try{const u=new URL(text(x));return ["http:","https:"].includes(u.protocol)?u.href:"";}catch{return"";}}
export function uid(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);}
export function isDate(x){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(x||"")))return false;const d=new Date(x+"T12:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x;}
export function freshness(date,now=new Date()){if(!isDate(date))return "unknown";const days=Math.floor((now.getTime()-new Date(date+"T12:00:00Z").getTime())/86400000);return days>30?"stale":days>7?"aging":"recent";}
export function sourceQuality(rec){return Boolean(rec&&!rec.demo&&safeUrl(rec.sourceUrl)&&(isDate(rec.observedAt)||isDate(rec.sourceCheckedAt))&&text(rec.evidence).length>=20);}
export function brier(prob,outcome){if(prob===""||prob===null||prob===undefined)return null;const p=Number(prob);if(!Number.isFinite(p)||p<0||p>100||![0,1].includes(outcome))return null;return Math.pow(p/100-outcome,2);}
export const ORIGINAL_FIELDS=["question","targetDate","probability","resolutionRule","disconfirming","sourceUrl","sourceType","sourceCheckedAt","evidence","rationale"];
export function originalSnapshot(f){return Object.fromEntries(ORIGINAL_FIELDS.map(k=>[k,f[k]??null]));}
export function forecastIntegrity(f){
 if(!f||typeof f!=="object")return {status:"invalid",ok:false};
 if(!f.original||!Array.isArray(f.timeline))return {status:"legacy",ok:false};
 const mismatch=ORIGINAL_FIELDS.some(k=>(f.original[k]??null)!==(f[k]??null));
 const creation=f.timeline[0]?.type==="created"&&typeof f.timeline[0]?.at==="string"&&f.timeline[0].at===f.createdAt;
 const validEvents=f.timeline.every(e=>e&&["created","resolved"].includes(e.type)&&typeof e.at==="string");
 const resolutions=f.timeline.filter(e=>e.type==="resolved");
 const statusOK=f.status==="resolved"?(resolutions.length===1&&[0,1].includes(f.outcome)&&text(f.outcomeEvidence).length>=15&&(resolutions[0].outcome===undefined||(resolutions[0].outcome===f.outcome&&resolutions[0].evidence===f.outcomeEvidence))):(resolutions.length===0&&f.status==="open");
 if(mismatch||!creation||!validEvents||!statusOK)return {status:"mismatch",ok:false};
 return {status:"tracked",ok:true};
}
export function createForecastRecord(f,now=new Date()){
 const rec={...f,createdAt:now.toISOString(),status:"open",outcome:null};
 rec.original=originalSnapshot(rec);
 rec.timeline=[{type:"created",at:rec.createdAt,summary:"Original human estimate and resolution rule recorded"}];
 return rec;
}
export function calibration(forecasts,now=new Date()){
 const real=(Array.isArray(forecasts)?forecasts:[]).filter(f=>f&&!f.demo);
 const scored=real.filter(f=>f.status==="resolved"&&forecastIntegrity(f).ok&&brier(f.probability,f.outcome)!==null);
 const scores=scored.map(f=>brier(f.probability,f.outcome));
 const overdue=real.filter(f=>f.status!=="resolved"&&isDate(f.targetDate)&&f.targetDate<now.toISOString().slice(0,10)).length;
 const resolved=real.filter(f=>f.status==="resolved").length;
 return {count:scores.length,mean:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,
   referenceMean:scores.length?0.25:null,referenceLabel:"Fixed 50% probability reference (not base-rate model)",
   overdue,open:real.filter(f=>f.status!=="resolved").length,resolved,
   unscored:resolved-scored.length,eligibleBacklog:scored.length+overdue,
   resolutionRate:scored.length+overdue?scored.length/(scored.length+overdue):null};
}
export function evidenceGrade(rec,now=new Date()){
 if(rec?.demo)return {label:"SYNTHETIC",tone:"amber",age:"not applicable",sourced:false};
 const age=freshness(rec?.observedAt||rec?.sourceCheckedAt,now);
 if(!sourceQuality(rec))return {label:"SOURCE INCOMPLETE",tone:"amber",age,sourced:false};
 const kind=["primary","secondary","commentary","unverified"].includes(rec?.sourceType)?rec.sourceType:"unclassified";
 return {label:(kind==="primary"?"PRIMARY":kind==="secondary"?"SECONDARY":kind==="commentary"?"COMMENTARY":"SOURCE CITED")+" / SELF-CLASSIFIED",
 tone:age==="stale"?"amber":"green",age,sourced:true};
}
export function validateForecast(f){if(text(f.question,180).length<12)return "Write a testable, specific question (at least 12 characters).";if(!isDate(f.targetDate))return "Provide a valid outcome deadline.";if(text(f.resolutionRule).length<15)return "Define a measurable resolution rule (15+ characters).";if(text(f.disconfirming).length<10)return "Record a meaningful countercase / falsifier (10+ characters).";if(f.probability!==null&&f.probability!==""&&f.probability!==undefined&&(!Number.isInteger(Number(f.probability))||Number(f.probability)<0||Number(f.probability)>100))return "Probability must be an integer between 0 and 100.";return "";}
export function canResolve(f,outcome,now=new Date()){return [0,1].includes(outcome)&&isDate(f.targetDate)&&(outcome===1||f.targetDate<=now.toISOString().slice(0,10));}
export function resolveForecast(f,outcome,evidence,now=new Date()){
 if(f?.status==="resolved")return {error:"This forecast is already resolved. Resolutions cannot be overwritten."};
 if(f?.original&&!forecastIntegrity(f).ok)return {error:"Original forecast fields or history changed. Review the record before resolving."};
 if(!canResolve(f,outcome,now))return {error:"A NO outcome requires the forecast deadline to have passed. A YES needs confirmed occurrence."};
 if(text(evidence).length<15)return {error:"Provide at least 15 characters of resolution evidence."};
 const result={...f,status:"resolved",outcome,outcomeEvidence:text(evidence),resolvedAt:now.toISOString(),brier:brier(f.probability,outcome)};
 if(f.original)result.timeline=[...f.timeline,{type:"resolved",at:result.resolvedAt,outcome,evidence:result.outcomeEvidence,summary:"Outcome "+(outcome===1?"YES":"NO")+" recorded with evidence"}];
 return result;
}
export function scenarioWeighted(rows){if(!Array.isArray(rows)||!rows.length)return {error:"Enter scenarios."};let sum=0,weighted=0;for(const r of rows){const p=Number(r.weight),v=Number(r.impact);if(!Number.isFinite(p)||p<0||p>100||!Number.isFinite(v)||v<-100||v>100)return {error:"Weights must be 0–100, conditional impacts −100 to 100."};sum+=p;weighted+=p*v/100;}if(Math.abs(sum-100)>0.000001)return {error:"Scenario weights must total exactly 100%."};return {weighted,assumptionsOnly:true};}
export function blankWorkspace(){return {schema:SCHEMA,mode:"demo",profile:{label:"Operator",risk:"Balanced",focus:"Global events, forecasting, decision quality",modules:MODULES.map(m=>m[0])},demo:{signals:[],forecasts:[],decisions:[],projects:[],causal:[],localOil:null},live:{signals:[],forecasts:[],decisions:[],projects:[],causal:[],localOil:null},createdAt:new Date().toISOString()};}
export function validWorkspace(x){
 if(!x||typeof x!=="object"||Array.isArray(x)||x.schema!==SCHEMA||!["demo","live"].includes(x.mode))return false;
 const allowed=["schema","mode","profile","demo","live","createdAt"];
 if(Object.keys(x).some(k=>!allowed.includes(k)))return false;
 if(!x.profile||typeof x.profile!=="object"||typeof x.profile.label!=="string"||x.profile.label.length>80||!Array.isArray(x.profile.modules)||x.profile.modules.some(m=>!MODULES.some(row=>row[0]===m)))return false;
 for(const mode of ["demo","live"]){
   const w=x[mode];if(!w||typeof w!=="object"||Array.isArray(w))return false;
   for(const field of ["signals","forecasts","decisions","projects"]){
     if(!Array.isArray(w[field])||w[field].length>1000)return false;
     if(w[field].some(rec=>!rec||typeof rec!=="object"||Array.isArray(rec)||typeof rec.id!=="string"||rec.id.length>100))return false;
   }
   if(w.forecasts.some(f=>f.original&&!forecastIntegrity(f).ok))return false;
   if(mode==="live"&&w.forecasts.some(f=>f.demo))return false;
 }
 try{return JSON.stringify(x).length<=1024*1024;}catch{return false;}
}
