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
]);
cambiar(R + "App.tsx", [
  ["const RefProgramas = lazy(", "const RefCursoNuevo = lazy(() => import('@/public-reference/PublicReferencePage').then((m) => ({ default: m.makeReferenceRoute('/programa') })));\nconst RefProgramas = lazy("],
  ['<Route path="/programa" component={EvergreenCourse} />', '<Route path="/programa" component={RefCursoNuevo} />'],
]);
cambiar("artifacts/api-server/src/app.ts", [
  ['const wrapper = `<div class="${`sref ${referencePage.bodyClass}`.trim()}" data-prerendered="reference">',
   'const wrapper = `<div class="${referencePage.bodyClass === "ssy-nuevo" ? "ssy-nuevo" : `sref ${referencePage.bodyClass}`.trim()}" data-prerendered="reference">'],
  ['routePath === "/" || routePath === "/automatizaciones" || routePath === "/tienda" || routePath === "/programas"\n',
   'routePath === "/" || routePath === "/automatizaciones" || routePath === "/tienda" || routePath === "/programas" || routePath === "/programa"\n'],
]);
