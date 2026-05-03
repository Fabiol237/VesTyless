async function checkAndAlias() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_2hcr7X1uDHdgnPmRHmn4PgbPKxqo';
  const alias = 'ves-tyless.vercel.app';

  const res = await fetch('https://api.vercel.com/v13/deployments/' + deployId, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const deploy = await res.json();
  console.log('Status: ' + deploy.readyState);

  if (deploy.readyState === 'READY') {
    console.log('✅ READY! Assigning alias...');
    const aliasRes = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/aliases', {
      method: 'POST',
      headers: { 
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ alias })
    });
    const aliasData = await aliasRes.json();
    console.log('Alias Result: ' + JSON.stringify(aliasData, null, 2));
  }
}

checkAndAlias();
