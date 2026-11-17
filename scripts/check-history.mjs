import {readFile} from "node:fs/promises";
import {safeSeries} from "../analytics.js";
const get=async path=>JSON.parse(await readFile(new URL("../data/"+path,import.meta.url),"utf8"));
const history=await get("history.json"),brief=await get("chief-public-brief.json");
const errors=[];
if(history.schema!=="watchtower-history-v1"||!["unconfigured","active"].includes(history.status))errors.push("Bad history schema/status.");
if(!Array.isArray(history.series)||history.series.length>8)errors.push("Invalid number of series.");
if(history.series?.some(s=>!safeSeries(s)))errors.push("Bad time series URL, dates or values.");
if(history.energy&&!["needs_key","source_error","stale","active"].includes(history.energy.status))errors.push("Invalid energy source status.");
if(history.status==="active"&&(!history.retrievedAt||Number.isNaN(Date.parse(history.retrievedAt))))errors.push("Active history missing retrieval date.");
if(brief.schema!=="watchtower-chief-brief-v1"||!["unconfigured","public-only"].includes(brief.status)||!Array.isArray(brief.items))errors.push("Bad CHIEF brief.");
if(brief.status==="public-only"&&(!brief.generatedAt||Number.isNaN(Date.parse(brief.generatedAt))))errors.push("Public brief missing timestamp.");
if(JSON.stringify({history,brief}).length>500000)errors.push("Public artifacts too large.");
if(errors.length){for(const e of errors)console.error(e);process.exitCode=1;}
else console.log("Public history and brief validated:",history.series.length,"series;",brief.items.length,"observations; energy:",history.energy?.status);
