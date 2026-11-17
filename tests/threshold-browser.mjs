// Test-only in-memory future public-series fixture. NEVER committed as an actual data artifact.
import assert from "node:assert/strict";
import {chromium} from "playwright";
const root="http://127.0.0.1:8000/";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1200,height:830}});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
try{
 await page.clock.install({time:new Date("2026-11-17T12:00:00Z")});
 await page.goto(root,{waitUntil:"networkidle"});
 await page.locator('[data-nav="forecast"]').click();
 const btn=page.locator('[data-action="new-threshold"][data-id="treasury-total-debt"]');
 await btn.waitFor({timeout:8000});
 await btn.click();
 await page.locator('#thresholdForm').waitFor();
 await page.locator('#i-targetDate').fill("2026-11-19");
 const originalHistory=await (await page.request.get(root+"data/history.json")).json();
 const source=originalHistory.series.find(s=>s.id==="treasury-total-debt");
 assert.ok(source&&source.points.length>10,"Expected a real historical Treasury series from the checked-in source");
 const originalValue=source.points.at(-1).value;
 const cutoff=Number((originalValue+0.3).toFixed(6));
 await page.locator('#i-threshold').fill(String(cutoff));
 await page.locator('#i-comparator').selectOption("gte");
 await page.locator('#i-probability').fill("55");
 await page.locator('#i-rationale').fill("A human test forecast with a chosen threshold and no automated model probabilities.");
 await page.locator('#i-disconfirming').fill("An eligible later official report remains below the threshold.");
 await page.locator('#thresholdForm button[type="submit"]').click();
 await page.locator('.item').filter({hasText:"first recorded observation on or after 2026-11-19"}).first().waitFor({timeout:8000});
 const created=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem("watchtower-os-public-v1")||"null");return s?.live?.forecasts?.find(x=>x.binding)||null;});
 assert.ok(created,"New source-linked forecast must persist in local browser only.");
 assert.equal(created.original.binding.originalValue,originalValue);
 assert.equal(created.binding.persistenceCall,0);
 assert.equal(created.original.binding.threshold,cutoff);
 assert.equal(created.status,"open");
 await page.locator('[data-action="resolve-forecast"][data-id="'+created.id+'"]').click();
 await page.locator('.modal').filter({hasText:"Target date has not yet arrived"}).waitFor();
 await page.locator('.modal [data-action="close-modal"]').first().click();

 // Substitute a test-only fake FUTURE observation in browser's fetch response.
 // No synthetic data is ever written to the repository's public data/history.json.
 const fixture=JSON.parse(JSON.stringify(originalHistory));
 fixture.retrievedAt="2026-11-20T09:00:00Z";
 const changed=fixture.series.find(s=>s.id==="treasury-total-debt");
 changed.points.push({date:"2026-11-19",value:cutoff+0.5});
 await page.route("**/data/history.json",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
 await page.clock.setFixedTime(new Date("2026-11-20T13:00:00Z"));
 await page.reload({waitUntil:"networkidle"});
 await page.locator('[data-nav="forecast"]').click();
 await page.locator('[data-action="resolve-forecast"][data-id="'+created.id+'"]').click();
 await page.locator('form#thresholdResolutionForm').waitFor({timeout:8000});
 await page.locator('form#thresholdResolutionForm input[name="reviewed"]').check();
 await page.locator('form#thresholdResolutionForm button[type="submit"]').click();
 await page.locator('.item').filter({hasText:"Persistence baseline: INCORRECT"}).first().waitFor({timeout:8000});
 const ended=await page.evaluate(id=>{
  const s=JSON.parse(localStorage.getItem("watchtower-os-public-v1")||"null");return s?.live?.forecasts?.find(x=>x.id===id);
 },created.id);
 assert.equal(ended.status,"resolved");assert.equal(ended.outcome,1);assert.equal(ended.baselineCorrect,0);
 assert.equal(ended.outcomeObservationDate,"2026-11-19");
 assert.ok(Math.abs(ended.brier-0.2025)<1e-10);
 assert.deepEqual(ended.original.binding,created.original.binding);
 assert.equal(ended.timeline.length,2);

 // Decision record regression — app modal delegation must not block native submission.
 await page.locator('[data-nav="decisions"]').click();
 await page.locator('[data-action="add-decision"]').click();
 await page.locator('#i-title').fill("Example follow-up to verified threshold");
 await page.locator('#i-thesis').fill("Review the evidence after the official observation.");
 await page.locator('#i-countercase').fill("The initial model-free hypothesis could be wrong.");
 await page.locator('#i-options').fill("Wait for more data");
 await page.locator('#i-nextAction').fill("Assess outcome and record lesson");
 await page.locator('#recordForm button[type="submit"]').click();
 await page.locator('.item').filter({hasText:"Example follow-up to verified threshold"}).waitFor({timeout:8000});
 assert.deepEqual(errors,[]);
 console.log("Threshold create → fixed-date official-series mock resolution → Brier/persistence → local decision browser flow PASSED.");
}catch(error){console.error("Threshold browser test failed:",error);process.exitCode=1;}
finally{await browser.close();}
