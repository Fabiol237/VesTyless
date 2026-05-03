async function getLatestDeploy() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectName = 'ves-tyless';

  const res = await fetch('https://api.vercel.com/v6/deployments?projectId=prj_9SVO9yOTiBbABaqQvEgELDpvdBCc&limit=1', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  const latest = data.deployments[0];
  console.log('ID: ' + latest.uid);
  console.log('Status: ' + latest.state);
}

getLatestDeploy();
