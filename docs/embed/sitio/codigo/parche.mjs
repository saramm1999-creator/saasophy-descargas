// Aplica el diseño nuevo. Uso: node parche.mjs (desde /home/runner/workspace). Idempotente.
import { readFileSync, writeFileSync } from "node:fs";
const R = "artifacts/negocio-30-dias/src/";
function cambiar(file, pares) {
  let s = readFileSync(file, "utf8");
  for (const [de, a] of pares) {
    if (s.includes(a)) continue;
    if (!s.includes(de)) throw new Error(`No encuentro en ${file}: ${de.slice(0, 80)}`);
    s = s.replace(de, a);
  }
  writeFileSync(file, s);
  console.log("ok", file);
}
cambiar(R + "public-reference/reference-markup.ts", [
  ['import { homeProgramsMarkup, withProgramsNav } from "./programas.ts";\n',
   'import { homeProgramsMarkup, withProgramsNav } from "./programas.ts";\nimport "./sitio-nuevo.ts";\n'],
]);
cambiar(R + "public-reference/PublicReferencePage.tsx", [
  ['import "./programas.css";\n', 'import "./programas.css";\nimport "./sitio-nuevo.css";\nimport { referenceWrapperClass } from "./sitio-nuevo";\n'],
  ['className={`sref ${page.bodyClass}`.trim()}', 'className={referenceWrapperClass(page.bodyClass)}'],
  ['import { referenceWrapperClass } from "./sitio-nuevo";\n', 'import { referenceWrapperClass } from "./sitio-nuevo";\nimport { activarEfectos } from "./sitio-nuevo-efectos";\n'],
  ['  if (!page) return <NotFound />;\n', '  // Efectos del diseño nuevo (aparición, contadores, chat, calculadora).\n  useEffect(() => {\n    const root = rootRef.current;\n    if (!root || page?.bodyClass !== "ssy-nuevo") return;\n    return activarEfectos(root);\n  }, [page, markup]);\n\n  if (!page) return <NotFound />;\n'],
]);
cambiar(R + "App.tsx", [
  ["const RefProgramas = lazy(", "const RefCursoNuevo = lazy(() => import('@/public-reference/PublicReferencePage').then((m) => ({ default: m.makeReferenceRoute('/programa') })));\nconst RefProgramas = lazy("],
  ['<Route path="/programa" component={EvergreenCourse} />', '<Route path="/programa" component={RefCursoNuevo} />'],
]);
cambiar("artifacts/api-server/src/lib/public-reference-meta.ts", [
  ['    ["talleres-de-automocion", "talleres de automoción", "Aprovecha los huecos del taller y reduce llamadas de recogida."],\n',
   '    ["talleres-de-automocion", "talleres de automoción", "Aprovecha los huecos del taller y reduce llamadas de recogida."],\n    ["concesionarios-y-compraventas", "concesionarios y compraventas", "Mesa de compra para subastas de coches: puja máxima y margen neto calculados y avisos por WhatsApp."],\n'],
]);
cambiar("artifacts/api-server/src/app.ts", [
  ['<div class="${`sref ${referencePage.bodyClass}`.trim()}" data-prerendered="reference">',
   '<div class="${referencePage.bodyClass === "ssy-nuevo" ? "ssy-nuevo" : `sref ${referencePage.bodyClass}`.trim()}" data-prerendered="reference">'],
  ['routePath === "/" || routePath === "/automatizaciones" || routePath === "/tienda" || routePath === "/programas"\n',
   'routePath === "/" || routePath === "/automatizaciones" || routePath === "/tienda" || routePath === "/programas" || routePath === "/programa"\n'],
]);
