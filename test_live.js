async function testLiveAI() {
  const url = 'https://vestyless.vercel.app/api/chat';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Bonjour' }] })
    });
    const data = await res.json();
    console.log('AI Test Result:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('AI Test Failed:', e.message);
  }
}

async function testLiveCloudinary() {
    const url = 'https://vestyless.vercel.app/api/cloudinary';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', publicId: 'test_dummy' })
      });
      const data = await res.json();
      console.log('Cloudinary Test Result:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Cloudinary Test Failed:', e.message);
    }
}

testLiveAI().then(() => testLiveCloudinary());
