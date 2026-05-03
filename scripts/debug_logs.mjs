async function getLogs() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_2hcr7X1uDHdgnPmRHmn4PgbPKxqo';

  const res = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/events', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data).substring(0, 500));
}

getLogs();
