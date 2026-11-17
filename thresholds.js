// Source-linked binary forecasts. This module is deterministic and does NOT estimate probabilities.
import {isDate,safeUrl} from "./core.js";
import {normalizePoints,safeSeries} from "./analytics.js";
export const THRESHOLD_SCHEMA="watchtower-threshold-v1";
export const COMPARATORS=[["gte","at or above"],["gt","above"],["lte","at or below"],["lt","below"]];
const comps={gte:(a,b)=>a>=b,gt:(a,b)=>a>b,lte:(a,b)=>a<=b,lt:(a,b)=>a<b};
const round=(x)=>Number(x.toPrecision(12));
function plusDate(date,n){const d=new Date(date+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function thresholdCall(value,threshold,comparator){return typeof value==="number"&&Number.isFinite(value)&&typeof threshold==="number"&&Number.isFinite(threshold)&&comps[comparator]?Number(comps[comparator](value,threshold)):null;}
export function validateThresholdBinding(b){
 if(!b||typeof b!=="object"||Array.isArray(b)||b.schema!==THRESHOLD_SCHEMA)return "Threshold binding schema invalid.";
 if(typeof b.seriesId!=="string"||!/^[a-z0-9_-]{3,70}$/.test(b.seriesId))return "Invalid published series identifier.";
 if(!["gt","gte","lt","lte"].includes(b.comparator)||!Number.isFinite(b.threshold))return "Invalid threshold and comparison.";
 if(!isDate(b.targetDate)||!isDate(b.originalObservationDate)||b.targetDate<=b.originalObservationDate)return "Forecast must target a date after its original observed data.";
 if(typeof b.originalValue!=="number"||!Number.isFinite(b.originalValue))return "Original source value missing.";
 if(!safeUrl(b.sourceUrl)||!b.sourceUrl.startsWith("https://"))return "HTTPS original source required.";
 if(typeof b.unit!=="string"||b.unit.length>70||typeof b.seriesLabel!=="string"||b.seriesLabel.length>150)return "Missing source details.";
 if(b.rule!=="first-observation-on-or-after-target-within-7-calendar-days")return "Unrecognized deterministic outcome rule.";
 if(![0,1].includes(b.persistenceCall)||b.persistenceCall!==thresholdCall(b.originalValue,b.threshold,b.comparator))return "Original persistence baseline does not match original observation.";
 return "";
}
export function bindThreshold(series,targetDate,threshold,comparator,now=new Date()){
 if(!safeSeries(series))return {error:"Only valid, sourced public time series can be selected."};
 const pts=normalizePoints(series.points),last=pts.at(-1),v=Number(threshold);
 if(!isDate(targetDate)||targetDate<=now.toISOString().slice(0,10)||targetDate<=last.date)return {error:"Target date must be in the future and after the latest published observation."};
 if(targetDate>plusDate(now.toISOString().slice(0,10),90))return {error:"Select a target date no more than 90 days away."};
 if(typeof threshold==="string"&&!threshold.trim()||!Number.isFinite(v))return {error:"Enter a valid numerical threshold."};
 const baseline=thresholdCall(last.value,v,comparator);
 if(baseline===null)return {error:"Select an allowed comparison."};
 const binding={schema:THRESHOLD_SCHEMA,seriesId:series.id,seriesLabel:series.label,sourceUrl:series.sourceUrl,unit:series.unit,
  originalObservationDate:last.date,originalValue:last.value,targetDate,threshold:round(v),comparator,persistenceCall:baseline,
  rule:"first-observation-on-or-after-target-within-7-calendar-days"};
 return {binding};
}
export function thresholdQuestion(b){
 const c=COMPARATORS.find(([code])=>code===b.comparator)?.[1]||"at threshold";
 return "Will "+b.seriesLabel+" be "+c+" "+b.threshold+" "+b.unit+" on the first recorded observation on or after "+b.targetDate+"?";
}
export function evaluateThreshold(b,series,now=new Date()){
 const error=validateThresholdBinding(b);if(error)return {status:"invalid",error};
 if(!safeSeries(series)||series.id!==b.seriesId||safeUrl(series.sourceUrl)!==safeUrl(b.sourceUrl))return {status:"source-mismatch",error:"The original official series cannot be matched."};
 const nowDate=now.toISOString().slice(0,10);
 if(nowDate<b.targetDate)return {status:"pending",reason:"Target date has not yet arrived."};
 const cutoff=plusDate(b.targetDate,7);
 const pt=normalizePoints(series.points).find(x=>x.date>=b.targetDate&&x.date<=cutoff&&x.date<=nowDate);
 if(!pt)return {status:"pending",reason:nowDate>cutoff?"No valid observation within the fixed 7-day resolution window; manual adjudication required, without changing the original rule.":"Waiting for the first eligible official observation."};
 const outcome=thresholdCall(pt.value,b.threshold,b.comparator);
 return {status:"ready",outcome,value:pt.value,observationDate:pt.date,sourceUrl:b.sourceUrl,
  baselineCall:b.persistenceCall,baselineCorrect:Number(b.persistenceCall===outcome),
  explanation:"First official observation on/after "+b.targetDate+"; value "+pt.value+" "+b.unit+"; binary outcome "+(outcome?"YES":"NO")};
}
export function templateOptions(series){
 const latest=normalizePoints(series.points).at(-1)?.value;if(!Number.isFinite(latest))return [];
 const variations=[[-1,-1],[1,1],[-3,-3],[3,3],[-5,-5],[5,5]];
 return variations.map(([percent])=>({label:(percent>0?"+":"")+percent+"% relative to latest (illustrative threshold)",value:round(latest*(1+percent/100))}));
}
