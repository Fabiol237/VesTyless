async function setEnvs() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectId = 'prj_9SVO9yOTiBbABaqQvEgELDpvdBCc';
  
  const envs = [
    { key: 'NEXT_PUBLIC_MEILISEARCH_HOST', value: 'https://ms-8dae386d9adc-46848.fra.meilisearch.io' },
    { key: 'NEXT_PUBLIC_MEILISEARCH_API_KEY', value: 'b266e79052658faf1e1a20c7e846c98cffff1225' },
    { key: 'NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY', value: '50a6e7fc4e49e2f9c46af151b858239bd2cb04040f40ab31cb0787e43cae37f6' }
  ];

  for (const env of envs) {
    console.log('Adding ' + env.key + '...');
    const res = await fetch('https://api.vercel.com/v10/projects/' + projectId + '/env', {
      method: 'POST',
      headers: { 
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: env.key,
        value: env.value,
        type: 'plain',
        target: ['production', 'preview', 'development']
      })
    });
    console.log(env.key + ' status: ' + res.status);
  }
}

setEnvs();
