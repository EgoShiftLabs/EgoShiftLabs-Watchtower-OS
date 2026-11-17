// Source-specific parsing. Public government source observations, not a forecast.
export const TREASURY_SOURCE="https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny";
export const TREASURY_API="https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=record_date,tot_pub_debt_out_amt,debt_held_public_amt&sort=-record_date&page%5Bsize%5D=6";
export const USGS_SOURCE="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson";
function isDate(x){if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x;}
function money(x){const n=Number(x);return (typeof x==="string"||typeof x==="number")&&Number.isFinite(n)&&n>0&&n<1e16?n:null;}
const rnd=(n,nDigits=4)=>Number(n.toFixed(nDigits));
export function normalizeTreasury(payload,at=new Date()){
 if(!Array.isArray(payload?.data)||payload.data.length<2)throw Error("Treasury did not return sufficient data.");
 const rows=payload.data.filter(x=>isDate(x.record_date)&&money(x.tot_pub_debt_out_amt)!==null).sort((a,b)=>b.record_date.localeCompare(a.record_date));
 if(rows.length<2)throw Error("No valid pair of Treasury records.");
 const [latest,previous]=rows,dated=latest.record_date;
 if(dated>at.toISOString().slice(0,10))throw Error("Treasury publication date is in the future.");
 if(at-new Date(dated+"T00:00:00Z")>14*86400000)throw Error("Treasury data is too old to call current.");
 const make=(id,label,field)=>{const a=money(latest[field]),b=money(previous[field]);if(a===null||b===null)throw Error("Invalid Treasury "+field);return {id,label,sourceName:"U.S. Treasury FiscalData",sourceUrl:TREASURY_SOURCE,observationDate:dated,value:rnd(a/1e12),unit:"USD trillions",previousValue:rnd(b/1e12),changePct:rnd((a-b)/b*100),indicator:field};};
 return [make("treasury-total-debt","U.S. total public debt outstanding","tot_pub_debt_out_amt"),make("treasury-held-public","U.S. federal debt held by the public","debt_held_public_amt")];
}
export function normalizeUSGS(payload,at=new Date()){
 if(payload?.type!=="FeatureCollection"||!Array.isArray(payload.features)||!Number.isFinite(payload?.metadata?.generated))throw Error("Invalid USGS GeoJSON response.");
 const time=new Date(payload.metadata.generated);
 if(Number.isNaN(time.getTime())||Math.abs(at-time)>12*3600000)throw Error("USGS source timestamp is stale or invalid.");
 const valid=payload.features.filter(x=>Number.isFinite(x?.properties?.mag)&&x.properties.mag>=4.5&&Number.isFinite(x.properties.time)&&x.properties.time<=at.getTime()+5*60000&&x.properties.time>=at.getTime()-27*3600000);
 if(valid.length!==payload.features.length)throw Error("Unexpected or invalid USGS event records.");
 const common={sourceName:"U.S. Geological Survey",sourceUrl:USGS_SOURCE,observationDate:time.toISOString().slice(0,10)};
 const result=[{id:"usgs-quake-count",label:"M4.5+ earthquakes in rolling 24 hours",...common,value:valid.length,unit:"events",indicator:"earthquakes_day"}];
 if(valid.length)result.push({id:"usgs-largest-quake",label:"Largest M4.5+ event in rolling 24 hours",...common,value:rnd(Math.max(...valid.map(x=>x.properties.mag)),1),unit:"magnitude",indicator:"earthquakes_day_max"});
 return result;
}
export function buildFeed(treasury,usgs,at=new Date()){
 return {schema:"watchtower-public-intel-v1",status:"active",retrievedAt:at.toISOString(),observations:[...normalizeTreasury(treasury,at),...normalizeUSGS(usgs,at)],notice:"Official dated observations. Treasury debt stock is not the current market yield. USGS earthquake observations do not predict damage, politics, or asset prices. No predictive probability is generated."};
}
