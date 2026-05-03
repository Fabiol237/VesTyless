async function getAliases() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const deployId = 'dpl_6H4HA1J8AyndKzV7maECKeHsrdFY';

  const res = await fetch('https://api.vercel.com/v2/deployments/' + deployId + '/aliases', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log('Aliases: ' + JSON.stringify(data.aliases, null, 2));
}

getAliases();
