async function testLiveNotify() {
  const url = 'https://vestyless.vercel.app/api/emails/notify';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to: 'fabiolzoko133@gmail.com', 
        subject: 'Test Production', 
        type: 'MESSAGE', 
        data: { message: 'Ceci est un test de production' } 
      })
    });
    const data = await res.json();
    console.log('Notify Test Result:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Notify Test Failed:', e.message);
  }
}

testLiveNotify();
