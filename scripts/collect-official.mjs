// Keyless official public sources; fail closed on unavailable/malformed data.
import {writeFile} from "node:fs/promises";
import {buildFeed,TREASURY_API,USGS_SOURCE} from "./official-normalizers.mjs";
import {validatePublicIntel} from "./public-intel-schema.mjs";
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
 const [treasury,usgs]=await Promise.all([getJson(TREASURY_API),getJson(USGS_SOURCE)]);
 const feed=buildFeed(treasury,usgs,at),errors=validatePublicIntel(feed);
 if(errors.length)throw Error("Validation rejected official feed: "+errors.join("; "));
 await writeFile(new URL("../data/public-intel.json",import.meta.url),JSON.stringify(feed,null,2)+"\n");
 console.log("Official public feed updated:",feed.observations.length,"observations retrieved",feed.retrievedAt);
}catch(e){console.error("Source collection failed; previous stored snapshot left unchanged:",e.message);process.exitCode=1;}
