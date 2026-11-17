import test from "node:test";import assert from "node:assert/strict";
import {bindThreshold,thresholdQuestion,evaluateThreshold,validateThresholdBinding,templateOptions,thresholdCall} from "../thresholds.js";
const series={id:"treasury-total-debt",label:"Federal debt stock",sourceUrl:"https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",unit:"USD trillions",points:[{date:"2026-11-13",value:40.6},{date:"2026-11-16",value:40.7}]};
const created=new Date("2026-11-17T16:00:00Z");
test("threshold forecast references a real dated source snapshot",()=>{
 const {binding}=bindThreshold(series,"2026-11-23",41,"gte",created);
 assert.equal(binding.originalValue,40.7);assert.equal(binding.persistenceCall,0);assert.equal(binding.sourceUrl,series.sourceUrl);assert.equal(validateThresholdBinding(binding),"");
 assert.match(thresholdQuestion(binding),/first recorded observation/);
 assert.equal(templateOptions(series).length,6);
});
test("cannot create a threshold forecast using a stale target or invalid comparator",()=>{
 assert.ok(bindThreshold(series,"2026-11-16",41,"gte",created).error);
 assert.ok(bindThreshold(series,"2027-12-16",41,"gte",created).error);
 assert.ok(bindThreshold(series,"2026-11-23",41,"nonsense",created).error);
});
test("resolution uses first dated observation on or after target, no hindsight selection",()=>{
 const {binding}=bindThreshold(series,"2026-11-23",41,"gte",created);
 const next={...series,points:[...series.points,{date:"2026-11-24",value:41.2},{date:"2026-11-25",value:40.1}]};
 assert.equal(evaluateThreshold(binding,next,new Date("2026-11-22T16:00:00Z")).status,"pending");
 const r=evaluateThreshold(binding,next,new Date("2026-11-26T16:00:00Z"));
 assert.equal(r.status,"ready");assert.equal(r.outcome,1);assert.equal(r.observationDate,"2026-11-24");assert.equal(r.baselineCorrect,0);
});
test("expired missing history stays pending instead of guessing a NO",()=>{
 const {binding}=bindThreshold(series,"2026-11-23",41,"lt",created);
 const r=evaluateThreshold(binding,series,new Date("2026-12-05T00:00:00Z"));
 assert.equal(r.status,"pending");assert.match(r.reason,/manual adjudication/);
});
test("source mismatch and forged persistence calls are rejected",()=>{
 const {binding}=bindThreshold(series,"2026-11-23",41,"gte",created);
 assert.equal(evaluateThreshold(binding,{...series,id:"other-source"},new Date("2026-11-28T00:00:00Z")).status,"source-mismatch");
 assert.match(validateThresholdBinding({...binding,persistenceCall:1}),/baseline/);
 assert.equal(thresholdCall(40.7,41,"gte"),0);
});
