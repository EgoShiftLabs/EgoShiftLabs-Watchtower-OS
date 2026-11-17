import {esc,safeUrl,freshness} from "./core.js";
import {normalizePoints,historyStats,sparkline,safeSeries} from "./analytics.js";
// All text and sources are escaped. This module displays public observations or explicit owner-entered hypotheses.
const p=x=>esc(x??"");
const label=(name,type="muted")=>'<span class="tag '+type+'">'+p(name)+'</span>';
const stat=(title,value,sub)=>'<div class="stat"><div class="stat-label">'+p(title)+'</div><div class="stat-value">'+p(value)+'</div><div class="stat-help">'+p(sub)+'</div></div>';
const empty=msg=>'<div class="empty">'+msg+'</div>';
const link=(url,text)=>safeUrl(url)?'<a class="text-link" target="_blank" rel="noopener noreferrer" href="'+p(safeUrl(url))+'">'+p(text)+' ↗</a>':"Source not provided";
function status(history){return history?.status==="active"?"ACTIVE HISTORICAL DATA":"NOT CONFIGURED";}
function numeric(n,unit=""){return typeof n==="number"&&Number.isFinite(n)?n.toLocaleString("en-US",{maximumFractionDigits:4})+(unit?" "+unit:""):"—";}
function graph(s){
 const coords=sparkline(s.points,540,160);
 if(!coords)return empty("At least two valid dated observations are required.");
 const pts=normalizePoints(s.points),min=Math.min(...pts.map(x=>x.value)),max=Math.max(...pts.map(x=>x.value));
 return '<div class="intel-graph" role="group" aria-label="Historical observation chart"><svg viewBox="0 0 540 160" role="img" aria-label="'+p(s.label)+' historical trend, '+pts.length+' observations; minimum '+p(numeric(min))+', maximum '+p(numeric(max))+'"><line x1="0" y1="152" x2="540" y2="152" stroke="#355265" stroke-width="1"/><polyline points="'+coords+'" fill="none" stroke="#77e6ca" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="graph-caption"><span>'+p(pts[0].date)+'</span><span>'+p(pts.at(-1).date)+'</span></div></div>';
}
function analyticsCard(s){
 const st=historyStats(s.points,7);
 const back=st.backtest||{};
 return '<section class="panel"><div class="panel-title"><h2>'+p(s.label)+'</h2>'+label("DESCRIPTIVE, NOT PREDICTIVE","amber")+'</div><div class="badge-row">'+label(p(s.sourceName),"green")+label(p(s.unit))+'</div>'+graph(s)+
 '<div class="grid three mt">'+stat("LATEST VALUE",numeric(st.latest?.value,s.unit),st.latest?.date||"No observations")+
 stat("RECENT CHANGE",st.changePct===null?"—":numeric(st.changePct,"%"),"Change from previous observed point")+
 stat("7-OBS MEAN",numeric(st.rollingMean,s.unit),"Trailing arithmetic mean")+'</div>'+
 '<div class="grid three mt">'+stat("RETURN VOLATILITY",numeric(st.volatility,"%"),"Std. dev. of last 20 observed changes")+
 stat("PERSISTENCE MAE",numeric(back.persistenceMae,s.unit),"One-step historical absolute error")+
 stat("ROLLING MEAN MAE",numeric(back.rollingMae,s.unit),"One-step 7-observation error")+'</div>'+
 '<div class="intel-note mt">Walk-forward evaluated on '+p(back.count||0)+' historical points. Both baselines use only preceding observations, with no model fitting or future information. Lower MAE is better on THIS series and evaluation window; neither baseline is an investment probability.</div>'+
 '<p class="small mt">Source: '+link(s.sourceUrl,s.sourceName)+' · '+p(s.frequency||"observational")+' · '+p(s.method||"Original dated public observations")+'</p></section>';
}
export function renderPatterns(history,selectedId,localOil){
 const raw=history?.series||[],series=raw.filter(s=>safeSeries(s));
 if(localOil?.points?.length>2)series.push({id:"local-oil-csv",label:"Imported oil-price observations (self-supplied)",unit:"USD/barrel",frequency:"supplied dates",sourceName:"Unverified local CSV",sourceUrl:"https://www.eia.gov/opendata/",points:localOil.points,method:"User-supplied import; provenance and units unverified"});
 const choice=series.find(s=>s.id===selectedId)||series[0];
 return '<section class="intel-header"><div><div class="eyebrow">WATCHTOWER / HISTORICAL PATTERN ENGINE</div><h1>Pattern Lab.</h1><p>Inspect actual dated historical series and test two simple, transparent, one-step baselines. No machine-generated event probabilities.</p></div></section>'+
 '<div class="note warning"><b>ANALYSIS ≠ FORECAST:</b> Trends, volatility and walk-forward historical errors describe past data. A low historical error does not ensure future reliability. Comparisons across unrelated indicators are not causal proof.</div>'+
 '<div class="grid two mt"><section class="panel"><h2>Choose a source series</h2><p class="panel-sub">Historical observations fetched by GitHub Actions. The collector does not access private journal records.</p><select class="select mt" id="patternSeries" aria-label="Select historical series">'+series.map(s=>'<option value="'+p(s.id)+'" '+(s.id===choice?.id?"selected":"")+'>'+p(s.label)+'</option>').join("")+'</select><p class="small mt">Collection status: '+p(status(history))+' · Last fetch: '+p(history?.retrievedAt||"No completed collection")+'</p></section>'+
 '<section class="panel"><h2>What is being tested?</h2><div class="kv"><span>Persistence</span><strong>Next = previous observation</strong></div><div class="kv"><span>Rolling mean</span><strong>Next = mean of previous 7</strong></div><div class="kv"><span>Evaluation</span><strong>Walk-forward one step; MAE</strong></div><div class="kv"><span>Calibrated probabilities</span><strong>None</strong></div></section></div>'+
 '<div class="mt">'+(choice?analyticsCard(choice):empty("No historical series has been published yet. The official-source collector must complete successfully."))+'</div>';
}
export function renderEnergy(history,localOil){
 const e=history?.energy||{status:"needs_key"};
 const energySource=history?.series?.find(x=>x.id==="eia-wti-spot");
 const pub=e.status==="active"&&energySource&&safeSeries(energySource);
 const manual=localOil?.points?.length>=3?{id:"local-oil-csv",label:"WTI or oil prices: manually imported CSV",unit:"USD/barrel",sourceName:"Unverified user-supplied CSV",sourceUrl:"https://www.eia.gov/opendata/",points:localOil.points,frequency:"local dated observations",method:"User-provided prices not independently verified"}:null;
 const active=pub?energySource:manual;
 const config=e.status==="active"?"LIVE EIA SERIES":e.status==="stale"?"LAST KNOWN EIA HISTORY · STALE":e.status==="source_error"?"EIA FETCH FAILED": "EIA KEY NOT CONFIGURED";
 return '<section class="intel-header"><div><div class="eyebrow">ENERGY WATCH / PETROLEUM DATA</div><h1>Energy Market Watch.</h1><p>Track official WTI spot-price history when configured, or analyze your own dated CSV locally. Do not confuse crude prices with energy company share prices.</p></div></section>'+
 '<div class="note warning"><b>SUPPLY & DEMAND RESEARCH ONLY:</b> No current EIA WTI series is shown unless the source was successfully fetched. Historical changes do not imply individual oil stocks will rise or fall.</div>'+
 '<div class="grid two mt"><section class="panel"><div class="panel-title"><h2>EIA WTI connector</h2>'+label(config,pub?"green":"amber")+'</div><p class="panel-sub">'+p(e.note||"EIA API v2 requires a key configured in GitHub Actions secrets.")+'</p><div class="kv"><span>Original publisher</span><strong>U.S. Energy Information Administration</strong></div><div class="kv"><span>Oil benchmark</span><strong>WTI Cushing spot ($/barrel)</strong></div><div class="kv"><span>Last EIA fetch</span><strong>'+p(e.lastRetrievedAt||"Not connected")+'</strong></div><p class="small mt">'+link("https://www.eia.gov/opendata/register.php","Register for a free EIA API key")+' · '+link("https://github.com/EgoShiftLabs/EgoShiftLabs-Watchtower-OS/settings/secrets/actions","Add EIA_API_KEY in repository secrets")+'</p></section>'+
 '<section class="panel"><h2>Analyze without credentials</h2><p class="panel-sub">Download public oil-price CSV from a legitimate source and import exactly two columns: <code>date,value</code>, one YYYY-MM-DD and positive USD/barrel value per line. This CSV stays on your device. Treat supplied data as unverified.</p><label class="btn btn-primary mt" for="oilCsv">Import local oil-price CSV</label><input class="file-input" type="file" id="oilCsv" accept=".csv,text/csv"><p class="small mt">No trades, brokerage access or market advice. Only dated arithmetic and historical baseline comparison.</p></section></div>'+
 (active?'<div class="mt">'+analyticsCard(active)+'</div>':empty("No actual WTI historical prices available. Add an EIA API key to activate automatic ingestion, or import a dated public-price CSV to analyze locally."))+
 '<div class="panel mt"><h2>Energy research checklist</h2><p class="panel-sub">Compare crude supply, inventories, consumption, OPEC policy, shipping disruption and the dollar as distinct pieces of evidence. Watchtower does not yet fetch all these factors and cannot estimate a statistically calibrated 90-day oil-price probability.</p><div class="badge-row">'+label("SUPPLY / HYPOTHESIS")+label("DEMAND / HYPOTHESIS")+label("STOCKS ≠ COMMODITY")+label("INVESTMENT DECISION / USER")+'</div></div>';
}
const LINKS=[
 {cause:"Crude supply interruption",effect:"Possible crude-price pressure",mechanism:"At unchanged demand, reduced available supply may increase prices; inventories and substitute supply matter.",source:"https://www.eia.gov/finance/markets/crudeoil/supply-opec.php",domain:"Energy"},
 {cause:"Global economic activity",effect:"Oil demand changes",mechanism:"Industrial output and transport demand can alter consumption; direction and lag vary across periods.",source:"https://www.eia.gov/finance/markets/crudeoil/demand-nonoecd.php",domain:"Economy"},
 {cause:"Elevated crude prices",effect:"Potential transportation fuel costs",mechanism:"Crude is one component of refined fuel prices; taxes, refining and distribution add independent effects.",source:"https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php",domain:"Supply chains"}
];
export function renderCausal(localLinks,feed){
 const all=[...LINKS.map((x,i)=>({...x,id:"example-"+i,demo:true})),...(Array.isArray(localLinks)?localLinks:[]).map(x=>({...x,demo:false}))];
 return '<section class="intel-header"><div><div class="eyebrow">CROSS-DOMAIN / CAUSAL HYPOTHESIS MAP</div><h1>Causal Map.</h1><p>Study potential first- and second-order mechanisms, with source links and competing explanations. Explicitly distinguish observed data from hypotheses.</p></div><div class="head-actions"><button class="btn btn-primary" type="button" data-action="add-causal">＋ New hypothesis</button></div></section>'+
 '<div class="note warning"><b>NOT AUTOMATIC CAUSAL INFERENCE:</b> Every connection here is a hypothesis to test—not proof that a relationship currently holds. Official time series below are separate observations and cannot validate a causal link by themselves.</div>'+
 '<div class="grid three mt">'+all.map(x=>'<article class="panel causal-card"><div class="badge-row">'+label(x.demo?"RESEARCH TEMPLATE":"OWNER HYPOTHESIS",x.demo?"muted":"amber")+' '+label(x.domain||"Research")+'</div><div class="causal-nodes"><div class="causal-node">'+p(x.cause)+'</div><div class="causal-arrow">↓ Potential mechanism ↓</div><div class="causal-node">'+p(x.effect)+'</div></div><p class="panel-sub">'+p(x.mechanism)+'</p>'+(x.falsifier?'<p class="small"><b>Disconfirming signal:</b> '+p(x.falsifier)+'</p>':"")+'<p class="small">'+link(x.source||x.sourceUrl,"Research source")+'</p></article>').join("")+'</div>'+
 '<section class="panel mt"><div class="panel-title"><h2>Separate observed evidence</h2>'+label("NO AUTOMATIC CONNECTIONS","amber")+'</div>'+
 '<p class="panel-sub">These sourced observations can motivate further investigation, but Watchtower does not infer cause and effect from their coincidence.</p>'+
 '<div class="grid two">'+(feed?.observations||[]).slice(0,4).map(o=>'<div class="item"><div class="item-body"><h3>'+p(o.label)+'</h3><p>'+p(o.value)+' '+p(o.unit)+' · '+p(o.observationDate)+'</p><p>'+link(o.sourceUrl,"Original public record")+'</p></div></div>').join("")+'</div></section>';
}
export function renderChief(brief,history,liveRecords,demoMode){
 const active=brief?.status==="public-only";
 const publicRows=active?brief.items||[]:[];
 const local=!demoMode&&liveRecords?liveRecords:{decisions:[],forecasts:[],projects:[]};
 const due=(local.decisions||[]).filter(x=>x.status==="open"&&x.reviewDate&&x.reviewDate<=new Date().toISOString().slice(0,10)).slice(0,10);
 const overdue=(local.forecasts||[]).filter(x=>x.status==="open"&&x.targetDate&&x.targetDate<new Date().toISOString().slice(0,10)).slice(0,10);
 return '<section class="intel-header"><div><div class="eyebrow">CHIEF / SOURCE-BACKED EXECUTIVE SUMMARY</div><h1>Intelligence Brief.</h1><p>A deterministic, sourced weekly-style briefing of public observations plus optional LOCAL decision reminders. CHIEF is not currently an AI inference agent.</p></div><div class="head-actions"><button class="btn btn-primary" type="button" data-action="export-chief">↓ Export briefing</button></div></section>'+
 '<div class="note"><b>AUTOMATIC PUBLIC BRIEF:</b> The GitHub collector summarizes observed numerical changes and simple baseline evaluation. Your browser-local forecasts and decisions are added only on this device when you view or export the briefing; they are never sent to the public repository.</div>'+
 '<div class="grid three mt">'+stat("PUBLIC OBSERVATIONS",String(publicRows.length),"Source-backed numerical records")+stat("LOCAL DECISIONS DUE",String(due.length),"Private browser-only reminders")+stat("LOCAL OVERDUE FORECASTS",String(overdue.length),"Unresolved process backlog")+'</div>'+
 '<div class="grid wide-split mt"><section class="panel"><div class="panel-title"><h2>Official changes</h2>'+label(active?"RULE-GENERATED":"NOT YET AVAILABLE",active?"green":"amber")+'</div><p class="small">Generated: '+p(brief?.generatedAt||"No valid public brief")+'</p>'+
 (publicRows.length?'<div class="card-list mt">'+publicRows.slice(0,10).map(x=>'<div class="item"><div class="item-body"><h3>'+p(x.title)+'</h3><p>'+p(x.finding)+'</p><p class="item-meta">'+p(x.observationDate)+' · '+link(x.sourceUrl,x.sourceName)+'</p></div></div>').join("")+'</div>':empty("The official collector has not yet published an active CHIEF public brief."))+'</section>'+
 '<section class="panel"><h2>Local decision queue</h2><p class="panel-sub">Data shown here only comes from your current browser workspace. No automatic server access.</p>'+
 (due.length?due.map(x=>'<div class="kv"><span>'+p(x.title)+'</span><strong>'+p(x.reviewDate)+'</strong></div>').join(""):empty(demoMode?"Switch to LOCAL WORKSPACE for your private decision queue.":"No decisions due."))+
 '<h3 class="mt">Overdue forecast outcomes</h3>'+(overdue.length?overdue.map(x=>'<div class="kv"><span>'+p(x.question)+'</span><strong>'+p(x.targetDate)+'</strong></div>').join(""):empty("No overdue local forecasts."))+'</section></div>'+
 '<div class="panel mt"><h2>CHIEF questions worth answering</h2><div class="card-list">'+(brief?.researchQuestions||[]).map((q,i)=>'<div class="item"><div class="item-body"><span class="mini-label">CHECK '+String(i+1).padStart(2,"0")+'</span><p>'+p(q)+'</p></div></div>').join("")+'</div><p class="small mt">CHIEF cannot independently determine why an indicator moved. That requires sourced research, causal testing and human review.</p></div>';
}
export function chiefMarkdown(brief,history,workspace){
 const lines=["# CHIEF — Intelligence Brief","Generated locally: "+new Date().toISOString(),"Source: Watchtower OS static public data + optional local browser entries","","> Public observations are not automated predictions, investment advice, or causal proof.",""];
 for(const o of brief?.items||[]){lines.push("## "+o.title,"- Observation: "+o.finding,"- Date: "+o.observationDate,"- Original source: "+o.sourceUrl,"");}
 lines.push("## Historical baseline checks");
 for(const x of brief?.baselines||[]){lines.push("- "+x.id+": "+x.historyCount+" points; persistence MAE "+(x.persistenceMae??"n/a")+"; rolling MAE "+(x.rollingMae??"n/a")+"; evaluated "+(x.evaluationCount??0)+" steps");}
 lines.push("","## Local decision checkpoints (not uploaded)");
 for(const x of workspace?.decisions||[])if(x.status==="open")lines.push("- "+x.title+" · review "+(x.reviewDate||"unscheduled")+" · "+(x.nextAction||""));
 lines.push("","## Local overdue forecasts (not uploaded)");
 for(const x of workspace?.forecasts||[])if(x.status==="open"&&x.targetDate&&x.targetDate<new Date().toISOString().slice(0,10))lines.push("- "+x.question+" · deadline "+x.targetDate);
 lines.push("","## Open research questions",...(brief?.researchQuestions||[]).map(x=>"- "+x),"","## Limitations",...(brief?.limitations||[]).map(x=>"- "+x));
 return lines.join("\n");
}
