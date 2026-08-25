import { useEffect, useRef } from "react";

/* ------------------------------- data ------------------------------- */
type NavItem = { label: string; href: string; ext?: boolean };
const NAV: NavItem[] = [
  { label: "protocol", href: "#protocol" },
  { label: "signatures", href: "#signatures" },
  { label: "design", href: "#design" },
  { label: "ecosystem", href: "#ecosystem" },
  { label: "docs", href: "https://docs.ngchain.org", ext: true },
];

type Stat = { n: number; unit: string; label: string };
const STATS: Stat[] = [
  { n: 4, unit: "s", label: "block target" },
  { n: 2, unit: "", label: "core entities" },
  { n: 6, unit: "", label: "operations" },
  { n: 256, unit: "-bit", label: "native money" },
];

type Entity = { tag: string; cmd: string; name: string; desc: string; chips: string[] };
const ENTITIES: Entity[] = [
  {
    tag: "ENTITY 01", cmd: "address", name: "Address",
    desc: "The 32-byte hash of a public key — identity, balance and namespace in one. Addresses spend directly; nothing is ever registered.",
    chips: ["identity", "balance", "namespace"],
  },
  {
    tag: "ENTITY 02", cmd: "contract", name: "Contract",
    desc: "A compiled WebAssembly module opened under an address's namespace — versioned entirely on-chain, each revision stored as the minimal change from the last. Frozen and executed while active.",
    chips: ["webassembly", "on-chain versioning", "sandboxed"],
  },
];

type Op = { no: string; name: string; desc: string };
const OPS: Op[] = [
  { no: "01", name: "generate", desc: "The mining reward — the only operation that mints new value." },
  { no: "02", name: "transact", desc: "Pay an address and trigger its live contract, routed to the entry point named in the call." },
  { no: "03", name: "commit", desc: "Publish a new revision of your module; only the minimal change is written on-chain. The first revision brings it online." },
  { no: "04", name: "activate", desc: "Validate, freeze and power on the contract — its startup routine runs once." },
  { no: "05", name: "deactivate", desc: "Power the contract down and reopen it for new revisions." },
  { no: "06", name: "destroy", desc: "Remove the contract slot entirely." },
];

type Sig = { name: string; role: string; size: string; w: number };
const SIGS: Sig[] = [
  { name: "secp256k1", role: "classical · ethereum parity", size: "67 B", w: 12 },
  { name: "FN-DSA-512", role: "compact post-quantum", size: "700 B", w: 22 },
  { name: "ML-DSA-44", role: "fips 204 · the finalized standard", size: "2.5 KB", w: 46 },
  { name: "SLH-DSA-128s", role: "hash-based · assumption-minimal", size: "7.9 KB", w: 100 },
];

type Principle = { no: string; title: string; desc: string };
const PRINCIPLES: Principle[] = [
  { no: "01", title: "WebAssembly, not a bespoke VM", desc: "Any language that compiles to WebAssembly becomes a contract, on a decade-hardened sandbox. The frontier choice and the usable one at once." },
  { no: "02", title: "Determinism as the hard rule", desc: "Every validator computes the same result and the same cost on every machine. It is the filter every performance idea must pass through." },
  { no: "03", title: "Exact money, native speed", desc: "Balances are exact 256-bit integers, yet the hot path runs in native code — lifting a thousand-fold ceiling without touching the rules." },
];

type Eco = { no: string; name: string; sd: string };
const ECO: Eco[] = [
  { no: "01", name: "Explorer", sd: "explorer.ngchain.org" },
  { no: "02", name: "Wallet", sd: "wallet.ngchain.org" },
  { no: "03", name: "Faucet", sd: "faucet.ngchain.org" },
  { no: "04", name: "Mining pool", sd: "pool.ngchain.org" },
  { no: "05", name: "RPC & API", sd: "rpc.ngchain.org" },
  { no: "06", name: "Docs", sd: "docs.ngchain.org" },
  { no: "07", name: "Status", sd: "status.ngchain.org" },
  { no: "08", name: "Yellow paper", sd: "yellowpaper.ngchain.org" },
];

const FOOTER_LINKS: [string, string][] = [
  ["explorer", "https://explorer.ngchain.org"],
  ["wallet", "https://wallet.ngchain.org"],
  ["faucet", "https://faucet.ngchain.org"],
  ["pool", "https://pool.ngchain.org"],
  ["rpc", "https://rpc.ngchain.org"],
  ["docs", "https://docs.ngchain.org"],
  ["status", "https://status.ngchain.org"],
  ["yellow paper", "https://yellowpaper.ngchain.org"],
  ["github", "https://github.com/ngchain"],
];

const MARQUEE = [
  "next-generation blockchain", "proof-of-work", "post-quantum from genesis",
  "webassembly core", "two entities / six operations", "exact 256-bit money",
  "4-second blocks", "ghost uncles", "auditable / scalable / security-oriented",
];

const BOOT = [
  "$ ngchain --boot",
  "> consensus ......... proof-of-work",
  "> vm ................ webassembly",
  "> keys .............. post-quantum",
  "> state ............. 2 entities / 6 ops",
  "> node .............. [ ONLINE ]",
];

const TERMINAL_HTML = `<span class="c"># build the node</span>
<span class="p">$</span> go build -o ngcore ./cmd/ngcore

<span class="c"># spin up a disposable local chain</span>
<span class="p">$</span> ./ngcore --zeronet --in-mem

<span class="c"># a wallet — keys never leave the machine</span>
<span class="p">$</span> ./ngcore cli key --new --scheme <span class="k">ml-dsa-44</span>
<span class="p">$</span> ./ngcore cli send --to &lt;address&gt; --value 1.5 --fee 0.0001

<span class="c"># the first revision deploys the contract</span>
<span class="p">$</span> ./ngcore cli commit --file contract.wasm --fee 0.0001
<span class="p">$</span> ./ngcore cli activate --fee 0.0001
<span class="p">$</span> ./ngcore cli call --contract &lt;address&gt; --entry balance_of<span class="cur">_</span>`;

const ext = { target: "_blank" as const, rel: "noopener" as const };

/* ------------------------------- mark ------------------------------- */
function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="88 16 464 608" aria-hidden="true" fill="#c6ff3a">
      <path fillOpacity="0.65" d="M464,32l72,72H177" />
      <path fillOpacity="0.4" d="M104,32v360l72-72l1-216" />
      <path d="M464,32v504l72-72V104" />
      <path fillOpacity="0.65" d="M104,536l288,72l72-72l-288-72" />
    </svg>
  );
}

/* ------------------------------- app -------------------------------- */
export default function App() {
  const rainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const hoverable = matchMedia("(hover:hover)").matches;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, f: EventListenerOrEventListenerObject, o?: AddEventListenerOptions) => {
      t.addEventListener(e, f, o);
      cleanups.push(() => t.removeEventListener(e, f, o));
    };
    const rafs: number[] = [];
    const loop = (fn: () => void) => {
      const step = () => { fn(); rafs.push(requestAnimationFrame(step)); };
      rafs.push(requestAnimationFrame(step));
    };

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ---- boot sequence ----
    const boot = document.querySelector<HTMLElement>(".boot");
    const bootLog = document.getElementById("bootlog");
    const revealHero = () => {
      document.querySelectorAll<HTMLElement>(".hero [data-reveal]").forEach((el, i) => {
        setTimeout(() => el.classList.add("in"), 80 + i * 90);
      });
      setTimeout(scramble, 220);
    };
    let bootDone = false;
    const finishBoot = () => {
      if (bootDone) return; bootDone = true;
      boot?.classList.add("gone");
      revealHero();
    };
    if (reduce || !bootLog) {
      finishBoot();
    } else {
      let li = 0, ci = 0;
      const type = () => {
        if (li >= BOOT.length) { setTimeout(finishBoot, 320); return; }
        const line = BOOT[li];
        if (ci === 0) { const d = document.createElement("div"); d.className = "boot-line"; bootLog.appendChild(d); }
        const cur = bootLog.lastElementChild as HTMLElement;
        cur.textContent = line.slice(0, ci) + "▋";
        ci++;
        if (ci > line.length) { cur.textContent = line; li++; ci = 0; setTimeout(type, 130); }
        else setTimeout(type, 12 + Math.random() * 26);
      };
      type();
      const fs = setTimeout(finishBoot, 3600);
      cleanups.push(() => clearTimeout(fs));
    }

    // ---- scramble headline (decrypt) ----
    function scramble() {
      document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el, idx) => {
        const final = el.dataset.scramble || "";
        const g = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#%&<>*=+";
        let frame = 0;
        const start = 4 + idx * 8;
        if (reduce) { el.textContent = final; return; }
        const tick = () => {
          let out = "", done = true;
          for (let i = 0; i < final.length; i++) {
            if (frame >= start + i * 2) out += final[i];
            else if (final[i] === " ") out += " ";
            else { out += g[(Math.random() * g.length) | 0]; done = false; }
          }
          el.textContent = out; frame++;
          if (!done) requestAnimationFrame(tick); else el.textContent = final;
        };
        requestAnimationFrame(tick);
      });
    }

    // ---- scroll rail + nav ----
    const rail = document.querySelector<HTMLElement>(".rail i");
    const header = document.querySelector("header");
    on(window, "scroll", () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (rail) rail.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      header?.classList.toggle("scrolled", scrollY > 12);
    }, { passive: true } as AddEventListenerOptions);

    // ---- crosshair cursor ----
    if (hoverable && !reduce) {
      const cx = document.querySelector<HTMLElement>(".cross");
      on(window, "mousemove", (e) => {
        const ev = e as MouseEvent;
        if (cx) cx.style.transform = `translate(${ev.clientX}px,${ev.clientY}px)`;
        document.body.classList.add("lit");
      });
      const sel = "a,button,.cell,.sig,.btn,[data-hov]";
      on(document, "mouseover", (e) => { if ((e.target as HTMLElement).closest(sel)) document.body.classList.add("cur-lg"); });
      on(document, "mouseout", (e) => { if ((e.target as HTMLElement).closest(sel)) document.body.classList.remove("cur-lg"); });
    }

    // ---- reveal (hard wipe) ----
    const io = new IntersectionObserver((es) => {
      es.forEach((x) => {
        if (!x.isIntersecting) return;
        const el = x.target as HTMLElement;
        const sibs = Array.from(el.parentElement?.querySelectorAll(":scope > [data-reveal]") || []);
        el.style.transitionDelay = `${Math.max(0, sibs.indexOf(el)) * 60}ms`;
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]:not(.hero *),.sig").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ---- count up ----
    const cio = new IntersectionObserver((es) => {
      es.forEach((x) => {
        if (!x.isIntersecting) return;
        cio.unobserve(x.target);
        const el = x.target as HTMLElement;
        const to = Number(el.dataset.count || "0"), unit = el.dataset.unit || "", dur = 1300;
        let t0 = 0;
        const tick = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min((t - t0) / dur, 1);
          const v = Math.floor((1 - Math.pow(1 - p, 4)) * to);
          el.innerHTML = String(v).padStart(2, "0") + (unit ? `<i>${unit}</i>` : "");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => cio.observe(el));
    cleanups.push(() => cio.disconnect());

    // ---- magnetic ----
    if (hoverable && !reduce) {
      document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
        on(el, "mousemove", (e) => {
          const ev = e as MouseEvent, r = el.getBoundingClientRect();
          el.style.transform = `translate(${(ev.clientX - r.left - r.width / 2) * 0.3}px,${(ev.clientY - r.top - r.height / 2) * 0.3}px)`;
        });
        on(el, "mouseleave", () => { el.style.transform = ""; });
      });
    }

    // ---- copy ----
    const copy = document.getElementById("copy"), code = document.getElementById("code");
    if (copy && code) {
      on(copy, "click", () => {
        navigator.clipboard.writeText(code.innerText).then(() => {
          const o = copy.textContent; copy.textContent = "[ copied ]";
          setTimeout(() => { copy.textContent = o; }, 1400);
        });
      });
    }

    // ---- hero data-rain ----
    const canvas = rainRef.current;
    if (canvas && !reduce) {
      const ctx = canvas.getContext("2d")!;
      const DPR = Math.min(devicePixelRatio || 1, 2);
      const G = "0123456789ABCDEF/\\<>*+=·".split("");
      let W = 0, H = 0, fs = 0, cols: { x: number; y: number; sp: number }[] = [];
      const build = () => {
        fs = 16 * DPR;
        const gap = fs * 2.4;
        cols = [];
        for (let x = gap / 2; x < W; x += gap) cols.push({ x, y: Math.random() * H, sp: (0.6 + Math.random() * 1.4) * DPR });
      };
      const resize = () => {
        const host = canvas.parentElement!;
        W = canvas.width = innerWidth * DPR; H = canvas.height = host.offsetHeight * DPR;
        canvas.style.width = innerWidth + "px"; canvas.style.height = host.offsetHeight + "px";
        ctx.font = `${16 * DPR}px "Space Mono", monospace`; ctx.textBaseline = "top";
        build();
      };
      on(window, "resize", resize);
      resize();
      const trail = 7;
      loop(() => {
        ctx.clearRect(0, 0, W, H);
        for (const c of cols) {
          for (let k = 0; k < trail; k++) {
            const yy = c.y - k * fs;
            if (yy < -fs || yy > H) continue;
            const ch = G[(Math.random() * G.length) | 0];
            if (k === 0) ctx.fillStyle = "rgba(198,255,58,0.9)";
            else ctx.fillStyle = `rgba(198,255,58,${0.16 * (1 - k / trail)})`;
            ctx.fillText(ch, c.x, yy);
          }
          c.y += c.sp;
          if (c.y - trail * fs > H) { c.y = -Math.random() * H * 0.4; c.sp = (0.6 + Math.random() * 1.4) * DPR; }
        }
      });
    }

    return () => { rafs.forEach(cancelAnimationFrame); cleanups.forEach((f) => f()); };
  }, []);

  return (
    <>
      {/* boot */}
      <div className="boot">
        <div className="boot-inner"><Mark className="boot-mk" /><div className="boot-log" id="bootlog" /></div>
      </div>

      {/* ambient */}
      <div className="grid-bg" aria-hidden="true" />
      <div className="scan" aria-hidden="true" />
      <div className="cross" aria-hidden="true"><i /><i /></div>
      <div className="rail" aria-hidden="true"><i /></div>

      <header>
        <div className="nav">
          <a className="brand" href="#top" data-magnet><Mark className="mk" />ngchain<span className="cur">_</span></a>
          <nav className="nav-links">
            {NAV.map((x) => (
              <a key={x.label} className="hide-sm" href={x.href} {...(x.ext ? ext : {})}>[ {x.label} ]</a>
            ))}
            <a className="nav-cta" href="https://github.com/ngchain/ngcore" data-magnet {...ext}>&gt; github</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <canvas id="rain" ref={rainRef} aria-hidden="true" />
        <div className="hero-in">
          <div className="term-bar" data-reveal><span className="ok" />~/ngchain — main · node online</div>
          <div className="eyebrow" data-reveal>// proof-of-work · webassembly · post-quantum</div>
          <h1 data-reveal>
            <span data-scramble="NEXT-GENERATION">NEXT-GENERATION</span>
            <br /><span className="lime" data-glitch data-scramble="BLOCKCHAIN">BLOCKCHAIN</span><span className="cur big">_</span>
          </h1>
          <p className="sub" data-reveal>
            A ground-up reconstruction of proof-of-work — <b>auditable</b>, <b>scalable</b>,{" "}
            <b>security-oriented</b> and <b>post-quantum</b> from genesis. An entire settlement layer
            distilled to <b>two entities</b> and <b>six operations</b>, on a <b>WebAssembly</b> core that
            runs any language and settles exact 256-bit value at native speed.
          </p>
          <div className="cta-row" data-reveal>
            <a className="btn btn-primary" href="https://github.com/ngchain/ngcore" data-magnet {...ext}>[ explore the code ]</a>
            <a className="btn btn-ghost" href="https://yellowpaper.ngchain.org" data-magnet {...ext}>[ yellow paper ]</a>
          </div>
        </div>
        <div className="scroll-cue"><span>scroll ↓</span></div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span className="mq-run" key={k}>
              {MARQUEE.map((m, i) => <span className="mq-item" key={i}><span className="mq-dot">◆</span>{m}</span>)}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="stats-sec">
        <div className="wrap">
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" data-reveal key={s.label}>
                <div className="n" data-count={s.n} data-unit={s.unit}>00{s.unit && <i>{s.unit}</i>}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROTOCOL */}
      <section id="protocol">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal><span className="eyebrow">01 // the protocol</span></div>
            <h2 className="h2" data-reveal>TWO ENTITIES.<br /><span className="lime">SIX OPERATIONS.</span></h2>
            <p className="lead" data-reveal>The entire chain is a small formal system — a state of two nouns, moved by six verbs. Small enough to hold in your head, hard enough to misuse.</p>
          </div>

          <div className="grid g-2 entities">
            {ENTITIES.map((e) => (
              <article className="cell win" data-reveal key={e.name}>
                <div className="win-top"><span className="dots"><i /><i /><i /></span><span className="win-title">$ {e.cmd}</span><span className="win-tag">{e.tag}</span></div>
                <div className="win-body">
                  <h3>{e.name}</h3>
                  <p>{e.desc}</p>
                  <div className="chips">{e.chips.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid g-3 ops">
            {OPS.map((o) => (
              <article className="cell op" data-reveal key={o.name}>
                <div className="op-no">OP_{o.no}</div>
                <h3>{o.name}<span className="paren">()</span></h3>
                <p>{o.desc}</p>
                <span className="op-arrow">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURES */}
      <section id="signatures">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal><span className="eyebrow">02 // signatures</span></div>
            <h2 className="h2" data-reveal>POST-QUANTUM,<br /><span className="lime">BY CHOICE.</span></h2>
            <p className="lead" data-reveal>Keys derive from a 32-byte seed under a per-key scheme — classical efficiency or assumption-minimal post-quantum, chosen per key, never forced on the whole chain.</p>
          </div>
          <div className="sig-table">
            <div className="sig-head"><span>scheme</span><span>class</span><span>envelope</span><span>size</span></div>
            {SIGS.map((s) => (
              <div className="sig" style={{ ["--w" as string]: s.w + "%" }} key={s.name}>
                <span className="nm">{s.name}</span>
                <span className="rl">{s.role}</span>
                <span className="bar"><i /></span>
                <span className="sz">{s.size}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGN */}
      <section id="design">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal><span className="eyebrow">03 // the design rule</span></div>
            <h2 className="h2" data-reveal>BUILT FOR<br /><span className="lime">THE FRONTIER.</span></h2>
            <p className="lead" data-reveal>Commitments, not footnotes — the mechanics beneath them, from the millisecond retarget to the uncle-reward curve, are derived in full in the forthcoming yellow paper.</p>
          </div>
          <div className="grid g-3">
            {PRINCIPLES.map((p) => (
              <article className="cell pr" data-reveal key={p.title}>
                <div className="pr-no">{p.no}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK START */}
      <section id="start">
        <div className="wrap">
          <div className="startgrid">
            <div className="sec-head">
              <div data-reveal><span className="eyebrow">04 // quick start</span></div>
              <h2 className="h2" data-reveal>RUN IT IN<br /><span className="lime">ONE COMMAND.</span></h2>
              <p className="lead" data-reveal>Keys stay local; only signed transactions travel. A disposable local chain is one flag away, and any running chain can be forked for contract debugging.</p>
            </div>
            <div className="win term" data-reveal>
              <div className="win-top"><span className="dots"><i /><i /><i /></span><span className="win-title">~/ngcore</span><span className="cp" id="copy">[ copy ]</span></div>
              <div className="win-body body" id="code" dangerouslySetInnerHTML={{ __html: TERMINAL_HTML }} />
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal><span className="eyebrow">05 // the ecosystem</span></div>
            <h2 className="h2" data-reveal>A FULL-STACK<br /><span className="lime">NETWORK.</span></h2>
            <p className="lead" data-reveal>Everything a layer-one needs, live on second-level domains — nothing it doesn't.</p>
          </div>
          <div className="grid g-4">
            {ECO.map((e) => (
              <a className="cell eco" href={"https://" + e.sd} data-reveal {...ext} key={e.sd}>
                <div className="eco-no">{e.no}</div>
                <h3>{e.name}</h3>
                <div className="sd">{e.sd}<span className="arr"> ↗</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-cta" data-reveal>
            <div className="eyebrow">// join the network</div>
            <h2 className="h2">BUILD ON THE <span className="lime">NEXT GENERATION.</span></h2>
            <p className="lead">Open source, post-quantum, and running today on the public testnet.</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="https://github.com/ngchain/ngcore" data-magnet {...ext}>[ start building ]</a>
              <a className="btn btn-ghost" href="https://docs.ngchain.org" data-magnet {...ext}>[ read the docs ]</a>
            </div>
          </div>
          <div className="foot-grid">
            <a className="foot-brand" href="#top"><Mark className="mk" />ngchain</a>
            <div className="foot-links">{FOOTER_LINKS.map(([l, h]) => <a href={h} {...ext} key={l}>{l}</a>)}</div>
          </div>
          <div className="foot-meta">
            <span className="status"><i /> node: experimental · mainnet undefined</span>
            <span>ngchain — the next-generation blockchain · <span id="year" /></span>
          </div>
        </div>
      </footer>
    </>
  );
}
