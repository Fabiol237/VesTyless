async function getLogs() {
  const token = '';
  const deployId = 'dpl_2hcr7X1uDHdgnPmRHmn4PgbPKxqo';

  const res = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/events', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const logs = await res.json();
  
  // Find where the error occurred
  const lastLogs = logs.slice(-50);
  lastLogs.forEach(l => {
    if (l.payload && l.payload.text) {
      console.log(l.payload.text);
    }
  });
}

// Fixed token reference
const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
getLogs();
