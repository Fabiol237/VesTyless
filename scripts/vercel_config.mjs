async function setVercelEnv() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectName = 'ves-tyless';
  const key = 'SUPABASE_SERVICE_ROLE_KEY';
  const value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M';

  console.log('🚀 Configuration de Vercel pour ' + projectName + '...');

  // 1. Get project ID
  const projRes = await fetch('https://api.vercel.com/v9/projects/' + projectName, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const project = await projRes.json();
  
  if (!project.id) {
    console.error('❌ Projet introuvable sur Vercel');
    return;
  }
  
  console.log('✅ Projet ID trouvé: ' + project.id);

  // 2. Add or Update Env Var
  const envRes = await fetch('https://api.vercel.com/v10/projects/' + project.id + '/env', {
    method: 'POST',
    headers: { 
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key,
      value,
      type: 'plain',
      target: ['production', 'preview', 'development']
    })
  });
  
  const envResult = await envRes.json();
  if (envResult.error) {
    console.log('ℹ️ Note: ' + envResult.error.message);
  } else {
    console.log('✅ Variable SUPABASE_SERVICE_ROLE_KEY ajoutée !');
  }

  // 3. Trigger Redeploy
  console.log('🔄 Lancement du redéploiement...');
  const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { 
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      gitSource: {
        type: 'github',
        repoId: '802098492', // We need the repo ID. I'll try without it first or use the project info.
        ref: 'main'
      }
    })
  });
  
  const deployResult = await deployRes.json();
  if (deployResult.id) {
    console.log('🚀 Déploiement lancé ! ID: ' + deployResult.id);
    console.log('🌍 URL: https://' + deployResult.url);
  } else {
    console.error('❌ Échec du lancement du déploiement: ' + JSON.stringify(deployResult));
  }
}

setVercelEnv();
