import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const testCandidates = [
  // Fashion
  { ind: 'fashion', url: 'https://www.gymshark.com' },
  { ind: 'fashion', url: 'https://www.patagonia.com' },
  { ind: 'fashion', url: 'https://www.pacsun.com' },
  { ind: 'fashion', url: 'https://www.net-a-porter.com' },
  // Restaurant
  { ind: 'restaurant', url: 'https://www.starbucks.com' },
  { ind: 'restaurant', url: 'https://www.mcdonalds.com' },
  { ind: 'restaurant', url: 'https://www.panerabread.com' },
  { ind: 'restaurant', url: 'https://www.subway.com' },
  // Beauty
  { ind: 'beauty', url: 'https://www.thebodyshop.com' },
  { ind: 'beauty', url: 'https://www.kyliecosmetics.com' },
  { ind: 'beauty', url: 'https://www.fentybeauty.com' },
  { ind: 'beauty', url: 'https://www.maccosmetics.com' },
  // Electronics
  { ind: 'electronics', url: 'https://www.dyson.com' },
  { ind: 'electronics', url: 'https://www.logitech.com' },
  { ind: 'electronics', url: 'https://www.anker.com' },
  { ind: 'electronics', url: 'https://www.corsair.com' },
  // Hotel
  { ind: 'hotel', url: 'https://www.hilton.com' },
  { ind: 'hotel', url: 'https://www.hyatt.com' },
  { ind: 'hotel', url: 'https://www.wyndhamhotels.com' },
  { ind: 'hotel', url: 'https://www.standardhotels.com' },
];

async function testReplacements() {
  const apiKey = process.env.JINA_API_KEY;
  console.log('Testing candidates for replacements...\n');
  for (const item of testCandidates) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
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
        if (content.length >= 500 && !/just a moment|access denied|track\/cmf/i.test(content.slice(0, 300))) {
          console.log(`✅ [${item.ind}] ${item.url} -> ${content.length}b (${lat}ms) | "${title}"`);
        } else {
          console.log(`⚠️ [${item.ind}] ${item.url} -> SHORT/BLOCKED (${content.length}b, ${lat}ms)`);
        }
      } else {
        console.log(`❌ [${item.ind}] ${item.url} -> HTTP ${res.status}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.log(`❌ [${item.ind}] ${item.url} -> ${err.message}`);
    }
  }
}

testReplacements().catch(console.error);
