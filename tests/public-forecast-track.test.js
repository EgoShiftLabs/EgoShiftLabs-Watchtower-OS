import test from "node:test";
import assert from "node:assert/strict";
import {emptyTrack,validatePublicTrack,makePublicTrack,publicTrackSummary} from "../scripts/public-forecast-track.mjs";
const asOf=new Date("2026-11-17T17:00:00Z");
const points=Array.from({length:24},(_,i)=>{const d=new Date("2026-10-24T00:00:00Z");d.setUTCDate(d.getUTCDate()+i);return {date:d.toISOString().slice(0,10),value:40+i/100};});
const history={schema:"watchtower-history-v1",status:"active",retrievedAt:"2026-11-17T16:20:00Z",series:[
 {id:"treasury-total-debt",label:"U.S. public debt stock",unit:"USD trillions",sourceName:"U.S. Treasury FiscalData",sourceUrl:"https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",points},
 {id:"treasury-held-public",label:"Federal debt held by public",unit:"USD trillions",sourceName:"U.S. Treasury FiscalData",sourceUrl:"https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",points:points.map(p=>({...p,value:p.value-8}))}
],energy:{status:"needs_key"}};
test("first official data snapshot creates exactly four pre-registered, real-source questions with no human odds",()=>{
 const a=makePublicTrack(history,emptyTrack(),asOf);
 assert.deepEqual(a.changes,{registered:4,resolved:0,flagged:0});
 assert.equal(validatePublicTrack(a.track).length,0);
 assert.equal(a.track.records.every(r=>r.kind==="deterministic-public-baselines"&&r.resolution===null&&r.createdAt===asOf.toISOString()),true);
 assert.equal(a.track.records.every(r=>!Object.keys(r).some(k=>k==="probability"||k==="user")),true);
 assert.deepEqual(new Set(a.track.records.map(r=>r.binding.targetDate)),new Set(["2026-11-24","2026-12-01"]));
 const summary=publicTrackSummary(a.track,asOf);assert.equal(summary.created,4);assert.equal(summary.resolved,0);assert.equal(summary.accuracy,null);
});
test("same-week twice-daily updates cannot backfill or rewrite original forecasts",()=>{
 const first=makePublicTrack(history,emptyTrack(),asOf).track;
 const second=makePublicTrack({...history,retrievedAt:"2026-11-18T15:00:00Z"},first,new Date("2026-11-18T16:00:00Z"));
 assert.equal(second.changes.registered,0);
 assert.deepEqual(second.track.records,first.records);
});
test("future outcome resolves only after target date, from first eligible official observation",()=>{
 const first=makePublicTrack(history,emptyTrack(),asOf).track;
 const updated={...history,retrievedAt:"2026-11-25T16:00:00Z",series:history.series.map(s=>({...s,points:[...s.points,{date:"2026-11-25",value:s.points.at(-1).value+0.3}]}))};
 const next=makePublicTrack(updated,first,new Date("2026-11-25T17:00:00Z"));
 assert.equal(next.changes.registered,4); // New calendar week starts a separate, clearly labeled cohort.
 assert.equal(next.changes.resolved,2);
 const resolved=next.track.records.filter(r=>r.status==="resolved");
 assert.equal(resolved.every(r=>r.resolution.observationDate==="2026-11-25"),true);
 assert.equal(resolved.every(r=>r.resolution.outcome===1),true);
 assert.equal(resolved.every(r=>r.resolution.persistenceCorrect===1),true);
 assert.equal(publicTrackSummary(next.track).resolved,2);
 assert.deepEqual(resolved[0].binding,first.records.find(r=>r.id===resolved[0].id).binding);
});
test("unobserved outcomes remain unresolved rather than being scored NO",()=>{
 const first=makePublicTrack(history,emptyTrack(),asOf).track;
 const missing={...history,retrievedAt:"2026-12-11T12:00:00Z",series:history.series.map(s=>({...s,points:s.points}))};
 const after=makePublicTrack(missing,first,new Date("2026-12-11T13:00:00Z"));
 assert.equal(after.track.records.filter(r=>r.status==="unresolved-missing-data").length,4);
 assert.equal(publicTrackSummary(after.track).resolved,0);
});
test("fake private data field and forged resolution fail publication validation",()=>{
 const track=makePublicTrack(history,emptyTrack(),asOf).track;
 track.records[0].walletAddress="not-permitted";
 assert.match(validatePublicTrack(track).join(" " ),/private/);
 delete track.records[0].walletAddress;
 track.records[0].status="resolved";
 track.records[0].resolution={outcome:1,value:0,observationDate:"2026-11-25",resolvedAt:"2026-11-26T12:00:00Z"};
 assert.match(validatePublicTrack(track).join(" "),/Outcome does not satisfy/);
});
test("stale or missing official data cannot issue new public predictions",()=>{
 assert.throws(()=>makePublicTrack({...history,retrievedAt:"2026-11-10T00:00:00Z"},emptyTrack(),asOf),/Fresh/);
 assert.throws(()=>makePublicTrack({...history,status:"unconfigured"},emptyTrack(),asOf),/Fresh/);
});
