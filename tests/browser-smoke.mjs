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
 await page.locator('[data-nav="causal"]').click();
 await page.locator('[data-action="add-causal"]').click();
 await page.locator('#i-cause').fill("Illustrative supply constraint");
 await page.locator('#i-effect').fill("Possible change in supply cost");
 await page.locator('#i-mechanism').fill("A smaller supply may increase market clearing prices if demand stays constant.");
 await page.locator('#i-falsifier').fill("Additional available capacity offsets the original shortage.");
 console.log("Causal form validation:",JSON.stringify(await page.locator("#recordForm").evaluate(f=>({valid:f.checkValidity(),invalid:[...f.elements].filter(x=>x.willValidate&&!x.checkValidity()).map(x=>({name:x.name,value:x.value,message:x.validationMessage,tag:x.tagName}))}))));
 await page.locator('#recordForm button[type="submit"]').click();
 console.log("Causal form diagnostics:",JSON.stringify({
  notification:await page.locator("#toast").innerText(),
  remainingForm:await page.locator("#recordForm").count(),
  causalCards:(await page.locator(".causal-card").allTextContents()).slice(-3),
  localCount:await page.evaluate(()=>{const x=JSON.parse(localStorage.getItem("watchtower-os-public-v1")||"null");return x?.demo?.causal?.length??null;})
 }));
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
