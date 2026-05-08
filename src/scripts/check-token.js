// No node-fetch needed
require('dotenv').config({ path: '.env.local' });

const token = process.env.HUGGINGFACE_TOKEN;

async function checkToken() {
  console.log('Checking token permissions for Fabiol237...');
  try {
    const res = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Whoami Result:', JSON.stringify(data, null, 2));
    
    if (data.auth && data.auth.accessToken && data.auth.accessToken.role) {
       console.log('Token Role:', data.auth.accessToken.role);
    }
  } catch (e) {
    console.error('Check failed:', e.message);
  }
}

checkToken();
