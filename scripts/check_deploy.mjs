async function checkDeploy() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_z5jMgPqsrfTP1m4As4FCcPEyzT1f';

  const res = await fetch('https://api.vercel.com/v13/deployments/' + deployId, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const deploy = await res.json();
  console.log('Status: ' + deploy.readyState);
}

checkDeploy();
