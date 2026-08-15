const fs = require('fs');
const path = require('path');

// Intentar cargar variables desde un archivo .env si existe (para desarrollo local)
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      // Ignorar comentarios y líneas vacías
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        // Quitar comillas si las tiene
        if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
          val = val.substring(1, val.length - 1);
        } else if (val.length > 0 && val.charAt(0) === "'" && val.charAt(val.length - 1) === "'") {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val.trim();
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  const envJsContent = `/**
 * @file env.js
 * Generado automáticamente por build.js a partir de variables de entorno.
 * NO EDITAR ESTE ARCHIVO MANUALMENTE.
 */
export const SUPABASE_URL = '${supabaseUrl}';
export const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
`;

  const jsDir = path.join(__dirname, 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir);
  }

  fs.writeFileSync(path.join(jsDir, 'env.js'), envJsContent);
  console.log('✅ Archivo js/env.js generado con éxito a partir de las variables de entorno.');
} else {
  console.log('ℹ️ No se detectaron SUPABASE_URL ni SUPABASE_ANON_KEY en el entorno ni en el archivo .env.');
  console.log('ℹ️ Se mantendrá el archivo js/env.js actual si existe.');
}
