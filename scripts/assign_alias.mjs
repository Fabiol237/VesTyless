async function assignAlias() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_6H4HA1J8AyndKzV7maECKeHsrdFY';
  const alias = 'ves-tyless.vercel.app';

  const res = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/aliases', {
    method: 'POST',
    headers: { 
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ alias })
  });
  const data = await res.json();
  console.log('Alias assigned: ' + JSON.stringify(data, null, 2));
}

assignAlias();
