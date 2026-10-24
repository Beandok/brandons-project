import { focusedSources, guideFor, matchTopics, type Topic } from './topics';
export type Source = { id: string; title: string; author: string; year: string; kind: 'Scientific evidence' | "Ray Peat's position" | 'Community interpretation'; evidence: string; url: string; passage: string; tags: string[]; locator?: string };
// Original editorial summaries, not copied full text. Links do not imply indexing permission.
const initialSources: Source[] = [
 {id:'skin-2014',title:'Clinical Characteristics of Cholinergic Urticaria in Korea',author:'Kim et al.',year:'2014',kind:'Scientific evidence',evidence:'Human observational study',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4037671/',passage:'A clinical cohort describes cholinergic urticaria associated with increases in body temperature and triggers such as exercise. Trigger patterns help characterize the condition; they do not establish a diagnosis from a text description.',tags:['heat','hot','shower','hives','itch','skin','sweat','urticaria','exercise']},
 {id:'tau-2020',title:'Taurine chloramine selectively regulates neutrophil degranulation',author:'Kim et al.',year:'2020',kind:'Scientific evidence',evidence:'Experimental cell research',url:'https://pubmed.ncbi.nlm.nih.gov/32865666/',passage:'This experimental study investigated taurine chloramine and neutrophil degranulation, including myeloperoxidase and lactoferrin. A derivative acting in cells is not evidence that oral taurine treats heat-triggered hives.',tags:['taurine','inflammation','chloramine','neutrophil','skin']},
 {id:'tau-1995',title:'Taurine chloramine and macrophage inflammatory mediators',author:'Marcinkiewicz et al.',year:'1995',kind:'Scientific evidence',evidence:'In vitro research',url:'https://pubmed.ncbi.nlm.nih.gov/7499964/',passage:'Taurine chloramine reduced production of certain inflammatory mediators in vitro. These findings do not demonstrate a clinical effect of taurine supplementation or establish the cause of an individual response.',tags:['taurine','inflammation','chloramine','macrophage']},
 {id:'peat-autonomic',title:'Autonomic systems',author:'Ray Peat',year:'Undated article',kind:"Ray Peat's position",evidence:"Author's physiological interpretation",url:'https://raypeat.com/articles/other/autonomic-systems.shtml',locator:'Paragraphs beginning: When nutrition and thyroid function; Parasympathetic nerves, pituitary hormones and mast cells',passage:'Peat discusses estrogen-associated histamine release from ovarian mast cells and proposes that nutrition, thyroid function and environment influence autonomic signaling. This interpretive framework and ovarian observations do not establish the cause of skin hives or thyroid dysfunction in a reader.',tags:['peat','metabolism','stress','histamine','autonomic','energy','thyroid']},
];
export const sources: Source[] = [...initialSources, ...focusedSources];
export const directories = [ {name:'Bioenergetic.life',url:'https://bioenergetic.life',description:'Interview transcript discovery. Linked only; no transcripts or timestamps indexed.'}, {name:'Ray Peat’s articles',url:'https://raypeat.com/articles/',description:'Primary author articles, with original summaries and locators for the Peat passages used in each focused guide.'}, {name:'ReciPeats',url:'https://recipeats.org',description:'Community recipes. External browsing only; no recipe API or therapeutic meal claims.'} ];

export function rankSources(query:string):Source[] {
 const words=query.toLowerCase().match(/[a-z]{3,}/g)||[];
 const ranked=sources.map(source=>({source,score:words.reduce((n,w)=>n+(source.tags.includes(w)?3:0)+(source.title.toLowerCase().includes(w)?1:0),0)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).map(r=>r.source);
 const guide=guideFor(query);
 const selected=guide?guide.sourceIds.map(id=>sources.find(s=>s.id===id)!):[];
 return selected.length?selected:ranked.slice(0,8);
}
export type Answer = {mode:string;overview:string;peat?:string;clinical?:string;limits?:string;questions:string[];considerations:string[];sources:Source[];urgent?:boolean;focused:boolean;topic?:Topic;comparison?:string};
export function safetyConcern(query:string) {
 const text=query.toLowerCase().replace(/\b(no|without|denies?|not experiencing)\s+(?:any\s+)?(?:trouble breathing|difficulty breathing|chest pain|throat swelling|fainting|severe pain|severe pelvic pain)\b/g,'');
 return /can['\u2019]?t breathe|cannot breathe|trouble breathing|difficulty breathing|throat.{0,15}swelling|swelling.{0,15}throat|severe chest pain|passed out|fainting|overdos|suicid/.test(text)||(matchTopics(query).includes('cramps')&&/sudden.{0,15}severe|severe.{0,15}(?:pelvic|abdominal|uter|pain)|(?:pelvic|abdominal).{0,15}severe|shoulder.{0,8}pain/.test(text));
}
export function pregnancyConcern(query:string) {
 const text=query.toLowerCase().replace(/\b(?:not pregnant|no (?:chance|possibility) of pregnancy|pregnancy (?:is )?(?:not possible|ruled out))\b/g,'');
 return /pregnan|positive.{0,12}test|missed.{0,6}period/.test(text)&&/cramp|pelvic|abdominal pain|bleeding/.test(text);
}
export function curatedAnswer(query:string):Answer {
 if(safetyConcern(query)) return {mode:'Safety guidance',overview:'If these symptoms are happening now, especially trouble breathing, throat swelling, fainting or sudden severe pelvic pain, seek emergency medical help now. Do not wait for a research response. If you meant a past event, clarify that after you are safe.',questions:[],considerations:[],sources:[],urgent:true,focused:false};
 if(pregnancyConcern(query)) return {mode:'Prompt clinical assessment',overview:'If pregnancy is possible and you have pelvic pain, cramping or bleeding, seek prompt medical assessment today. Sudden severe pain, shoulder pain, dizziness or fainting needs emergency care. Do not assume this is ordinary period pain. [pelvic-safety]',questions:[],considerations:[],sources:sources.filter(s=>s.id==='pelvic-safety'),urgent:true,focused:false};
 const guide=guideFor(query);
 if(!guide) return {mode:'Focused library; no live AI',overview:matchTopics(query).length>1?'This spans more than one focused topic. Choose one concern first so we do not incorrectly force several symptoms into one hormone explanation.':'The prepared library currently covers hair loss, urticaria and menstrual or uterine cramping. There is not enough indexed evidence to explain this concern reliably yet.',questions:['Which one concern would you like to explore first?'],considerations:[],sources:rankSources(query),focused:false};
 return {mode:'Prepared source-grounded guide; not live AI',topic:guide.id,focused:true,overview:guide.overview,peat:guide.peat,clinical:guide.clinical,limits:guide.limits,questions:guide.questions,considerations:guide.considerations,sources:rankSources(query)};
}
