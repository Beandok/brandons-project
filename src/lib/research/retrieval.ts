import postgres from 'postgres';
import { rankSources, type Source } from './sources';
export async function retrieve(query:string): Promise<Source[]> {
 if(!process.env.DATABASE_URL || !process.env.OPENAI_API_KEY) return rankSources(query);
 const response=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'text-embedding-3-small',input:query})});
 if(!response.ok) throw new Error('Embedding service unavailable');
 const data=await response.json();const vector=JSON.stringify(data.data[0].embedding);
 const sql=postgres(process.env.DATABASE_URL,{prepare:false,max:1,connect_timeout:8});
 try {
 const rows=await sql`WITH semantic AS (SELECT id, row_number() OVER (ORDER BY embedding <=> ${vector}::vector) AS rank FROM research_passages WHERE embedding IS NOT NULL ORDER BY embedding <=> ${vector}::vector LIMIT 12), keyword AS (SELECT id, row_number() OVER (ORDER BY ts_rank(search, plainto_tsquery('english', ${query})) DESC) AS rank FROM research_passages WHERE search @@ plainto_tsquery('english', ${query}) LIMIT 12) SELECT p.metadata, COALESCE(1.0/(60+s.rank),0)+COALESCE(1.0/(60+k.rank),0) AS score FROM research_passages p LEFT JOIN semantic s USING(id) LEFT JOIN keyword k USING(id) WHERE s.id IS NOT NULL OR k.id IS NOT NULL ORDER BY score DESC LIMIT 4`;
 return rows.map(r=>r.metadata as Source);
 } finally {await sql.end();}
}
