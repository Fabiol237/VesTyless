import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const testUrls = [
  'https://www.ssense.com',
  'https://www.farfetch.com',
  'https://www.sezane.com',
  'https://www.arket.com',
  'https://www.thefrenchlaundry.com',
  'https://www.shakeshack.com',
  'https://www.bluebottlecoffee.com',
  'https://www.noburestaurants.com',
  'https://www.glossier.com',
  'https://www.aesop.com',
  'https://www.sephora.com',
  'https://www.apple.com',
  'https://www.razer.com',
  'https://www.sonos.com',
  'https://www.aman.com',
  'https://www.fourseasons.com',
  'https://www.standardhotels.com',
  'https://www.stripe.com',
  'https://www.linear.app',
  'https://www.mckinsey.com',
  'https://www.cartier.com',
];

async function testAllUrls() {
  const apiKey = process.env.JINA_API_KEY;
  console.log('Testing Jina Reader on 21 URLs...');
  let liveCount = 0;

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const start = Date.now();
    try {
      const res = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-With-Generated-Alt': 'true',
        },
      });
      const lat = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        const contentLen = json.data?.content?.length || 0;
        const title = (json.data?.title || '').slice(0, 40);
        console.log(`[${i + 1}/${testUrls.length}] 200 OK (${lat}ms) | len: ${contentLen} | "${title}" -> ${url}`);
        if (contentLen > 50) liveCount++;
      } else {
        console.log(`[${i + 1}/${testUrls.length}] HTTP ${res.status} (${lat}ms) -> ${url}`);
      }
    } catch (err) {
      console.log(`[${i + 1}/${testUrls.length}] ERROR: ${err.message} -> ${url}`);
    }
  }

  console.log(`\nTOTAL SUCCESSFUL JINA LIVE FETCHES: ${liveCount}/${testUrls.length}`);
}

testAllUrls().catch(console.error);
