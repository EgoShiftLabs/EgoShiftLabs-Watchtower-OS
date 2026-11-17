// Public, pre-committed deterministic baseline experiment. No human forecasts or private workspace data.
import {normalizePoints,safeSeries} from "../analytics.js";
import {bindThreshold,evaluateThreshold,thresholdCall,validateThresholdBinding,thresholdQuestion} from "../thresholds.js";
export const TRACK_SCHEMA="watchtower-public-track-v1";
export const SUMMARY_SCHEMA="watchtower-public-track-summary-v1";
export const POLICY="weekly-two-horizons-v1";
const ELIGIBLE_IDS=new Set(["treasury-total-debt","treasury-held-public","eia-wti-spot"]);
const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;
const allowedRecordKeys=new Set(["id","cohort","createdAt","kind","policy","question","sourceName","sourceRetrievedAt","binding","modelCalls","status","resolution"]);
function dateAt(d){return d.toISOString().slice(0,10);}
function plus(d,n){const x=new Date(d+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+n);return dateAt(x);}
function weekStart(d){const x=new Date(d+"T00:00:00Z");x.setUTCDate(x.getUTCDate()-((x.getUTCDay()+6)%7));return dateAt(x);}
const decimals=n=>Number(n.toPrecision(12));
function expectedId(cohort,seriesId,horizon){return cohort+"-"+seriesId+"-"+horizon+"d";}
export function emptyTrack(){return {schema:TRACK_SCHEMA,policy:POLICY,records:[],updatedAt:null,notice:"Public research baseline predictions only. No human probabilities or personalized records. Future outcomes remain unknown until a qualifying original observation is published."};}
export function validatePublicTrack(data){
 const issues=[];
 if(!data||typeof data!=="object"||Array.isArray(data)||data.schema!==TRACK_SCHEMA||data.policy!==POLICY||!Array.isArray(data.records)||data.records.length>240)return ["Invalid public track schema, policy or record count."];
 if(Object.keys(data).some(k=>!["schema","policy","records","updatedAt","notice"].includes(k)))issues.push("Unexpected top-level field");
 const seen=new Set();
 for(const [i,r] of data.records.entries()){
  if(!r||typeof r!=="object"||Array.isArray(r)){issues.push("Invalid record "+i);continue;}
  if(Object.keys(r).some(k=>!allowedRecordKeys.has(k)))issues.push("Unknown/private record field "+i);
  if(typeof r.id!=="string"||seen.has(r.id))issues.push("Duplicate or missing id "+i);seen.add(r.id);
  if(!ISO_DATE.test(r.cohort)||r.policy!==POLICY||r.kind!=="deterministic-public-baselines")issues.push("Unrecognized cohort or prediction mode "+i);
  if(typeof r.createdAt!=="string"||!Number.isFinite(Date.parse(r.createdAt)))issues.push("Invalid pre-commit timestamp "+i);
  const b=r.binding;
  if(validateThresholdBinding(b))issues.push("Invalid original binding "+i);
  if(b&&(!ELIGIBLE_IDS.has(b.seriesId)||r.id!==expectedId(r.cohort,b.seriesId,Number.parseInt(r.id.slice(-3),10))||r.question!==thresholdQuestion(b)))issues.push("Source identity / question mismatch "+i);
  if(b&&(!r.modelCalls||r.modelCalls.persistence!==b.persistenceCall||![0,1].includes(r.modelCalls.rollingMean7)))issues.push("Original deterministic baseline calls are inconsistent "+i);
  if(typeof r.sourceName!=="string"||!r.sourceName||typeof r.sourceRetrievedAt!=="string"||!Number.isFinite(Date.parse(r.sourceRetrievedAt)))issues.push("Source provenance missing "+i);
  if(!["open","resolved","unresolved-missing-data"].includes(r.status))issues.push("Unknown outcome state "+i);
  if(r.status==="resolved"){
   if(!r.resolution||![0,1].includes(r.resolution.outcome)||!ISO_DATE.test(r.resolution.observationDate)||!Number.isFinite(r.resolution.value)||!Number.isFinite(Date.parse(r.resolution.resolvedAt)))issues.push("Invalid outcome record "+i);
   else if(b&&r.resolution.outcome!==thresholdCall(r.resolution.value,b.threshold,b.comparator))issues.push("Outcome does not satisfy original rule "+i);
  }else if(r.resolution!==null)issues.push("Unresolved outcome should have null evidence "+i);
 }
 return issues;
}
export function makePublicTrack(history,existing=emptyTrack(),now=new Date()){
 const problems=validatePublicTrack(existing);
 if(problems.length)throw Error("Existing committed ledger invalid: "+problems.join("; "));
 if(history?.status!=="active"||!Array.isArray(history.series)||!Number.isFinite(Date.parse(history.retrievedAt))||Math.abs(now-Date.parse(history.retrievedAt))>72*3600000)throw Error("Fresh, validated public source history required.");
 const next={...existing,records:existing.records.map(x=>({...x,binding:{...x.binding},modelCalls:{...x.modelCalls},resolution:x.resolution?{...x.resolution}:null}))};
 const sources=new Map(history.series.filter(s=>ELIGIBLE_IDS.has(s.id)&&safeSeries(s)).map(s=>[s.id,s]));
 const day=dateAt(now),cohort=weekStart(day);let registered=0,resolved=0,flagged=0;
 // Resolve old precommitted questions first. Never update their pre-outcome fields.
 for(const r of next.records){
  if(r.status==="resolved")continue;
  const src=sources.get(r.binding.seriesId);
  const evaluation=evaluateThreshold(r.binding,src,now);
  if(evaluation.status==="ready"){
   r.status="resolved";r.resolution={outcome:evaluation.outcome,value:evaluation.value,observationDate:evaluation.observationDate,sourceUrl:evaluation.sourceUrl,
    resolvedAt:now.toISOString(),persistenceCorrect:Number(r.modelCalls.persistence===evaluation.outcome),
    rollingMeanCorrect:Number(r.modelCalls.rollingMean7===evaluation.outcome)};
   resolved++;
  }else if(day>plus(r.binding.targetDate,7)&&r.status!=="unresolved-missing-data"){
   r.status="unresolved-missing-data";flagged++;
  }
 }
 // Max FOUR cohort questions per weekly run for currently connected Treasury series;
 // optional EIA makes the cohort at most SIX. These are related, NOT independent samples.
 for(const src of sources.values()){
  if(src.id==="eia-wti-spot"&&history.energy?.status!=="active")continue;
  const pts=normalizePoints(src.points),last=pts.at(-1);
  if(!last||last.date>day||now-new Date(last.date+"T00:00:00Z")>10*86400000)continue;
  const rolling=pts.slice(-7).reduce((sum,p)=>sum+p.value,0)/Math.min(7,pts.length);
  for(const h of [7,14]){
   const id=expectedId(cohort,src.id,h);
   if(next.records.some(r=>r.id===id))continue;
   const target=plus(day,h);
   const threshold=decimals(h===7?last.value:last.value*1.001);
   const bound=bindThreshold(src,target,threshold,"gte",now);
   if(bound.error)throw Error("Unable to register original source question: "+bound.error);
   const binding=bound.binding;
   const record={id,cohort,createdAt:now.toISOString(),kind:"deterministic-public-baselines",policy:POLICY,question:thresholdQuestion(binding),
    sourceName:src.sourceName,sourceRetrievedAt:history.retrievedAt,binding,
    modelCalls:{persistence:binding.persistenceCall,rollingMean7:thresholdCall(rolling,threshold,"gte")},
    status:"open",resolution:null};
   next.records.push(record);registered++;
  }
 }
 if(next.records.length>240)throw Error("Public ledger capacity reached: archive and rotate explicitly before continuing.");
 if(registered||resolved||flagged)next.updatedAt=now.toISOString();
 const errors=validatePublicTrack(next);
 if(errors.length)throw Error("New public ledger rejected: "+errors.join("; "));
 return {track:next,changes:{registered,resolved,flagged}};
}
export function publicTrackSummary(track,now=new Date()){
 const issues=validatePublicTrack(track);if(issues.length)throw Error("Invalid experiment ledger: "+issues.join("; "));
 const records=track.records,resolved=records.filter(r=>r.status==="resolved"),open=records.filter(r=>r.status==="open");
 const missing=records.filter(r=>r.status==="unresolved-missing-data");
 const right=key=>resolved.reduce((acc,r)=>acc+(r.resolution[key]===1?1:0),0);
 return {schema:SUMMARY_SCHEMA,policy:POLICY,generatedAt:now.toISOString(),created:records.length,open:open.length,resolved:resolved.length,unresolvedMissingData:missing.length,
  evaluated:resolved.length,accuracy:resolved.length?{persistence:right("persistenceCorrect")/resolved.length,rollingMean7:right("rollingMeanCorrect")/resolved.length}:null,
  recentRecords:records.slice(-18).reverse().map(r=>({id:r.id,createdAt:r.createdAt,question:r.question,sourceName:r.sourceName,sourceUrl:r.binding.sourceUrl,
   originalObservationDate:r.binding.originalObservationDate,originalValue:r.binding.originalValue,threshold:r.binding.threshold,unit:r.binding.unit,
   targetDate:r.binding.targetDate,status:r.status,persistenceCall:r.modelCalls.persistence,rollingMeanCall:r.modelCalls.rollingMean7,
   outcome:r.resolution?.outcome??null,outcomeObservationDate:r.resolution?.observationDate||null,outcomeValue:r.resolution?.value??null})),
  notice:"Real official-data precommitments; binary deterministic persistence/rolling-mean calls only. No human estimates, no calibrated odds, no model skill claim. Questions share sources, so raw n is not independent."};
}
