// Instala el buzón de check-in online en el servidor de saasophy.online (idempotente).
// Se ejecuta en la raíz del proyecto de Replit: node /tmp/parche-checkin.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const ruta = 'artifacts/api-server/src/app.ts';
let s = readFileSync(ruta, 'utf8');
const imp = 'import { checkinRouter } from "./lib/checkin-buzon";';
const ancla = 'app.use(express.urlencoded({ extended: true, limit: FORM_BODY_LIMIT }));';
if (!s.includes(ancla)) { console.log('ERROR: no encuentro el punto de montaje'); process.exit(1); }
if (!s.includes(imp)) s = s.replace('import router from "./routes";', `import router from "./routes";\n${imp}`);
if (!s.includes('app.use(checkinRouter());')) s = s.replace(ancla, `${ancla}\n// Check-in online de SaaSophy Alojamientos: buzón cifrado, sin sesión.\napp.use(checkinRouter());`);
writeFileSync(ruta, s);
console.log('OK parche checkin', s.includes(imp), s.includes('app.use(checkinRouter());'));
