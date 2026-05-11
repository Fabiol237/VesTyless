const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env.local and parse it
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envs = {};

for (const line of envLines) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envs[key.trim()] = valueParts.join('=').trim();
  }
}

console.log(`Detected ${Object.keys(envs).length} environment variables.`);

for (const [k, v] of Object.entries(envs)) {
  console.log(`Syncing ${k} to Vercel...`);
  try {
    // We use --force to overwrite if exists, or remove/add
    // Actually vercel env add doesn't have --force easily for existing keys in CLI without prompt
    // So we try to remove first just in case
    try {
       execSync(`npx vercel env rm ${k} production -y`, { stdio: 'ignore' });
    } catch(e) {}
    
    execSync(`npx vercel env add ${k} production`, { 
      input: v, 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    console.log(`✅ ${k} synced.`);
  } catch (e) {
    console.error(`❌ Failed ${k}: ${e.message}`);
  }
}

console.log("\n🚀 All variables synced. You can now deploy.");
