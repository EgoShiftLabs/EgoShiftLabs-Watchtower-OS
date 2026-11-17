import {readFile} from "node:fs/promises";
import {validatePublicIntel} from "./public-intel-schema.mjs";
const raw=await readFile(new URL("../data/public-intel.json",import.meta.url),"utf8");
if(Buffer.byteLength(raw)>150000)throw Error("Public feed exceeds permitted size.");
const data=JSON.parse(raw),errors=validatePublicIntel(data);
if(errors.length){for(const error of errors)console.error(error);process.exitCode=1;}
else console.log("Valid PUBLIC feed status:",data.status,"observations:",data.observations.length);
