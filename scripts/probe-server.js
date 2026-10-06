async function check() {
  try {
    const res = await fetch('http://localhost:3000/builder/demo-fashion');
    console.log('HTTP_STATUS:', res.status);
  } catch (err) {
    console.log('FETCH_ERROR:', err.message);
  }
}
check();
