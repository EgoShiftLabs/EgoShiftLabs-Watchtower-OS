// Automated headless Chromium smoke test. Does not replace hardware accessibility QA.
import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on("pageerror",e=>failures.push("Page error: "+e.message));
 await page.goto("http://127.0.0.1:8000/",{waitUntil:"networkidle",timeout:30000});
 await page.locator('h1').filter({hasText:"Your intelligence command."}).waitFor();
 for(const [nav,heading] of [["watch","Global watch."],["brief","Intelligence Brief."],["energy","Energy Market Watch."],["patterns","Pattern Lab."],["causal","Causal Map."],["forecast","Forecast lab."],["decisions","Decision desk."],["projects","Project desk."],["agents","Agent room."],["settings","Settings & data."]]){
  await page.locator('[data-nav="'+nav+'"]').click();
  await page.locator("h1").filter({hasText:heading}).waitFor({timeout:5000});
  assert.ok((await page.locator("#content").innerText()).includes(heading),"Page failed: "+nav);
 }
 await page.locator('[data-nav="patterns"]').click();
 const series=page.locator("#patternSeries");
 assert.ok(await series.count(),"Pattern Lab should have a data-source chooser");
 const first=await series.locator("option").first().getAttribute("value");
 assert.ok(first,"There should be at least one official series");
 await page.locator('[data-nav="brief"]').click();
 const btn=page.locator('[data-action="export-chief"]');
 assert.ok(await btn.count(),"Local CHIEF Markdown export must be present");
 await page.locator('[data-nav="energy"]').click();
 await page.locator('#oilCsv').setInputFiles({name:"wti-research.csv",mimeType:"text/csv",buffer:Buffer.from("date,value\n2026-10-01,72\n2026-10-02,73\n2026-10-03,71\n2026-10-04,74")});
 await page.locator("h2").filter({hasText:"WTI or oil prices: manually imported CSV"}).waitFor({timeout:7000});
 await page.locator('[data-nav="forecast"]').click();
 assert.ok(await page.locator('h2').filter({hasText:"Public baseline forecast track record"}).count(),"Public precommitted research section required");
 await page.locator('[data-action="add-forecast"]').click();
 await page.locator('#i-question').fill("Will the named public indicator exceed its stated threshold?");
 await page.locator('#i-targetDate').fill("2027-02-01");
 await page.locator('#i-probability').fill("55");
 await page.locator('#i-resolutionRule').fill("An original dated public report confirms the exact threshold at the deadline.");
 await page.locator('#i-disconfirming').fill("A primary dated source shows the threshold was not reached.");
 await page.locator('#recordForm button[type="submit"]').click();
 await page.locator('.item').filter({hasText:"Will the named public indicator exceed its stated threshold?"}).first().waitFor({timeout:7000});
 await page.locator('[data-nav="causal"]').click();
 await page.locator('[data-action="add-causal"]').click();
 await page.locator('#i-cause').fill("Illustrative supply constraint");
 await page.locator('#i-effect').fill("Possible change in supply cost");
 await page.locator('#i-mechanism').fill("A smaller supply may increase market clearing prices if demand stays constant.");
 await page.locator('#i-falsifier').fill("Additional available capacity offsets the original shortage.");
 await page.locator('#recordForm button[type="submit"]').click();
 await page.locator(".causal-card").filter({hasText:"Illustrative supply constraint"}).waitFor({timeout:5000});
 assert.equal(failures.length,0,failures.join("\n"));
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on("pageerror",e=>failures.push("Mobile page error: "+e.message));
 await mobile.goto("http://127.0.0.1:8000/",{waitUntil:"networkidle",timeout:30000});
 await mobile.locator('h1').filter({hasText:"Your intelligence command."}).waitFor();
 await mobile.locator('#mobileMenu').click();
 await mobile.locator('[data-nav="energy"]').click();
 await mobile.locator('h1').filter({hasText:"Energy Market Watch."}).waitFor();
 assert.equal(failures.length,0,failures.join("\n"));
 console.log("Headless desktop + mobile-viewport smoke checks passed.");
}catch(error){console.error("Browser smoke failed:",error);process.exitCode=1;}
finally{await browser.close();}
