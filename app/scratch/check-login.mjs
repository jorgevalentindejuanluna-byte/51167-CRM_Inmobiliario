async function run() {
  try {
    console.log('Haciendo fetch a http://localhost:3000/login ...');
    const res = await fetch('http://localhost:3000/login');
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Longitud del HTML: ${text.length}`);
    if (text.includes('Iniciar sesión') || text.includes('LoginClient') || text.includes('html')) {
      console.log('✅ El login cargó correctamente.');
    } else {
      console.log('❌ El contenido no parece ser la página de login correcta.');
    }
  } catch (err) {
    console.error('❌ Falló la petición:', err.message);
  }
}

run();
