// Source-specific, public-only historical series. No synthetic observations, API keys, or private data.
import {normalizePoints,historyStats} from "../analytics.js";
export const HISTORY_SCHEMA="watchtower-history-v1";
export const EIA_SOURCE="https://www.eia.gov/dnav/pet/hist/RWTCd.htm";
export const EIA_API_ROOT="https://api.eia.gov/v2/petroleum/pri/spt/data/";
function dt(s){if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;}
function money(v){const n=Number(v);return (typeof v==="string"||typeof v==="number")&&Number.isFinite(n)&&n>0&&n<1e16?n:null;}
export function treasuryHistory(payload,now=new Date()){
 if(!Array.isArray(payload?.data))throw Error("Treasury history missing.");
 const rows=payload.data.filter(x=>dt(x.record_date)&&money(x.tot_pub_debt_out_amt)!==null&&money(x.debt_held_public_amt)!==null);
 if(rows.length<12)throw Error("At least 12 comparable Treasury observations are required.");
 const newest=[...rows].sort((a,b)=>b.record_date.localeCompare(a.record_date))[0].record_date;
 if(newest>now.toISOString().slice(0,10)||now-new Date(newest+"T00:00:00Z")>14*86400000)throw Error("Treasury history newest observation is invalid/stale.");
 const make=(id,label,field)=>({
  id,label,unit:"USD trillions",sourceName:"U.S. Treasury FiscalData",
  sourceUrl:"https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",
  frequency:"business-day",method:"Original public debt STOCK; not market interest yield",
  points:normalizePoints(rows.map(x=>({date:x.record_date,value:Number((money(x[field])/1e12).toFixed(7))})))
 });
 return [make("treasury-total-debt","U.S. total public debt outstanding","tot_pub_debt_out_amt"),make("treasury-held-public","Federal debt held by public","debt_held_public_amt")];
}
export function eiaPriceHistory(payload,now=new Date()){
 const rows=payload?.response?.data;
 if(!Array.isArray(rows)||rows.length<12)throw Error("EIA WTI response has insufficient observations.");
 const valid=rows.filter(x=>dt(x.period)&&x.series==="RWTC"&&money(x.value)!==null);
 const pts=normalizePoints(valid.map(x=>({date:x.period,value:Number(x.value)})));
 if(pts.length<12)throw Error("EIA WTI data invalid or too short.");
 const last=pts.at(-1).date;
 if(last>now.toISOString().slice(0,10)||now-new Date(last+"T00:00:00Z")>14*86400000)throw Error("WTI most recent record missing or stale.");
 return {id:"eia-wti-spot",label:"Cushing WTI crude oil spot price",unit:"USD/barrel",sourceName:"U.S. Energy Information Administration",sourceUrl:EIA_SOURCE,
 frequency:"business-day",method:"Observed spot prices; not a stock recommendation or model probability.",points:pts};
}
export function eiaURL(key){
 if(typeof key!=="string"||!key.trim())throw Error("EIA_API_KEY missing.");
 const u=new URL(EIA_API_ROOT);u.searchParams.set("api_key",key.trim());u.searchParams.set("frequency","daily");
 u.searchParams.set("data[0]","value");u.searchParams.set("facets[series][]","RWTC");
 u.searchParams.set("sort[0][column]","period");u.searchParams.set("sort[0][direction]","desc");u.searchParams.set("length","140");
 return u.toString();
}
export function buildHistory(treasury,eia,energyStatus="needs_key",now=new Date(),old=null){
 const core=treasuryHistory(treasury,now);
 const series=[...core];let status=energyStatus,lastRetrievedAt=null;
 if(eia){const oil=eiaPriceHistory(eia,now);series.push(oil);status="active";lastRetrievedAt=now.toISOString();}
 else if(old&&["active","stale"].includes(old.energy?.status)){
  const prior=old.series?.find(x=>x.id==="eia-wti-spot");
  if(prior&&Array.isArray(prior.points)&&prior.points.length>=12){
   series.push(prior);status="stale";lastRetrievedAt=old.energy.lastRetrievedAt||old.retrievedAt;
  }
 }
 for(const s of series){if(s.points.length>366)throw Error("Too much history.");if(s.points.length<12)throw Error("Insufficient source history.");}
 return {schema:HISTORY_SCHEMA,status:"active",retrievedAt:now.toISOString(),series,
 energy:{status,lastRetrievedAt,note:status==="needs_key"?"EIA_API_KEY is not configured. Energy API was not called.":status==="stale"?"Previous WTI history retained, but the current EIA refresh failed or is disabled.":status==="source_error"?"EIA API attempted but unavailable; no valid WTI history was published.":"WTI series retrieved from EIA API v2. No predictive probabilities."},
 note:"Historical public observations and lagged one-step descriptive baselines only; never financial advice or predictive certainty."};
}
export function buildChiefPublicBrief(feed,history,now=new Date()){
 if(feed?.status!=="active"||history?.status!=="active")throw Error("Public observation feeds must be active before a brief can be assembled.");
 const items=feed.observations.map(o=>{
  const direction=typeof o.changePct==="number"?(o.changePct>0?"higher":o.changePct<0?"lower":"unchanged"):"not compared";
  return {id:o.id,title:o.label,observationDate:o.observationDate,sourceName:o.sourceName,sourceUrl:o.sourceUrl,
   finding:String(o.value)+" "+o.unit+(direction==="not compared"?"":"; "+Math.abs(o.changePct).toFixed(4)+"% "+direction+" than the preceding published record"),
   type:"observed",confidence:"Official source; observation does not imply a causal mechanism."};
 });
 const baselines=history.series.map(s=>{
  const stats=historyStats(s.points);
  return {id:s.id,historyCount:stats.count,observationDate:stats.latest?.date,
   persistenceMae:stats.backtest?.persistenceMae,rollingMae:stats.backtest?.rollingMae,window:stats.backtest?.window,
   evaluationCount:stats.backtest?.count,unit:s.unit};
 });
 return {schema:"watchtower-chief-brief-v1",generatedAt:now.toISOString(),status:"public-only",title:"CHIEF Public Intelligence Digest",items,baselines,
 researchQuestions:[
  "What changed in each ORIGINAL source since the preceding dated observation?",
  "Do comparable historical observations support a reliable baseline, or is more data required?",
  "Which causal link is only a hypothesis, and what observation would disconfirm it?",
  "What decisions or forecasts are due in the LOCAL workspace? (Not available to GitHub Actions.)"
 ],
 limitations:["This digest is rule-generated from public time series, not an AI interpretation.","No private decisions or user forecasts were read or published.","Historical baseline MAE is not a probability of a market move.","Two separate official indicators are not evidence that they influence each other."]};
}
