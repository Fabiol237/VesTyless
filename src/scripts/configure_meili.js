const { createClient } = require('@supabase/supabase-js');

async function configure() {
  const { Meilisearch } = await import('meilisearch');
  const ms = new Meilisearch({ 
    host: 'https://ms-8dae386d9adc-46848.fra.meilisearch.io', 
    apiKey: 'b266e79052658faf1e1a20c7e846c98cffff1225' 
  });
  
  const index = ms.index('products');
  
  console.log('Updating Meilisearch settings...');
  const task = await index.updateSettings({
    searchableAttributes: ['name', 'description', 'store_name', 'category_id'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 3,
        twoTypos: 7
      }
    },
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]
  });
  
  console.log('Settings update task submitted:', task);
}

configure();
