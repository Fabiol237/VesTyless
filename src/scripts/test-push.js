require('dotenv').config({ path: '.env.local' });
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('VAPID keys missing in .env.local');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:admin@vestyle.cm',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// This script requires a real subscription object from the database to work
// You can get one from the `push_subscriptions` table in Supabase
console.log('--- VAPID CONFIG CHECK ---');
console.log('Public Key:', VAPID_PUBLIC_KEY.substring(0, 10) + '...');
console.log('Private Key:', VAPID_PRIVATE_KEY.substring(0, 5) + '...');
console.log('\nTo test a real push, run this script with a subscription JSON as an argument.');

const subArg = process.argv[2];
if (subArg) {
  try {
    const subscription = JSON.parse(subArg);
    const payload = JSON.stringify({
      title: 'Test Vestyle',
      body: 'Ceci est une notification de test !',
      url: '/'
    });

    webpush.sendNotification(subscription, payload)
      .then(res => console.log('Push sent successfully:', res.statusCode))
      .catch(err => console.error('Push failed:', err));
  } catch (e) {
    console.error('Invalid subscription JSON');
  }
}
