const {Client} = require('pg');
const regions = ['eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-southeast-1'];
(async () => {
  let connected = false;
  for(const r of regions) {
    console.log('Trying', r);
    const c = new Client({
      connectionString: `postgresql://postgres.qkqowrwkmipxyktjdvfg:Z0kof@ro@aws-0-${r}.pooler.supabase.com:6543/postgres`,
      connectionTimeoutMillis: 3000
    });
    try {
      await c.connect();
      console.log('SUCCESS:', r);
      await c.end();
      connected = true;
      break;
    } catch(e) {
      console.log('FAILED:', r, e.message);
    }
  }
  if(!connected) console.log('Could not connect to any region.');
})();
