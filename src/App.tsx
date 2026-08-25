import { useEffect, useRef } from "react";

/* ------------------------------- data ------------------------------- */
type NavItem = { label: string; href: string; ext?: boolean };
const NAV: NavItem[] = [
  { label: "Protocol", href: "#protocol" },
  { label: "Signatures", href: "#signatures" },
  { label: "Design", href: "#design" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Docs", href: "https://docs.ngchain.org", ext: true },
];

type Stat = { n: number; unit: string; label: string };
const STATS: Stat[] = [
  { n: 4, unit: "s", label: "block target" },
  { n: 2, unit: "", label: "core entities" },
  { n: 6, unit: "", label: "operations" },
  { n: 256, unit: "-bit", label: "native money" },
];

type Entity = { tag: string; name: string; desc: string; chips: string[] };
const ENTITIES: Entity[] = [
  {
    tag: "ENTITY / 01",
    name: "Address",
    desc: "The 32-byte hash of a public key — identity, balance and namespace in one. Addresses spend directly; nothing is ever registered.",
    chips: ["identity", "balance", "namespace"],
  },
  {
    tag: "ENTITY / 02",
    name: "Contract",
    desc: "A compiled WebAssembly module opened under an address's namespace — versioned entirely on-chain, each revision stored as the minimal change from the last. Frozen and executed while active.",
    chips: ["webassembly", "on-chain versioning", "sandboxed"],
  },
];

type Op = { no: string; name: string; desc: string };
const OPS: Op[] = [
  { no: "OP / 01", name: "Generate", desc: "The mining reward — the only operation that mints new value." },
  { no: "OP / 02", name: "Transact", desc: "Pay an address and trigger its live contract, routed to the entry point named in the call." },
  { no: "OP / 03", name: "Commit", desc: "Publish a new revision of your module; only the minimal change is written on-chain. The first revision brings it online." },
  { no: "OP / 04", name: "Activate", desc: "Validate, freeze and power on the contract — its startup routine runs once." },
  { no: "OP / 05", name: "Deactivate", desc: "Power the contract down and reopen it for new revisions." },
  { no: "OP / 06", name: "Destroy", desc: "Remove the contract slot entirely." },
];

type Sig = { name: string; role: string; size: string; w: string };
const SIGS: Sig[] = [
  { name: "secp256k1", role: "classical · Ethereum parity", size: "67 B", w: "12%" },
  { name: "FN-DSA-512", role: "compact post-quantum", size: "700 B", w: "22%" },
  { name: "ML-DSA-44", role: "FIPS 204 · the finalized standard", size: "2.5 KB", w: "46%" },
  { name: "SLH-DSA-128s", role: "hash-based · assumption-minimal", size: "7.9 KB", w: "100%" },
];

type Principle = { no: string; title: string; desc: string };
const PRINCIPLES: Principle[] = [
  { no: "/ 01", title: "WebAssembly, not a bespoke VM", desc: "Any language that compiles to WebAssembly becomes a contract, on a decade-hardened sandbox. The frontier choice and the usable one at once." },
  { no: "/ 02", title: "Determinism as the hard rule", desc: "Every validator computes the same result and the same cost on every machine. It is the filter every performance idea must pass through." },
  { no: "/ 03", title: "Exact money, native speed", desc: "Balances are exact 256-bit integers, yet the hot path runs in native code — lifting a thousand-fold ceiling without touching the rules." },
];

type Eco = { no: string; name: string; sd: string };
const ECO: Eco[] = [
  { no: "01", name: "Explorer", sd: "explorer.ngchain.org" },
  { no: "02", name: "Wallet", sd: "wallet.ngchain.org" },
  { no: "03", name: "Faucet", sd: "faucet.ngchain.org" },
  { no: "04", name: "Mining pool", sd: "pool.ngchain.org" },
  { no: "05", name: "RPC & API", sd: "rpc.ngchain.org" },
  { no: "06", name: "Docs", sd: "docs.ngchain.org" },
  { no: "07", name: "Network status", sd: "status.ngchain.org" },
  { no: "08", name: "Yellow paper", sd: "yellowpaper.ngchain.org" },
];

const FOOTER_LINKS: [string, string][] = [
  ["Explorer", "https://explorer.ngchain.org"],
  ["Wallet", "https://wallet.ngchain.org"],
  ["Faucet", "https://faucet.ngchain.org"],
  ["Mining pool", "https://pool.ngchain.org"],
  ["RPC & API", "https://rpc.ngchain.org"],
  ["Docs", "https://docs.ngchain.org"],
  ["Network status", "https://status.ngchain.org"],
  ["Yellow paper", "https://yellowpaper.ngchain.org"],
  ["GitHub", "https://github.com/ngchain"],
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
<span class="p">$</span> ./ngcore cli call --contract &lt;address&gt; --entry balance_of<span class="blink"></span>`;

const ext = { target: "_blank" as const, rel: "noopener" as const };

/* --------------------------- ng logo mark --------------------------- */
function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="88 16 464 608" aria-hidden="true">
      <defs>
        <linearGradient id="ngGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.55" stopColor="#7c8bff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <g fill="url(#ngGrad)">
        <path fillOpacity="0.7" d="M464,32l72,72H177" />
        <path fillOpacity="0.5" d="M104,32v360l72-72l1-216" />
        <path d="M464,32v504l72-72V104" />
        <path fillOpacity="0.7" d="M104,536l288,72l72-72l-288-72" />
      </g>
    </svg>
  );
}

/* ------------------------------ app -------------------------------- */
export default function App() {
  const netRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, f: EventListenerOrEventListenerObject, o?: AddEventListenerOptions) => {
      t.addEventListener(e, f, o);
      cleanups.push(() => t.removeEventListener(e, f, o));
    };

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // nav scrolled state
    const header = document.querySelector("header");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 12);
    on(window, "scroll", onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();

    // spotlight
    const spot = document.querySelector<HTMLElement>(".spot");
    on(window, "mousemove", (e) => {
      const ev = e as MouseEvent;
      document.body.classList.add("lit");
      if (spot) spot.style.transform = `translate(${ev.clientX - 320}px,${ev.clientY - 320}px)`;
    });

    // reveal
    const io = new IntersectionObserver(
      (es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }),
      { threshold: 0.16 },
    );
    document.querySelectorAll("[data-reveal],.sig").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // count up
    const cio = new IntersectionObserver((es) => {
      es.forEach((x) => {
        if (!x.isIntersecting) return;
        cio.unobserve(x.target);
        const el = x.target as HTMLElement;
        const to = Number(el.dataset.count || "0");
        const unit = el.dataset.unit || "";
        const dur = 1200;
        let t0 = 0;
        const tick = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min((t - t0) / dur, 1);
          const v = Math.floor((1 - Math.pow(1 - p, 3)) * to);
          el.innerHTML = v + (unit ? `<em>${unit}</em>` : "");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => cio.observe(el));
    cleanups.push(() => cio.disconnect());

    // copy
    const copy = document.getElementById("copy");
    const code = document.getElementById("code");
    if (copy && code) {
      on(copy, "click", () => {
        navigator.clipboard.writeText(code.innerText).then(() => {
          const o = copy.textContent;
          copy.textContent = "copied ✓";
          setTimeout(() => { copy.textContent = o; }, 1400);
        });
      });
    }

    // ---- hero: glowing particle network ----
    let raf = 0;
    const canvas = netRef.current;
    if (canvas && !reduce) {
      const ctx = canvas.getContext("2d")!;
      const DPR = Math.min(devicePixelRatio || 1, 2);
      type P = { x: number; y: number; vx: number; vy: number; c: 0 | 1 };
      let ps: P[] = [];
      let W = 0, H = 0, mx = -9999, my = -9999;

      const sprite = (rgb: string) => {
        const s = document.createElement("canvas");
        const R = 46;
        s.width = s.height = R * 2;
        const g = s.getContext("2d")!;
        const rg = g.createRadialGradient(R, R, 0, R, R, R);
        rg.addColorStop(0, `rgba(${rgb},0.9)`);
        rg.addColorStop(0.25, `rgba(${rgb},0.32)`);
        rg.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = rg;
        g.beginPath();
        g.arc(R, R, R, 0, 7);
        g.fill();
        return s;
      };
      const gV = sprite("167,139,250"); // violet
      const gC = sprite("34,211,238"); // cyan

      const build = () => {
        const n = Math.max(40, Math.min(120, Math.round((W * H) / (DPR * DPR) / 15000)));
        ps = [];
        for (let i = 0; i < n; i++) {
          ps.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.22 * DPR,
            vy: (Math.random() - 0.5) * 0.22 * DPR,
            c: Math.random() < 0.5 ? 0 : 1,
          });
        }
      };
      const resize = () => {
        const host = canvas.parentElement!;
        W = canvas.width = innerWidth * DPR;
        H = canvas.height = host.offsetHeight * DPR;
        canvas.style.width = innerWidth + "px";
        canvas.style.height = host.offsetHeight + "px";
        build();
      };
      on(window, "mousemove", (e) => { const ev = e as MouseEvent; mx = ev.clientX * DPR; my = ev.clientY * DPR; });
      on(window, "mouseout", () => { mx = -9999; my = -9999; });
      on(window, "resize", resize);

      const LINK = 150 * DPR, MOUSE = 220 * DPR;
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of ps) {
          const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
          if (d2 < MOUSE * MOUSE) { const d = Math.sqrt(d2) || 1, f = (1 - d / MOUSE) * 0.04 * DPR; p.vx += dx / d * f; p.vy += dy / d * f; }
          p.x += p.vx; p.y += p.vy; p.vx *= 0.994; p.vy *= 0.994;
          if (Math.abs(p.vx) < 0.04 * DPR) p.vx += (Math.random() - 0.5) * 0.05 * DPR;
          if (Math.abs(p.vy) < 0.04 * DPR) p.vy += (Math.random() - 0.5) * 0.05 * DPR;
          if (p.x < -40) p.x = W + 40; else if (p.x > W + 40) p.x = -40;
          if (p.y < -40) p.y = H + 40; else if (p.y > H + 40) p.y = -40;
        }
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = DPR;
        for (let i = 0; i < ps.length; i++) {
          const a = ps[i];
          for (let j = i + 1; j < ps.length; j++) {
            const b = ps[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              const t = 1 - Math.sqrt(d2) / LINK;
              ctx.strokeStyle = `rgba(130,150,255,${t * 0.16})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          const mdx = a.x - mx, mdy = a.y - my, md2 = mdx * mdx + mdy * mdy;
          if (md2 < MOUSE * MOUSE) {
            const t = 1 - Math.sqrt(md2) / MOUSE;
            ctx.strokeStyle = `rgba(34,211,238,${t * 0.5})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
          }
        }
        for (const p of ps) {
          const md2 = (p.x - mx) * (p.x - mx) + (p.y - my) * (p.y - my);
          const near = md2 < MOUSE * MOUSE;
          const s = (near ? 20 : 13) * DPR;
          ctx.globalAlpha = near ? 1 : 0.8;
          ctx.drawImage(p.c ? gC : gV, p.x - s, p.y - s, s * 2, s * 2);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        raf = requestAnimationFrame(draw);
      };
      resize();
      raf = requestAnimationFrame(draw);
    }

    return () => { cancelAnimationFrame(raf); cleanups.forEach((f) => f()); };
  }, []);

  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="spot" aria-hidden="true" />

      <header>
        <div className="nav">
          <a className="brand" href="#top"><Mark className="mk" />ng<b>chain</b></a>
          <nav className="nav-links">
            {NAV.map((x) => (
              <a key={x.label} className="hide-sm" href={x.href} {...(x.ext ? ext : {})}>{x.label}</a>
            ))}
            <a className="nav-cta" href="https://github.com/ngchain/ngcore" {...ext}>GitHub ↗</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <canvas id="net" ref={netRef} aria-hidden="true" />
        <div className="hero-in">
          <div className="badge" data-reveal><span className="dot" /> proof-of-work · webassembly · post-quantum</div>
          <h1 data-reveal>Next-generation<br /><span className="grad">blockchain.</span></h1>
          <p className="sub" data-reveal>
            A ground-up reconstruction of proof-of-work — <b>auditable</b>, <b>scalable</b>,{" "}
            <b>security-oriented</b> and <b>post-quantum</b> from genesis. An entire settlement layer
            distilled to <b>two entities</b> and <b>six operations</b>, powered by a <b>WebAssembly</b>{" "}
            core that runs any language and settles exact 256-bit value at native speed.
          </p>
          <div className="cta-row" data-reveal>
            <a className="btn btn-primary" href="https://github.com/ngchain/ngcore" {...ext}>Explore the code <span className="a">↗</span></a>
            <a className="btn btn-ghost" href="https://yellowpaper.ngchain.org" {...ext}>Read the yellow paper <span className="a">↗</span></a>
          </div>
        </div>
        <div className="scroll-cue"><span>scroll</span><i /></div>
      </section>

      {/* STATS */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" data-reveal key={s.label}>
                <div className="n" data-count={s.n} data-unit={s.unit}>0{s.unit && <em>{s.unit}</em>}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROTOCOL */}
      <section id="protocol">
        <div className="wrap">
          <div data-reveal><span className="eyebrow">01 / the protocol</span></div>
          <h2 className="h2" data-reveal>Two entities.<br /><span className="grad">Six operations.</span></h2>
          <p className="lead" data-reveal>The entire chain is a small formal system — a state of two nouns, moved by six verbs. Small enough to hold in your head, hard enough to misuse.</p>

          <div className="grid g-2">
            {ENTITIES.map((e) => (
              <article className="card" data-reveal key={e.name}>
                <div className="ci">{e.tag}</div>
                <h3>{e.name}</h3>
                <p>{e.desc}</p>
                <div className="chips">{e.chips.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
              </article>
            ))}
          </div>

          <div className="grid g-3">
            {OPS.map((o) => (
              <article className="card op" data-reveal key={o.name}>
                <span className="glowdot" />
                <div className="no">{o.no}</div>
                <h3>{o.name}</h3>
                <p>{o.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURES */}
      <section id="signatures">
        <div className="wrap">
          <div data-reveal><span className="eyebrow">02 / signatures</span></div>
          <h2 className="h2" data-reveal>Post-quantum,<br /><span className="grad">by choice.</span></h2>
          <p className="lead" data-reveal>Keys derive from a 32-byte seed under a per-key scheme — classical efficiency or assumption-minimal post-quantum, chosen per key, never forced on the whole chain. Bars scale to signature size.</p>
          <div className="sigs">
            {SIGS.map((s) => (
              <div className="sig" style={{ ["--w" as string]: s.w }} key={s.name}>
                <div className="nm">{s.name}</div>
                <div className="rl">{s.role}</div>
                <div className="sz">{s.size}</div>
                <div className="bar"><i /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGN */}
      <section id="design">
        <div className="wrap">
          <div data-reveal><span className="eyebrow">03 / design</span></div>
          <h2 className="h2" data-reveal>Built for<br /><span className="grad">the frontier.</span></h2>
          <p className="lead" data-reveal>
            These are commitments, not footnotes — and the mechanics beneath them, from the
            millisecond retarget to the uncle-reward curve, are derived in full in the forthcoming yellow paper.
          </p>
          <div className="grid g-3">
            {PRINCIPLES.map((p) => (
              <article className="card" data-reveal key={p.title}>
                <div className="ci grad">{p.no}</div>
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
            <div>
              <div data-reveal><span className="eyebrow">04 / quick start</span></div>
              <h2 className="h2" data-reveal>Run it in<br /><span className="grad">one command.</span></h2>
              <p className="lead" data-reveal>Keys stay local; only signed transactions travel. A disposable local chain is one flag away, and any running chain can be forked for contract debugging.</p>
            </div>
            <div className="term" data-reveal>
              <div className="top">
                <span className="dots"><i /><i /><i /></span>
                ~/ngcore
                <span className="cp" id="copy">copy ⧉</span>
              </div>
              <div className="body" id="code" dangerouslySetInnerHTML={{ __html: TERMINAL_HTML }} />
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem">
        <div className="wrap">
          <div data-reveal><span className="eyebrow">05 / ecosystem</span></div>
          <h2 className="h2" data-reveal>A full-stack<br /><span className="grad">network.</span></h2>
          <p className="lead" data-reveal>Everything a layer-one needs, live on second-level domains — nothing it doesn't.</p>
          <div className="grid g-4">
            {ECO.map((e) => (
              <a className="card eco" href={"https://" + e.sd} {...ext} data-reveal key={e.sd}>
                <span className="arr">↗</span>
                <div className="ci">/ {e.no}</div>
                <div><h3>{e.name}</h3><div className="sd">{e.sd}</div></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-cta" data-reveal>
            <h2>Build on the <span className="grad">next generation.</span></h2>
            <p>Open source, post-quantum, and running today on the public testnet.</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="https://github.com/ngchain/ngcore" {...ext}>Start building <span className="a">↗</span></a>
              <a className="btn btn-ghost" href="https://docs.ngchain.org" {...ext}>Read the docs <span className="a">↗</span></a>
            </div>
          </div>

          <div className="foot-grid">
            <a className="foot-brand" href="#top"><Mark className="mk" />ng<b>chain</b></a>
            <div className="foot-links">
              {FOOTER_LINKS.map(([l, h]) => <a href={h} {...ext} key={l}>{l}</a>)}
            </div>
          </div>
          <div className="foot-meta">
            <span className="status"><i /> network: experimental · mainnet undefined</span>
            <span>ngchain — the next-generation blockchain · <span id="year" /></span>
          </div>
        </div>
      </footer>
    </>
  );
}
