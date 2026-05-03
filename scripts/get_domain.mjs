async function getDomain() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const domain = 'ves-tyless.vercel.app';

  const res = await fetch('https://api.vercel.com/v9/projects/ves-tyless/domains/' + domain, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log('Domain info: ' + JSON.stringify(data, null, 2));
}

getDomain();
