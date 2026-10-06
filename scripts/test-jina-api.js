import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testJina() {
  const apiKey = process.env.JINA_API_KEY;
  console.log('Jina API key configured:', !!apiKey);

  console.log('1. Testing Jina Reader on https://example.com...');
  const resReader = await fetch('https://r.jina.ai/https://example.com', {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  console.log('Reader status:', resReader.status);
  const jsonReader = await resReader.json();
  console.log('Reader title:', jsonReader.data?.title);
  console.log('Reader content preview:', (jsonReader.data?.content || '').slice(0, 100));

  console.log('2. Testing Jina Embeddings...');
  const resEmb = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'jina-clip-v2',
      dimensions: 1024,
      normalized: true,
      embedding_type: 'float',
      input: ['Test design embedding editorial minimal typography'],
    }),
  });
  console.log('Embeddings status:', resEmb.status);
  const jsonEmb = await resEmb.json();
  console.log('Embedding dimension:', jsonEmb.data?.[0]?.embedding?.length);
}

testJina().catch((e) => console.error(e));
