import React, { useEffect } from "react";

const NAV = [
  { label: "Model", href: "#model" },
  { label: "Keys", href: "#keys" },
  { label: "Design", href: "#design" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Docs ↗", href: "https://docs.ngchain.org", ext: true },
  { label: "GitHub ↗", href: "https://github.com/ngchain/ngcore", ext: true },
];

const NOUNS = [
  { i: "ENTITY / 01", h: "Address", p: "The 32-byte keccak hash of a public key. Identity, the balance holder, and a namespace — all at once.", tags: ["identity", "balance", "namespace"] },
  { i: "ENTITY / 02", h: "Contract", p: "A compiled WebAssembly module an address opens under its own namespace — committed whole like a git blob, frozen and executed while active.", tags: ["wasm", "git-blob commit", "sandboxed"] },
];

const VERBS = [
  { no: "OP / 01", h: "Generate", p: <>The mining reward — the only tx that mints.</> },
  { no: "OP / 02", h: "Transact", p: <>Pay an address; run its active contract. The call routes to the export named in the payload — <b>main</b> is the fallback.</> },
  { no: "OP / 03", h: "Commit", p: <>Replace the own contract module (a deflate snapshot). The first commit opens the slot.</> },
  { no: "OP / 04", h: "Activate", p: <>Validate and freeze the module, turn the VM on — runs <b>init</b> once.</> },
  { no: "OP / 05", h: "Deactivate", p: <>Turn the VM off, reopen the module for commits.</> },
  { no: "OP / 06", h: "Destroy", p: <>Remove the own slot entirely.</> },
];

const SIGS = [
  { w: "9%", name: "secp256k1", role: "default · classical · eth parity", size: "67 B" },
  { w: "18%", name: "FN-DSA-512", role: "small post-quantum · compact", size: "700 B" },
  { w: "42%", name: "ML-DSA-44", role: "FIPS 204 · the finalized pick", size: "2.5 KB" },
  { w: "100%", name: "SLH-DSA-128s", role: "hash-based · assumption-minimal", size: "7.9 KB" },
];

const PRINCIPLES = [
  { n: "/ 01", h: "WebAssembly, not a bespoke VM", p: "Any language that targets wasm produces a contract, with standard tooling and a decade-hardened sandbox. The frontier choice and the usable one at once." },
  { n: "/ 02", h: "Determinism is the hard constraint", p: "Every validator must compute the same result — and the same gas — on every architecture. It is the filter every performance idea passes through." },
  { n: "/ 03", h: "Exact money, native speed", p: "Token amounts are exact U256, but the hot operations run in a native host module over 32-byte operands — removing a ~1000× ceiling without touching gas semantics." },
];

const SPECS = [
  { count: 4, em: "s", t: "block target" },
  { count: 2, em: "entities", t: "the whole state" },
  { count: 6, em: "operations", t: "the whole grammar" },
  { count: 256, em: "bit", t: "exact money" },
];

const ECO = [
  { n: "/ 01", h: "Explorer", sd: "explorer.ngchain.org" },
  { n: "/ 02", h: "Wallet", sd: "wallet.ngchain.org" },
  { n: "/ 03", h: "Faucet", sd: "faucet.ngchain.org" },
  { n: "/ 04", h: "Mining pool", sd: "pool.ngchain.org" },
  { n: "/ 05", h: <>RPC &amp; API</>, sd: "rpc.ngchain.org" },
  { n: "/ 06", h: "Docs", sd: "docs.ngchain.org" },
  { n: "/ 07", h: "Network status", sd: "status.ngchain.org" },
  { n: "/ 08", h: "Yellow paper", sd: "yellowpaper.ngchain.org" },
];

const FOOTER_LINKS = [
  ["Explorer", "https://explorer.ngchain.org"],
  ["Wallet", "https://wallet.ngchain.org"],
  ["Faucet", "https://faucet.ngchain.org"],
  ["Pool", "https://pool.ngchain.org"],
  ["RPC", "https://rpc.ngchain.org"],
  ["Docs", "https://docs.ngchain.org"],
  ["Status", "https://status.ngchain.org"],
  ["Playground", "https://try.ngchain.org"],
  ["Yellow paper", "https://yellowpaper.ngchain.org"],
  ["GitHub", "https://github.com/ngchain"],
];

const TERMINAL_HTML = `<span class="c"># build</span>
<span class="p">$</span> go build -o ngcore ./cmd/ngcore

<span class="c"># a throwaway local chain</span>
<span class="p">$</span> ./ngcore --zeronet --in-mem

<span class="c"># a wallet — keys never leave the machine</span>
<span class="p">$</span> ./ngcore cli key --new --scheme <span class="k">secp256k1</span>
<span class="p">$</span> ./ngcore cli send --to &lt;bs58&gt; --value 1.5 --fee 0.0001

<span class="c"># first commit deploys the contract</span>
<span class="p">$</span> ./ngcore cli commit --file contract.wasm --fee 0.0001
<span class="p">$</span> ./ngcore cli activate --fee 0.0001
<span class="p">$</span> ./ngcore cli call --contract &lt;bs58&gt; --entry balance_of<span class="cursor-blink"></span>`;

function ext(u) {
  return { target: "_blank", rel: "noopener" };
}

// The isometric ng block mark (from resources/NG.svg), retinted to the site
// palette: facets are currentColor at tiered opacities so it inverts cleanly
// on either theme; `accent` lights the tall facet vermilion.
const Mark = ({ className, accent }) => (
  <svg className={className} viewBox="88 16 464 608" fill="currentColor" aria-hidden="true">
    <path fillOpacity=".72" d="M464,32l72,72H177" />
    <path fillOpacity=".5" d="M104,32v360l72-72l1-216" />
    <path {...(accent ? { style: { fill: "var(--accent)" } } : { fillOpacity: 1 })} d="M464,32v504l72-72V104" />
    <path fillOpacity=".72" d="M104,536l288,72l72-72l-288-72" />
  </svg>
);

export default function App() {
  useEffect(() => {
    const root = document.documentElement, body = document.body;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const hoverable = matchMedia("(hover:hover)").matches;
    const cleanups = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); cleanups.push(() => t.removeEventListener(e, f, o)); };

    document.getElementById("year").textContent = new Date().getFullYear();

    // failsafe: never leave the page stuck behind the preloader
    const failsafe = setTimeout(() => {
      try {
        document.querySelector(".pre").classList.add("done");
        document.querySelectorAll("[data-rise],.mask,.srow").forEach((e) => e.classList.add("in"));
      } catch (e) {}
    }, 6000);

    // preloader
    const pre = document.querySelector(".pre"), cnt = pre.querySelector(".cnt");
    let n = 0;
    const step = setInterval(() => {
      n += Math.floor(Math.random() * 18) + 6; if (n > 100) n = 100;
      cnt.textContent = String(n).padStart(3, "0");
      if (n >= 100) {
        clearInterval(step);
        setTimeout(() => {
          pre.classList.add("done");
          document.querySelectorAll(".hero .mask,[data-rise]").forEach((el, i) => {
            setTimeout(() => el.classList.add("in"), 80 + i * 60);
          });
        }, 420);
      }
    }, 90);

    // cursor
    const cur = document.querySelector(".cur"), ring = document.querySelector(".cur-ring");
    let raf1;
    if (hoverable) {
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      on(window, "mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        cur.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      });
      const loop = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)"; raf1 = requestAnimationFrame(loop); };
      loop();
      const sel = "[data-hov],a,button,.verb,.srow,.noun,.pcard,.eco";
      on(document, "mouseover", (e) => { if (e.target.closest(sel)) body.classList.add("hovering"); });
      on(document, "mouseout", (e) => { if (e.target.closest(sel)) body.classList.remove("hovering"); });
    }

    // scroll progress
    const rail = document.querySelector(".rail i");
    on(window, "scroll", () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (scrollY / h * 100) + "%";
    }, { passive: true });

    // reveal
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .15 });
    document.querySelectorAll("[data-rise],.mask,.srow").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // count up
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        const el = e.target, to = +el.getAttribute("data-count"), em = el.querySelector("em"), suf = em ? em.outerHTML : "", d = 1100;
        let t0 = null;
        const tick = (t) => { if (!t0) t0 = t; const p = Math.min((t - t0) / d, 1); const v = Math.floor((1 - Math.pow(1 - p, 3)) * to); el.innerHTML = v + (suf ? " " + suf : ""); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));
    cleanups.push(() => cio.disconnect());

    // magnetic
    if (hoverable) {
      document.querySelectorAll("nav a,.foot-links a,.theme").forEach((el) => {
        on(el, "mousemove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .3) + "px," + ((e.clientY - r.top - r.height / 2) * .3) + "px)"; });
        on(el, "mouseleave", () => { el.style.transform = ""; });
      });
    }

    // theme
    const tbtn = document.getElementById("theme"), tt = document.getElementById("theme-t");
    on(tbtn, "click", () => {
      const dark = root.getAttribute("data-theme") === "dark";
      root.setAttribute("data-theme", dark ? "light" : "dark");
      tt.textContent = dark ? "Lights off" : "Lights on";
    });

    // copy
    const copy = document.getElementById("copy");
    on(copy, "click", () => {
      const text = document.getElementById("code").innerText;
      navigator.clipboard.writeText(text).then(() => { const o = copy.textContent; copy.textContent = "copied ✓"; setTimeout(() => { copy.textContent = o; }, 1400); });
    });

    // hero canvas: a dynamic metallic particle field — drifting steel nodes
    // wired into a live constellation. Nodes gravitate to the pointer, the
    // links there charge vermilion, and each node carries a specular glint so
    // the whole field reads like brushed, moving metal.
    const cv = document.getElementById("field"), ctx = cv.getContext("2d");
    let ps = [], W, H, raf2, mxx = -9999, myy = -9999, tms = 0;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    const css = getComputedStyle(root);
    const build = () => {
      const n = Math.max(46, Math.min(150, Math.round((W * H) / (DPR * DPR) / 13000)));
      ps = [];
      for (let i = 0; i < n; i++) ps.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .22 * DPR, vy: (Math.random() - .5) * .22 * DPR,
        r: (Math.random() * 1.3 + .7) * DPR, ph: Math.random() * 6.283,
      });
    };
    const resize = () => {
      W = cv.width = innerWidth * DPR; H = cv.height = cv.parentElement.offsetHeight * DPR;
      cv.style.width = innerWidth + "px"; cv.style.height = cv.parentElement.offsetHeight + "px"; build();
    };
    on(window, "mousemove", (e) => { mxx = e.clientX * DPR; myy = e.clientY * DPR; });
    on(window, "mouseout", () => { mxx = -9999; myy = -9999; });
    const draw = () => {
      tms += 1;
      ctx.clearRect(0, 0, W, H);
      const ink = css.getPropertyValue("--ink").trim();
      const acc = css.getPropertyValue("--accent").trim();
      const hi = root.getAttribute("data-theme") === "dark" ? "#f4f2ec" : "#ffffff";
      const LINK = 132 * DPR, MOUSE = 200 * DPR;
      // integrate motion + gentle pointer gravitation
      for (const p of ps) {
        const dx = mxx - p.x, dy = myy - p.y, d2 = dx * dx + dy * dy;
        if (d2 < MOUSE * MOUSE) { const d = Math.sqrt(d2) || 1, f = (1 - d / MOUSE) * .05 * DPR; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.x += p.vx; p.y += p.vy; p.vx *= .992; p.vy *= .992;
        if (Math.abs(p.vx) < .05 * DPR) p.vx += (Math.random() - .5) * .05 * DPR;
        if (Math.abs(p.vy) < .05 * DPR) p.vy += (Math.random() - .5) * .05 * DPR;
        if (p.x < -30) p.x = W + 30; else if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30; else if (p.y > H + 30) p.y = -30;
      }
      // wiring: node-to-node, then node-to-pointer (charged)
      ctx.lineWidth = .6 * DPR;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const t = 1 - Math.sqrt(d2) / LINK;
            ctx.strokeStyle = ink; ctx.globalAlpha = t * .16;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mdx = a.x - mxx, mdy = a.y - myy, md2 = mdx * mdx + mdy * mdy;
        if (md2 < MOUSE * MOUSE) {
          const t = 1 - Math.sqrt(md2) / MOUSE;
          ctx.strokeStyle = acc; ctx.globalAlpha = t * .5; ctx.lineWidth = .9 * DPR;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mxx, myy); ctx.stroke();
          ctx.lineWidth = .6 * DPR;
        }
      }
      // metallic nodes: dark core + offset specular glint, shimmering
      for (const p of ps) {
        const md2 = (p.x - mxx) * (p.x - mxx) + (p.y - myy) * (p.y - myy);
        const near = md2 < MOUSE * MOUSE;
        const sh = .55 + .45 * Math.sin(tms * .03 + p.ph);
        const rr = p.r * (near ? 1.7 : 1);
        ctx.globalAlpha = near ? .95 : .62; ctx.fillStyle = near ? acc : ink;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.283); ctx.fill();
        ctx.globalAlpha = (near ? .85 : .5) * sh; ctx.fillStyle = hi;
        ctx.beginPath(); ctx.arc(p.x - rr * .34, p.y - rr * .34, rr * .5, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; raf2 = requestAnimationFrame(draw);
    };
    resize(); on(window, "resize", resize);
    if (!reduce) raf2 = requestAnimationFrame(draw);

    return () => {
      clearTimeout(failsafe); clearInterval(step);
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2);
      cleanups.forEach((f) => f());
    };
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="cur" /><div className="cur-ring" />
      <div className="rail"><i /></div>

      <div className="pre">
        <Mark className="pre-mark" accent />
        <div className="lbl">ngchain / loading</div>
        <div className="cnt">000</div>
      </div>

      <header>
        <a className="brand" href="#top"><Mark className="brand-mark" />ng<b>·</b>chain</a>
        <nav><ul>
          {NAV.map((x) => (
            <li key={x.label} className={x.ext ? "" : "nav-scroll"}><a href={x.href} data-hov {...(x.ext ? ext() : {})}>{x.label}</a></li>
          ))}
        </ul></nav>
      </header>

      <button className="theme" id="theme" data-hov aria-label="toggle theme">
        <span className="dot" /><span id="theme-t">Lights off</span>
      </button>

      {/* HERO */}
      <section className="hero" id="top">
        <canvas id="field" aria-hidden="true" />
        <div className="hero-inner">
          <div className="eyebrow" data-rise><span className="no">01 —</span> proof-of-work · webassembly · post-quantum</div>
          <h1 style={{ marginTop: "24px" }}>
            <span className="mask"><span className="thin metal">next-generation</span></span>
            <span className="mask"><span><span className="metal">block</span><em>chain</em><span className="metal">.</span></span></span>
          </h1>
          <div className="kicker" data-rise>a sovereign proof-of-work engine — forged down to its irreducible core</div>
          <p className="sub" data-rise>
            <b>ngchain</b> is a ground-up reconstruction of the proof-of-work chain —{" "}
            <b>auditable</b>, <b>scalable</b>, <b>security-oriented</b>, <b>post-quantum</b>{" "}
            from genesis. An entire settlement layer forged down to <b>two entities</b> and{" "}
            <b>six operations</b>, on a <b>WebAssembly</b> core that runs any language and
            settles exact 256-bit value at native speed. The formal design lands in the{" "}
            <b>yellow paper</b>.
          </p>
          <div className="cta-row" data-rise>
            <a className="cta" href="https://github.com/ngchain/ngcore" {...ext()} data-hov>View on GitHub <span>↗</span></a>
            <a className="cta ghost" href="https://docs.ngchain.org" {...ext()} data-hov>Read the docs <span>↗</span></a>
          </div>
        </div>
        <div className="scroll-hint"><span className="bar" /> scroll</div>
      </section>

      {/* MARQUEE */}
      <div className="marq" aria-hidden="true">
        <div className="track">
          {[0, 1].map((k) => (
            <React.Fragment key={k}>
              <span>◇</span> the next-generation blockchain <b>—</b> forged from first principles
              <span>◇</span> auditable · scalable · security-oriented
              <span>◇</span> two entities · six operations <span>◇</span> webassembly, any language
              <span>◇</span> post-quantum from genesis <span>◇</span> 4-second blocks · GHOST uncles
              <span>◇</span> exact 256-bit money at native speed <span>◇</span> specified in the yellow paper {"  "}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MANIFESTO */}
      <section className="manifesto rule">
        <div className="eyebrow" data-rise style={{ marginBottom: "46px" }}><span className="no">02 —</span> the whole model in one paragraph</div>
        <p data-rise>
          An <span className="k">Address</span> is identity, balance and namespace at
          once. A <span className="k">Contract</span> is the code slot it opens under
          itself. <span className="g">That is the entire state.</span>
        </p>
        <div className="note" data-rise>
          Subtraction is the discipline. A smaller surface is easier to reason about,
          harder to misuse, cheaper to keep deterministic across every node — and every
          feature earns its place against that baseline. The full formal treatment —
          state, transitions, gas and consensus — is specified in the ngchain yellow paper.
        </div>
      </section>

      {/* MODEL */}
      <section id="model" className="rule">
        <div className="model-head">
          <div>
            <div className="eyebrow" data-rise><span className="no">03 —</span> the entire chain, formally</div>
            <h2 data-rise style={{ marginTop: "22px" }}>Two&nbsp;entities.<br />Six&nbsp;operations.</h2>
          </div>
          <div className="model-note" data-rise>
            <span className="hint">hover an operation to read its effect</span>
            <code className="schema">tx = {"{ Network · Type · Height · To ·"}<br />{"Value · Fee · Extra · Sign }"}</code>
          </div>
        </div>

        <div className="nouns" data-rise>
          {NOUNS.map((x) => (
            <div className="noun" data-hov key={x.h}>
              <div className="idx">{x.i}</div>
              <div><h3>{x.h}</h3><p>{x.p}</p></div>
              <div className="tags">{x.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </div>
          ))}
        </div>

        <div className="verbs" data-rise>
          {VERBS.map((v) => (
            <div className="verb" data-hov key={v.h}>
              <span className="mark" /><div className="vno">{v.no}</div><h4>{v.h}</h4><p>{v.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURES */}
      <section id="keys" className="sig rule">
        <div>
          <div className="eyebrow" data-rise><span className="no">04 —</span> signatures</div>
          <h2 data-rise style={{ marginTop: "22px" }}>A menu,<br />not a<br />monoculture.</h2>
          <p className="lead" data-rise>
            Keys derive from a 32-byte seed under a per-key scheme. Classical
            efficiency or assumption-minimal post-quantum — chosen per key, not
            per chain. Bars scale to envelope size.
          </p>
        </div>
        <div className="sigrows">
          {SIGS.map((s) => (
            <div className="srow" data-hov style={{ "--w": s.w }} key={s.name}>
              <div className="name">{s.name}</div><div className="role">{s.role}</div>
              <div className="size">{s.size}</div><div className="bar"><i /></div>
            </div>
          ))}
        </div>
      </section>

      {/* PRINCIPLES */}
      <section id="design" className="principles rule">
        <div className="eyebrow" data-rise style={{ marginBottom: "26px" }}><span className="no">05 —</span> the design rule</div>
        <h2 data-rise>The frontier of chain design — made usable.</h2>
        <p className="lead" data-rise>
          These are commitments, not footnotes. The mechanics beneath them — the
          millisecond retarget, the GHOST uncle-reward curve, the gas model and the
          determinism proof — are derived in full in the forthcoming yellow paper.
        </p>
        <div className="pgrid" data-rise>
          {PRINCIPLES.map((p) => (
            <div className="pcard" data-hov key={p.n}><div className="pn">{p.n}</div><h3>{p.h}</h3><p>{p.p}</p></div>
          ))}
        </div>
      </section>

      {/* SPECS */}
      <section className="rule" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="specs">
          {SPECS.map((s) => (
            <div className="spec" data-hov key={s.t}>
              <div className="n" data-count={s.count}>{s.em === "s" ? <em>s</em> : <>&nbsp;<em>{s.em}</em></>}</div>
              <div className="t">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* START */}
      <section id="start" className="start rule">
        <div>
          <div className="eyebrow" data-rise><span className="no">06 —</span> quick start</div>
          <h2 data-rise style={{ marginTop: "22px" }}>Build it.<br />Spend directly.</h2>
          <p className="lead" data-rise>
            Keys stay local; only signed txs travel. A throwaway local chain is
            one flag away. Fork a running chain for contract debugging, anvil-style.
          </p>
        </div>
        <div className="term" data-rise>
          <div className="top">
            <span>~/ngcore</span>
            <span className="dots"><i /><i /><i /></span>
            <span className="copy" data-hov id="copy">copy ⧉</span>
          </div>
          <div className="body" id="code" dangerouslySetInnerHTML={{ __html: TERMINAL_HTML }} />
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="rule">
        <div className="eco-head">
          <div>
            <div className="eyebrow" data-rise><span className="no">07 —</span> the ecosystem</div>
            <h2 data-rise style={{ marginTop: "22px" }}>Everything an L1 needs.<br />Nothing it doesn't.</h2>
          </div>
          <div className="eyebrow" data-rise style={{ maxWidth: "26ch", textAlign: "right", color: "var(--mute)" }}>the full stack, on second-level domains — explorer, wallet, faucet, pool, rpc &amp; more.</div>
        </div>
        <div className="eco-grid" data-rise>
          {ECO.map((e) => (
            <a className="eco" href={"https://" + e.sd} {...ext()} data-hov key={e.sd}>
              <span className="arr">↗</span><div className="ei">{e.n}</div>
              <div><h4>{e.h}</h4><div className="sd">{e.sd}</div></div>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="foot">
        <Mark className="foot-mark" accent />
        <div className="foot-big" data-rise>ng<em>·</em>chain</div>
        <div className="kicker" data-rise style={{ marginTop: "18px", fontFamily: "var(--f-mono)", fontSize: "13px", letterSpacing: ".06em", color: "var(--mute)" }}>the next-generation blockchain — forged from first principles, specified in the yellow paper</div>
        <div className="foot-grid">
          <div className="foot-links">
            {FOOTER_LINKS.map(([l, h]) => <a href={h} {...ext()} data-hov key={l}>{l}</a>)}
            <a href="#top" data-hov>↑ Top</a>
          </div>
          <div className="foot-meta">
            <span className="status-dot" />status: experimental<br />
            consensus formats change freely · mainnet undefined<br />
            built by subtraction · <span id="year" />
          </div>
        </div>
      </footer>
    </>
  );
}
