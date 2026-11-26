/** Diseño nuevo de las páginas públicas principales. Sustituye solo el HTML: título, descripción y rutas no cambian. */
import { REFERENCE_PAGES } from "./pages.generated.ts";
import "./programas.ts"; // primero registra /programas; después se le pone el diseño nuevo
import { SITIO_CABECERA, SITIO_NUEVO, SITIO_PIE } from "./sitio-nuevo.generated.ts";

export const SITIO_NUEVO_CLASS = "ssy-nuevo";
const TITULOS: Record<string, { title: string; description: string }> = {
  "/automatizaciones/concesionarios-y-compraventas": { title: "Automatizaciones para concesionarios y compraventas | SaaSophy", description: "Mesa de compra para subastas de coches: puja máxima y margen neto calculados, avisos por WhatsApp y seguimiento de ventas. Demo gratis." },
  "/programa": {
    title: "Automatiza y Vende | Saasophy",
    description: "Automatiza y Vende: 4 semanas de clases en directo con Sara que quedan grabadas y ayuda para conseguir tus primeros clientes. 135 € IVA incluido.",
  },
};
function cabecera(route: string) {
  const activa = route.startsWith("/automatizaciones/") ? "/automatizaciones" : route;
  return SITIO_CABECERA.replace(`<a href="${activa}">`, `<a href="${activa}" aria-current=page>`);
}
for (const [route, contenido] of Object.entries(SITIO_NUEVO)) {
  const page = REFERENCE_PAGES[route] ?? TITULOS[route];
  if (page) REFERENCE_PAGES[route] = { ...page, bodyClass: SITIO_NUEVO_CLASS, html: cabecera(route) + contenido + SITIO_PIE };
}
export function referenceWrapperClass(bodyClass: string | undefined) {
  return bodyClass === SITIO_NUEVO_CLASS ? SITIO_NUEVO_CLASS : `sref ${bodyClass ?? ""}`.trim();
}
