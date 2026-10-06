import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const candidates = [
  // Fashion
  { ind: 'fashion', url: 'https://www.boohoo.com' },
  { ind: 'fashion', url: 'https://www.shein.com' },
  { ind: 'fashion', url: 'https://www.cos.com' },
  { ind: 'fashion', url: 'https://www.sezane.com' },
  // Restaurant
  { ind: 'restaurant', url: 'https://www.starbucks.com' },
  { ind: 'restaurant', url: 'https://www.mcdonalds.com' },
  { ind: 'restaurant', url: 'https://www.panerabread.com' },
  // Beauty
  { ind: 'beauty', url: 'https://www.thebodyshop.com' },
  { ind: 'beauty', url: 'https://www.kyliecosmetics.com' },
  { ind: 'beauty', url: 'https://www.fentybeauty.com' },
  { ind: 'beauty', url: 'https://www.maccosmetics.com' },
  { ind: 'beauty', url: 'https://www.sephora.com' },
  // Electronics
  { ind: 'electronics', url: 'https://www.dyson.com' },
  { ind: 'electronics', url: 'https://www.logitech.com' },
  { ind: 'electronics', url: 'https://www.corsair.com' },
  // Hotel
  { ind: 'hotel', url: 'https://www.hilton.com' },
  { ind: 'hotel', url: 'https://www.standardhotels.com' },
  { ind: 'hotel', url: 'https://www.fourseasons.com' },
];

async function runTest() {
  const apiKey = process.env.JINA_API_KEY;
  console.log('Testing focused candidate URLs (25s timeout)...\n');

  for (const item of candidates) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(`https://r.jina.ai/${item.url}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-With-Generated-Alt': 'true',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const lat = Date.now() - start;

      if (res.ok) {
        const json = await res.json();
        const content = json.data?.content || '';
        const title = (json.data?.title || '').slice(0, 35);
        if (content.length >= 300 && !/just a moment|access denied|track\/cmf/i.test(content.slice(0, 300))) {
          console.log(`✅ [${item.ind}] ${item.url} -> ${content.length} bytes (${lat}ms) | "${title}"`);
        } else {
          console.log(`⚠️ [${item.ind}] ${item.url} -> SHORT/BLOCKED (${content.length}b, ${lat}ms)`);
        }
      } else {
        console.log(`❌ [${item.ind}] ${item.url} -> HTTP ${res.status} (${lat}ms)`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.log(`❌ [${item.ind}] ${item.url} -> ERROR: ${err.message}`);
    }
  }
}

runTest().catch(console.error);
