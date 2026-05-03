async function getLink() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectName = 'ves-tyless';

  const res = await fetch('https://api.vercel.com/v9/projects/' + projectName, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const project = await res.json();
  console.log('Git Link: ' + JSON.stringify(project.link, null, 2));
}

getLink();
