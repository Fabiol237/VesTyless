// No need for node-fetch in Node 21+
require('dotenv').config({ path: '.env.local' });

const token = process.env.HUGGINGFACE_TOKEN;
const model = "mistralai/Mistral-7B-Instruct-v0.2";

async function test() {
  console.log('Testing HF API with textGeneration...');
  
  try {
    const res = await fetch(`https://huggingface.co/api/models/HuggingFaceH4/zephyr-7b-beta/inference`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        inputs: "User: Hello\nAssistant:",
      })
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (e) { console.error('Test failed:', e.message); }
}

test();
