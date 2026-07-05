// ============================================================
// AI-Powered Resume Analyzer
// Day 1 — Full UI + Day 2 — Upload & Validation
// Single File: App.js (No confusion, no duplicates)
// ============================================================
import { useState, useEffect, useRef } from "react";
import JobMatch from './pages/JobMatch';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { BrowserRouter, Routes, Route, useNavigate,Link} from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResumeHistory from './pages/ResumeHistory';
import AdminDashboard from './pages/AdminDashboard';
import FAQSection from './components/FAQSection';
import { ToastProvider } from './ToastContext';
import NotFound from './pages/NotFound';
import { useToast } from './ToastContext';
import InstallGate from './InstallGate';
import LoadingState from './components/LoadingState';
// ── Google Font (Poppins) ────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
document.head.appendChild(fontLink);

// ============================================================
// GLOBAL STYLES — injected once into <head>
// ============================================================
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --yellow:      #FFD54F;
    --yellow-lt:   #FFF8E1;
    --orange:      #FFA726;
    --orange-dk:   #FF7043;
    --sky:         #4FC3F7;
    --sky-dk:      #0288D1;
    --green:       #81C784;
    --green-dk:    #388E3C;
    --red:         #EF5350;
    --red-lt:      #FFEBEE;
    --bg:          #FFF8E1;
    --white:       #FFFFFF;
    --text:        #2D3748;
    --muted:       #718096;
    --light:       #EDF2F7;
    --radius:      20px;
    --shadow:      0 8px 32px rgba(255,167,38,0.15);
    --transition:  all 0.3s ease;
  }

  html  { scroll-behavior: smooth; }

  body  {
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
  }

  ::-webkit-scrollbar       { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--yellow-lt); }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(var(--yellow), var(--orange));
    border-radius: 4px;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideL {
    from { opacity:0; transform:translateX(-36px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes slideR {
    from { opacity:0; transform:translateX(36px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-12px); }
  }
  @keyframes gradShift {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes shimmer {
    0%   { background-position:-200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,167,38,0.45); }
    70%     { box-shadow:0 0 0 14px rgba(255,167,38,0); }
  }
  @keyframes bounceIn {
    0%   { transform:scale(0.5); opacity:0; }
    70%  { transform:scale(1.15); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes wiggle {
    0%,100% { transform:rotate(-3deg); }
    50%     { transform:rotate(3deg); }
  }
  @keyframes slideDown {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* Page fade-in on route change */
  .page-fade-in {
    animation: pageFadeIn 0.4s ease both;
  }
  @keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media(max-width:768px){
    .nav-links  { display:none!important; }
    .hamburger  { display:block!important; }
    .hero-grid  { grid-template-columns:1fr!important; text-align:center; }
    .hero-grid > div:last-child { order:-1; }
    .hero-btns  { justify-content:center!important; }
    .hero-trust { justify-content:center!important; }
    .footer-grid{ grid-template-columns:1fr 1fr!important; }
    .act-btns   { flex-direction:column!important; }
  }
  @media(max-width:480px){
    .footer-grid{ grid-template-columns:1fr!important; }
  }
`;

// Inject global styles once
const styleTag = document.createElement("style");
styleTag.textContent = css;
document.head.appendChild(styleTag);

// ============================================================
// HOOKS
// ============================================================

// Reveal element when it scrolls into view
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// Animated number counter
function useCounter(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const numeric = parseInt(target.replace(/\D/g, ""), 10);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * numeric));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  const raw    = parseInt(target.replace(/\D/g, ""), 10);
  const suffix = target.replace(/[0-9]/g, "");
  return count === raw ? target : `${count}${suffix}`;
}

// ============================================================
// SHARED STYLE TOKENS
// ============================================================
const T = {
  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(16px)",
    borderRadius: 24,
    boxShadow: "0 8px 32px rgba(255,167,38,0.13)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  btnPrimary: {
    background: "linear-gradient(135deg,#FFA726,#FF7043)",
    color: "#fff", border: "none",
    padding: "13px 32px", borderRadius: 40,
    fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(255,112,67,0.38)",
    transition: "all 0.25s ease",
  },
  btnOutline: (color = "#0288D1", border = "#4FC3F7") => ({
    background: "transparent",
    color, border: `2px solid ${border}`,
    padding: "11px 28px", borderRadius: 40,
    fontFamily: "Poppins", fontWeight: 600, fontSize: "0.9rem",
    cursor: "pointer", transition: "all 0.25s ease",
  }),
};

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  // --- NEW: tracks the logged-in user, read from localStorage ---
const [user, setUser] = useState(null);
const navigate = useNavigate();

useEffect(() => {
  const stored = localStorage.getItem('user');
  if (stored) setUser(JSON.parse(stored));
}, []);

// Clears the saved login and sends the user back to the homepage
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/');
};

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Home","Features","About","Upload","Contact"];

  return (
    <nav style={{
      position:"fixed",top:0,left:0,right:0,zIndex:1000,
      transition:"all 0.3s",
      background: scrolled ? "rgba(255,248,225,0.93)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      boxShadow: scrolled ? "0 4px 20px rgba(255,167,38,0.12)" : "none",
      padding:"0 2rem",
    }}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:66}}>
        {/* Logo */}
        <span style={{fontSize:"1.45rem",fontWeight:900,background:"linear-gradient(135deg,#FFA726,#4FC3F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",cursor:"pointer"}}>
          ✦ DOSS&CO 
        </span>

        {/* Desktop links */}
        <div className="nav-links" style={{display:"flex",alignItems:"center",gap:4}}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{color:"#2D3748",fontWeight:500,fontSize:"0.92rem",textDecoration:"none",padding:"6px 14px",borderRadius:30,transition:"all 0.25s"}}
              onMouseEnter={e=>{e.target.style.background="rgba(255,213,79,0.25)";e.target.style.color="#FFA726"}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#2D3748"}}>
              {l}
            </a>
          ))}

          {/* NEW: links only visible when logged in */}
          {user && (
            <>
              <Link to="/history"
                style={{color:"#2D3748",fontWeight:500,fontSize:"0.92rem",textDecoration:"none",padding:"6px 14px",borderRadius:30,transition:"all 0.25s"}}
                onMouseEnter={e=>{e.target.style.background="rgba(255,213,79,0.25)";e.target.style.color="#FFA726"}}
                onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#2D3748"}}>
                History
              </Link>
              <Link to="/job-match"
                style={{color:"#2D3748",fontWeight:500,fontSize:"0.92rem",textDecoration:"none",padding:"6px 14px",borderRadius:30,transition:"all 0.25s"}}
                onMouseEnter={e=>{e.target.style.background="rgba(255,213,79,0.25)";e.target.style.color="#FFA726"}}
                onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#2D3748"}}>
                Job Match
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin"
                  style={{color:"#2D3748",fontWeight:500,fontSize:"0.92rem",textDecoration:"none",padding:"6px 14px",borderRadius:30,transition:"all 0.25s"}}
                  onMouseEnter={e=>{e.target.style.background="rgba(255,213,79,0.25)";e.target.style.color="#FFA726"}}
                  onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#2D3748"}}>
                  Admin
                </Link>
              )}
            </>
          )}

          {user ? (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <span style={{ fontWeight: 600, color: "#2D3748" }}>
      Hi, {user.name.split(' ')[0]}
    </span>
    <button style={T.btnPrimary}
      onClick={handleLogout}
      onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
      onMouseLeave={e=>e.target.style.transform="scale(1)"}>
      Logout
    </button>
  </div>
) : (
  <button style={T.btnPrimary}
    onClick={() => navigate('/login')}
    onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
    onMouseLeave={e=>e.target.style.transform="scale(1)"}>
    Login
  </button>
)}
        </div>

        {/* Hamburger */}
        <button className="hamburger"
          onClick={()=>setMenuOpen(!menuOpen)}
          style={{display:"none",background:"none",border:"none",fontSize:"1.6rem",cursor:"pointer",color:"#FFA726"}}>
          {menuOpen?"✕":"☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{background:"rgba(255,248,225,0.97)",backdropFilter:"blur(16px)",padding:"1rem 2rem 1.5rem",display:"flex",flexDirection:"column",gap:8,animation:"slideDown 0.3s ease"}}>
          {links.map(l=>(
            <a key={l} href={`#${l.toLowerCase()}`}
              onClick={()=>setMenuOpen(false)}
              style={{color:"#2D3748",fontWeight:500,padding:"10px 0",borderBottom:"1px solid #FFE082",textDecoration:"none"}}>
              {l}
            </a>
          ))}

          {user && (
            <>
              <Link to="/history" onClick={()=>setMenuOpen(false)}
                style={{color:"#2D3748",fontWeight:500,padding:"10px 0",borderBottom:"1px solid #FFE082",textDecoration:"none"}}>
                History
              </Link>
              <Link to="/job-match" onClick={()=>setMenuOpen(false)}
                style={{color:"#2D3748",fontWeight:500,padding:"10px 0",borderBottom:"1px solid #FFE082",textDecoration:"none"}}>
                Job Match
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={()=>setMenuOpen(false)}
                  style={{color:"#2D3748",fontWeight:500,padding:"10px 0",borderBottom:"1px solid #FFE082",textDecoration:"none"}}>
                  Admin
                </Link>
              )}
            </>
          )}

          {user ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
              <span style={{fontWeight:600,color:"#2D3748"}}>Hi, {user.name.split(' ')[0]}</span>
              <button style={T.btnPrimary} onClick={()=>{handleLogout();setMenuOpen(false)}}>
                Logout
              </button>
            </div>
          ) : (
            <button style={{...T.btnPrimary,marginTop:8}} onClick={()=>{navigate('/login');setMenuOpen(false)}}>
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

// ============================================================
// HERO ILLUSTRATION (SVG)
// ============================================================
function HeroIllustration() {
  return (
    <div style={{width:"100%",maxWidth:460,animation:"float 4s ease-in-out infinite"}}>
      <svg viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{width:"100%",height:"auto",filter:"drop-shadow(0 20px 40px rgba(255,167,38,0.2))"}}>
        <ellipse cx="240" cy="425" rx="138" ry="22" fill="rgba(255,167,38,0.1)"/>
        {/* Head */}
        <circle cx="240" cy="158" r="66" fill="#FFCC80"/>
        <circle cx="240" cy="158" r="58" fill="#FFE0B2"/>
        {/* Eyes */}
        <ellipse cx="222" cy="150" rx="8" ry="9" fill="#2D3748"/>
        <ellipse cx="258" cy="150" rx="8" ry="9" fill="#2D3748"/>
        <circle cx="225" cy="148" r="3" fill="white"/>
        <circle cx="261" cy="148" r="3" fill="white"/>
        {/* Smile */}
        <path d="M224 170 Q240 184 256 170" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <ellipse cx="210" cy="166" rx="10" ry="7" fill="#FFAB91" opacity="0.6"/>
        <ellipse cx="270" cy="166" rx="10" ry="7" fill="#FFAB91" opacity="0.6"/>
        {/* Hair */}
        <path d="M182 136 Q185 100 240 98 Q295 96 298 136 Q294 116 240 114 Q186 116 182 136Z" fill="#5D4037"/>
        {/* Body */}
        <rect x="190" y="216" width="100" height="110" rx="20" fill="#4FC3F7"/>
        <path d="M220 218 L240 238 L260 218" fill="#0288D1"/>
        {/* Left arm + resume */}
        <rect x="130" y="220" width="36" height="90" rx="18" fill="#FFCC80"/>
        <rect x="80" y="246" width="72" height="92" rx="8" fill="white" stroke="#FFD54F" strokeWidth="2"/>
        <rect x="88" y="260" width="46" height="4" rx="2" fill="#FFA726"/>
        <rect x="88" y="272" width="36" height="3" rx="2" fill="#CFD8DC"/>
        <rect x="88" y="282" width="40" height="3" rx="2" fill="#CFD8DC"/>
        <rect x="88" y="292" width="32" height="3" rx="2" fill="#CFD8DC"/>
        <rect x="88" y="302" width="44" height="3" rx="2" fill="#CFD8DC"/>
        <text x="84" y="324" fontSize="7" fill="#81C784" fontFamily="Poppins" fontWeight="700">★ RESUME</text>
        {/* Right arm */}
        <path d="M290 226 Q340 198 350 188" stroke="#FFCC80" strokeWidth="32" strokeLinecap="round" fill="none"/>
        {/* Legs */}
        <rect x="200" y="316" width="34" height="80" rx="17" fill="#37474F"/>
        <rect x="246" y="316" width="34" height="80" rx="17" fill="#37474F"/>
        <rect x="194" y="384" width="42" height="16" rx="8" fill="#263238"/>
        <rect x="244" y="384" width="42" height="16" rx="8" fill="#263238"/>
        {/* Floating icons */}
        <g style={{animation:"float 3s ease-in-out infinite 0.5s"}}>
          <circle cx="364" cy="114" r="24" fill="rgba(129,199,132,0.2)" stroke="#81C784" strokeWidth="2"/>
          <text x="364" y="120" fontSize="20" textAnchor="middle" fill="#388E3C">🧠</text>
        </g>
        <g style={{animation:"float 3.5s ease-in-out infinite 1s"}}>
          <circle cx="84" cy="114" r="24" fill="rgba(79,195,247,0.2)" stroke="#4FC3F7" strokeWidth="2"/>
          <text x="84" y="120" fontSize="20" textAnchor="middle" fill="#0277BD">✨</text>
        </g>
        <g style={{animation:"float 4s ease-in-out infinite 0.2s"}}>
          <circle cx="394" cy="224" r="24" fill="rgba(255,213,79,0.2)" stroke="#FFD54F" strokeWidth="2"/>
          <text x="394" y="230" fontSize="20" textAnchor="middle" fill="#F57F17">🎯</text>
        </g>
        <g style={{animation:"float 3.2s ease-in-out infinite 0.8s"}}>
          <circle cx="74" cy="224" r="24" fill="rgba(255,112,67,0.15)" stroke="#FF7043" strokeWidth="2"/>
          <text x="74" y="230" fontSize="20" textAnchor="middle" fill="#BF360C">🚀</text>
        </g>
        {/* Confetti */}
        <circle cx="400" cy="60" r="6" fill="#FFD54F"/>
        <circle cx="100" cy="70" r="5" fill="#4FC3F7"/>
        <circle cx="440" cy="160" r="4" fill="#81C784"/>
        <circle cx="60" cy="300" r="7" fill="#FFA726" opacity="0.6"/>
      </svg>
    </div>
  );
}

// ============================================================
// HERO SECTION
// ============================================================
function Hero() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section id="home" style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#FFF8E1 0%,#FFF3E0 30%,#E1F5FE 70%,#F3E5F5 100%)",
      backgroundSize:"400% 400%", animation:"gradShift 12s ease infinite",
      display:"flex", alignItems:"center",
      padding:"100px 2rem 60px", position:"relative", overflow:"hidden",
    }}>
      {/* Blobs */}
      <div style={{position:"absolute",top:-120,left:-120,width:400,height:400,background:"radial-gradient(circle,rgba(255,213,79,0.22) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,right:-80,width:340,height:340,background:"radial-gradient(circle,rgba(79,195,247,0.18) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>

      <div ref={ref} className="hero-grid" style={{maxWidth:1200,margin:"0 auto",width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3rem",alignItems:"center"}}>
        {/* Left: text */}
        <div style={{opacity:visible?1:0,animation:visible?"slideL 0.8s ease both":"none"}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,213,79,0.28)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,213,79,0.5)",borderRadius:30,padding:"6px 16px",marginBottom:"1.2rem",fontSize:"0.8rem",fontWeight:600,color:"#E65100",animation:"pulse 2.5s ease infinite"}}>
            ⚡ AI-Powered Career Boost
          </div>
          <h1 style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",fontWeight:900,lineHeight:1.15,marginBottom:"1.2rem",background:"linear-gradient(135deg,#E65100 0%,#FFA726 45%,#0277BD 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            AI-Powered Resume Analyzer
          </h1>
          <p style={{fontSize:"1.03rem",color:"#546E7A",lineHeight:1.78,marginBottom:"2.2rem",maxWidth:480}}>
            Upload your resume and receive AI-powered skill analysis, job matching, and personalized improvement suggestions — in seconds.
          </p>
          <div className="hero-btns" style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <a href="#upload">
              <button style={T.btnPrimary}
                onMouseEnter={e=>e.target.style.transform="scale(1.06) translateY(-2px)"}
                onMouseLeave={e=>e.target.style.transform="scale(1) translateY(0)"}>
                📄 Upload Resume
              </button>
            </a>
            <button style={T.btnOutline()}
              onMouseEnter={e=>{e.target.style.background="rgba(79,195,247,0.14)";e.target.style.transform="scale(1.04)"}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.transform="scale(1)"}}>
              ▶ Try Demo
            </button>
          </div>
          <div className="hero-trust" style={{display:"flex",gap:20,marginTop:"2rem",flexWrap:"wrap"}}>
            {["🔒 Secure","🤖 AI-Driven","⚡ Instant"].map(t=>(
              <span key={t} style={{fontSize:"0.82rem",color:"#546E7A",fontWeight:600}}>{t}</span>
            ))}
          </div>
        </div>
        {/* Right: illustration */}
        <div style={{display:"flex",justifyContent:"center",opacity:visible?1:0,animation:visible?"slideR 0.9s ease 0.2s both":"none"}}>
          <HeroIllustration/>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FEATURES SECTION
// ============================================================
const FEATURES = [
  {icon:"📤",color:"#FFA726",bg:"#FFF3E0",title:"Upload Resume",   desc:"Upload your resume in PDF or DOCX format with a single click or drag-and-drop.",tag:"Step 1"},
  {icon:"🧠",color:"#4FC3F7",bg:"#E1F5FE",title:"Extract Skills",  desc:"AI automatically extracts technical and soft skills, certifications and experience.",tag:"Step 2"},
  {icon:"🎯",color:"#81C784",bg:"#E8F5E9",title:"Job Matching",    desc:"Compare your resume with top job descriptions and receive a compatibility score.",tag:"Step 3"},
  {icon:"✨",color:"#FF7043",bg:"#FBE9E7",title:"Improve Resume",  desc:"Receive smart, personalized AI suggestions to craft a resume that stands out.",tag:"Step 4"},
];

function FeatureCard({feat,delay}) {
  const [ref,visible] = useReveal(0.1);
  const [hov,setHov]  = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...T.card,padding:"2rem",background:hov?feat.bg:"rgba(255,255,255,0.82)",transform:hov?"translateY(-8px) scale(1.02)":"translateY(0) scale(1)",boxShadow:hov?"0 20px 56px rgba(0,0,0,0.11)":"0 8px 32px rgba(0,0,0,0.06)",transition:"all 0.3s ease",opacity:visible?1:0,animation:visible?`fadeUp 0.6s ease ${delay}ms both`:"none",cursor:"default"}}>
      <div style={{width:58,height:58,borderRadius:16,background:`linear-gradient(135deg,${feat.bg},white)`,border:`2px solid ${feat.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",marginBottom:"1.2rem",transition:"transform 0.3s",transform:hov?"rotate(-6deg) scale(1.12)":"rotate(0) scale(1)"}}>
        {feat.icon}
      </div>
      <span style={{fontSize:"0.7rem",fontWeight:700,color:feat.color,textTransform:"uppercase",letterSpacing:2,display:"block",marginBottom:6}}>{feat.tag}</span>
      <h3 style={{fontSize:"1.1rem",fontWeight:800,marginBottom:8,color:"#2D3748"}}>{feat.title}</h3>
      <p style={{color:"#718096",lineHeight:1.72,fontSize:"0.9rem"}}>{feat.desc}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" style={{padding:"80px 2rem",background:"linear-gradient(180deg,#E1F5FE 0%,#FFF8E1 100%)"}}>
      <div style={{textAlign:"center",marginBottom:"3rem"}}>
        <span style={{fontSize:"0.75rem",fontWeight:700,color:"#4FC3F7",textTransform:"uppercase",letterSpacing:3}}>FEATURES</span>
        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.5rem)",fontWeight:800,background:"linear-gradient(135deg,#0277BD,#FFA726)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:8}}>
          Everything You Need to Land Your Dream Job
        </h2>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"1.5rem"}}>
        {FEATURES.map((f,i)=><FeatureCard key={f.title} feat={f} delay={i*120}/>)}
      </div>
    </section>
  );
}

// ============================================================
// STATISTICS
// ============================================================
const STATS = [
  {value:"1500+",label:"Resume Analyses",icon:"📄"},
  {value:"95%",  label:"Average ATS Score",icon:"🎯"},
  {value:"500+", label:"Companies Supported",icon:"🏢"},
  {value:"200+", label:"Daily Users",      icon:"👥"},
];

function StatCard({stat,started}) {
  const count = useCounter(stat.value,1800,started);
  return (
    <div style={{...T.card,padding:"2rem 1.5rem",textAlign:"center",border:"1px solid rgba(255,213,79,0.3)"}}>
      <div style={{fontSize:"2.4rem",marginBottom:8}}>{stat.icon}</div>
      <div style={{fontSize:"clamp(2rem,4vw,2.7rem)",fontWeight:900,background:"linear-gradient(135deg,#FFA726,#FF7043)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>{count}</div>
      <div style={{color:"#718096",fontWeight:600,marginTop:6,fontSize:"0.88rem"}}>{stat.label}</div>
    </div>
  );
}

function Statistics() {
  const [ref,visible]=useReveal(0.2);
  return (
    <section style={{padding:"70px 2rem",background:"linear-gradient(135deg,#FFF3E0,#E8F5E9,#E1F5FE)",backgroundSize:"400% 400%",animation:"gradShift 10s ease infinite"}}>
      <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.3rem)",fontWeight:800,background:"linear-gradient(135deg,#388E3C,#0277BD)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          Trusted by Job Seekers Worldwide
        </h2>
      </div>
      <div ref={ref} style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1.5rem"}}>
        {STATS.map(s=><StatCard key={s.label} stat={s} started={visible}/>)}
      </div>
    </section>
  );
}

// ============================================================
// TESTIMONIALS
// ============================================================
const TESTIMONIALS = [
  {name:"Priya Sharma", role:"Software Engineer @ Google",  avatar:"👩‍💻",bg:"#FFF3E0",quote:"✦ DOSS&CO helped me land my dream job at Google! The skill extraction was spot-on and the suggestions were incredibly actionable."},
  {name:"Arjun Mehta",  role:"Data Scientist @ Amazon",     avatar:"👨‍🔬",bg:"#E1F5FE",quote:"I was amazed at how accurately it matched my resume to job descriptions. Got 3 interview calls within a week!"},
  {name:"Sneha Patel",  role:"Product Manager @ Flipkart",  avatar:"👩‍💼",bg:"#E8F5E9",quote:"The AI improvement suggestions were gold. My resume ATS score jumped from 62% to 97%! Highly recommend."},
  {name:"Rahul Verma",  role:"UX Designer @ Swiggy",        avatar:"🧑‍🎨",bg:"#F3E5F5",quote:"Clean, fast, and genuinely useful. The missing-skills breakdown showed me exactly what to add before applying."},
  {name:"Ananya Iyer",  role:"Business Analyst @ Deloitte", avatar:"👩‍💼",bg:"#FFEBEE",quote:"I've tried other resume tools before but this one actually explains WHY a score is low. That made all the difference."},
  {name:"Karthik Raj",  role:"DevOps Engineer @ Zoho",      avatar:"🧑‍💻",bg:"#E0F2F1",quote:"The job match feature alone is worth it. Pasted a JD and instantly saw my exact gaps — saved me hours of guessing."},
];

function Testimonials() {
  const [ref, visible] = useReveal();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // How many cards show at once — 1 on mobile, 3 on wider screens.
  // We keep this simple with a media query check via window width state.
  const [cardsPerView, setCardsPerView] = useState(
    window.innerWidth < 768 ? 1 : 3
  );

  useEffect(() => {
    const handleResize = () => setCardsPerView(window.innerWidth < 768 ? 1 : 3);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(TESTIMONIALS.length / cardsPerView);

  // Auto-advance every 4 seconds, unless the user is hovering (paused)
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, totalSlides]);

  const goTo = (index) => setCurrent(((index % totalSlides) + totalSlides) % totalSlides);
  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  // Slice out just the testimonials for the current slide
  const visibleTestimonials = TESTIMONIALS.slice(
    current * cardsPerView,
    current * cardsPerView + cardsPerView
  );

  return (
    <section
      style={{padding:"80px 2rem",background:"#FFF8E1"}}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <span style={{fontSize:"0.75rem",fontWeight:700,color:"#81C784",textTransform:"uppercase",letterSpacing:3}}>TESTIMONIALS</span>
        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.4rem)",fontWeight:800,background:"linear-gradient(135deg,#2E7D32,#0277BD)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:8}}>
          Happy Users, Happy Careers 🎉
        </h2>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",position:"relative"}}>
        {/* Prev / Next arrow buttons */}
        <button
          onClick={goPrev}
          aria-label="Previous testimonial"
          style={{position:"absolute",left:-16,top:"50%",transform:"translateY(-50%)",zIndex:2,width:40,height:40,borderRadius:"50%",border:"none",background:"white",boxShadow:"0 4px 14px rgba(0,0,0,0.12)",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}
        >‹</button>
        <button
          onClick={goNext}
          aria-label="Next testimonial"
          style={{position:"absolute",right:-16,top:"50%",transform:"translateY(-50%)",zIndex:2,width:40,height:40,borderRadius:"50%",border:"none",background:"white",boxShadow:"0 4px 14px rgba(0,0,0,0.12)",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}
        >›</button>

        <div ref={ref} style={{display:"grid",gridTemplateColumns:`repeat(${cardsPerView},1fr)`,gap:"1.5rem"}}>
          {visibleTestimonials.map((t, i) => (
            <div key={t.name}
              style={{...T.card,background:t.bg,padding:"2rem",opacity:visible?1:0,animation:visible?`fadeUp 0.6s ease ${i*150}ms both`:"none",transition:"transform 0.3s,box-shadow 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(0,0,0,0.1)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:"1.2rem"}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.7rem",boxShadow:"0 4px 14px rgba(0,0,0,0.08)"}}>{t.avatar}</div>
                <div>
                  <div style={{fontWeight:700,color:"#2D3748",fontSize:"0.95rem"}}>{t.name}</div>
                  <div style={{fontSize:"0.78rem",color:"#90A4AE"}}>{t.role}</div>
                </div>
              </div>
              <div style={{color:"#FFA726",marginBottom:10,fontSize:"1rem"}}>★★★★★</div>
              <p style={{color:"#546E7A",lineHeight:1.75,fontSize:"0.9rem",fontStyle:"italic"}}>"{t.quote}"</p>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:"2rem"}}>
          {Array.from({length: totalSlides}).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i+1}`}
              style={{width:current===i?24:8,height:8,borderRadius:4,border:"none",background:current===i?"#FF7043":"#FFCC80",cursor:"pointer",transition:"all 0.3s"}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// DAY 2 — UPLOAD SECTION WITH FULL VALIDATION
// ============================================================

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

// Format bytes to KB / MB
function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Get emoji icon by file type
function getFileIcon(type) {
  if (type === "application/pdf") return "📕";
  if (type.includes("word") || type.includes("doc")) return "📘";
  return "📄";
}

// ============================================================
// UploadSection — Day 3 Update
// REPLACE the UploadSection function inside your App.js
// with this updated version.
//
// Changes from Day 2:
//   - handleUpload() now sends file to real backend API
//   - Uses fetch() + FormData to POST to http://localhost:5000/api/upload
//   - Shows real server response (filename, filesize, message)
//   - Shows proper error if server is down or file is rejected
// ============================================================

// ── ALLOWED TYPES (frontend validation — first line of defense) ──

// ── MAX SIZE: 5MB ────────────────────────────────────────────
// ── FORMAT FILE SIZE ─────────────────────────────────────────
// ── FILE ICON BY TYPE ────────────────────────────────────────
// ============================================================
// UPLOAD SECTION COMPONENT
// ============================================================
function UploadSection({ onUploadSuccess }) {
  const { showToast } = useToast();

  // ── STATE ──────────────────────────────────────────────────
  const [file,       setFile]       = useState(null);   // selected file
  const [error,      setError]      = useState(null);   // error message
  const [progress,   setProgress]   = useState(0);      // 0–100
  const [uploading,  setUploading]  = useState(false);  // is uploading?
  const [success,    setSuccess]    = useState(false);  // upload done?
  const [dragging,   setDragging]   = useState(false);  // drag active?
  const [serverData, setServerData] = useState(null);   // server response

  // useRef to trigger hidden file input
  const inputRef = useRef(null);

  // ── FRONTEND VALIDATION ────────────────────────────────────
  function validate(f) {
    if (!f) {
      setError("⚠️ Please select a file first.");
      return false;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("⚠️ Only PDF, DOC and DOCX files are allowed.");
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError(`⚠️ File too large. Max 5MB. Your file: ${formatSize(f.size)}`);
      return false;
    }
    return true;
  }

  // ── HANDLE FILE SELECTION ──────────────────────────────────
  function handleFile(selected) {
    setError(null);
    setProgress(0);
    setSuccess(false);
    setServerData(null);
    if (!validate(selected)) { setFile(null); return; }
    setFile(selected);
    handleUpload(selected);
  }

  // ── DRAG EVENTS ────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ── HANDLE UPLOAD — sends file to backend API ──────────────
  async function handleUpload(fileToUpload = file) {

    // Guard: must have a file
    if (!fileToUpload) {
      setError("⚠️ Please select a file before uploading.");
      return;
    }

    // Reset states
    setError(null);
    setSuccess(false);
    setServerData(null);
    setUploading(true);
    setProgress(0);

    // ── FAKE PROGRESS BAR ────────────────────────────────────
    // Animate from 0% to 90% while waiting for server
    // We stop at 90% and jump to 100% only after server responds
    let cur = 0;
    const timer = setInterval(() => {
      cur += 3;
      if (cur <= 90) setProgress(cur); // stop fake progress at 90%
      else clearInterval(timer);
    }, 60);

    try {
      // ── FormData — how we send a file via fetch() ──────────
      // FormData is like a form submission — key: value pairs
      const formData = new FormData();

      // "resume" must match upload.single("resume") in upload.js
      formData.append("resume", fileToUpload);

      // ── fetch() — sends HTTP POST to our Express server ────
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
  method: "POST", // POST request (sending data)
  headers: {
    // NEW (Day 9): attach the logged-in user's token so the
    // backend knows WHO is uploading (required now that /api/upload
    // is a protected route)
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  body: formData, // the file inside FormData
  // Note: Do NOT set Content-Type header manually
  // fetch sets it automatically for FormData (multipart/form-...
});

      // Stop the fake progress timer
      clearInterval(timer);

      // Parse the JSON response from server
      const data = await response.json();

      // ── Handle server response ──────────────────────────────
      // ── Handle server response ──────────────────────────────
      if (data.success) {
        // Jump to 100% on success
        setProgress(100);
        setSuccess(true);
        setServerData(data); // store server response to display details
        showToast('Resume uploaded and analyzed successfully! 🚀', 'success');
        console.log("✅ Upload success:", data);
        if (onUploadSuccess) onUploadSuccess(); // tell the list to refresh
      } else {
        // Server rejected the file (wrong type, too large, etc.)
        setProgress(0);
        const message = data.message || "❌ Upload failed. Please try again.";
        setError(message);
        showToast(message, 'error');
        console.error("❌ Upload failed:", data.message);
      }

    } catch (err) {
      // Network error — server might be offline
      clearInterval(timer);
      setProgress(0);
      const message = "❌ Cannot connect to server. Make sure the backend is running on port 5000.";
      setError(message);
      showToast(message, 'error');
      console.error("🔴 Network error:", err);
    } finally {
      // Always stop the uploading spinner
      setUploading(false);
    }
  }

  // ── REMOVE FILE — reset everything ────────────────────────
  function handleRemove() {
    setFile(null);
    setError(null);
    setProgress(0);
    setUploading(false);
    setSuccess(false);
    setServerData(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── INLINE STYLES ──────────────────────────────────────────
  const S = {
    section: {
      padding: "80px 2rem",
      background: "linear-gradient(180deg,#FFF8E1 0%,#E1F5FE 100%)",
    },
    card: {
      maxWidth: 660, margin: "0 auto",
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(16px)",
      borderRadius: 24,
      boxShadow: "0 8px 32px rgba(255,167,38,0.13)",
      border: "1px solid rgba(255,255,255,0.8)",
      padding: "2.5rem 2rem",
      display: "flex", flexDirection: "column", gap: "1.4rem",
    },
    dropZone: {
      border: `3px dashed ${dragging ? "#4FC3F7" : file ? "#81C784" : "#FFD54F"}`,
      borderStyle: file ? "solid" : "dashed",
      borderRadius: 18, padding: "2.5rem 1.5rem",
      textAlign: "center",
      cursor: file ? "default" : "pointer",
      transition: "all 0.3s ease",
      background: dragging
        ? "rgba(79,195,247,0.1)"
        : file ? "linear-gradient(135deg,#FFF8E1,#E8F5E9)"
        : "#FFF8E1",
      transform: dragging ? "scale(1.02)" : "scale(1)",
      boxShadow: dragging ? "0 0 0 6px rgba(79,195,247,0.18)" : "none",
    },
  };

  return (
    <section id="upload" style={S.section}>

      {/* ── HEADING ── */}
      <div style={{textAlign:"center",marginBottom:"2.5rem",animation:"fadeUp 0.6s ease both"}}>

        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.5rem)",fontWeight:800,background:"linear-gradient(135deg,#E65100,#4FC3F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:8}}>
          Upload Your Resume
        </h2>
        
      </div>

      {/* ── CARD ── */}
      <div style={S.card}>

        {/* ── DROP ZONE ── */}
        <div style={S.dropZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={()=>!file && inputRef.current.click()}
          role="button" tabIndex={0}
          onKeyDown={e=>e.key==="Enter"&&!file&&inputRef.current.click()}>

          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
            style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>

          {!file ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.6rem"}}>
              <div style={{fontSize:"3.5rem",animation:"float 3s ease-in-out infinite"}}>
                {dragging ? "🎯" : "📂"}
              </div>
              <p style={{fontSize:"1.05rem",fontWeight:600,color:"#2D3748"}}>
                {dragging ? "Release to upload!" : "Drag & Drop your Resume here"}
              </p>
              <p style={{fontSize:"0.85rem",color:"#90A4AE"}}>or</p>
              <button
                style={{background:"linear-gradient(135deg,#FFA726,#FF7043)",color:"#fff",border:"none",padding:"10px 28px",borderRadius:40,fontFamily:"Poppins",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",boxShadow:"0 4px 16px rgba(255,112,67,0.35)",transition:"all 0.25s"}}
                onClick={e=>{e.stopPropagation();inputRef.current.click();}}
                onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                onMouseLeave={e=>e.target.style.transform="scale(1)"}>
                📎 Choose Resume
              </button>
              <p style={{fontSize:"0.78rem",color:"#B0BEC5",marginTop:4}}>
                Accepted: <strong style={{color:"#FFA726"}}>PDF</strong>, <strong style={{color:"#4FC3F7"}}>DOC</strong>, <strong style={{color:"#81C784"}}>DOCX</strong> • Max <strong>5MB</strong>
              </p>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:"1.2rem",textAlign:"left",padding:"0.4rem"}}>
              <div style={{fontSize:"3rem",flexShrink:0}}>{getFileIcon(file.type)}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700,color:"#2D3748",fontSize:"0.95rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:4}}>
                  {file.name}
                </p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:"0.8rem",color:"#718096"}}>📦 {formatSize(file.size)}</span>
                  <span style={{color:"#FFD54F",fontWeight:700}}>•</span>
                  <span style={{fontSize:"0.8rem",color:"#718096"}}>🏷️ {file.name.split(".").pop().toUpperCase()}</span>
                  <span style={{fontSize:"0.75rem",background:"rgba(129,199,132,0.2)",color:"#388E3C",border:"1px solid #81C784",borderRadius:20,padding:"2px 10px",fontWeight:600}}>✔ Valid</span>
                </div>
              </div>
            </div>
          )}
        </div>

        
        {/* ── SUCCESS MESSAGE ── */}
        {success && serverData && (
          <div style={{background:"#E8F5E9",border:"1px solid rgba(129,199,132,0.4)",borderRadius:14,padding:"1.2rem 1.4rem",animation:"bounceIn 0.5s ease both"}}>
            {/* Success title */}
            <p style={{color:"#2E7D32",fontWeight:800,fontSize:"1.05rem",marginBottom:"0.8rem"}}>
              ✅ {serverData.message}
            </p>
            {/* Server response details */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
              {[
                {label:"📄 File Name", value: serverData.filename},
                {label:"📦 File Size", value: serverData.filesize},
                {label:"🏷️ File Type", value: serverData.filetype?.split("/")[1]?.toUpperCase()},
                {label:"⏰ Uploaded",  value: new Date(serverData.uploadedAt).toLocaleTimeString()},
              ].map(item=>(
                <div key={item.label} style={{background:"rgba(255,255,255,0.7)",borderRadius:10,padding:"8px 12px"}}>
                  <p style={{fontSize:"0.72rem",color:"#90A4AE",fontWeight:600}}>{item.label}</p>
                  <p style={{fontSize:"0.88rem",color:"#2D3748",fontWeight:700,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP-BASED LOADING (NEW) ── */}
        {uploading && (
          <LoadingState
            steps={["Uploading file", "Extracting text", "Running AI analysis"]}
            currentStep={
              progress < 35 ? 0 :
              progress < 70 ? 1 : 2
            }
            theme="warm"
          />
        )}

        
        {/* ── PROGRESS BAR ── */}
        {file && progress > 0 && (
          <div style={{animation:"fadeUp 0.4s ease both"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:"0.85rem",fontWeight:600,color:"#2D3748"}}>
                {uploading ? "Sending to server…" : success ? "Upload Complete! ✅" : "Processing…"}
              </span>
              <span style={{fontSize:"0.85rem",fontWeight:700,color:"#FFA726"}}>{progress}%</span>
            </div>
            <div style={{width:"100%",height:10,background:"#EDF2F7",borderRadius:10,overflow:"hidden"}}>
              <div style={{
                height:"100%", borderRadius:10,
                background:"linear-gradient(90deg,#FFD54F,#FFA726,#4FC3F7)",
                backgroundSize:"200% 100%",
                animation:"shimmer 1.5s linear infinite",
                width:`${progress}%`,
                transition:"width 0.06s linear",
              }}/>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        {file && (
          <div className="act-btns" style={{display:"flex",gap:"1rem",flexWrap:"wrap",animation:"fadeUp 0.5s ease both"}}>          
            <button
              style={{background:"transparent",color:"#0288D1",border:"2px solid #4FC3F7",padding:"11px 24px",borderRadius:40,fontFamily:"Poppins",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",transition:"all 0.25s"}}
              onClick={handleRemove}
              onMouseEnter={e=>{e.target.style.background="rgba(79,195,247,0.12)";e.target.style.transform="scale(1.04)"}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.transform="scale(1)"}}>
              🗑️ Remove File
            </button>
          </div>
        )}

        {/* ── TRUST BADGES ── */}
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",paddingTop:"0.5rem",borderTop:"1px solid #EDF2F7"}}>
          {["🔒 Secure Upload","🤖 AI Ready","⚡ Fast Results","💾 Saved to Server"].map(b=>(
            <span key={b} style={{fontSize:"0.76rem",fontWeight:600,color:"#388E3C",background:"rgba(129,199,132,0.15)",border:"1px solid rgba(129,199,132,0.3)",padding:"5px 14px",borderRadius:20}}>
              {b}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
// ============================================================
// CTA BANNER
// ============================================================
// ============================================================
// UploadedResumes — Day 4 React Component
// Fetches all resumes from MongoDB via GET /api/resumes
// and displays them in a modern table
// ============================================================
// ============================================================
// UploadedResumes — Day 5 Update
// REPLACE your existing UploadedResumes function with this one.
//
// CHANGES from Day 4:
//   - Added useState for "selectedId" (which resume to preview)
//   - Made each table row clickable
//   - Renders <ResumePreview /> modal when a row is clicked
// ============================================================
// ============================================================
// ResumePreview — Day 5 React Component
// Shows ONE resume's full details + extracted text
// Fetches from GET /api/resume/:id
//
// HOW TO USE:
// 1. Add this function INSIDE App.js (below UploadedResumes)
// 2. We'll trigger it by clicking a resume row in the table
// 3. Uses simple useState to control which resume ID to show
//    (no react-router needed — keeps things beginner-friendly)
// ============================================================
  function ResumePreview({ resumeId, onClose }) {

  // ── STATE ──────────────────────────────────────────────────
  const [resume,  setResume]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── FETCH ONE RESUME BY ID ─────────────────────────────────
  useEffect(() => {
    if (!resumeId) return;

    async function fetchResumes() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setResume(data.data);
        } else {
          setError(data.message || "Failed to load resume.");
        }

      } catch (err) {
        setError("❌ Cannot connect to server. Make sure backend is running.");
        console.error("🔴 Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, [resumeId]);

  function getTypeIcon(mime) {
    if (mime === "application/pdf") return "📕";
    if (mime?.includes("doc")) return "📘";
    return "📄";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (!resumeId) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(45,55,72,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
        animation: "fadeUp 0.25s ease both",
      }}>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: 700, width: "100%",
          maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}>

        <div style={{
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg,#FFD54F,#FFA726)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{color:"#fff",fontSize:"1.2rem",fontWeight:800}}>
            📋 Resume Preview
          </h3>
          <button
            onClick={onClose}
            style={{
              background:"rgba(255,255,255,0.25)", border:"none",
              color:"#fff", width:32, height:32, borderRadius:"50%",
              fontSize:"1.1rem", cursor:"pointer", fontWeight:700,
            }}>
            ✕
          </button>
        </div>

        <div style={{padding:"1.8rem 2rem",overflowY:"auto",flex:1}}>

          {loading && (
            <div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <div style={{fontSize:"3rem",animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</div>
              <p style={{color:"#718096",marginTop:"1rem",fontWeight:600}}>Loading resume…</p>
            </div>
          )}

          {!loading && error && (
            <div style={{
              background:"#FFEBEE", color:"#C62828",
              border:"1px solid rgba(239,83,80,0.3)",
              borderRadius:12, padding:"1.2rem",
              textAlign:"center", fontWeight:600,
            }}>
              {error}
            </div>
          )}

          {!loading && !error && resume && (
            <>
              <div style={{
                display:"flex", alignItems:"center", gap:14,
                background:"#FFF8E1", borderRadius:16,
                padding:"1rem 1.2rem", marginBottom:"1.2rem",
              }}>
                <span style={{fontSize:"2.2rem"}}>{getTypeIcon(resume.fileType)}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:700,color:"#2D3748",fontSize:"1rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {resume.fileName}
                  </p>
                  <p style={{fontSize:"0.78rem",color:"#90A4AE",marginTop:2}}>
                    Uploaded {formatDate(resume.uploadDate)}
                  </p>
                </div>
              </div>

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:"1.5rem"}}>
                <span style={badgeStyle("#4FC3F7","#E1F5FE")}>
                  🏷️ {resume.fileType?.includes("pdf") ? "PDF" : "DOCX"}
                </span>
                <span style={badgeStyle("#81C784","#E8F5E9")}>
                  📦 {resume.fileSize}
                </span>
                <span style={badgeStyle("#FFA726","#FFF3E0")}>
                  🔤 {resume.resumeText?.length || 0} characters extracted
                </span>
              </div>

              <p style={{fontSize:"0.85rem",fontWeight:700,color:"#2D3748",marginBottom:8}}>
                📝 Extracted Text
              </p>
              <div style={{
                background:"#F7FAFC",
                border:"1px solid #EDF2F7",
                borderRadius:14,
                padding:"1.2rem",
                maxHeight:280,
                overflowY:"auto",
                fontSize:"0.85rem",
                lineHeight:1.7,
                color:"#4A5568",
                whiteSpace:"pre-wrap",
                fontFamily:"'Poppins', monospace",
              }}>
                {resume.resumeText && resume.resumeText.trim().length > 0
                  ? resume.resumeText
                  : "⚠️ No text could be extracted from this file. It may be a scanned image or an unsupported format."}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function badgeStyle(color, bg) {
  return {
    fontSize: "0.78rem", fontWeight: 700,
    color: color, background: bg,
    padding: "5px 14px", borderRadius: 20,
  };
}
// ============================================================
// ResumePreview — Day 5 React Component
// Shows ONE resume's full details + extracted text
// Fetches from GET /api/resume/:id
//
// HOW TO USE:
// 1. Add this function INSIDE App.js (below UploadedResumes)
// 2. We'll trigger it by clicking a resume row in the table
// 3. Uses simple useState to control which resume ID to show
//    (no react-router needed — keeps things beginner-friendly)
// ============================================================
// ============================================================
// AIAnalysisDashboard — Day 6 React Component
// Fetches AI analysis for ONE resume from
// GET /api/resume/:id/analysis
// and displays it in a modern, card-based dashboard
//
// HOW TO USE:
// Add this function INSIDE App.js (below ResumePreview)
// Then render <AIAnalysisDashboard /> the same way we render
// ResumePreview — triggered by a button click in the table
// ============================================================

function AIAnalysisDashboard({ resumeId, onClose }) {

  // ── STATE ──────────────────────────────────────────────────
  const [analysis,  setAnalysis]  = useState(null);   // the AI analysis object
  const [fileName,  setFileName]  = useState("");      // resume's file name
  const [loading,   setLoading]   = useState(true);    // true while fetching
  const [error,     setError]     = useState(null);    // error message

  // ── FETCH AI ANALYSIS BY RESUME ID ─────────────────────────
  useEffect(() => {
    if (!resumeId) return;

    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
  `${process.env.REACT_APP_API_URL}/api/resume/${resumeId}/analysis`
);
        const data = await response.json();

        if (data.success) {
          setAnalysis(data.data);
          setFileName(data.fileName);
        } else {
          setError(data.message || "No AI analysis available.");
        }

      } catch (err) {
        setError("❌ Cannot connect to server. Make sure backend is running.");
        console.error("🔴 Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [resumeId]);

  // ── HELPER: pick a color based on resume score ─────────────
  function getScoreColor(score) {
    if (score >= 80) return "#81C784"; // green — great
    if (score >= 60) return "#FFD54F"; // yellow — good
    if (score >= 40) return "#FFA726"; // orange — okay
    return "#EF5350";                  // red — needs work
  }

  if (!resumeId) return null;

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(45,55,72,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 2100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
        animation: "fadeUp 0.25s ease both",
      }}>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg,#FFF8E1,#E1F5FE)",
          borderRadius: 24,
          maxWidth: 800, width: "100%",
          maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg,#4FC3F7,#0288D1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h3 style={{color:"#fff",fontSize:"1.25rem",fontWeight:800}}>
              🤖 AI Analysis Dashboard
            </h3>
            {fileName && (
              <p style={{color:"rgba(255,255,255,0.85)",fontSize:"0.8rem",marginTop:2}}>
                {fileName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background:"rgba(255,255,255,0.25)", border:"none",
              color:"#fff", width:32, height:32, borderRadius:"50%",
              fontSize:"1.1rem", cursor:"pointer", fontWeight:700, flexShrink:0,
            }}>
            ✕
          </button>
        </div>

        {/* ── BODY (scrollable) ── */}
        <div style={{padding:"1.8rem 2rem",overflowY:"auto",flex:1}}>

          {/* ── LOADING STATE ── */}
          {loading && (
            <div style={{textAlign:"center",padding:"3.5rem 1rem"}}>
              <div style={{fontSize:"3.5rem",animation:"spin 1s linear infinite",display:"inline-block"}}>🤖</div>
              <p style={{color:"#718096",marginTop:"1.2rem",fontWeight:600}}>
                Loading AI analysis…
              </p>
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {!loading && error && (
            <div style={{
              background:"#FFEBEE", color:"#C62828",
              border:"1px solid rgba(239,83,80,0.3)",
              borderRadius:14, padding:"1.5rem",
              textAlign:"center", fontWeight:600,
            }}>
              {error}
              <p style={{fontSize:"0.8rem",fontWeight:500,marginTop:8,color:"#E57373"}}>
                This resume may have been uploaded before AI analysis was added,
                or analysis failed during upload.
              </p>
            </div>
          )}

          {/* ── ANALYSIS CONTENT ── */}
          {!loading && !error && analysis && (
            <div style={{display:"flex",flexDirection:"column",gap:"1.4rem"}}>

              {/* ── Candidate Name + Score ── */}
              <div style={{
                ...cardStyle,
                display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:"1rem",
              }}>
                <div>
                  <p style={labelStyle}>👤 Candidate</p>
                  <p style={{fontSize:"1.3rem",fontWeight:800,color:"#2D3748"}}>
                    {analysis.candidateName || "Not Found"}
                  </p>
                </div>

                {/* Resume Score Circle */}
                <div style={{textAlign:"center"}}>
                  <p style={labelStyle}>📊 Resume Score</p>
                  <p style={{
                    fontSize:"2rem",fontWeight:900,
                    color:getScoreColor(analysis.resumeScore),
                  }}>
                    {analysis.resumeScore}<span style={{fontSize:"1rem",color:"#90A4AE"}}>/100</span>
                  </p>
                </div>
              </div>

              {/* ── Score Progress Bar ── */}
              <div style={cardStyle}>
                <div style={{width:"100%",height:14,background:"#EDF2F7",borderRadius:10,overflow:"hidden"}}>
                  <div style={{
                    height:"100%", borderRadius:10,
                    width:`${analysis.resumeScore}%`,
                    background:`linear-gradient(90deg,${getScoreColor(analysis.resumeScore)},#FFD54F)`,
                    transition:"width 0.8s ease",
                  }}/>
                </div>
              </div>

              {/* ── Professional Summary ── */}
              <div style={cardStyle}>
                <p style={labelStyle}>📝 Professional Summary</p>
                <p style={{color:"#4A5568",lineHeight:1.7,fontSize:"0.92rem",marginTop:6}}>
                  {analysis.summary}
                </p>
              </div>

              {/* ── Experience Level + Education (side by side) ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.2rem"}} className="dash-grid2">
                <div style={cardStyle}>
                  <p style={labelStyle}>💼 Experience Level</p>
                  <span style={{
                    display:"inline-block", marginTop:6,
                    background:"rgba(79,195,247,0.15)", color:"#0288D1",
                    padding:"5px 16px", borderRadius:20,
                    fontWeight:700, fontSize:"0.85rem",
                  }}>
                    {analysis.experienceLevel}
                  </span>
                </div>
                <div style={cardStyle}>
                  <p style={labelStyle}>🎓 Education</p>
                  <p style={{color:"#4A5568",fontWeight:600,fontSize:"0.88rem",marginTop:6}}>
                    {analysis.education}
                  </p>
                </div>
              </div>

              {/* ── Technical Skills ── */}
              <div style={cardStyle}>
                <p style={labelStyle}>⚙️ Technical Skills</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {analysis.technicalSkills?.map((skill, i) => (
                    <span key={i} style={chipStyle("#4FC3F7","#E1F5FE")}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* ── Soft Skills ── */}
              <div style={cardStyle}>
                <p style={labelStyle}>💬 Soft Skills</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {analysis.softSkills?.map((skill, i) => (
                    <span key={i} style={chipStyle("#81C784","#E8F5E9")}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* ── Strengths + Missing Skills (side by side) ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.2rem"}} className="dash-grid2">
                <div style={cardStyle}>
                  <p style={labelStyle}>💪 Strengths</p>
                  <ul style={listStyle}>
                    {analysis.strengths?.map((item, i) => (
                      <li key={i} style={listItemStyle("#388E3C")}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
                <div style={cardStyle}>
                  <p style={labelStyle}>📌 Missing Skills</p>
                  <ul style={listStyle}>
                    {analysis.missingSkills?.map((item, i) => (
                      <li key={i} style={listItemStyle("#E65100")}>⚠ {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Recommended Job Roles ── */}
              <div style={cardStyle}>
                <p style={labelStyle}>🎯 Recommended Job Roles</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {analysis.recommendedJobRoles?.map((role, i) => (
                    <span key={i} style={chipStyle("#FF7043","#FBE9E7")}>{role}</span>
                  ))}
                </div>
              </div>

              {/* ── Improvement Suggestions ── */}
              <div style={{...cardStyle,background:"linear-gradient(135deg,#FFF8E1,#FFECB3)"}}>
                <p style={labelStyle}>✨ Improvement Suggestions</p>
                <ul style={listStyle}>
                  {analysis.improvementSuggestions?.map((tip, i) => (
                    <li key={i} style={listItemStyle("#E65100")}>💡 {tip}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:640px){
          .dash-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Shared style helpers ────────────────────────────────────────
const cardStyle = {
  background: "rgba(255,255,255,0.85)",
  borderRadius: 16,
  padding: "1.2rem 1.4rem",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#90A4AE",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

function chipStyle(color, bg) {
  return {
    fontSize: "0.8rem", fontWeight: 700,
    color: color, background: bg,
    padding: "5px 14px", borderRadius: 20,
  };
}

const listStyle = {
  listStyle: "none",
  marginTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

function listItemStyle(color) {
  return {
    fontSize: "0.85rem",
    color: color,
    fontWeight: 600,
    lineHeight: 1.5,
  };
}
// ============================================================
// UploadedResumes — Day 6 Update
// REPLACE your existing UploadedResumes function with this one.
//
// CHANGES from Day 5:
//   - Added a second useState "analysisId" to control the
//     AI Analysis Dashboard modal separately from the file preview
//   - Added a "🤖 View AI Analysis" button per row
//   - Renders <AIAnalysisDashboard /> alongside <ResumePreview />
// ============================================================

function UploadedResumes({ refreshTrigger }) {

  // ── STATE ──────────────────────────────────────────────────
  const [resumes, setResumes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);

  // Controls the file preview modal (Day 5)
  const [selectedId, setSelectedId] = useState(null);

  // ── NEW (Day 6): controls the AI Analysis Dashboard modal ──
  const [analysisId, setAnalysisId] = useState(null);

  // ── FETCH RESUMES FROM BACKEND ────────────────────────────
  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setResumes(data.data);
        } else {
          setError(data.message || "Failed to load resumes.");
        }

      } catch (err) {
        setError("❌ Cannot connect to server. Make sure backend is running.");
        console.error("🔴 Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, [refreshTrigger]);

  // ── HELPERS ────────────────────────────────────────────────
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function getTypeLabel(mime) {
    if (mime === "application/pdf") return "PDF";
    if (mime.includes("docx") || mime.includes("openxml")) return "DOCX";
    if (mime.includes("doc")) return "DOC";
    return "FILE";
  }

  function getTypeIcon(mime) {
    if (mime === "application/pdf") return "📕";
    if (mime.includes("doc")) return "📘";
    return "📄";
  }

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <section id="resumes" style={{
      padding: "80px 2rem",
      background: "linear-gradient(180deg,#E1F5FE 0%,#FFF8E1 100%)",
    }}>

      <div style={{textAlign:"center",marginBottom:"2.5rem",animation:"fadeUp 0.6s ease both"}}>
        
        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.5rem)",fontWeight:800,background:"linear-gradient(135deg,#0277BD,#FFA726)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:8}}>
          Uploaded Resumes
        </h2>
        <p style={{color:"#718096",marginTop:8}}>
          Click a row to preview text, or view AI insights 🤖
        </p>
      </div>

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(255,167,38,0.13)",
        border: "1px solid rgba(255,255,255,0.8)",
        padding: "2rem",
        overflowX: "auto",
      }}>

        {loading && (
          <div style={{textAlign:"center",padding:"3rem 1rem"}}>
            <div style={{fontSize:"3rem",animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</div>
            <p style={{color:"#718096",marginTop:"1rem",fontWeight:600}}>Loading resumes…</p>
          </div>
        )}

        {!loading && error && (
          <div style={{
            background:"#FFEBEE", color:"#C62828",
            border:"1px solid rgba(239,83,80,0.3)",
            borderRadius:12, padding:"1.2rem",
            textAlign:"center", fontWeight:600,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && resumes.length === 0 && (
          <div style={{textAlign:"center",padding:"3rem 1rem"}}>
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>📭</div>
            <p style={{color:"#718096",fontWeight:600}}>
              No resumes uploaded yet. Upload one above! 👆
            </p>
          </div>
        )}

        {!loading && !error && resumes.length > 0 && (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"2px solid #FFD54F"}}>
                <th style={thStyle}>📄 File Name</th>
                <th style={thStyle}>🏷️ Type</th>
                <th style={thStyle}>📦 Size</th>
                <th style={thStyle}>📅 Upload Date</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r, index) => (
                <tr key={r._id}
                  style={{
                    borderBottom:"1px solid #EDF2F7",
                    transition:"background 0.2s",
                    animation:`fadeUp 0.4s ease ${index * 60}ms both`,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,213,79,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                  {/* Clicking the name/icon opens text preview (Day 5) */}
                  <td style={tdStyle} onClick={() => setSelectedId(r._id)}>
                    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                      <span style={{fontSize:"1.4rem"}}>{getTypeIcon(r.fileType)}</span>
                      <span style={{fontWeight:600,color:"#2D3748",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {r.fileName}
                      </span>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{
                      fontSize:"0.78rem", fontWeight:700,
                      background:"rgba(79,195,247,0.15)",
                      color:"#0288D1",
                      padding:"4px 12px", borderRadius:20,
                    }}>
                      {getTypeLabel(r.fileType)}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span style={{color:"#718096",fontWeight:500}}>{r.fileSize}</span>
                  </td>

                  <td style={tdStyle}>
                    <span style={{color:"#718096",fontSize:"0.85rem"}}>
                      {formatDate(r.uploadDate)}
                    </span>
                  </td>

                  {/* ── NEW (Day 6): AI Analysis button ── */}
                  <td style={{...tdStyle,textAlign:"right"}}>
                    <button
                      onClick={() => setAnalysisId(r._id)}
                      style={{
                        background:"linear-gradient(135deg,#4FC3F7,#0288D1)",
                        color:"#fff", border:"none",
                        padding:"6px 16px", borderRadius:20,
                        fontFamily:"Poppins", fontWeight:700, fontSize:"0.78rem",
                        cursor:"pointer", whiteSpace:"nowrap",
                        boxShadow:"0 3px 10px rgba(2,136,209,0.3)",
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={e=>e.target.style.transform="scale(1.06)"}
                      onMouseLeave={e=>e.target.style.transform="scale(1)"}>
                      🤖 AI Analysis
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && (
          <div style={{textAlign:"center",marginTop:"1.5rem"}}>
            <button
              onClick={()=>window.location.reload()}
              style={{
                background:"linear-gradient(135deg,#FFA726,#FF7043)",
                color:"#fff", border:"none",
                padding:"10px 28px", borderRadius:40,
                fontFamily:"Poppins", fontWeight:700, fontSize:"0.85rem",
                cursor:"pointer", boxShadow:"0 4px 16px rgba(255,112,67,0.3)",
                transition:"all 0.25s",
              }}
              onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
              onMouseLeave={e=>e.target.style.transform="scale(1)"}>
              🔄 Refresh List
            </button>
          </div>
        )}

      </div>

      {/* ── Day 5: file text preview modal ── */}
      <ResumePreview
        resumeId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      {/* ── NEW (Day 6): AI analysis dashboard modal ── */}
      <AIAnalysisDashboard
        resumeId={analysisId}
        onClose={() => setAnalysisId(null)}
      />

    </section>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#E65100",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "0.9rem",
};

function CTABanner() {
  return (
    <section style={{padding:"70px 2rem",background:"linear-gradient(135deg,#FFA726,#FF7043,#4FC3F7)",backgroundSize:"300% 300%",animation:"gradShift 8s ease infinite",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,left:-80,width:280,height:280,background:"rgba(255,255,255,0.1)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",bottom:-60,right:-60,width:240,height:240,background:"rgba(255,255,255,0.08)",borderRadius:"50%"}}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:"2.8rem",marginBottom:"1rem",animation:"wiggle 1.5s ease-in-out infinite"}}>🚀</div>
        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.7rem)",fontWeight:900,color:"#fff",marginBottom:12}}>Ready to Land Your Dream Job?</h2>
        <p style={{color:"rgba(255,255,255,0.88)",fontSize:"1rem",maxWidth:500,margin:"0 auto 2rem"}}>
          Join thousands of happy job seekers who upgraded their resumes with AI.
        </p>
        <a href="#upload">
          <button style={{background:"white",color:"#FFA726",border:"none",padding:"14px 40px",borderRadius:40,fontSize:"1rem",fontFamily:"Poppins",fontWeight:800,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,0.14)",transition:"all 0.25s ease"}}
            onMouseEnter={e=>{e.target.style.transform="scale(1.06) translateY(-2px)";e.target.style.boxShadow="0 12px 36px rgba(0,0,0,0.2)"}}
            onMouseLeave={e=>{e.target.style.transform="scale(1) translateY(0)";e.target.style.boxShadow="0 6px 24px rgba(0,0,0,0.14)"}}>
            ✨ Analyze My Resume — Free
          </button>
        </a>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function NewsletterForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast("You're subscribed! 📬", 'success');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubscribe} style={{display:"flex",gap:8}}>
      <input
        type="email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        placeholder="Your email"
        style={{
          flex:1, padding:"9px 12px", borderRadius:10,
          border:"1px solid rgba(255,255,255,0.18)",
          background:"rgba(255,255,255,0.06)",
          color:"#fff", fontSize:"0.82rem", fontFamily:"Poppins",
          outline:"none",
        }}
      />
      <button type="submit" style={{
        background:"linear-gradient(135deg,#FFA726,#FF7043)",
        color:"#fff", border:"none", padding:"9px 18px",
        borderRadius:10, fontWeight:700, fontSize:"0.8rem",
        cursor:"pointer", fontFamily:"Poppins", whiteSpace:"nowrap",
      }}>
        Subscribe
      </button>
    </form>
  );
}

function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ...the rest of your existing Footer code continues here unchanged
  const linkStyle = {color:"#90A4AE",textDecoration:"none",fontSize:"0.88rem",transition:"color 0.2s",cursor:"pointer"};
  return (
    <footer id="contact" style={{background:"#1A237E",padding:"60px 2rem 28px",color:"#B0BEC5"}}>
      <div className="footer-grid" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"2.5rem",marginBottom:"3rem"}}>
        {/* Brand */}
        <div>
          <div style={{fontSize:"1.7rem",fontWeight:900,background:"linear-gradient(135deg,#FFD54F,#4FC3F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:14}}>✦ DOSS&CO Resume Analysis</div>
          <p style={{lineHeight:1.8,fontSize:"0.88rem",maxWidth:250,marginBottom:18}}>AI-powered resume analysis helping job seekers land their dream roles faster.</p>

          {/* Newsletter signup */}
          <NewsletterForm />

          <div style={{display:"flex",gap:10,marginTop:18}}>
            {["𝕏","in","🐙","📘"].map((s,i)=>(
              <div key={i} style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,213,79,0.2)";e.currentTarget.style.transform="translateY(-3px)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.transform="translateY(0)"}}>
                {s}
              </div>
            ))}
          </div>
        </div>
        {/* Links */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <h4 style={{color:"#fff",fontWeight:700,marginBottom:4}}>Quick Links</h4>
          {["Home","Features","Upload","About","Contact"].map(l=>(
            <a key={l} href={`#${l.toLowerCase()}`} style={linkStyle}
              onMouseEnter={e=>e.target.style.color="#FFD54F"}
              onMouseLeave={e=>e.target.style.color="#90A4AE"}>{l}</a>
          ))}
        </div>
        {/* Legal */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <h4 style={{color:"#fff",fontWeight:700,marginBottom:4}}>Legal</h4>
          {["Privacy Policy","Terms of Service","Cookie Policy","Disclaimer"].map(l=>(
            <a key={l} href="/" style={linkStyle}
              onMouseEnter={e=>e.target.style.color="#FFD54F"}
              onMouseLeave={e=>e.target.style.color="#90A4AE"}>{l}</a>
          ))}
        </div>
        {/* Contact */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <h4 style={{color:"#fff",fontWeight:700,marginBottom:4}}>Contact</h4>
          <span style={{fontSize:"0.88rem"}}>📧 dossebi2004@gmail.com</span>
          <span style={{fontSize:"0.88rem"}}>📞 +91 95978 27680</span>
          <span style={{fontSize:"0.88rem"}}>📍 Puducherry, India</span>
          <div style={{marginTop:10,background:"rgba(129,199,132,0.2)",border:"1px solid #81C784",borderRadius:20,padding:"5px 14px",fontSize:"0.76rem",color:"#81C784",fontWeight:600,display:"inline-block"}}>
            🟢 AI Online 24/7
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:22,textAlign:"center",fontSize:"0.82rem",color:"#546E7A"}}>
        © 2025 ✦ DOSS&CO Resume Analysis • Made with ❤️ & 🤖 AI • All rights reserved.
      </div>

      {/* Back to Top button */}
{showBackToTop && (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    style={{
      position:"fixed", bottom:28, right:28, zIndex:500,
      width:48, height:48, borderRadius:"50%",
      background:"linear-gradient(135deg,#FFA726,#FF7043)",
      color:"#fff", border:"none", cursor:"pointer",
      fontSize:"1.3rem", boxShadow:"0 6px 20px rgba(255,112,67,0.4)",
      transition:"transform 0.2s",
    }}
    onMouseEnter={e=>e.target.style.transform="translateY(-4px)"}
    onMouseLeave={e=>e.target.style.transform="translateY(0)"}
    title="Back to top"
  >
    ↑
  </button>
)}
    </footer>
  );
}
// =========================================================================
// HOMEPAGE — your existing landing page, now its own component
// =========================================================================
// ============================================================
// ============================================================
// ABOUT / TEAM SECTION — carousel style (matches Testimonials)
// ============================================================
const TEAM = [
  { name: "Doss Ebinesan A",     role: "Project Lead & Full-Stack Developer", avatar: "👑", lead: true },
  { name: "Eshwar Jagan M",      role: "Backend Developer",                   avatar: "🧑‍💻" },
  { name: "Sivavishnu P",        role: "Frontend Developer",                  avatar: "🎨" },
  { name: "Nesaprasath T",       role: "AI/ML Integration Engineer",          avatar: "🤖" },
  { name: "Vijay Venkat Raj R",  role: "UI/UX Designer",                      avatar: "✨" },
  { name: "Parthasarathy P",     role: "Database & API Engineer",             avatar: "🗄️" },
  { name: "Manasseh V",          role: "Quality Assurance & Testing",         avatar: "🧪" },
  { name: "Arul Prasath P",      role: "Documentation & Deployment",          avatar: "📦" },
];

function TeamCard({ member, delay }) {
  return (
    <div style={{
      ...T.card,
      padding: member.lead ? "2.4rem 2rem" : "1.8rem 1.4rem",
      textAlign: "center",
      border: member.lead ? "2px solid #FFA726" : "1px solid rgba(255,255,255,0.8)",
      background: member.lead
        ? "linear-gradient(135deg,#FFF3E0,#FFF8E1)"
        : "rgba(255,255,255,0.82)",
      position: "relative",
      transform: member.lead ? "scale(1.04)" : "scale(1)",
      animation: `fadeUp 0.6s ease ${delay}ms both`,
      transition: "transform 0.3s, box-shadow 0.3s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform=(member.lead?"scale(1.07)":"scale(1.03)")+" translateY(-4px)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform=member.lead?"scale(1.04)":"scale(1)";}}>
      {member.lead && (
        <div style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#FFA726,#FF7043)", color: "#fff",
          fontSize: "0.68rem", fontWeight: 800, letterSpacing: 1,
          padding: "4px 14px", borderRadius: 20,
          boxShadow: "0 4px 12px rgba(255,112,67,0.4)",
          whiteSpace: "nowrap",
        }}>
          PROJECT LEAD
        </div>
      )}
      <div style={{
        width: member.lead ? 76 : 60, height: member.lead ? 76 : 60,
        margin: "0 auto 14px", borderRadius: "50%",
        background: member.lead
          ? "linear-gradient(135deg,#FFD54F,#FFA726)"
          : "linear-gradient(135deg,#E1F5FE,#B3E5FC)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: member.lead ? "2.1rem" : "1.6rem",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}>
        {member.avatar}
      </div>
      <h4 style={{
        fontSize: member.lead ? "1.15rem" : "1rem",
        fontWeight: 800, color: "#2D3748", marginBottom: 6,
      }}>
        {member.name}
      </h4>
      <p style={{
        fontSize: member.lead ? "0.88rem" : "0.8rem",
        fontWeight: 600,
        color: member.lead ? "#E65100" : "#0288D1",
      }}>
        {member.role}
      </p>
    </div>
  );
}

function AboutSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const [cardsPerView, setCardsPerView] = useState(
    window.innerWidth < 768 ? 1 : 3
  );

  useEffect(() => {
    const handleResize = () => setCardsPerView(window.innerWidth < 768 ? 1 : 3);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(TEAM.length / cardsPerView);

  // Auto-advance every 4 seconds, unless hovering
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, totalSlides]);

  const goTo = (index) => setCurrent(((index % totalSlides) + totalSlides) % totalSlides);
  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  const visibleTeam = TEAM.slice(
    current * cardsPerView,
    current * cardsPerView + cardsPerView
  );

  return (
    <section
      id="about"
      style={{ padding: "80px 2rem", background: "linear-gradient(180deg,#FFF8E1 0%,#F3E5F5 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span style={{fontSize:"0.75rem",fontWeight:700,color:"#FF7043",textTransform:"uppercase",letterSpacing:3}}>ABOUT US</span>
        <h2 style={{fontSize:"clamp(1.8rem,4vw,2.5rem)",fontWeight:800,background:"linear-gradient(135deg,#4FC3F7,#FFA726)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:8,marginBottom:20}}>
          About DOSS&CO Resume Analysis
        </h2>
        <p style={{maxWidth:640,margin:"0 auto",color:"#546E7A",lineHeight:1.8,fontSize:"1rem"}}>
          DOSS&CO Resume Analysis is an AI-powered platform built to help job seekers understand
          and improve their resumes. By combining skill extraction, ATS scoring, and job-description
          matching, we give candidates clear, actionable feedback — turning guesswork into
          data-driven career decisions.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <button
          onClick={goPrev}
          aria-label="Previous team member"
          style={{position:"absolute",left:-16,top:"50%",transform:"translateY(-50%)",zIndex:2,width:40,height:40,borderRadius:"50%",border:"none",background:"white",boxShadow:"0 4px 14px rgba(0,0,0,0.12)",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}
        >‹</button>
        <button
          onClick={goNext}
          aria-label="Next team member"
          style={{position:"absolute",right:-16,top:"50%",transform:"translateY(-50%)",zIndex:2,width:40,height:40,borderRadius:"50%",border:"none",background:"white",boxShadow:"0 4px 14px rgba(0,0,0,0.12)",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}
        >›</button>

        <div style={{display:"grid",gridTemplateColumns:`repeat(${cardsPerView},1fr)`,gap:"1.5rem"}}>
          {visibleTeam.map((m, i) => (
            <TeamCard key={m.name} member={m} delay={i * 150} />
          ))}
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:"2rem"}}>
          {Array.from({length: totalSlides}).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i+1}`}
              style={{width:current===i?24:8,height:8,borderRadius:4,border:"none",background:current===i?"#FF7043":"#FFCC80",cursor:"pointer",transition:"all 0.3s"}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
function HomePage() {
  // Bumping this number tells UploadedResumes to refetch the list
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <Navbar />         {/* Fixed top navigation */}
      <Hero />            {/* Landing hero with illustration */}
      <Features />        {/* 4 feature cards */}
      
      <Statistics />      {/* Animated counters */}
      <UploadSection onUploadSuccess={() => setRefreshKey(k => k + 1)} />
      <UploadedResumes refreshTrigger={refreshKey} /> {/* Day 2 — Upload + Validation */}
      <Testimonials />    {/* 3 user testimonials */}
      <FAQSection />      {/* NEW: Frequently Asked Questions */}
      <AboutSection />
      <CTABanner />       {/* Call to action */}
      <Footer />          {/* Footer with links */}
    </div>
  );
}

// =========================================================================
// APP — ROOT COMPONENT
// Sets up routing: decides which page to show based on the URL
// =========================================================================
export default function App() {
  return (
    <InstallGate>
  <ToastProvider>
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/job-match" element={
  <ProtectedRoute>
    <JobMatch />
  </ProtectedRoute>
} />
  <Route path="/history" element={
  <ProtectedRoute>
    <ResumeHistory />
  </ProtectedRoute>
} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
  <Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />   
   <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ToastProvider>
  </InstallGate>
  );
}
