/* Buzón de check-in online de SaaSophy Alojamientos (generado en productos/web/checkin; no editar a mano).
 *
 * El huésped abre https://saasophy.online/checkin#<datos>, rellena sus datos en el móvil y el navegador los CIFRA con la
 * clave pública del programa del alojamiento (ECDH P-256 + HKDF-SHA256 + AES-256-GCM). Aquí solo se guarda el texto
 * cifrado: SaaSophy no puede leerlo. El programa del alojamiento lo recoge, lo descifra en su ordenador y pide borrarlo.
 * Lo que no se recoge se borra solo a los 30 días.
 */
import express, { Router } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { CHECKIN_PAGINA } from "./checkin-pagina.generated";

const TOKEN = /^[a-f0-9]{32}$/;
const MAX_POR_BUZON = 20;
let preparada: Promise<unknown> | null = null;

function tabla() {
  preparada ??= pool.query(`CREATE TABLE IF NOT EXISTS checkin_buzon (
      id TEXT PRIMARY KEY, buzon TEXT NOT NULL, datos TEXT NOT NULL, creado TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE INDEX IF NOT EXISTS checkin_buzon_buzon ON checkin_buzon (buzon);`).catch((e) => { preparada = null; throw e; });
  return preparada;
}

async function caducar() {
  await pool.query("DELETE FROM checkin_buzon WHERE creado < now() - interval '30 days'");
}

export function checkinRouter(): Router {
  const r = Router();
  const texto = express.text({ type: "text/plain", limit: "8mb" });

  // Página del huésped (todo el estado viaja en el fragmento #…, que nunca llega al servidor).
  r.get("/checkin", (_req, res) => {
    res.set("Cache-Control", "no-store").set("Referrer-Policy", "no-referrer").set("X-Robots-Tag", "noindex").type("html").send(CHECKIN_PAGINA);
  });

  // El huésped deja su ficha cifrada.
  r.post("/api/checkin/:buzon", texto, async (req, res) => {
    try {
      const buzon = String(req.params.buzon);
      const datos = typeof req.body === "string" ? req.body : "";
      if (!TOKEN.test(buzon)) return res.status(400).json({ error: "Enlace no válido." });
      let sobre: { v?: number; e?: string; i?: string; c?: string };
      try { sobre = JSON.parse(datos); } catch { return res.status(400).json({ error: "Datos no válidos." }); }
      if (sobre.v !== 1 || !sobre.e || !sobre.i || !sobre.c) return res.status(400).json({ error: "Datos no válidos." });
      await tabla();
      const n = await pool.query("SELECT COUNT(*)::int AS n FROM checkin_buzon WHERE buzon = $1", [buzon]);
      if (n.rows[0].n >= MAX_POR_BUZON) return res.status(429).json({ error: "Ya se han enviado demasiadas fichas con este enlace." });
      await pool.query("INSERT INTO checkin_buzon (id, buzon, datos) VALUES ($1, $2, $3)", [randomUUID(), buzon, datos]);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "No se ha podido guardar. Inténtalo de nuevo en un momento." });
    }
  });

  // El programa del alojamiento recoge lo que han dejado sus huéspedes (solo quien conoce el enlace puede pedirlo).
  r.post("/api/checkin-recoger", express.json({ limit: "64kb" }), async (req, res) => {
    try {
      const buzones: string[] = (Array.isArray(req.body?.buzones) ? req.body.buzones : []).filter((b: unknown) => typeof b === "string" && TOKEN.test(b)).slice(0, 200);
      const borrar: string[] = (Array.isArray(req.body?.borrar) ? req.body.borrar : []).filter((b: unknown) => typeof b === "string").slice(0, 500);
      await tabla();
      if (borrar.length && buzones.length) await pool.query("DELETE FROM checkin_buzon WHERE id = ANY($1) AND buzon = ANY($2)", [borrar, buzones]);
      await caducar();
      if (!buzones.length) return res.json({ fichas: [] });
      const q = await pool.query("SELECT id, buzon, datos, creado FROM checkin_buzon WHERE buzon = ANY($1) ORDER BY creado LIMIT 100", [buzones]);
      res.json({ fichas: q.rows });
    } catch {
      res.status(500).json({ error: "Buzón no disponible." });
    }
  });
  return r;
}
