const fs = require('fs');
const path = require('path');

const srcAppDir = path.resolve('C:/crm/app');
const destAppDir = path.resolve('H:/Mi unidad/Inteligencia artificial/Curso Angélica - 51167 IA Práctica para crear soluciones de negocio/Antigravity/CRM/app');
const srcSupabaseDir = path.resolve('C:/crm/supabase');
const destSupabaseDir = path.resolve('H:/Mi unidad/Inteligencia artificial/Curso Angélica - 51167 IA Práctica para crear soluciones de negocio/Antigravity/CRM/supabase');

function syncDirectory(src, dest) {
  console.log(`Sincronizando ${src} -> ${dest}...`);
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Origen no existe: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`✅ Sincronizado con éxito.`);
}

try {
  // Sincronizar app/src
  syncDirectory(path.join(srcAppDir, 'src'), path.join(destAppDir, 'src'));
  
  // Sincronizar app/scripts
  syncDirectory(path.join(srcAppDir, 'scripts'), path.join(destAppDir, 'scripts'));
  
  // Sincronizar supabase
  syncDirectory(srcSupabaseDir, destSupabaseDir);
  
  console.log('✨ Todo el workspace de la unidad H: ha sido sincronizado y actualizado.');
} catch (err) {
  console.error('❌ Error al sincronizar carpetas:', err);
}
