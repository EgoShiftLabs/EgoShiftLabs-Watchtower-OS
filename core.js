export const VERSION="0.1.0";
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
export const MODULES=[["command","Command Center"],["watch","Global Watch"],["forecast","Forecast Lab"],["decisions","Decision Desk"],["projects","Project Desk"],["agents","Agent Room"],["settings","Settings"]];
export function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function text(x,max=2200){return String(x??"").trim().slice(0,max);}
export function safeUrl(x){try{const u=new URL(text(x));return ["http:","https:"].includes(u.protocol)?u.href:"";}catch{return"";}}
export function uid(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);}
export function isDate(x){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(x||"")))return false;const d=new Date(x+"T12:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x;}
export function freshness(date,now=new Date()){if(!isDate(date))return "unknown";const days=Math.floor((now.getTime()-new Date(date+"T12:00:00Z").getTime())/86400000);return days>30?"stale":days>7?"aging":"recent";}
export function sourceQuality(rec){return Boolean(rec&&!rec.demo&&safeUrl(rec.sourceUrl)&&isDate(rec.observedAt)&&text(rec.evidence).length>=20);}
export function brier(prob,outcome){if(prob===""||prob===null||prob===undefined)return null;const p=Number(prob);if(!Number.isFinite(p)||p<0||p>100||![0,1].includes(outcome))return null;return Math.pow(p/100-outcome,2);}
export function calibration(forecasts){const scores=(forecasts||[]).filter(f=>!f.demo&&f.status==="resolved").map(f=>brier(f.probability,f.outcome)).filter(v=>v!==null);return {count:scores.length,mean:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null};}
export function validateForecast(f){if(text(f.question,180).length<12)return "Write a testable, specific question (at least 12 characters).";if(!isDate(f.targetDate))return "Provide a valid outcome deadline.";if(text(f.resolutionRule).length<15)return "Define a measurable resolution rule (15+ characters).";if(text(f.disconfirming).length<10)return "Record a meaningful countercase / falsifier (10+ characters).";if(f.probability!==null&&f.probability!==""&&f.probability!==undefined&&(!Number.isInteger(Number(f.probability))||Number(f.probability)<0||Number(f.probability)>100))return "Probability must be an integer between 0 and 100.";return "";}
export function canResolve(f,outcome,now=new Date()){return [0,1].includes(outcome)&&isDate(f.targetDate)&&(outcome===1||f.targetDate<=now.toISOString().slice(0,10));}
export function resolveForecast(f,outcome,evidence,now=new Date()){if(!canResolve(f,outcome,now))return {error:"A NO outcome requires the forecast deadline to have passed. A YES needs confirmed occurrence."};if(text(evidence).length<15)return {error:"Provide at least 15 characters of resolution evidence."};return {...f,status:"resolved",outcome,outcomeEvidence:text(evidence),resolvedAt:now.toISOString(),brier:brier(f.probability,outcome)};}
export function scenarioWeighted(rows){if(!Array.isArray(rows)||!rows.length)return {error:"Enter scenarios."};let sum=0,weighted=0;for(const r of rows){const p=Number(r.weight),v=Number(r.impact);if(!Number.isFinite(p)||p<0||p>100||!Number.isFinite(v)||v<-100||v>100)return {error:"Weights must be 0–100, conditional impacts −100 to 100."};sum+=p;weighted+=p*v/100;}if(Math.abs(sum-100)>0.000001)return {error:"Scenario weights must total exactly 100%."};return {weighted,assumptionsOnly:true};}
export function blankWorkspace(){return {schema:SCHEMA,mode:"demo",profile:{label:"Operator",risk:"Balanced",focus:"Global events, forecasting, decision quality",modules:MODULES.map(m=>m[0])},demo:{signals:[],forecasts:[],decisions:[],projects:[]},live:{signals:[],forecasts:[],decisions:[],projects:[]},createdAt:new Date().toISOString()};}
export function validWorkspace(x){return !!(x&&x.schema===SCHEMA&&["demo","live"].includes(x.mode)&&x.profile&&x.demo&&x.live&&["demo","live"].every(k=>["signals","forecasts","decisions","projects"].every(a=>Array.isArray(x[k][a])&&x[k][a].length<=1000)));}
