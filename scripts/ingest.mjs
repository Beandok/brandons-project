// Run: node --env-file=.env.local scripts/ingest.mjs approved-documents.json
// Input: array of {id,title,author,year,kind,evidence,url,passage,tags,permission}.
// permission must be "original-summary", "licensed", or "public-domain".
import fs from 'node:fs/promises';
import postgres from 'postgres';
const path=process.argv[2];
if(!path||!process.env.DATABASE_URL||!process.env.OPENAI_API_KEY) throw new Error('Supply an approved JSON file, DATABASE_URL and OPENAI_API_KEY');
const docs=JSON.parse(await fs.readFile(path,'utf8'));
if(!Array.isArray(docs)||docs.length>200) throw new Error('Expected an array of at most 200 passages');
const sql=postgres(process.env.DATABASE_URL,{prepare:false,max:1});
try {
 await sql.unsafe(await fs.readFile(new URL('../data/schema.sql',import.meta.url),'utf8'));
 for(const doc of docs) {
 if(!['original-summary','licensed','public-domain'].includes(doc.permission)||!doc.id||!doc.passage||!doc.title||!doc.author||!doc.evidence||!Array.isArray(doc.tags)||!['Scientific evidence','Ray Peat’s position','Community interpretation'].includes(doc.kind)||!doc.url?.startsWith('https://')) throw new Error('Invalid source metadata or missing permission');
 const response=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'text-embedding-3-small',input:doc.passage})});
 if(!response.ok) throw new Error(`Embedding failed: ${response.status}`);
 const result=await response.json();
 await sql`INSERT INTO research_passages (id,passage,metadata,embedding) VALUES (${doc.id},${doc.passage},${sql.json(doc)},${JSON.stringify(result.data[0].embedding)}::vector) ON CONFLICT(id) DO UPDATE SET passage=EXCLUDED.passage,metadata=EXCLUDED.metadata,embedding=EXCLUDED.embedding`;
 }
 console.log(`Indexed ${docs.length} approved passages`);
} finally {await sql.end();}
