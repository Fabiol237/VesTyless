async function redeploy() {
  const token = process.env.VERCEL_TOKEN || 'YOUR_VERCEL_TOKEN_HERE';
  const projectName = 'ves-tyless';
  const repoId = '1178680702';

  console.log('🚀 Lancement du déploiement pour le BON dépôt (Fabiol237/VesTyless)...');

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
        repoId: repoId,
        ref: 'main'
      }
    })
  });
  
  const deployResult = await deployRes.json();
  if (deployResult.id) {
    console.log('✅ Nouveau déploiement lancé ! ID: ' + deployResult.id);
  } else {
    console.error('❌ Erreur: ' + JSON.stringify(deployResult));
  }
}

redeploy();
