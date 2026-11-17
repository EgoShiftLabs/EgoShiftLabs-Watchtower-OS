export function validatePublicIntel(d){
 const errors=[];
 if(!d||typeof d!=="object"||Array.isArray(d))return ["Expected a feed object."];
 if(d.schema!=="watchtower-public-intel-v1")errors.push("Unexpected feed schema.");
 if(!["unconfigured","active","stale"].includes(d.status))errors.push("Unknown feed status.");
 if(!Array.isArray(d.observations)||d.observations.length>60)return [...errors,"Expected no more than 60 public observations."];
 if(d.status==="unconfigured"&&d.observations.length>0)errors.push("Unconfigured feeds must be empty.");
 if(d.status==="active"&&(!d.retrievedAt||Number.isNaN(Date.parse(d.retrievedAt))))errors.push("An active feed requires a real retrieval timestamp.");
 const seen=new Set();
 for(const [i,o] of d.observations.entries()){
  if(!o||typeof o!=="object"||Array.isArray(o)){errors.push("Invalid observation "+i);continue;}
  for(const k of ["id","label","sourceName","sourceUrl","observationDate","value","unit"])if(!(k in o))errors.push("Missing "+k+" in "+i);
  if(typeof o.id!=="string"||!o.id||o.id.length>80||seen.has(o.id))errors.push("Invalid or duplicate identifier "+i);
  seen.add(o.id);
  if(typeof o.label!=="string"||!o.label||o.label.length>150)errors.push("Invalid label "+i);
  if(typeof o.sourceName!=="string"||!o.sourceName||o.sourceName.length>150)errors.push("Invalid source "+i);
  if(typeof o.sourceUrl!=="string"||!/^https:\/\/[^/]+/.test(o.sourceUrl)||o.sourceUrl.length>500)errors.push("Invalid official source URL "+i);
  if(typeof o.observationDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(o.observationDate)||Number.isNaN(Date.parse(o.observationDate)))errors.push("Invalid date "+i);
  if(typeof o.value!=="number"||!Number.isFinite(o.value))errors.push("Invalid numerical observation "+i);
  if(typeof o.unit!=="string"||o.unit.length>60)errors.push("Invalid unit "+i);
  if(Object.keys(o).some(k=>!["id","label","sourceName","sourceUrl","observationDate","value","unit","previousValue","changePct","retrievedAt","indicator"].includes(k)))errors.push("Unexpected/private field "+i);
 }
 return errors;
}
