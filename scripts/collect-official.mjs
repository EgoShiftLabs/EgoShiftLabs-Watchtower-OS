// Keyless official public sources; fail closed on unavailable/malformed data.
import {writeFile,readFile} from "node:fs/promises";
import {buildFeed,TREASURY_API,USGS_SOURCE} from "./official-normalizers.mjs";
import {validatePublicIntel} from "./public-intel-schema.mjs";
import {eiaURL,buildHistory,buildChiefPublicBrief} from "./historical-build.mjs";
async function getJson(url){
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const res=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"WatchtowerOS/0.2 (https://github.com/EgoShiftLabs/EgoShiftLabs-Watchtower-OS)"},signal:AbortSignal.timeout(15000)});
   if(!res.ok)throw Error("Response "+res.status);
   if(!(res.headers.get("content-type")||"").includes("json"))throw Error("Unexpected response type");
   if(Number(res.headers.get("content-length")||0)>2500000)throw Error("Source response too large");
   const txt=await res.text();if(txt.length>2500000)throw Error("Source response too large");
   return JSON.parse(txt);
  }catch(e){last=e;if(attempt<2)await new Promise(r=>setTimeout(r,800*(attempt+1)));}
 }
 throw Error("Official source "+new URL(url).hostname+" unavailable: "+last.message);
}
try{
 const at=new Date();
 // Full recent Treasury historical series, not just a single point-in-time snapshot.
 const historicalTreasuryUrl=TREASURY_API.replace("page%5Bsize%5D=6","page%5Bsize%5D=140");
 if(historicalTreasuryUrl===TREASURY_API)throw Error("Treasury API history size setting was not found.");
 const [treasury,usgs]=await Promise.all([getJson(historicalTreasuryUrl),getJson(USGS_SOURCE)]);
 const feed=buildFeed(treasury,usgs,at),errors=validatePublicIntel(feed);
 if(errors.length)throw Error("Validation rejected official feed: "+errors.join("; "));
 let old=null;
 try{old=JSON.parse(await readFile(new URL("../data/history.json",import.meta.url),"utf8"));}catch{old=null;}
 let energy=null,energyStatus="needs_key";
 if(process.env.EIA_API_KEY){
  try{energy=await getJson(eiaURL(process.env.EIA_API_KEY));energyStatus="active";}
  catch(e){console.error("Optional EIA WTI source failed, will show stale/unavailable status:",e.message);energyStatus="source_error";}
 }
 let history;
 try{history=buildHistory(treasury,energy,energyStatus,at,old);}
 catch(e){
  if(energy){console.error("Invalid EIA series, ignoring optional price data:",e.message);history=buildHistory(treasury,null,"source_error",at,old);}
  else throw e;
 }
 const brief=buildChiefPublicBrief(feed,history,at);
 for(const [name,body] of [["public-intel",feed],["history",history],["chief-public-brief",brief]]){
  const str=JSON.stringify(body,null,2)+"\n";
  if(str.length>250000)throw Error(name+" output exceeds static size budget.");
 }
 // No output is written until official-source parsing and validation complete.
 await Promise.all([
  writeFile(new URL("../data/public-intel.json",import.meta.url),JSON.stringify(feed,null,2)+"\n"),
  writeFile(new URL("../data/history.json",import.meta.url),JSON.stringify(history,null,2)+"\n"),
  writeFile(new URL("../data/chief-public-brief.json",import.meta.url),JSON.stringify(brief,null,2)+"\n")
 ]);
 console.log("Official public intelligence assembled:",feed.observations.length,"current indicators;",history.series.length,"historical series; EIA:",history.energy.status,"retrieved",feed.retrievedAt);
}catch(e){console.error("Source collection failed; previous stored snapshot left unchanged:",e.message);process.exitCode=1;}
