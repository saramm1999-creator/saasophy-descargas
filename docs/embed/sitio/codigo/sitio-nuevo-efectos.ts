/** Efectos del diseño nuevo (generado por productos/web/replit_sitio.py): aparición al bajar, contadores,
 * chat que se escribe solo, calculadora de ahorro y retirada automática de la oferta caducada. */
export function activarEfectos(root: HTMLElement): () => void {
  const limpiar: Array<() => void> = [];
  const tiempos: number[] = [];
  const esperar = (ms: number, fn: () => void) => { tiempos.push(window.setTimeout(fn, ms)); };

  root.querySelectorAll<HTMLElement>(".oferta-bf[data-hasta]").forEach((el) => {
    const hasta = Date.parse(el.dataset.hasta ?? "");
    if (!Number.isNaN(hasta) && Date.now() > hasta) el.remove();
  });

  const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
  root.querySelectorAll<HTMLElement>("[data-calc]").forEach((calc) => {
    const valor = (k: string) => Number(calc.querySelector<HTMLInputElement>(`[data-i="${k}"]`)?.value ?? 0);
    const poner = (sel: string, texto: string) => { const el = calc.querySelector(sel); if (el) el.textContent = texto; };
    const pintar = () => {
      const h = valor("h"), c = valor("c"), pct = valor("p");
      const horas = (h * 4.33 * pct) / 100;
      poner('[data-o="h"]', `${h} h`); poner('[data-o="c"]', `${c} €`); poner('[data-o="p"]', `${pct} %`);
      poner('[data-r="h"]', `${fmt.format(horas)} h`); poner('[data-r="e"]', `${fmt.format(horas * c)} €/mes`);
    };
    calc.addEventListener("input", pintar);
    limpiar.push(() => calc.removeEventListener("input", pintar));
    pintar();
  });

  // Botones que rellenan el formulario de abajo (p. ej. «Comprar por transferencia»).
  root.querySelectorAll<HTMLElement>("[data-rellenar]").forEach((b) => {
    const f = () => {
      const t = root.querySelector<HTMLTextAreaElement>('#request-form textarea[name="task"]');
      if (t) { t.value = b.dataset.rellenar ?? ""; setTimeout(() => root.querySelector<HTMLInputElement>('#request-form input[name="name"]')?.focus(), 300); }
      const bloque = root.querySelector<HTMLElement>("#solicitar");
      const titulo = bloque?.querySelector("h2");
      const boton = bloque?.querySelector<HTMLButtonElement>('#request-form button[type="submit"]');
      const eti = bloque?.querySelector<HTMLElement>(".eti");
      if (b.dataset.titulo && titulo) titulo.textContent = b.dataset.titulo;
      if (b.dataset.boton && boton) boton.textContent = b.dataset.boton;
      if (b.dataset.titulo && eti) eti.textContent = "Compra por transferencia";
    };
    b.addEventListener("click", f);
    limpiar.push(() => b.removeEventListener("click", f));
  });

  const fin = () => { tiempos.forEach((t) => clearTimeout(t)); limpiar.forEach((f) => f()); };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return fin;

  const contar = (el: HTMLElement) => {
    const b = el.querySelector("b");
    const texto = b?.textContent ?? "";
    const m = /\d+/.exec(texto);
    if (!b || !m) return;
    const meta = Number(m[0]);
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / 900);
      b.textContent = texto.replace(m[0], String(Math.round(meta * (1 - Math.pow(1 - t, 3)))));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  const chat = (caja: HTMLElement) => {
    const piezas = Array.from(caja.querySelectorAll<HTMLElement>(".burb, .pill"));
    let t = 300;
    for (const pieza of piezas) {
      const respuesta = pieza.classList.contains("r");
      if (respuesta) {
        const puntos = document.createElement("div");
        puntos.className = "escribiendo";
        puntos.style.marginLeft = "auto";
        puntos.innerHTML = "<i></i><i></i><i></i>";
        pieza.before(puntos);
        esperar(t, () => puntos.classList.add("ver"));
        t += 1100;
        esperar(t, () => { puntos.remove(); pieza.classList.add("ver"); });
      } else {
        esperar(t, () => pieza.classList.add("ver"));
      }
      t += 650;
    }
  };

  root.classList.add("js");
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      el.classList.add("ver");
      if (el.classList.contains("dato")) contar(el);
      if (el.classList.contains("chat-vivo")) chat(el);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  const sel = ".cab-sec, .carta, .tesela, .dato, .opinion, .semana, .proc, .tarjeta, .calc, .persona, .faq, .oscuro, .video";
  root.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.classList.add("anim");
    const hermanos = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
    el.style.transitionDelay = `${(hermanos % 4) * 90}ms`;
    io.observe(el);
  });
  root.querySelectorAll<HTMLElement>(".chat-vivo").forEach((el) => io.observe(el));
  limpiar.push(() => io.disconnect());
  return fin;
}
