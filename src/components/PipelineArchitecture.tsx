import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Cpu } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   COORDINATE MAP  (viewBox 0 0 760 420)
   ─────────────────────────────────────────────────────────
   INPUT      : 10,110 → 110,195      (cx≈60)
   DISCOVERY  : 120,100 → 310,230     (cx≈215, gate inside)
   CHUNKER    : 325,10  → 470,72      (top-right dim box)
   EXPORT     : 480,10  → 750,130     (top-far-right, green)
   AGENTS-BOT : 480,140 → 750,270     (right, pink ghost)
   3-AGENT KV : 185,300 → 340,380     (bottom-center, yellow)
   HALLUC AI  : 350,300 → 545,380     (bottom-right, yellow)
   SCORE R2   : 10,300  → 175,380     (bottom-left, orange/yellow)
   ─────────────────────────────────────────────────────────
   Main pipe y=155 (horizontal flow)
   Chunker sits above pipe at y=10–72
   Export/Bot sit right of x=480
   KV/Halluc/Score sit below y=300
*/

const BEATS = [
  {
    label: "BEAT 0 /// query formed · country + pillar selected",
    pipes: [] as string[],
    active: ["n-input"],
    gate: "closed",
    dot: { path: [[60,155],[120,155]] as [number,number][], color: "#ffffff", r: 7, sq: false, dur: 1200 },
    wait: 1500,
    panelMod: "",
    pt: "STEP 0 /// INPUT · COUNTRY + PILLAR SELECTED",
    pb: "A <b>white dot</b> departs from the query origin. <code>Country Code + Pillar ID</code> assembled. RDTII indicator set mapped to target economy. <b>Waiting for discovery.</b>",
  },
  {
    label: "BEAT 1 /// discovery engine · crawl + retrieve evidence",
    pipes: ["pl-id"],
    active: ["n-input","n-discovery"],
    gate: "closed",
    dot: { path: [[60,155],[120,155],[215,155]] as [number,number][], color: "#00f0ff", r: 6, sq: false, dur: 1400 },
    wait: 1800,
    panelMod: "",
    pt: "STEP 1 /// DISCOVERY ENGINE · TAVILY + PLAYWRIGHT",
    pb: "<b>Discovery Engine</b> activates. Tavily + Playwright crawl official legal portals. Multi-engine PDF extraction + OCR. <code>Structured text</code> with language detection returned.",
  },
  {
    label: "BEAT 2 /// chunker + embedder · vector pipeline",
    pipes: ["pl-id","pl-dc","pl-chunk-up"],
    active: ["n-input","n-discovery","n-chunker"],
    gate: "hold",
    dot: { path: [[60,155],[120,155],[310,155],[398,72]] as [number,number][], color: "#818cf8", r: 6, sq: false, dur: 1400 },
    wait: 1800,
    panelMod: "",
    pt: "STEP 2 /// CHUNKER + EMBEDDER · CHROMADB VECTOR STORE",
    pb: "<b>Chunker</b> splits documents into passages. <b>Embedder</b> (bge-base-en-v1.5) writes vectors to <b>ChromaDB</b>. Collection ready for <code>similarity search</code>. Gate = HOLD.",
  },
  {
    label: "BEAT 3 /// 3-agent adversarial pipeline · gate open",
    pipes: ["pl-id","pl-dc","pl-chunk-up","pl-kv"],
    active: ["n-input","n-discovery","n-chunker","n-agents","n-prosecution"],
    gate: "open",
    dot: { path: [[262,300],[262,210]] as [number,number][], color: "#eab308", r: 5, sq: true, dur: 1200 },
    wait: 2200,
    panelMod: "",
    pt: "STEP 3 /// 3-AGENT ADVERSARIAL PIPELINE · GATE OPEN",
    pb: "<b>Prosecution → Defense → Arbiter</b>. Each indicator scored via adversarial LLM debate. <b>Hallucination Validation</b> checks quote grounding + fuzzy matching. <em>Gate OPEN.</em>",
  },
  {
    label: "BEAT 4 /// score mapping · hallucination check",
    pipes: ["pl-id","pl-dc","pl-chunk-up","pl-kv","pl-ai"],
    active: ["n-input","n-discovery","n-chunker","n-agents","n-prosecution","n-halluc","n-score"],
    gate: "open",
    dot: { path: [[455,340],[195,340]] as [number,number][], color: "#eab308", r: 5, sq: true, dur: 1100 },
    wait: 2200,
    panelMod: "",
    pt: "STEP 4 /// SCORE MAPPING · HALLUCINATION VALIDATION",
    pb: "<b>Yellow square</b> — state data, not a page. <code>Promise.all([scores])</code> collects adversarial results. Hallucination check validates quote grounding. <b>Score Mapping</b> normalises to 0–100.",
  },
  {
    label: "BEAT 5A /// structured export · PostgreSQL + UN template",
    pipes: ["pl-id","pl-dc","pl-chunk-up","pl-wh"],
    active: ["n-input","n-discovery","n-chunker","n-export"],
    gate: "open-human",
    dot: { path: [[398,72],[480,72],[615,72]] as [number,number][], color: "#00bba9", r: 8, sq: false, dur: 3000 },
    wait: 5500,
    panelMod: "h",
    pt: "STEP 5A /// EXPORT · POSTGRESQL + JSON + CSV + EXCEL",
    pb: "<b>Large teal dot</b> — rich structured payload. Scores persisted to <b>PostgreSQL</b>. Exported as <b>JSON</b>, <b>CSV</b> (3 variants), or <b>Excel</b> (3 sheets) in official UN RDTII template. <b>Pipeline complete.</b>",
  },
  {
    label: "BEAT 5B /// raw score payload · score store",
    pipes: ["pl-id","pl-dc","pl-chunk-up","pl-wb","pl-ghost"],
    active: ["n-input","n-discovery","n-chunker","n-prosecution","n-halluc","n-score"],
    gate: "open-bot",
    dot: { path: [[398,155],[480,155],[615,205]] as [number,number][], color: "#e0287d", r: 5, sq: false, dur: 3000 },
    wait: 5500,
    panelMod: "b",
    pt: "STEP 5B /// RAW SCORE PAYLOAD · SCORE_STORE.get(key)",
    pb: "<b>Small pink dot</b> — payload from <code>SCORE_STORE</code>. Raw adversarial debate data, hallucination flags, and citation evidence returned as stripped semantic JSON. <em>No hallucination. Grounded in evidence.</em>",
  },
];

const DETAILS: Record<string, {pt:string,pb:string}> = {
  input:       { pt:"INPUT NODE /// query origin · country + pillar",     pb:"RDTII compliance query formed from <code>Country Code</code> + <code>Pillar ID</code>. Every indicator in the pillar set is resolved. <b>White dot</b> departs carrying an unclassified payload." },
  discovery:   { pt:"DISCOVERY ENGINE /// crawl + retrieve",              pb:"Tavily + Playwright crawl official legal portals. Multi-engine PDF extraction + OCR. Structured text with language detection. <b>Sole data source — no hallucination at origin.</b>" },
  chunker:     { pt:"CHUNKER + EMBEDDER /// vector pipeline",             pb:"Documents split into passages. Embedder (bge-base-en-v1.5) writes vectors to <b>ChromaDB</b>. Collection ready for <code>similarity search</code>. <b>Gate = HOLD.</b>" },
  agents:      { pt:"3-AGENT KV STORE /// adversarial pipeline state",    pb:"<b>Prosecution → Defense → Arbiter</b>. Each fires in sequence. KV stores state between agent calls. Gate opens on consensus. <em>Gate OPEN.</em>" },
  prosecution: { pt:"AGENTS NODE /// adversarial LLM debate",             pb:"Prosecution builds the strongest compliant case. Defense rebuts. Arbiter decides + assigns score 0–100. <code>max_tokens=2048</code>. Structured JSON output." },
  halluc:      { pt:"HALLUCINATION CHECK /// ground truth validation",    pb:"Every cited quote fuzzy-matched against retrieved chunks. <code>RapidFuzz</code> threshold = 85%. Ungrounded citations are flagged and penalised. <b>Sub-10ms validation.</b>" },
  score:       { pt:"SCORE STORE /// normalise to 0–100",                 pb:"Arbiter output normalised to RDTII scale. Pillar aggregate computed. Country-level rollup available. <b>Yellow square packet = state data.</b>" },
  export:      { pt:"EXPORT /// persist + format · pipeline complete",    pb:"Scores persisted to <b>PostgreSQL</b>. Exported as <b>JSON</b>, <b>CSV</b> (3 variants), or <b>Excel</b> (3 sheets) in official UN RDTII template. <b>Pipeline complete.</b>" },
};

export default function PipelineArchitecture() {
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const animRef  = useRef<number>();
  const [dotPos, setDotPos] = useState<{x:number,y:number,op:number}>({x:60,y:155,op:0});

  const stopTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(animRef.current!);
  }, []);

  const advance = useCallback(() => setBeat(p => (p + 1) % BEATS.length), []);

  const animateDot = useCallback((idx: number) => {
    cancelAnimationFrame(animRef.current!);
    const bd = BEATS[idx];
    if (!bd.dot) { setDotPos({x:60,y:155,op:0}); return; }
    const pts = bd.dot.path;
    if (pts.length < 2) { setDotPos({x:pts[0][0],y:pts[0][1],op:0}); return; }
    const segs: {x0:number,y0:number,x1:number,y1:number,len:number}[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i+1][0]-pts[i][0], dy = pts[i+1][1]-pts[i][1];
      const len = Math.sqrt(dx*dx+dy*dy);
      segs.push({x0:pts[i][0],y0:pts[i][1],x1:pts[i+1][0],y1:pts[i+1][1],len});
      total += len;
    }
    const dur = bd.dot.dur;
    let start = -1;
    function step(ts: number) {
      if (start < 0) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      const e = t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
      const dist = e * total;
      let acc = 0, x = pts[0][0], y = pts[0][1];
      for (const s of segs) {
        if (dist <= acc + s.len) { const f=(dist-acc)/s.len; x=s.x0+f*(s.x1-s.x0); y=s.y0+f*(s.y1-s.y0); break; }
        acc += s.len;
      }
      const op = t<0.08 ? t/0.08 : t>0.92 ? (1-t)/0.08 : 1;
      setDotPos({x,y,op});
      if (t<1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    animateDot(beat);
    if (playing) timerRef.current = setTimeout(advance, BEATS[beat].wait);
    return stopTimer;
  }, [beat, playing, advance, stopTimer, animateDot]);

  const goBeat = (i: number) => { stopTimer(); setPlaying(false); setBeat(i); setSelected(null); };
  const togglePlay = () => {
    setPlaying(p => {
      if (!p) timerRef.current = setTimeout(advance, BEATS[beat].wait);
      else stopTimer();
      return !p;
    });
  };
  const sel = (id: string) => { stopTimer(); setPlaying(false); setSelected(id); };

  const b   = BEATS[beat];
  const info = selected ? DETAILS[selected] : null;
  const pt   = info ? info.pt : b.pt;
  const pb   = info ? info.pb : b.pb;
  const pm   = info ? "" : b.panelMod;

  const na = (id: string) => b.active.includes(id);
  const pa = (id: string) => b.pipes.includes(id);

  type GS = "closed"|"hold"|"open"|"open-human"|"open-bot";
  const gs   = b.gate as GS;
  const gc   = gs==="closed"?"#e73c5d":gs==="hold"?"#eab308":gs==="open-human"?"#00bba9":gs==="open-bot"?"#e0287d":"#00f0ff";
  const gt   = gs==="closed"?"HOLD":gs==="hold"?"PROC":"OPEN";
  const gg   = (gs==="open"||gs==="open-human"||gs==="open-bot")?12:gs==="hold"?8:0;
  const ibt  = gs==="open-human"?"HUMAN":gs==="open-bot"?"BOT":"isBot?";
  const dc   = b.dot?.color ?? "#fff";
  const dr   = b.dot?.r ?? 6;

  /* pipe helper */
  const P = (id: string, el: React.ReactElement<React.SVGAttributes<SVGElement>>) => {
    const active = pa(id);
    return el;
  }; void P;

  return (
    <div className="arch">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes scan       {0%{top:-3px}100%{top:100%}}
        @keyframes blink      {0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes flicker    {0%,89%,91%,100%{opacity:1}90%{opacity:.3}}
        @keyframes ghostfloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pipe       {to{stroke-dashoffset:-20}}
        @keyframes ai-wave    {0%,100%{opacity:.2}50%{opacity:1;filter:drop-shadow(0 0 4px #eab308)}}
        @keyframes pulse-data {0%,100%{opacity:1}50%{opacity:.4;filter:brightness(1.5) drop-shadow(0 0 5px currentColor)}}
        @keyframes glow-pulse {0%,100%{opacity:.15}50%{opacity:.35}}

        .agp-dash{
          width:100%;position:relative;z-index:2;
          display:flex;flex-direction:column;padding:.8em 1.2em;
          background-image:radial-gradient(circle,rgba(67,134,195,0.18) 1px,transparent 1px);
          background-size:1.5em 1.5em;background-position:center center;
          overflow:hidden;border-radius:14px;
          background-color:#060522;
          border:1px solid rgba(99,102,241,0.12);
          box-shadow:0 8px 40px rgba(0,0,0,.2);
          font-family:'JetBrains Mono','Courier New',monospace;
        }
        .agp-scanline{position:absolute;left:0;top:0;width:100%;height:3px;
          background:linear-gradient(transparent,rgba(0,240,255,.1),transparent);
          animation:scan 6s linear infinite;pointer-events:none;z-index:10;}

        .agp-topbar{display:flex;align-items:center;justify-content:space-between;
          margin-bottom:.6em;padding-bottom:.6em;
          border-bottom:1px solid rgba(67,134,195,.18);flex-shrink:0;}
        .agp-tb-left{display:flex;align-items:center;gap:.8em;}
        .agp-tb-dots{display:flex;gap:.3em;}
        .agp-tb-dots span{width:.6em;height:.6em;display:block;
          clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);}
        .agp-tb-sys{font-size:.7em;color:rgba(0,240,255,.5);letter-spacing:.16em;}
        .agp-tb-title{font-size:.85em;color:#eab308;letter-spacing:.12em;animation:flicker 9s infinite;}
        .agp-tb-live{font-size:.7em;color:#00f0ff;letter-spacing:.14em;}
        .agp-cur{animation:blink 1s step-end infinite;}
        .agp-tb-livewrap{display:flex;align-items:center;}
        .agp-tb-btn{background:transparent;border:1px solid #00f0ff;color:#00f0ff;
          font-family:'JetBrains Mono',monospace;font-size:.7em;
          padding:.3em .8em;cursor:pointer;letter-spacing:.1em;
          transition:all .2s;margin-right:1em;}
        .agp-tb-btn:hover{background:rgba(0,240,255,.2);}
        .agp-tb-btn.paused{border-color:#eab308;color:#eab308;}

        .agp-beats{display:flex;gap:.4em;justify-content:center;margin:0 0 .3em;flex-shrink:0;}
        .agp-bp{width:2.2em;height:.3em;background:rgba(0,240,255,.2);cursor:pointer;
          transition:background .2s,box-shadow .2s;border:none;padding:0;
          clip-path:polygon(.3em 0%,100% 0%,calc(100% - .3em) 100%,0% 100%);}
        .agp-bp:hover{background:#00f0ff;box-shadow:0 0 5px #00f0ff;}
        .agp-bp.on{background:#eab308;box-shadow:0 0 5px #eab308;}
        .agp-blabel{text-align:center;font-size:.72em;margin:.1em 0 .5em;
          color:rgba(0,240,255,.4);letter-spacing:.1em;min-height:1em;
          transition:color .2s;flex-shrink:0;}
        .agp-blabel.on{color:#00f0ff;text-shadow:0 0 5px rgba(0,240,255,.4);}

        .agp-svg{display:block;width:100%;height:auto;overflow:visible;}

        .agp-panel{position:relative;background:#04122d;
          padding:.8em 1em;margin-top:.5em;
          border-left:3px solid rgba(0,240,255,.3);flex-shrink:0;
          clip-path:polygon(0 0,calc(100% - .8em) 0,100% .8em,100% 100%,.8em 100%,0 calc(100% - .8em));
          min-height:5em;overflow:hidden;}
        .agp-panel::before{content:'';position:absolute;inset:0;background:rgba(0,240,255,.4);z-index:-2;}
        .agp-panel::after{content:'';position:absolute;inset:1px;background:#060f22;z-index:-1;
          clip-path:polygon(0 0,calc(100% - .7em) 0,100% .7em,100% 100%,.7em 100%,0 calc(100% - .7em));}
        .agp-panel.h{border-left-color:#00bba9;}
        .agp-panel.b{border-left-color:#e0287d;}
        .agp-pt{font-size:.82em;color:#eab308;letter-spacing:.08em;margin-bottom:.3em;font-weight:700;}
        .agp-pb{font-size:.78em;color:#7d8b9e;line-height:1.6;}
        .agp-pb b{color:#e2e8f0;font-weight:500;}
        .agp-pb code{color:#00f0ff;font-size:.9em;background:rgba(0,240,255,.1);padding:.1em .3em;border-radius:2px;}
        .agp-pb em{color:#e0287d;font-style:normal;text-shadow:0 0 4px rgba(224,40,125,.5);}

        .piped{stroke-dasharray:7 4;animation:pipe .65s linear infinite;}
        .piped-slow{stroke-dasharray:5 5;animation:pipe .9s linear infinite;}
        g[id^="n-"]{cursor:pointer;}
        .ghost-float{animation:ghostfloat 2.5s ease-in-out infinite;}
        .glow-pulse{animation:glow-pulse 2s ease-in-out infinite;}
      `}</style>

      <div className="arch-inner">
        <motion.div className="wa-header"
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.5 }}>
          <div className="wa-chip"><Cpu style={{ width:12, height:12 }}/>Pipeline Architecture</div>
          <h2 className="wa-h2">Country + Pillar <span className="emp">→ Structured Output</span></h2>
        </motion.div>

        <div className="agp-dash">
          <div className="agp-scanline"/>

          {/* TOPBAR */}
          <div className="agp-topbar">
            <div className="agp-tb-left">
              <div className="agp-tb-dots">
                <span style={{ background:"#e0287d" }}/>
                <span style={{ background:"#eab308" }}/>
                <span style={{ background:"#00bba9" }}/>
              </div>
              <span className="agp-tb-sys">SYS:RDTII_PIPELINE_v2</span>
            </div>
            <span className="agp-tb-title">/// RDTII COMPLIANCE ENGINE ///</span>
            <div className="agp-tb-livewrap">
              <button className={`agp-tb-btn${playing ? "" : " paused"}`} onClick={togglePlay}>
                {playing ? "PAUSE" : "PLAY"}
              </button>
              <span className="agp-tb-live">LIVE<span className="agp-cur">_</span></span>
            </div>
          </div>

          {/* BEATS */}
          <div className="agp-beats">
            {BEATS.map((_, i) => (
              <button key={i} className={`agp-bp${i===beat?" on":""}`} onClick={() => goBeat(i)}/>
            ))}
          </div>
          <div className={`agp-blabel${beat>=0?" on":""}`}>{b.label}<span className="agp-cur">_</span></div>

          {/* ════════════════════════════════════════════════════════
              SVG  — viewBox 0 0 760 420
              All nodes fit cleanly within bounds.
          ════════════════════════════════════════════════════════ */}
          <svg className="agp-svg" viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ah"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <marker id="at"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#00bba9" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <marker id="ap"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#e0287d" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <marker id="apg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#e0287d" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <marker id="ay"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <marker id="ag"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/></marker>
              <filter id="glow-p"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            {/* ── GHOST BACKGROUND LINES ── */}
            {/* INPUT → DISCOVERY */}
            <line x1="110" y1="155" x2="120" y2="155" stroke="#00f0ff" strokeOpacity=".08" strokeWidth="2"/>
            {/* DISCOVERY → CHUNKER vertical */}
            <line x1="398" y1="115" x2="398" y2="72" stroke="#818cf8" strokeOpacity=".12" strokeWidth="1.5" strokeDasharray="4 4"/>
            {/* DISCOVERY → right */}
            <line x1="310" y1="155" x2="480" y2="155" stroke="#00f0ff" strokeOpacity=".06" strokeWidth="1.5"/>
            {/* Fork up to EXPORT */}
            <path d="M398 115 Q430 115 430 72 H480" fill="none" stroke="#00bba9" strokeOpacity=".07" strokeWidth="2"/>
            {/* Fork down to AGENTS */}
            <path d="M398 200 Q430 200 430 205 H480" fill="none" stroke="#e0287d" strokeOpacity=".07" strokeWidth="2"/>
            {/* KV vertical */}
            <line x1="262" y1="300" x2="262" y2="210" stroke="#eab308" strokeOpacity=".07" strokeWidth="1.5" strokeDasharray="4 4"/>
            {/* Halluc horizontal */}
            <line x1="455" y1="340" x2="355" y2="340" stroke="#eab308" strokeOpacity=".07" strokeWidth="1" strokeDasharray="3 5"/>
            {/* Ghost path */}
            <path d="M530 300 Q530 260 480 240" fill="none" stroke="#e0287d" strokeOpacity=".07" strokeWidth="1" strokeDasharray="3 5"/>

            {/* ── ANIMATED PIPES ── */}
            {/* INPUT → DISCOVERY */}
            <line id="pl-id" x1="110" y1="155" x2="120" y2="155"
              stroke={pa("pl-id")?"#00f0ff":"rgba(0,240,255,.04)"}
              strokeWidth={pa("pl-id")?2:1.5}
              className={pa("pl-id")?"piped":""}
              markerEnd={pa("pl-id")?"url(#ah)":undefined}
              opacity={pa("pl-id")?1:0.25}/>

            {/* DISCOVERY → CHUNKER (discovery node right edge → chunker bottom) */}
            <line id="pl-dc" x1="310" y1="155" x2="398" y2="155"
              stroke={pa("pl-dc")?"#00f0ff":"rgba(0,240,255,.04)"}
              strokeWidth={pa("pl-dc")?2:1.5}
              className={pa("pl-dc")?"piped":""}
              markerEnd={pa("pl-dc")?"url(#ah)":undefined}
              opacity={pa("pl-dc")?1:0.25}/>

            {/* CHUNKER vertical pipe up */}
            <line id="pl-chunk-up" x1="398" y1="115" x2="398" y2="73"
              stroke={pa("pl-chunk-up")?"#818cf8":"rgba(129,140,248,.04)"}
              strokeWidth={pa("pl-chunk-up")?1.5:1}
              strokeDasharray="5 5"
              className={pa("pl-chunk-up")?"piped-slow":""}
              markerEnd={pa("pl-chunk-up")?"url(#ag)":undefined}
              opacity={pa("pl-chunk-up")?1:0.25}/>

            {/* EXPORT (teal fork up-right) */}
            <path id="pl-wh" d="M398 115 Q430 115 430 72 H480" fill="none"
              stroke={pa("pl-wh")?"#00bba9":"rgba(0,187,169,.04)"}
              strokeWidth={pa("pl-wh")?2.5:1.5}
              className={pa("pl-wh")?"piped":""}
              markerEnd={pa("pl-wh")?"url(#at)":undefined}
              opacity={pa("pl-wh")?1:0.25}/>

            {/* BOT / AGENTS (pink fork down) */}
            <path id="pl-wb" d="M398 200 Q430 200 430 205 H480" fill="none"
              stroke={pa("pl-wb")?"#e0287d":"rgba(224,40,125,.04)"}
              strokeWidth={pa("pl-wb")?2.5:1.5}
              className={pa("pl-wb")?"piped":""}
              markerEnd={pa("pl-wb")?"url(#ap)":undefined}
              opacity={pa("pl-wb")?1:0.25}/>

            {/* KV vertical up */}
            <line id="pl-kv" x1="262" y1="300" x2="262" y2="210"
              stroke={pa("pl-kv")?"#eab308":"rgba(234,179,8,.04)"}
              strokeWidth={pa("pl-kv")?1.5:1}
              strokeDasharray="5 5"
              className={pa("pl-kv")?"piped-slow":""}
              markerEnd={pa("pl-kv")?"url(#ay)":undefined}
              opacity={pa("pl-kv")?1:0.25}/>

            {/* Halluc horizontal */}
            <line id="pl-ai" x1="455" y1="340" x2="355" y2="340"
              stroke={pa("pl-ai")?"#eab308":"rgba(234,179,8,.04)"}
              strokeWidth={pa("pl-ai")?1.5:1}
              strokeDasharray="5 5"
              className={pa("pl-ai")?"piped-slow":""}
              markerEnd={pa("pl-ai")?"url(#ay)":undefined}
              opacity={pa("pl-ai")?1:0.25}/>

            {/* Ghost path */}
            <path id="pl-ghost" d="M530 300 Q530 260 480 240" fill="none"
              stroke={pa("pl-ghost")?"#e0287d":"rgba(224,40,125,.04)"}
              strokeWidth={pa("pl-ghost")?1:0.8}
              strokeDasharray="4 5"
              className={pa("pl-ghost")?"piped":""}
              markerEnd={pa("pl-ghost")?"url(#apg)":undefined}
              opacity={pa("pl-ghost")?1:0.25}/>

            {/* ── PIPE LABELS ── */}
            <text x="115" y="147" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#f1f5f9"
              opacity={pa("pl-id")?0.5:0.12} textAnchor="middle">// request</text>
            <text x="280" y="273" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#eab308"
              opacity={pa("pl-kv")?0.7:0.1}>Promise.all</text>
            <text x="445" y="63" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#00bba9"
              opacity={pa("pl-wh")?0.7:0.1} textAnchor="middle">StructuredExport</text>
            <text x="445" y="195" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#f1f5f9"
              opacity={pa("pl-wb")?0.7:0.1} textAnchor="middle">ScoreStore</text>
            <text x="500" y="258" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#e0287d"
              opacity={pa("pl-ghost")?0.5:0.1} textAnchor="middle">raw score origin</text>

            {/* ══════════════════════════════════════════════════
                NODE: INPUT  (10,110 → 110,200)
            ══════════════════════════════════════════════════ */}
            <g id="n-input" onClick={() => sel("input")} style={{ opacity:na("n-input")?1:0.25, transition:"opacity .3s" }}>
              <polygon points="10,110 10,200 100,200 110,190 110,110"
                fill="#04122d"
                stroke={na("n-input")?"#00f0ff":"#0a1a2a"}
                strokeOpacity={na("n-input")?0.7:0.2}
                strokeWidth="1"/>
              <polyline points="10,122 22,110"  fill="none" stroke="#00f0ff" strokeOpacity=".4" strokeWidth="1"/>
              <polyline points="98,200 110,188" fill="none" stroke="#00f0ff" strokeOpacity=".2" strokeWidth="1"/>

              {/* Person head */}
              <path d="M22 122 C17 122 17 128 22 128" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <path d="M34 122 C39 122 39 128 34 128" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <circle cx="28" cy="125" r="7" fill="#04122d" stroke="#00f0ff" strokeWidth="1.5"/>
              <circle cx="25" cy="124" r="1.5" fill="#00f0ff" style={{ filter:"drop-shadow(0 0 2px #00f0ff)" }}/>
              <circle cx="31" cy="124" r="1.5" fill="#00f0ff" style={{ filter:"drop-shadow(0 0 2px #00f0ff)" }}/>
              <path d="M25 127 Q28 130 31 127" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <text x="44" y="127" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#00f0ff" fontWeight="700">YOU</text>
              <text x="44" y="136" fontFamily="JetBrains Mono,monospace" fontSize="7"  fill="#00f0ff" opacity=".6">// analyst</text>

              <line x1="28" y1="135" x2="28" y2="147" stroke="#7d8b9e" strokeWidth="1" strokeDasharray="2 2" opacity=".5"/>
              <polygon points="28,139 30,141 28,143 26,141" fill="#00f0ff" opacity=".6"/>

              {/* Robot */}
              <polyline points="24,149 24,151 32,151 32,149" fill="none" stroke="#e0287d" strokeWidth="1.2"/>
              <line x1="28" y1="149" x2="28" y2="154" stroke="#e0287d" strokeWidth="1.2"/>
              <rect x="18" y="154" width="20" height="13" rx="1.5" fill="#04122d" stroke="#e0287d" strokeWidth="1.5"/>
              <rect x="21" y="157" width="5" height="6" rx="1" fill="#e0287d" style={{ filter:"drop-shadow(0 0 2px #e0287d)" }}/>
              <rect x="30" y="157" width="5" height="6" rx="1" fill="#e0287d" style={{ filter:"drop-shadow(0 0 2px #e0287d)" }}/>
              <text x="44" y="160" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e0287d" fontWeight="700">BOT</text>
              <text x="44" y="169" fontFamily="JetBrains Mono,monospace" fontSize="7"  fill="#e0287d" opacity=".6">// crawler</text>
              <text x="60" y="185" fontFamily="JetBrains Mono,monospace" fontSize="7"  fill="#7d8b9e" opacity=".8" textAnchor="middle">User-Agent →</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: DISCOVERY ENGINE  (120,100 → 310,230)
            ══════════════════════════════════════════════════ */}
            <g id="n-discovery" onClick={() => sel("discovery")} style={{ opacity:na("n-discovery")?1:0.2, transition:"opacity .3s" }}>
              <polygon points="120,100 120,230 298,230 310,218 310,100"
                fill="#04122d"
                stroke={na("n-discovery")?"#00f0ff":"#0a1a2a"}
                strokeWidth="1.2"/>
              <polyline points="120,114 134,100"  fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <polyline points="294,230 310,214" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <polyline points="120,214 120,230 134,230" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>
              <polyline points="294,100 310,100 310,114" fill="none" stroke="#00f0ff" strokeWidth="1.5"/>

              <text x="215" y="120" fontFamily="JetBrains Mono,monospace" fontSize="12" fontWeight="700" fill="#00f0ff" textAnchor="middle">DISCOVERY ENGINE</text>
              <text x="215" y="132" fontFamily="JetBrains Mono,monospace" fontSize="8"  fill="#c8d8f0" opacity=".7" textAnchor="middle">Tavily · Playwright · OCR</text>

              {/* Cloud icon */}
              <path d="M130 155 a4.5 4.5 0 0 1 4.5-4.5 a7.5 7.5 0 0 1 14-4.5 a6 6 0 0 1 7.5 6 v3 h-26z" fill="#00f0ff" opacity=".8"/>

              {/* isBot gate box */}
              <polygon points="164,145 168,141 228,141 232,145 232,153 228,157 168,157 164,153"
                fill="#0a1020" stroke="#00f0ff" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="160" y1="149" x2="164" y2="149" stroke="#00f0ff" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="232" y1="149" x2="236" y2="149" stroke="#00f0ff" strokeOpacity=".5" strokeWidth="1"/>
              <text x="198" y="153" fontFamily="JetBrains Mono,monospace" fontSize="9" fontWeight="700"
                fill={gc} textAnchor="middle">{ibt}</text>
              <text x="266" y="146" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="#00f0ff" opacity=".5" textAnchor="middle">GATE</text>
              <text x="266" y="158" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="700" fill={gc} textAnchor="middle">{gt}</text>

              {/* Gate panels */}
              <rect x="162" y="163" width="54" height="2" fill="#00f0ff" opacity=".25"/>
              <rect x="162" y="187" width="54" height="2" fill="#00f0ff" opacity=".25"/>
              <g style={{ transform:`translateX(${-gg}px)`, transition:"transform 0.4s cubic-bezier(.4,0,.2,1)" }}>
                <polygon points="172,165 188,165 192,176 188,187 172,187"
                  fill="#060522" opacity=".8" stroke={gc} strokeWidth="1"/>
                <line x1="184" y1="169" x2="184" y2="183" stroke={gc} strokeWidth="2" opacity=".9"/>
                <line x1="178" y1="169" x2="178" y2="183" stroke={gc} strokeWidth="1" strokeDasharray="2 2" opacity=".5"/>
              </g>
              <g style={{ transform:`translateX(${gg}px)`, transition:"transform 0.4s cubic-bezier(.4,0,.2,1)" }}>
                <polygon points="214,165 198,165 194,176 198,187 214,187"
                  fill="#060522" opacity=".8" stroke={gc} strokeWidth="1"/>
                <line x1="202" y1="169" x2="202" y2="183" stroke={gc} strokeWidth="2" opacity=".9"/>
                <line x1="208" y1="169" x2="208" y2="183" stroke={gc} strokeWidth="1" strokeDasharray="2 2" opacity=".5"/>
              </g>

              <text x="215" y="217" fontFamily="JetBrains Mono,monospace" fontSize="8.5" fontWeight="600" fill="#00f0ff" opacity=".8" textAnchor="middle">legal-portals.gov</text>
              <text x="215" y="228" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#7d8b9e" opacity=".45" textAnchor="middle">&lt;5ms · multi-engine · PDF+OCR</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: CHUNKER  (325,8 → 472,75)  — top dim box
            ══════════════════════════════════════════════════ */}
            <g id="n-chunker" onClick={() => sel("chunker")} style={{ opacity:na("n-chunker")?1:0.2, transition:"opacity .3s" }}>
              <polygon points="325,8 325,75 460,75 472,63 472,8"
                fill="#060e1e"
                stroke={na("n-chunker")?"#818cf8":"#1e2a3a"}
                strokeWidth=".8"/>
              <polyline points="325,20 337,8"  fill="none" stroke="#818cf8" strokeWidth="1"/>
              <polyline points="458,75 472,61" fill="none" stroke="#818cf8" strokeWidth="1"/>

              <rect x="337" y="18" width="20" height="14" fill="none" stroke="#818cf8" strokeWidth="1"/>
              <line x1="337" y1="24" x2="357" y2="24" stroke="#818cf8" strokeWidth=".7"/>
              <line x1="337" y1="28" x2="357" y2="28" stroke="#818cf8" strokeWidth=".7"/>
              <circle cx="353" cy="30" r="1.5" fill="#818cf8"/>

              <text x="365" y="26" fontFamily="JetBrains Mono,monospace" fontSize="10" fontWeight="700" fill="#818cf8">CHUNKER</text>
              <text x="365" y="39" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="#818cf8" opacity=".7">+ Embedder</text>
              <text x="398" y="63" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".45" textAnchor="middle">ChromaDB · bge-base-en-v1.5</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: EXPORT  (480,8 → 750,128)  — teal
            ══════════════════════════════════════════════════ */}
            <g id="n-export" onClick={() => sel("export")} style={{ opacity:na("n-export")?1:0.18, transition:"opacity .3s" }}>
              <polygon points="480,8 480,128 738,128 750,116 750,8"
                fill="#091427"
                stroke={na("n-export")?"#00bba9":"rgba(0,187,169,.15)"}
                strokeOpacity=".55" strokeWidth="1.8"/>
              <polyline points="480,20 492,8"    fill="none" stroke="#00bba9" strokeWidth="1.2"/>
              <polyline points="480,114 480,128 492,128" fill="none" stroke="#00bba9" strokeOpacity=".3" strokeWidth="1.2"/>
              <polyline points="736,128 750,114"  fill="none" stroke="#00bba9" strokeWidth="1.2"/>
              <polyline points="736,8 750,8 750,20" fill="none" stroke="#00bba9" strokeWidth="1.2"/>

              {/* Screen icon */}
              <rect x="490" y="24" width="34" height="26" rx="1" fill="#091427" stroke="#00bba9" strokeWidth="1"/>
              <line x1="490" y1="29" x2="524" y2="29" stroke="#00bba9" strokeWidth="1"/>
              <circle cx="493" cy="26.5" r=".8" fill="#00bba9"/>
              <circle cx="496" cy="26.5" r=".8" fill="#00bba9"/>
              <rect x="493" y="32" width="22" height="6" fill="#00bba9" opacity=".3"/>
              <line x1="493" y1="41" x2="510" y2="41" stroke="#00bba9" strokeWidth="1.5" opacity=".4"/>
              <line x1="493" y1="45" x2="504" y2="45" stroke="#00bba9" strokeWidth="1.5" opacity=".4"/>

              <text x="532" y="34" fontFamily="JetBrains Mono,monospace" fontSize="13" fontWeight="700" fill="#00bba9" style={{ filter:"drop-shadow(0 0 6px rgba(0,187,169,.65))" }}>EXPORT</text>
              <text x="532" y="47" fontFamily="JetBrains Mono,monospace" fontSize="8"  fill="#c8d8f0" opacity=".7">json · csv · excel</text>
              <text x="615" y="64" fontFamily="JetBrains Mono,monospace" fontSize="8.5" fontWeight="700" fill="#c8d8f0" opacity=".9" textAnchor="middle">// pipeline complete</text>

              <polygon points="491,82 495,78 733,78 737,82 737,90 733,94 495,94 491,90"
                fill="#091427" stroke="#00bba9" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="487" y1="86" x2="491" y2="86" stroke="#00bba9" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="737" y1="86" x2="741" y2="86" stroke="#00bba9" strokeOpacity=".5" strokeWidth="1"/>
              <text x="614" y="89" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill="#00bba9" opacity=".9" textAnchor="middle">Structured output = PostgreSQL + UN template</text>
              <text x="614" y="118" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill="#94a3b8" opacity=".5" textAnchor="middle">3-sheet Excel · 3 CSV variants · JSON blob</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: AGENTS / BOT (480,138 → 750,275)  — pink
            ══════════════════════════════════════════════════ */}
            <g id="n-prosecution" onClick={() => sel("prosecution")} style={{ opacity:na("n-prosecution")?1:0.18, transition:"opacity .3s" }}>
              <polygon points="480,138 480,275 738,275 750,263 750,138"
                fill="#1e0525"
                stroke={na("n-prosecution")?"#e0287d":"rgba(224,40,125,.15)"}
                strokeOpacity=".55" strokeWidth="1.8"/>
              <polyline points="480,150 492,138"   fill="none" stroke="#e0287d" strokeWidth="1.2"/>
              <polyline points="480,261 480,275 492,275" fill="none" stroke="#e0287d" strokeOpacity=".3" strokeWidth="1.2"/>
              <polyline points="736,275 750,261"  fill="none" stroke="#e0287d" strokeWidth="1.2"/>
              <polyline points="736,138 750,138 750,150" fill="none" stroke="#e0287d" strokeWidth="1.2"/>

              {/* Ghost icon */}
              <g className="ghost-float">
                <path d="M496 215 L496 198 Q496 186 508 186 Q520 186 520 198 L520 215 L516 211 L512 215 L508 211 L504 215 L500 211 Z"
                  fill="#e0287d" opacity=".5" stroke="#e0287d" strokeWidth="1.2"/>
                <circle cx="503" cy="197" r="2.5" fill="#e0287d"/>
                <circle cx="513" cy="197" r="2.5" fill="#e0287d"/>
                <circle cx="504" cy="198" r="1" fill="#1e0525"/>
                <circle cx="514" cy="198" r="1" fill="#1e0525"/>
                <line x1="497" y1="212" x2="519" y2="212" stroke="#e0287d" strokeWidth=".4" opacity=".5"/>
                <line x1="497" y1="207" x2="519" y2="207" stroke="#e0287d" strokeWidth=".4" opacity=".5"/>
                <line x1="497" y1="202" x2="519" y2="202" stroke="#e0287d" strokeWidth=".4" opacity=".5"/>
                <line x1="497" y1="197" x2="519" y2="197" stroke="#e0287d" strokeWidth=".3" opacity=".7"/>
              </g>

              <text x="532" y="193" fontFamily="JetBrains Mono,monospace" fontSize="13" fontWeight="700" fill="#e0287d" style={{ filter:"drop-shadow(0 0 6px rgba(224,40,125,.65))" }}>AGENTS</text>
              <text x="532" y="207" fontFamily="JetBrains Mono,monospace" fontSize="8"  fill="#c8d8f0" opacity=".7">prosecute · defend · decide</text>
              <text x="615" y="224" fontFamily="JetBrains Mono,monospace" fontSize="8.5" fontWeight="600" fill="#cbd5e1" opacity=".9" textAnchor="middle">// AI cites evidence</text>

              <polygon points="491,242 495,238 733,238 737,242 737,250 733,254 495,254 491,250"
                fill="#1e0525" stroke="#e0287d" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="487" y1="246" x2="491" y2="246" stroke="#e0287d" strokeOpacity=".5" strokeWidth="1"/>
              <line x1="737" y1="246" x2="741" y2="246" stroke="#e0287d" strokeOpacity=".5" strokeWidth="1"/>
              <text x="614" y="249" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#e0287d" opacity=".9" textAnchor="middle">Adversarial payload = only from LLM debate</text>
              <text x="614" y="268" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill="#94a3b8" opacity=".5" textAnchor="middle">Prosecution → Defense → Arbiter · score 0–100</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: 3-AGENT KV  (185,295 → 355,390)  — yellow
            ══════════════════════════════════════════════════ */}
            <g id="n-agents" onClick={() => sel("agents")} style={{ opacity:na("n-agents")?1:0.18, transition:"opacity .3s" }}>
              <polygon points="185,295 185,390 343,390 355,378 355,295"
                fill="#1D111D"
                stroke={na("n-agents")?"#eab308":"rgba(234,179,8,.15)"}
                strokeOpacity=".4" strokeWidth="1"/>
              <polyline points="185,307 197,295" fill="none" stroke="#eab308" strokeWidth="1"/>
              <polyline points="341,390 355,376" fill="none" stroke="#eab308" strokeOpacity=".4" strokeWidth="1"/>

              <ellipse cx="215" cy="315" rx="12" ry="5" fill="none" stroke="#eab308" strokeWidth="1.1"/>
              <line x1="203" y1="315" x2="203" y2="327" stroke="#eab308" strokeWidth="1.1"/>
              <line x1="227" y1="315" x2="227" y2="327" stroke="#eab308" strokeWidth="1.1"/>
              <ellipse cx="215" cy="327" rx="12" ry="5" fill="none" stroke="#eab308" strokeWidth="1.1"/>

              <text x="242" y="319" fontFamily="JetBrains Mono,monospace" fontSize="10" fontWeight="700" fill="#eab308">3-AGENT KV</text>
              <text x="242" y="332" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="#eab308" opacity=".7">adversarial state</text>
              <text x="270" y="352" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".45" textAnchor="middle">PROSECUTION · DEFENSE · ARBITER</text>
              <text x="270" y="380" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".4" textAnchor="middle">AGP_STATE · SEO_PAYLOADS</text>
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: HALLUC CHECK  (365,295 → 545,390)  — yellow
            ══════════════════════════════════════════════════ */}
            <g id="n-halluc" onClick={() => sel("halluc")} style={{ opacity:na("n-halluc")?1:0.18, transition:"opacity .3s" }}>
              <polygon points="365,295 365,390 533,390 545,378 545,295"
                fill="#1D111D"
                stroke={na("n-halluc")?"#eab308":"rgba(234,179,8,.1)"}
                strokeOpacity=".3" strokeWidth="1"/>
              <polyline points="365,307 377,295" fill="none" stroke="#eab308" strokeOpacity=".4" strokeWidth="1"/>
              <polyline points="531,390 545,376" fill="none" stroke="#eab308" strokeOpacity=".3" strokeWidth="1"/>

              {/* CPU icon */}
              <rect x="381" y="307" width="22" height="16" fill="none" stroke="#eab308" strokeWidth="1.1"/>
              <line x1="387" y1="311" x2="387" y2="319" stroke="#eab308" strokeWidth="1"/>
              <line x1="392" y1="311" x2="392" y2="319" stroke="#eab308" strokeWidth="1"/>
              <line x1="397" y1="311" x2="397" y2="319" stroke="#eab308" strokeWidth="1"/>
              <line x1="381" y1="313" x2="377" y2="313" stroke="#eab308" strokeWidth="1"/>
              <line x1="381" y1="317" x2="377" y2="317" stroke="#eab308" strokeWidth="1"/>
              <line x1="403" y1="313" x2="407" y2="313" stroke="#eab308" strokeWidth="1"/>
              <line x1="403" y1="317" x2="407" y2="317" stroke="#eab308" strokeWidth="1"/>

              <text x="414" y="317" fontFamily="JetBrains Mono,monospace" fontSize="10" fontWeight="700" fill="#eab308">HALLUC. CHECK</text>
              <text x="414" y="330" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="#eab308" opacity=".7">RapidFuzz · 85%</text>
              <text x="455" y="350" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".45" textAnchor="middle">threshold=85% · grounding · penalty</text>

              {na("n-halluc") && (
                <g>
                  <text x="390" y="375" fontFamily="JetBrains Mono,monospace" fontSize="7" textAnchor="middle" fill="#eab308" style={{ animation:"ai-wave 1.2s ease-in-out infinite 0s" }}>RapidFuzz</text>
                  <text x="425" y="375" fontFamily="JetBrains Mono,monospace" fontSize="7" textAnchor="middle" fill="#eab308" style={{ animation:"ai-wave 1.2s ease-in-out infinite 0.4s" }}>Llama-3</text>
                  <text x="460" y="375" fontFamily="JetBrains Mono,monospace" fontSize="7" textAnchor="middle" fill="#eab308" style={{ animation:"ai-wave 1.2s ease-in-out infinite 0.8s" }}>→ Store</text>
                </g>
              )}
            </g>

            {/* ══════════════════════════════════════════════════
                NODE: SCORE STORE  (10,295 → 175,390)  — yellow/orange
            ══════════════════════════════════════════════════ */}
            <g id="n-score" onClick={() => sel("score")} style={{ opacity:na("n-score")?1:0.18, transition:"opacity .3s" }}>
              <polygon points="10,295 10,390 163,390 175,378 175,295"
                fill="#1a1000"
                stroke={na("n-score")?"#eab308":"rgba(234,179,8,.15)"}
                strokeOpacity=".4" strokeWidth="1"/>
              <polyline points="10,307 22,295"  fill="none" stroke="#eab308" strokeWidth="1"/>
              <polyline points="161,390 175,376" fill="none" stroke="#eab308" strokeOpacity=".4" strokeWidth="1"/>

              <ellipse cx="40" cy="315" rx="12" ry="5" fill="none" stroke="#eab308" strokeWidth="1.1"/>
              <line x1="28" y1="315" x2="28" y2="327" stroke="#eab308" strokeWidth="1.1"/>
              <line x1="52" y1="315" x2="52" y2="327" stroke="#eab308" strokeWidth="1.1"/>
              <ellipse cx="40" cy="327" rx="12" ry="5" fill="none" stroke="#eab308" strokeWidth="1.1"/>
              {na("n-score") && (
                <ellipse cx="40" cy="321" rx="11" ry="6" fill="#eab308" fillOpacity=".12" stroke="none"
                  style={{ animation:"pulse-data .7s ease-in-out infinite" }}/>
              )}

              <text x="64" y="319" fontFamily="JetBrains Mono,monospace" fontSize="10" fontWeight="700" fill="#eab308">SCORE STORE</text>
              <text x="64" y="332" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="#eab308" opacity=".7">0–100 · normalised</text>
              <text x="93" y="352" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".45" textAnchor="middle">PILLAR_AGG · COUNTRY_ROLL</text>
              <text x="93" y="380" fontFamily="JetBrains Mono,monospace" fontSize="6" fill="#94a3b8" opacity=".4" textAnchor="middle">RAW_JSON · UN_SCORE</text>
            </g>

            {/* ── MOVING DOT ── */}
            {b.dot && (
              b.dot.sq ? (
                <rect x={dotPos.x-dr} y={dotPos.y-dr} width={dr*2} height={dr*2}
                  fill={dc} opacity={dotPos.op} filter="url(#glow-p)" style={{ transition:"none" }}/>
              ) : (
                <circle cx={dotPos.x} cy={dotPos.y} r={dr}
                  fill={dc} opacity={dotPos.op} filter="url(#glow-p)" style={{ transition:"none" }}/>
              )
            )}
          </svg>

          {/* ── PANEL ── */}
          <div className={`agp-panel${pm==="h"?" h":pm==="b"?" b":""}`}>
            <div className="agp-pt">{selected ? `>> ${pt}` : pt}</div>
            <div className="agp-pb" dangerouslySetInnerHTML={{ __html: pb }}/>
          </div>
        </div>
      </div>
    </div>
  );
}
