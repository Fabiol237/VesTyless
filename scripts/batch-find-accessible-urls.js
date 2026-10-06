import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const candidates = {
  fashion: [
    'https://www.everlane.com',
    'https://www.uniqlo.com',
    'https://www.farfetch.com',
    'https://www.mango.com',
    'https://www.zara.com',
    'https://www.asos.com',
    'https://www.reformation.com',
    'https://www.patagonia.com',
    'https://www.gucci.com',
    'https://www.net-a-porter.com',
    'https://www.pacsun.com',
    'https://www.boohoo.com',
    'https://www.gymshark.com',
  ],
  restaurant: [
    'https://www.shakeshack.com',
    'https://www.bluebottlecoffee.com',
    'https://www.sweetgreen.com',
    'https://www.starbucks.com',
    'https://www.mcdonalds.com',
    'https://www.dominos.com',
    'https://www.chipotle.com',
    'https://www.subway.com',
    'https://www.panerabread.com',
  ],
  beauty: [
    'https://www.glossier.com',
    'https://www.aesop.com',
    'https://www.sephora.com',
    'https://www.lush.com',
    'https://www.thebodyshop.com',
    'https://www.kyliecosmetics.com',
    'https://www.maccosmetics.com',
    'https://www.fentybeauty.com',
    'https://www.kiehls.com',
  ],
  electronics: [
    'https://www.apple.com',
    'https://www.razer.com',
    'https://www.sonos.com',
    'https://www.logitech.com',
    'https://www.dyson.com',
    'https://www.bose.com',
    'https://www.anker.com',
    'https://www.corsair.com',
    'https://www.sony.com',
  ],
  hotel: [
    'https://www.aman.com',
    'https://www.marriott.com',
    'https://www.hilton.com',
    'https://www.hyatt.com',
    'https://www.citizenm.com',
    'https://www.fourseasons.com',
    'https://www.acehotel.com',
    'https://www.wyndhamhotels.com',
  ],
  services: [
    'https://www.stripe.com',
    'https://www.linear.app',
    'https://www.figma.com',
    'https://www.notion.so',
    'https://www.airbnb.com',
    'https://www.uber.com',
    'https://www.slack.com',
    'https://www.shopify.com',
    'https://www.squarespace.com',
  ],
  increment_test: [
    'https://www.cartier.com',
    'https://www.tiffany.com',
    'https://www.rolex.com',
    'https://www.vancleefarpels.com',
  ]
};

async function testFast() {
  const apiKey = process.env.JINA_API_KEY;
  console.log('Testing candidates rapidly...\n');
  const results = {};

  for (const [category, urls] of Object.entries(candidates)) {
    results[category] = [];
    console.log(`=== Category: ${category} ===`);
    for (const url of urls) {
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
          const content = json.data?.content || '';
          const title = json.data?.title || '';
          const isBlocked = content.length < 200 || /access denied|just a moment|security check|cloudflare|enable javascript/i.test(content.slice(0, 300));
          if (!isBlocked && content.length >= 300) {
            console.log(`  ✅ [${category}] ${url} | ${content.length} bytes (${lat}ms) | "${title.slice(0, 35)}"`);
            results[category].push({ url, title, length: content.length, latency: lat });
          } else {
            console.log(`  ⚠️ BLOCKED/SHORT: ${url} (${content.length}b, "${title.slice(0, 30)}")`);
          }
        } else {
          console.log(`  ❌ HTTP ${res.status}: ${url}`);
        }
      } catch (err) {
        console.log(`  ❌ ERR: ${url} (${err.message})`);
      }
    }
  }

  console.log('\n========================================');
  console.log('SELECTED ACCESSIBLE URLS:');
  console.log('========================================');
  for (const [category, list] of Object.entries(results)) {
    console.log(`\n${category.toUpperCase()} (${list.length} available):`);
    list.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.url} (${item.length}b, ${item.latency}ms) - "${item.title}"`);
    });
  }
}

testFast().catch(console.error);
