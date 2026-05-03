async function getAllLogs() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_6H4HA1J8AyndKzV7maECKeHsrdFY';

  const res = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/events', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const logs = await res.json();
  
  logs.forEach(l => {
    if (l.payload && l.payload.text) {
      console.log('[' + l.type + '] ' + l.payload.text);
    }
  });
}

getAllLogs();
