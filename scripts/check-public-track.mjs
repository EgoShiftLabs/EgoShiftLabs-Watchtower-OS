import {readFile} from "node:fs/promises";
import {validatePublicTrack,publicTrackSummary,SUMMARY_SCHEMA} from "./public-forecast-track.mjs";
try{
 const read=async p=>JSON.parse(await readFile(new URL("../data/"+p,import.meta.url),"utf8"));
 const track=await read("public-forecast-track.json"),reported=await read("public-forecast-summary.json");
 const issues=validatePublicTrack(track),expected=publicTrackSummary(track);
 if(issues.length)throw Error(issues.join("; "));
 if(reported.schema!==SUMMARY_SCHEMA||reported.created!==expected.created||reported.open!==expected.open||reported.resolved!==expected.resolved||reported.unresolvedMissingData!==expected.unresolvedMissingData)throw Error("Public forecast summary inconsistent with committed ledger.");
 if(JSON.stringify(track).length>500000)throw Error("Research track oversized.");
 console.log("Research ledger verified:",track.records.length,"questions,",expected.resolved,"resolved.");
}catch(e){console.error("Research ledger invalid:",e.message);process.exitCode=1;}
