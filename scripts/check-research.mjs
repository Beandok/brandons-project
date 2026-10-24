import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
const compile=(source)=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=(source)=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const topicsUrl=url(compile(await fs.readFile('src/lib/research/topics.ts','utf8')));
const sourcesUrl=url(compile(await fs.readFile('src/lib/research/sources.ts','utf8')).replace("'./topics'",JSON.stringify(topicsUrl)));
const {sources,curatedAnswer,rankSources,safetyConcern,pregnancyConcern}=await import(sourcesUrl);
const {guides,guideFor}=await import(topicsUrl);
let checks=0;function check(value){assert(value);checks++;}
for(const [query,topic] of [['hairloss','hair'],['my hair is falling out','hair'],['hair loss and itchy scalp','hair'],['hives after hot shower','urticaria'],['chronic urticaria','urticaria'],['uterus cramping','cramps'],['painful period cramps','cramps']])check(guideFor(query)?.id===topic);
check(!guideFor('leg cramps after running'));
check(guideFor('hair loss around my period')?.id==='hair');
check(guideFor('hives before my period')?.id==='urticaria');
check(guideFor('receding hairline at my temples')?.mechanismTitle.includes('Pattern thinning'));
check(guideFor('chronic spontaneous hives')?.nodes[0].name==='Trigger or no trigger');
check(!safetyConcern('period cramps but no severe pain'));
check(!guideFor('hair loss and hives'));
check(!curatedAnswer('headache').focused);
check(!curatedAnswer('hair loss and hives').focused);
check(safetyConcern('hives and trouble breathing'));
check(safetyConcern('severe pelvic pain now'));
check(!safetyConcern('itching, no trouble breathing'));
check(pregnancyConcern('I might be pregnant and have cramps'));
check(!pregnancyConcern('I am not pregnant and have period cramps'));
check(curatedAnswer('I might be pregnant and have cramps').urgent);
for(const guide of guides){
 const answer=curatedAnswer(guide.prompt);
 check(answer.topic===guide.id);
 check(answer.sources.some(s=>s.kind==="Ray Peat's position"));
 check(answer.sources.some(s=>s.kind==='Scientific evidence'));
 for(const text of [guide.overview,guide.peat,guide.clinical,guide.limits,...guide.considerations,...guide.alternatives.map(a=>a.text)]){
  for(const match of text.matchAll(/\[([^\]]+)\]/g))check(answer.sources.some(s=>s.id===match[1]));
 }
 for(const node of guide.nodes)check(node.sourceIds.every(id=>answer.sources.some(s=>s.id===id)));
 check(answer.questions.length<=2);
}
check(new Set(sources.map(s=>s.id)).size===sources.length);
check(sources.every(s=>new URL(s.url).protocol==='https:'));
check(sources.filter(s=>s.kind==="Ray Peat's position").every(s=>s.locator));
check(rankSources('hairloss').some(s=>s.id==='peat-hair'));
check(rankSources('uterus cramping').some(s=>s.id==='cramps-review'));
// Exercise the real route without a network socket. Stub only retrieval/provider boundaries.
const retrievalUrl=url(`import {rankSources} from ${JSON.stringify(sourcesUrl)}; export async function retrieve(q){return rankSources(q);}`);
const routeJs=compile(await fs.readFile('src/app/api/research/route.ts','utf8')).replace("'@/lib/research/sources'",JSON.stringify(sourcesUrl)).replace("'@/lib/research/topics'",JSON.stringify(topicsUrl)).replace("'@/lib/research/retrieval'",JSON.stringify(retrievalUrl));
const {POST}=await import(url(routeJs));
const post=(body)=>POST(new Request('http://test.local/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
const priorKey=process.env.OPENAI_API_KEY;const originalFetch=globalThis.fetch;
try{
 delete process.env.OPENAI_API_KEY;
 for(const guide of guides){const response=await post({message:guide.prompt});check(response.status===200);check((await response.json()).topic===guide.id);}
 check((await post(null)).status===400);
 check((await post({message:'hi'})).status===400);
 check((await post({message:'a'.repeat(4001)})).status===400);
 check((await post({message:'hairloss',comparison:123})).status===400);
 check((await (await post({message:'hairloss',comparison:'PeatBot says it must be thyroid.'})).json()).comparison.includes('does not evaluate'));
 process.env.OPENAI_API_KEY='test-placeholder';
 let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({choices:[{message:{content:JSON.stringify({overview:'A pattern matters. [hair-causes]',peat:'A proposed interpretation. [peat-hair]',clinical:'Compare shedding and pattern loss. [hair-shedding]',limits:'Not a diagnosis. [hair-causes]',questions:['What is the pattern?'],considerations:['Discuss a scalp assessment. [hair-causes]'],comparison:''})}}]});};
 const live=await (await post({message:'hairloss'})).json();check(live.mode.startsWith('AI synthesis'));
 check((await (await post({message:'hives and trouble breathing'})).json()).urgent);check(calls===1);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({overview:'Claim [invented]',peat:'Claim [peat-hair]',clinical:'Claim [hair-causes]',limits:'Claim [hair-causes]',questions:[],considerations:[]})}}]});
 check((await (await post({message:'hairloss'})).json()).mode.includes('unavailable'));
 globalThis.fetch=async()=>{throw new Error('Provider offline');};
 check((await (await post({message:'uterus cramping'})).json()).topic==='cramps');
}finally{globalThis.fetch=originalFetch;if(priorKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=priorKey;}
if(process.argv.includes('--export-seed'))await fs.writeFile('data/approved-documents.json',JSON.stringify(sources.map(s=>({...s,permission:'original-summary',reviewed:'2026-10-24'})),null,2));
console.log(`${checks} research checks passed: routing, evidence coverage, citation integrity, context isolation, safety gates, live-response validation and provider fallback.`);
