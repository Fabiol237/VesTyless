async function manageBuilds() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectId = 'prj_9SVO9yOTiBbABaqQvEgELDpvdBCc';

  const res = await fetch('https://api.vercel.com/v6/deployments?projectId=' + projectId + '&limit=10', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  
  for (const d of data.deployments) {
    console.log(d.uid + ' - ' + d.state);
  }
}

manageBuilds();
