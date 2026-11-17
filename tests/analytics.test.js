import test from "node:test";
import assert from "node:assert/strict";
import {normalizePoints,historyStats,walkForward,sparkline,safeSeries,csvPricePoints} from "../analytics.js";
const pts=Array.from({length:24},(_,i)=>({date:"2026-10-"+String(i+1).padStart(2,"0"),value:100+i}));
test("normalization keeps chronological valid points",()=>{
 assert.equal(normalizePoints([pts[2],pts[0],pts[1]]).at(-1).date,pts[2].date);
 assert.equal(normalizePoints([{date:"2026-02-30",value:1}]).length,0);
});
test("simple baseline backtests use only earlier observations",()=>{
 const x=walkForward(pts,5,10);
 assert.equal(x.count,14);assert.equal(x.persistenceMae,1);
 assert.ok(Math.abs(x.rollingMae-3)<1e-8);
 const y=historyStats(pts,5);assert.equal(y.count,24);assert.equal(y.change,1);assert.equal(y.rollingMean,121);
});
test("sparkline draws only numeric SVG coordinates",()=>{
 assert.ok(/^[\d., ]+$/.test(sparkline(pts)));
 assert.equal(sparkline([{date:"2026-11-01",value:1}]),"");
});
test("strict CSV manual energy import validates dates and prices",()=>{
 const csv="date,value\n2026-10-01,75\n2026-10-02,77\n2026-10-03,74";
 assert.equal(csvPricePoints(csv).length,3);
 assert.throws(()=>csvPricePoints("date,price\n2026-10-01,72\n2026-10-01,73\n2026-10-03,70"),/duplicate/);
 assert.throws(()=>csvPricePoints("date,price\n2026-10-01,72\n2026-10-02,<script>\n2026-10-03,70"),/Non-numeric/);
});
test("reject unsafe history series",()=>{
 assert.equal(safeSeries({id:"wti",label:"WTI",unit:"USD",sourceUrl:"javascript:alert(1)",points:pts}),false);
 assert.equal(safeSeries({id:"wti",label:"WTI",unit:"USD",sourceUrl:"https://www.eia.gov",points:pts}),true);
});
