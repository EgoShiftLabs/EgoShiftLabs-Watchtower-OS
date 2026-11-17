// CLI used in GitHub Actions after official retrieval; never fabricates observations.
import {readFile,writeFile} from "node:fs/promises";
import {emptyTrack,makePublicTrack,publicTrackSummary,validatePublicTrack} from "./public-forecast-track.mjs";
try{
 const file=async p=>JSON.parse(await readFile(new URL("../data/"+p,import.meta.url),"utf8"));
 const history=await file("history.json");
 let prior;
 try{prior=await file("public-forecast-track.json");}
 catch(e){if(e.code!=="ENOENT")throw e;prior=emptyTrack();}
 const now=new Date(),{track,changes}=makePublicTrack(history,prior,now);
 const summary=publicTrackSummary(track,now);
 for(const [path,body] of [["public-forecast-track.json",track],["public-forecast-summary.json",summary]]){
  const str=JSON.stringify(body,null,2)+"\n";
  if(str.length>500000)throw Error("Public research file exceeds size budget.");
  await writeFile(new URL("../data/"+path,import.meta.url),str);
 }
 console.log("Official-source public cohort: newly registered",changes.registered,"newly resolved",changes.resolved,"missing-outcome flagged",changes.flagged);
 console.log("PUBLIC baseline counts:",summary.created,"issued",summary.open,"open",summary.resolved,"resolved",summary.unresolvedMissingData,"missing");
}catch(e){console.error("No research track update published:",e.message);process.exitCode=1;}
