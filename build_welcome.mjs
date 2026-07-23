import fs from "fs";
const out = `import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bolt, ArrowUpRight, ChevronDown, Star } from "lucide-react";

interface WelcomeProps {
  onEnter: () => void;
}

const partners = [
  "UNESCAP", "Team SUPERNOVA", "RDTII 2.1", "APT", "WTO",
  "ASEAN", "APEC", "IMF", "World Bank", "UNCTAD",
];

export default function WelcomeScreen({ onEnter }: WelcomeProps) {
  const [exiting, setExiting] = useState(false);
  const handleEnter = () => { setExiting(true); setTimeout(onEnter, 700); };

  return (
    <AnimatePresence mode="wait">
      {!exiting ? (
        <motion.div
          key="welcome"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ position:"fixed", inset:0, zIndex:9999, overflowY:"auto", background:"#fff", fontFamily:"'Inter','Outfit',system-ui,sans-serif" }}
        >
          <style>{\`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');
            .wn{display:flex;align-items:center;justify-content:space-between;padding:13px 48px;position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.06);}
            .wn-logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px;color:#0f172a;letter-spacing:-0.3px;}
            .wn-logo-icon{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;}
            .wn-links{display:flex;align-items:center;gap:26px;font-size:13px;font-weight:500;color:#475569;}
            .wn-links span{cursor:pointer;transition:color .15s;display:flex;align-items:center;gap:3px;}
            .wn-links span:hover{color:#0f172a;}
            .wn-cta{background:#a3e635;color:#1a2e05;font-weight:700;font-size:12px;padding:9px 18px;border-radius:999px;border:none;cursor:pointer;letter-spacing:.5px;text-transform:uppercase;transition:opacity .15s;}
            .wn-cta:hover{opacity:.85;}
            .wh{position:relative;min-height:520px;overflow:hidden;display:flex;flex-direction:column;align-items:center;}
            .wh-bg{position:absolute;inset:0;}
            .wh-bg img{width:100%;height:100%;object-fit:cover;object-position:center;}
            .wh-ov1{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,30,70,0.72) 0%,rgba(15,40,90,0.58) 40%,rgba(20,55,100,0.45) 65%,rgba(255,255,255,0) 100%);}
            .wh-ov2{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,20,60,0.2) 0%,transparent 50%,rgba(10,20,60,0.2) 100%);}
            .wh-content{position:relative;z-index:5;text-align:center;padding:64px 24px 0;max-width:700px;}
            .wh-h1{font-family:'Outfit',sans-serif;font-size:clamp(34px,5.2vw,60px);font-weight:900;line-height:1.07;color:#fff;letter-spacing:-1.5px;margin:0 0 8px;text-shadow:0 2px 30px rgba(0,20,80,0.3);}
            .wh-h1 em{color:#a3e635;font-style:normal;}
            .wh-sub{font-size:14px;color:rgba(255,255,255,0.82);max-width:440px;margin:0 auto 28px;line-height:1.7;}
            .wh-btns{display:flex;gap:12px;justify-content:center;align-items:center;margin-bottom:24px;}
            .wh-btn-ghost{background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.32);color:#fff;font-weight:600;font-size:13px;padding:11px 24px;border-radius:10px;cursor:pointer;backdrop-filter:blur(8px);transition:background .15s;}
            .wh-btn-ghost:hover{background:rgba(255,255,255,0.25);}
            .wh-btn-solid{background:#a3e635;color:#1a2e05;font-weight:700;font-size:13px;padding:11px 22px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;transition:opacity .15s;}
            .wh-btn-solid:hover{opacity:.88;}
            .wh-btn-solid .arr{width:22px;height:22px;background:#1a2e05;border-radius:50%;display:flex;align-items:center;justify-content:center;}
            .wh-rating{font-size:12px;color:rgba(255,255,255,0.70);margin-bottom:14px;}
            .wh-stars{display:flex;justify-content:center;gap:2px;margin-bottom:5px;}
            .wh-card{position:absolute;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,0.22);backdrop-filter:blur(8px);}
            .wc-white{background:#fff;padding:12px;}
            .wc-dark{background:#0f172a;padding:12px;}
            .wc-blue{background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:12px;}
            .wc-glass{background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);padding:12px;}
            .wc-lbl{font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;}
            .wc-lbl-w{font-size:10px;font-weight:600;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:.5px;}
            .wc-big{font-size:22px;font-weight:800;color:#0f172a;line-height:1.1;margin:4px 0;}
            .wc-big-w{font-size:22px;font-weight:800;color:#fff;line-height:1.1;margin:4px 0;}
            .wc-sub{font-size:10px;color:#94a3b8;}
            .wc-num{font-size:13px;font-weight:700;color:#0f172a;}
            .wc-row{display:flex;align-items:center;gap:6px;margin-top:4px;}
            .wc-badge-g{display:inline-flex;align-items:center;border-radius:999px;padding:2px 7px;font-size:9px;font-weight:700;background:#dcfce7;color:#16a34a;}
            .wc-badge-b{display:inline-flex;align-items:center;border-radius:999px;padding:2px 7px;font-size:9px;font-weight:700;background:rgba(59,130,246,0.25);color:#93c5fd;}
            .wc-badge-gr{display:inline-flex;align-items:center;border-radius:999px;padding:2px 7px;font-size:9px;font-weight:700;background:#f1f5f9;color:#475569;}
            .wc-chart{display:flex;align-items:flex-end;gap:3px;height:28px;margin-top:8px;}
            .wc-bar{width:9px;border-radius:2px;}
            .wp{overflow:hidden;padding:18px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background:#fff;}
            .wp-track{display:flex;gap:48px;animation:wp-scroll 24s linear infinite;white-space:nowrap;width:max-content;}
            .wp-item{display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:13px;font-weight:600;}
            .wp-dot{width:18px;height:18px;border-radius:50%;background:#cbd5e1;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#fff;flex-shrink:0;}
            @keyframes wp-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
            .wa{max-width:860px;margin:0 auto;padding:72px 24px 16px;text-align:center;}
            .wa-pill{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#475569;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:20px;}
            .wa-h2{font-family:'Outfit',sans-serif;font-size:clamp(28px,4vw,44px);font-weight:900;color:#0f172a;line-height:1.1;letter-spacing:-1px;margin:0 0 4px;}
            .wa-h2-muted{font-family:'Outfit',sans-serif;font-size:clamp(24px,3.5vw,40px);font-weight:900;color:#94a3b8;line-height:1.1;letter-spacing:-1px;margin:0;}
            .wa-badge-b{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#3b82f6;color:#fff;font-size:16px;vertical-align:middle;margin:0 5px;}
            .wa-badge-g{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#a3e635;color:#1a2e05;font-size:16px;vertical-align:middle;margin:0 5px;}
            .wm{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;max-width:860px;margin:40px auto 80px;padding:0 24px;}
            .wm-card{border-radius:16px;overflow:hidden;}
            .wm-dark{background:#0f172a;padding:20px;}
            .wm-light{background:#f8fafc;border:1px solid #e2e8f0;padding:20px;}
            .wm-lbl{font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
            .wm-num{font-family:'Outfit',sans-serif;font-size:40px;font-weight:900;color:#fff;line-height:1.1;}
            .wm-num-dark{font-family:'Outfit',sans-serif;font-size:40px;font-weight:900;color:#0f172a;line-height:1.1;}
            .wm-sub{font-size:12px;color:#64748b;margin-top:6px;line-height:1.55;}
            .wm-quote{font-size:12px;color:#475569;font-style:italic;line-height:1.65;margin-top:10px;border-left:3px solid #e2e8f0;padding-left:10px;}
            .wm-lime{background:#a3e635;padding:18px 20px;}
            .wm-bottom{background:#0f172a;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;}
            .wf{text-align:center;padding:22px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;}
            @media(max-width:700px){.wn{padding:12px 20px;}.wn-links{display:none;}.wm{grid-template-columns:1fr;}.wh-h1{font-size:30px;}}
          \`}</style>

          <motion.nav className="wn" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <div className="wn-logo">
              <div className="wn-logo-icon"><Bolt style={{width:13,height:13,color:"#fff"}}/></div>
              RDTII <span style={{color:"#3b82f6"}}>2.1</span>
            </div>
            <div className="wn-links">
              <span onClick={handleEnter}>HOME</span>
              <span onClick={handleEnter}>SERVICES</span>
              <span onClick={handleEnter}>ABOUT US</span>
              <span onClick={handleEnter}>MORE LINKS <ChevronDown style={{width:13,height:13}}/></span>
            </div>
            <button className="wn-cta" onClick={handleEnter}>Launch Dashboard</button>
          </motion.nav>

          <div className="wh">
            <div className="wh-bg">
              <img src="/assets/bghome.jpg" alt=""/>
              <div className="wh-ov1"/>
              <div className="wh-ov2"/>
            </div>
            <motion.div className="wh-content" initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.15,ease:[0.16,1,0.3,1]}}>
              <h1 className="wh-h1">Analyzing compliance with<br/><em>AI and RDTII Strategy</em></h1>
              <p className="wh-sub">We help organizations unlock trade compliance and efficiency through data-driven analysis and intelligent automation across Asia-Pacific economies.</p>
              <div className="wh-btns">
                <button className="wh-btn-ghost" onClick={handleEnter}>VIEW DEMO</button>
                <button className="wh-btn-solid" onClick={handleEnter}>GET STARTED<span className="arr"><ArrowUpRight style={{width:12,height:12,color:"#a3e635"}}/></span></button>
              </div>
              <div className="wh-rating">
                <div className="wh-stars">{[1,2,3,4,5].map(i=><Star key={i} style={{width:14,height:14,fill:"#fbbf24",color:"#fbbf24"}}/>)}</div>
                Rated 4.9/5 &middot; 61 indicators &middot; 12 pillars &middot; 6+ economies
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.4,ease:[0.16,1,0.3,1]}} style={{position:"relative",zIndex:6,width:"100%",height:210,pointerEvents:"none"}}>
              <motion.div className="wh-card wc-white" style={{left:"4%",top:"22%",transform:"rotate(-16deg)",width:108}} animate={{y:[0,-7,0]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-lbl">Pillar Score</div>
                <div className="wc-big" style={{color:"#3b82f6"}}>0.87</div>
                <div className="wc-row"><span className="wc-badge-g">UP 12%</span><span className="wc-sub">vs last run</span></div>
              </motion.div>
              <motion.div className="wh-card wc-glass" style={{left:"16%",top:"18%",transform:"rotate(-7deg)",width:96}} animate={{y:[0,-5,0]}} transition={{duration:3.6,delay:0.3,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-lbl-w">Economies</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>{["SG","MY","AU","VN","TH","ID"].map(c=><span key={c} className="wc-badge-gr" style={{fontSize:8}}>{c}</span>)}</div>
              </motion.div>
              <motion.div className="wh-card wc-white" style={{left:"28%",top:"14%",transform:"rotate(-3deg)",width:132}} animate={{y:[0,-8,0]}} transition={{duration:4.2,delay:0.6,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-lbl">Intelligence in Every Decision</div>
                <div className="wc-chart">{[30,55,40,70,50,85,60].map((h,i)=><div key={i} className="wc-bar" style={{height:h*0.4,background:i===5?"#3b82f6":"#cbd5e1"}}/>)}</div>
                <div className="wc-row" style={{marginTop:6}}><span className="wc-num">$2,670</span><span className="wc-num" style={{color:"#10b981"}}>$1,200</span></div>
              </motion.div>
              <motion.div className="wh-card wc-dark" style={{left:"44%",top:"16%",transform:"rotate(0deg)",width:158,zIndex:10}} animate={{y:[0,-9,0]}} transition={{duration:4.8,delay:0.2,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-badge-b" style={{marginBottom:7}}>* Expertise</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:1.4}}>Combines Strategy,<br/>Data, and Artificial<br/>Intelligence</div>
              </motion.div>
              <motion.div className="wh-card wc-blue" style={{right:"18%",top:"20%",transform:"rotate(5deg)",width:118}} animate={{y:[0,-6,0]}} transition={{duration:3.9,delay:0.5,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-lbl-w">+ Data training</div>
                <div style={{fontSize:9,color:"#93c5fd",marginTop:2}}>Upload your content</div>
                <div className="wc-big-w" style={{marginTop:10,fontSize:24}}>520k+</div>
              </motion.div>
              <motion.div className="wh-card wc-white" style={{right:"4%",top:"26%",transform:"rotate(15deg)",width:100}} animate={{y:[0,-7,0]}} transition={{duration:4.4,delay:0.8,repeat:Infinity,ease:"easeInOut"}}>
                <div className="wc-lbl">Coverage</div>
                <div className="wc-big" style={{marginTop:6,fontSize:26}}>47%</div>
                <div className="wc-sub">APAC scored</div>
              </motion.div>
            </motion.div>
          </div>

          <div className="wp">
            <div className="wp-track">{[...partners,...partners].map((p,i)=><div key={i} className="wp-item"><div className="wp-dot">{p[0]}</div>{p}</div>)}</div>
          </div>

          <motion.div className="wa" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.7}}>
            <div className="wa-pill">About Us</div>
            <h2 className="wa-h2">A global compliance engine<br/>dedicated to building<span className="wa-badge-b">-&gt;</span>smarter</h2>
            <h2 className="wa-h2-muted">and<span className="wa-badge-g">o</span>more adaptive</h2>
          </motion.div>

          <div className="wm">
            <motion.div className="wm-card wm-dark" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}} whileHover={{y:-4,transition:{duration:0.2}}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <span style={{fontWeight:800,fontSize:15,color:"#60a5fa",letterSpacing:1}}>RDTII</span>
                <span style={{background:"rgba(255,255,255,0.1)",borderRadius:6,padding:"2px 8px",fontSize:10,color:"#93c5fd"}}>#</span>
              </div>
              <div style={{height:80,borderRadius:10,margin:"10px 0",background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",width:60,height:60,borderRadius:"50%",background:"#1d4ed8",opacity:0.5,bottom:-10,left:10}}/>
                <div style={{position:"absolute",width:50,height:50,borderRadius:"50%",background:"#2563eb",opacity:0.4,top:5,right:15}}/>
                <div style={{position:"absolute",bottom:8,right:10,color:"#60a5fa",fontSize:10,fontWeight:700}}>61 indicators</div>
              </div>
              <div className="wm-num">120+</div>
              <div className="wm-sub" style={{color:"#64748b"}}>Indicators scored across 12 compliance pillars</div>
            </motion.div>
            <motion.div className="wm-card wm-light" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.1}} whileHover={{y:-4,transition:{duration:0.2}}}>
              <div className="wm-lbl">Commitment to measurable</div>
              <div className="wm-num-dark">100%</div>
              <div style={{display:"flex",gap:0,margin:"12px 0 8px"}}>{["#f97316","#3b82f6","#10b981"].map((c,i)=><div key={i} style={{width:28,height:28,borderRadius:"50%",background:c,border:"2.5px solid #fff",marginLeft:i>0?-10:0}}/>)}</div>
              <div className="wm-quote">"Their automation strategy completely reshaped how we analyze trade compliance. It is efficient, intelligent, and seamless."</div>
            </motion.div>
            <motion.div className="wm-card" style={{padding:0,border:"1px solid #e2e8f0"}} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.2}} whileHover={{y:-4,transition:{duration:0.2}}}>
              <div className="wm-lime">
                <div className="wm-lbl" style={{color:"#365314"}}>Data Points</div>
                <div className="wm-num" style={{color:"#1a2e05",fontSize:38}}>520k+</div>
                <div className="wm-sub" style={{color:"#4d7c0f"}}>Analyzed monthly to power smarter compliance strategies.</div>
              </div>
              <div className="wm-bottom">
                <span style={{color:"#94a3b8",fontSize:11,fontWeight:600}}>Economies Covered</span>
                <span style={{color:"#fff",fontSize:26,fontWeight:900,fontFamily:"'Outfit',sans-serif"}}>6+</span>
              </div>
            </motion.div>
          </div>

          <footer className="wf">RDTII 2.1 Compliance Engine &middot; Team SUPERNOVA &middot; UNESCAP 2026</footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
`;
fs.writeFileSync("src/components/WelcomeScreen.tsx", out, "utf8");
console.log("written");
