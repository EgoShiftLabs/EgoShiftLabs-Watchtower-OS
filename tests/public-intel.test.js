import test from "node:test";
import assert from "node:assert/strict";
import {validatePublicIntel} from "../scripts/public-intel-schema.mjs";
const empty={schema:"watchtower-public-intel-v1",status:"unconfigured",retrievedAt:null,observations:[]};
test("unconfigured public feed is empty by definition",()=>{assert.deepEqual(validatePublicIntel(empty),[]);assert.ok(validatePublicIntel({...empty,observations:[{value:12}]}).length);});
test("active feed requires timestamp and public provenance",()=>{
 const a={...empty,status:"active",retrievedAt:"2026-11-17T15:00:00Z",observations:[{id:"1",label:"Sample only",sourceName:"Example",sourceUrl:"https://example.gov/data",observationDate:"2026-11-16",value:12,unit:"units"}]};
 assert.deepEqual(validatePublicIntel(a),[]);
 assert.ok(validatePublicIntel({...a,retrievedAt:null}).length);
 assert.ok(validatePublicIntel({...a,observations:[{...a.observations[0],sourceUrl:"javascript:alert(1)"}]}).length);
 assert.ok(validatePublicIntel({...a,observations:[{...a.observations[0],accountNo:"123"}]}).length);
});
