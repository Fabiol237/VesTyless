const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split(/\r?\n/);
const envs = {};

for (const line of envLines) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const k = key.trim();
    if (k.startsWith('#')) continue;
    envs[k] = valueParts.join('=').trim();
  }
}

console.log(`Detected ${Object.keys(envs).length} variables.`);

for (const [k, v] of Object.entries(envs)) {
  console.log(`Force syncing ${k}...`);
  try {
    // Remove if exists
    try {
      execSync(`npx vercel env rm ${k} production -y`, { stdio: 'ignore' });
    } catch(e) {}

    // Save value to a temp file to ensure it's passed correctly without shell escaping issues
    const tempFile = path.join(__dirname, `temp_${k}.txt`);
    fs.writeFileSync(tempFile, v);
    
    // Use redirection which is the most reliable way to pass stdin on Windows
    execSync(`npx vercel env add ${k} production < "${tempFile}"`, { shell: true });
    
    fs.unlinkSync(tempFile);
    console.log(`✅ ${k} synced.`);
  } catch (e) {
    console.error(`❌ Failed ${k}: ${e.message}`);
  }
}

console.log("\n🚀 All variables pushed. Re-deploying for real this time...");
execSync(`npx vercel --prod --force --yes`, { stdio: 'inherit', shell: true });
