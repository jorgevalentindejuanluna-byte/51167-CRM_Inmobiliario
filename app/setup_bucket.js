const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function run() {
  try {
    console.log('Creando bucket "documents"...');
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: 'documents',
        name: 'documents',
        public: true
      })
    });
    
    if (res.ok) {
      console.log('Bucket creado con éxito:', await res.json());
    } else {
      const errorText = await res.text();
      console.error('Error al crear bucket (puede que ya exista):', res.status, errorText);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
