import test from "node:test";
import assert from "node:assert/strict";
import {brier,calibration,scenarioWeighted,validateForecast,sourceQuality,canResolve,resolveForecast,validWorkspace,blankWorkspace,safeUrl,esc,createForecastRecord,forecastIntegrity,evidenceGrade} from "../core.js";
test("Brier score is deterministic",()=>{assert.ok(Math.abs(brier(70,1)-.09)<1e-10);assert.ok(Math.abs(brier(70,0)-.49)<1e-10);assert.equal(brier(null,1),null);assert.equal(brier(-1,1),null);});
test("synthetic, legacy, and unaudited outcomes excluded from scored calibration",()=>{
 const f=createForecastRecord({id:"a",demo:false,question:"Will the stated event occur by the stated date?",targetDate:"2026-01-01",resolutionRule:"Resolve with an authoritative dated original source.",disconfirming:"Observed conditions contradict the proposed event.",probability:80},new Date("2025-01-01T12:00:00Z"));
 const resolved=resolveForecast(f,1,"Official record confirms the specified event.",new Date("2026-01-02T12:00:00Z"));
 const x=calibration([{...resolved,demo:true},resolved,{demo:false,status:"resolved",probability:80,outcome:1},{...f,targetDate:"2026-01-01"}],new Date("2026-02-01T12:00:00Z"));
 assert.equal(x.count,1);assert.ok(Math.abs(x.mean-.04)<1e-9);assert.equal(x.referenceMean,.25);assert.equal(x.overdue,1);assert.equal(x.unscored,1);
});
test("scenario weights require exactly 100",()=>{assert.ok(scenarioWeighted([{weight:50,impact:20},{weight:40,impact:-10}]).error);assert.equal(scenarioWeighted([{weight:25,impact:40},{weight:75,impact:-20}]).weighted,-5);});
test("forecast requires measurable deadline, rule and falsifier",()=>{assert.match(validateForecast({question:"a",targetDate:"2026-01-02",resolutionRule:"",disconfirming:""}),/testable/);assert.equal(validateForecast({question:"Will an objectively measurable event occur?",targetDate:"2027-05-01",resolutionRule:"One or more original dated public reports confirm it.",disconfirming:"A published contrary observation.",probability:55}),"");});
test("negative outcome must await deadline",()=>{const f={targetDate:"2027-12-31",probability:50};const now=new Date("2026-11-17T12:00:00Z");assert.equal(canResolve(f,0,now),false);assert.equal(canResolve(f,1,now),true);assert.ok(resolveForecast(f,0,"Confirmed report indicating nonoccurrence.",now).error);});
test("source quality requires real links and adequate evidence",()=>{const f={sourceUrl:"https://example.gov/report",observedAt:"2026-11-17",evidence:"Original source document with dated observation."};assert.equal(sourceQuality(f),true);assert.equal(sourceQuality({...f,demo:true}),false);assert.equal(sourceQuality({...f,evidence:"short"}),false);});
test("block unsafe URLs and escape HTML",()=>{assert.equal(safeUrl("javascript:alert(1)"),"");assert.equal(esc('<script>"'),"&lt;script&gt;&quot;");});
test("workspace backup validation",()=>{const x=blankWorkspace();assert.equal(validWorkspace(x),true);x.live.signals=null;assert.equal(validWorkspace(x),false);});

test("new forecasts preserve original snapshot and prevent silent field changes",()=>{
 const initial=createForecastRecord({id:"f",demo:false,question:"Will a defined public indicator reach threshold?",targetDate:"2026-11-17",probability:40,resolutionRule:"An official data release confirms the indicator.",disconfirming:"A contrary release disproves the threshold.",sourceUrl:"https://example.gov",sourceCheckedAt:"2026-11-16",evidence:"Dated original public evidence for test.",rationale:"Model-independent reasoning."},new Date("2026-11-16T12:00:00Z"));
 assert.equal(forecastIntegrity(initial).ok,true);
 assert.equal(forecastIntegrity({...initial,probability:95}).status,"mismatch");
 const resolved=resolveForecast(initial,0,"Original source shows no threshold was reached.",new Date("2026-11-18T12:00:00Z"));
 assert.equal(forecastIntegrity(resolved).ok,true);
 assert.equal(resolved.timeline.length,2);
 assert.ok(resolveForecast(resolved,1,"Try to rewrite this resolved event.",new Date("2026-11-19T12:00:00Z")).error);
 assert.equal(initial.status,"open");
});
test("tampered forecast backup rejected",()=>{
 const a=blankWorkspace(),f=createForecastRecord({id:"f",demo:false,question:"A specific binary forecast question",targetDate:"2027-01-01",probability:20,resolutionRule:"Public original release confirms occurrence.",disconfirming:"The original release rejects this result."});
 a.live.forecasts=[{...f,probability:90}];
 assert.equal(validWorkspace(a),false);
});
test("evidence grade never means externally verified",()=>{
 const x=evidenceGrade({demo:false,sourceType:"primary",observedAt:"2026-11-17",sourceUrl:"https://example.gov/a",evidence:"Dated primary evidence from sample source."},new Date("2026-11-18T10:00:00Z"));
 assert.match(x.label,/SELF-CLASSIFIED/);assert.equal(x.sourced,true);
});
test("unknown top-level backup properties are rejected",()=>{
 const x=blankWorkspace();x.unexpected={admin:true};assert.equal(validWorkspace(x),false);
});

test("changed original creation timestamp or classification is detected",()=>{
 const x=createForecastRecord({id:"p",demo:false,question:"Will benchmark reach specified threshold?",targetDate:"2027-03-01",probability:20,sourceType:"primary",resolutionRule:"Use official exchange settlement report.",disconfirming:"Closing value falls below the threshold."},new Date("2026-11-17T15:00:00Z"));
 assert.equal(forecastIntegrity(x).ok,true);
 assert.equal(forecastIntegrity({...x,createdAt:"2026-11-10T15:00:00Z"}).status,"mismatch");
 assert.equal(forecastIntegrity({...x,sourceType:"unverified"}).status,"mismatch");
 const y=resolveForecast(x,1,"A dated official source confirms the event.",new Date("2027-02-01T15:00:00Z"));
 assert.equal(forecastIntegrity(y).ok,true);
 assert.equal(forecastIntegrity({...y,outcome:0}).status,"mismatch");
});
