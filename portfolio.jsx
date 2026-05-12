import { useState, useEffect, useRef, useCallback } from "react";
import profileImg1 from "./Asset/Img/Profil2.JPEG";
import profileImg2 from "./Asset/Img/profil.png";
import cvFile from "./Asset/CV/Cv Alfi Fikri Putra Saldan.pdf";

/* ─── TYPING ANIMATION ──────────────────────────────────────────────── */
const TypingText = ({ phrases, speed = 100, delay = 2000 }) => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout;
    if (!isDeleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => { setDisplayText(currentPhrase.slice(0, charIndex + 1)); setCharIndex(charIndex + 1); }, speed);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => { setDisplayText(currentPhrase.slice(0, charIndex - 1)); setCharIndex(charIndex - 1); }, speed / 2);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && charIndex === 0) {
      setPhraseIndex((phraseIndex + 1) % phrases.length);
      setIsDeleting(false);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, speed, delay]);

  return <span style={{ minHeight: "1.2em", display: "inline-block" }}>{displayText}</span>;
};

/* ─── SCROLL REVEAL ─────────────────────────────────────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
        else e.target.classList.remove("revealed");
      }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const lerp = (a, b, t) => a + (b - a) * t;
/* ═══════════════════════════════════════════════════════════════════
   3D TILT PROFILE CARD — fixed seamless light sweep
═══════════════════════════════════════════════════════════════════ */

const ProfileCard = ({ isMobile, profileImage }) => {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const target = useRef({ rx: 0, ry: 0, lx: 75, ly: 25 });
  const current = useRef({ rx: 0, ry: 0, lx: 75, ly: 25 });
  const hovering = useRef(false);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [light, setLight] = useState({ x: 75, y: 25 });
  const [isHovered, setIsHovered] = useState(false);

  const cardWidth  = isMobile ? 280 : 380;
  const cardHeight = isMobile ? 390 : 530;
  const barH = isMobile ? 80 : 90;

  const loop = useCallback(() => {
    const spd = hovering.current ? 0.1 : 0.05;
    const c = current.current, t = target.current;
    c.rx = lerp(c.rx, t.rx, spd);
    c.ry = lerp(c.ry, t.ry, spd);
    c.lx = lerp(c.lx, t.lx, spd);
    c.ly = lerp(c.ly, t.ly, spd);
    setTilt({ rx: c.rx, ry: c.ry });
    setLight({ x: c.lx, y: c.ly });
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const onMove = (e) => {
    if (isMobile) return;
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    target.current.rx = (y - 0.5) * -22;
    target.current.ry = (x - 0.5) * 22;
    target.current.lx = x * 100;
    target.current.ly = y * 100;
  };

  const onEnter = () => { hovering.current = true; setIsHovered(true); };
  const onLeave = () => {
    hovering.current = false; setIsHovered(false);
    target.current = { rx: 0, ry: 0, lx: 75, ly: 25 };
  };

  const depth   = Math.sqrt(tilt.rx ** 2 + tilt.ry ** 2);
  const shadowX = tilt.ry * 2;
  const shadowY = tilt.rx * -2;

  return (
    <div
      style={{ perspective: 900, width: cardWidth, height: cardHeight, flexShrink: 0 }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%", height: "100%",
          borderRadius: 20,
          position: "relative",
          overflow: "hidden",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${isHovered ? 1.03 : 1})`,
          transformStyle: "preserve-3d",
          transition: "box-shadow 0.3s, transform 0.1s",
          boxShadow: `
            ${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.75),
            ${shadowX * 0.4}px ${shadowY * 0.4}px 120px rgba(255,255,255,${0.12 + depth * 0.008}),
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          willChange: "transform",
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* LAYER 1: Full-bleed photo */}
        {profileImage ? (
          <img src={profileImage} alt="profile" style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            display: "block", zIndex: 0,
          }} />
        ) : (
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "linear-gradient(160deg, #1a2a3a 0%, #0d1520 60%, #050d18 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 100, opacity: 0.08 }}>👤</div>
          </div>
        )}

        {/* LAYER 2: Top gradient */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          zIndex: 1, pointerEvents: "none",
        }} />

        {/* LAYER 3: Bottom gradient */}
        <div style={{
          position: "absolute", bottom: barH - 4, left: 0, right: 0, height: 100,
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 100%)",
          zIndex: 1, pointerEvents: "none",
        }} />

        {/* ─────────────────────────────────────────────────────────
            LAYER 4: SWEEP CAHAYA — seamless via translate
            ─────────────────────────────────────────────────────────
            Elemen ini berukuran 4× kartu dan di-center.
            Strip diagonal tipis digambar di tengah area besar ini.
            Animasi menggeser elemen secara fisik (translate),
            bukan background-position, sehingga tidak ada visual
            "terpotong" saat loop kembali ke titik awal karena
            posisi awal/akhir sudah berada jauh di luar batas kartu.
            overflow: hidden pada parent yang memotongnya.
        ───────────────────────────────────────────────────────── */}
        {!isHovered && (
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            width:  cardWidth  * 4,
            height: cardHeight * 4,
            marginTop:  -(cardHeight * 2),
            marginLeft: -(cardWidth  * 2),
            pointerEvents: "none",
            zIndex: 5,
            background: `linear-gradient(
              135deg,
              transparent        0%,
              transparent        47%,
              rgba(255,255,255,0.05) 48.5%,
              rgba(255,255,255,0.11) 50%,
              rgba(255,255,255,0.05) 51.5%,
              transparent        53%,
              transparent        100%
            )`,
            animation: "sweepMove 6s linear infinite",
            willChange: "transform",
          }} />
        )}

        {/* LAYER 5: Cursor light saat hover */}
        {isHovered && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", borderRadius: 20,
            background: `radial-gradient(ellipse 65% 65% at ${light.x}% ${light.y}%,
              rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`,
          }} />
        )}

        {/* LAYER 6: Top specular */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.08 + Math.max(0, tilt.rx * -0.01)}), transparent)`,
          pointerEvents: "none", zIndex: 6,
        }} />

        {/* LAYER 7: Name overlay top-left */}
        <div style={{
          position: "absolute", top: isMobile ? 20 : 26, left: isMobile ? 20 : 26, zIndex: 3,
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: isMobile ? 28 : 36,
            color: "#fff",
            letterSpacing: 1.5,
            lineHeight: 1.05,
            textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          }}>
            Alfi Saldan
          </div>
          <div style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: 2,
            fontFamily: "'Space Mono', monospace",
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            marginTop: 4,
          }}>
            Software Engineer
          </div>
        </div>

        {/* LAYER 8: Bottom bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: barH,
          background: "rgba(10,10,14,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          zIndex: 4,
          display: "flex", alignItems: "center",
          padding: isMobile ? "0 16px" : "0 20px",
          gap: isMobile ? 12 : 14,
        }}>
          {/* Avatar */}
          <div style={{
            width: isMobile ? 42 : 50, height: isMobile ? 42 : 50,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.12)",
            overflow: "hidden", flexShrink: 0, background: "#1a2a3a",
          }}>
            {profileImage ? (
              <img src={profileImage} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1a2a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "rgba(255,255,255,0.2)" }}>👤</div>
            )}
          </div>

          {/* Username */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontSize: isMobile ? 12 : 13,
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>@alf_saldan</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
                boxShadow: "0 0 6px #22c55e, 0 0 14px #22c55e66",
                animation: "glow 2s ease-in-out infinite", flexShrink: 0,
              }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 9 : 10, fontFamily: "'Space Mono', monospace" }}>Online</span>
            </div>
          </div>

          {/* Contact Me */}
          <button
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 24,
              color: "#fff",
              fontSize: isMobile ? 10 : 11,
              fontFamily: "'Space Mono', monospace",
              padding: isMobile ? "7px 14px" : "8px 18px",
              cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5,
              transition: "background 0.2s, border-color 0.2s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
          >Contact Me</button>
        </div>
      </div>
    </div>
  );
};
/* ═══════════════════════════════════════════════════════════════════
   LANYARD ID CARD
═══════════════════════════════════════════════════════════════════ */
const IDCard = ({ isMobile, profileImage }) => {
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const prevMouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const cardEl = useRef(null);

  const [cardXY, setCardXY] = useState({ x: 0, y: 0 });
  const [cardRot, setCardRot] = useState(-4);
  const [isDrag, setIsDrag] = useState(false);
  const [ropePoints, setRopePoints] = useState({ cp1: { x: 0.5, y: 0.4 }, cp2: { x: 0.5, y: 0.72 } });

  const W = isMobile ? 240 : 280;
  const H_ROPE = isMobile ? 160 : 200;
  const cardWidth = isMobile ? 210 : 260;
  const cardHeight = isMobile ? 300 : 380;
  const PEG_X = W / 2, PEG_Y = 18;
  const CARD_TOP_BASE_Y = H_ROPE + 49;

  const loop = useCallback(() => {
    if (!dragRef.current) {
      const stiff = 0.09, damp = 0.7;
      velRef.current.x = (velRef.current.x + (0 - posRef.current.x) * stiff) * damp;
      velRef.current.y = (velRef.current.y + (0 - posRef.current.y) * stiff) * damp;
      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;
      const px = posRef.current.x, py = posRef.current.y;
      const rot = -4 + px * 0.04;
      const pullX = px / W, pullY = py / H_ROPE;
      setRopePoints({
        cp1: { x: 0.5 + pullX * 0.32, y: 0.38 + pullY * 0.18 + Math.abs(pullX) * 0.1 },
        cp2: { x: 0.5 + pullX * 0.58, y: 0.68 + pullY * 0.22 + Math.abs(pullX) * 0.08 },
      });
      setCardXY({ x: px, y: py });
      setCardRot(rot);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [W, H_ROPE]);

  useEffect(() => { rafRef.current = requestAnimationFrame(loop); return () => cancelAnimationFrame(rafRef.current); }, [loop]);

  const onMouseDown = (e) => {
    dragRef.current = true; setIsDrag(true);
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { x: posRef.current.x, y: posRef.current.y };
    prevMouse.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      posRef.current.x = startPos.current.x + dx;
      posRef.current.y = startPos.current.y + dy;
      const px = posRef.current.x, py = posRef.current.y;
      const rot = -4 + px * 0.04;
      const pullX = px / W, pullY = py / H_ROPE;
      const stretch = Math.sqrt(px * px + py * py) / 180;
      setRopePoints({
        cp1: { x: 0.5 + pullX * 0.38, y: 0.34 + pullY * 0.22 + Math.abs(pullX) * 0.13 + stretch * 0.04 },
        cp2: { x: 0.5 + pullX * 0.62, y: 0.66 + pullY * 0.26 + Math.abs(pullX) * 0.1 + stretch * 0.04 },
      });
      setCardXY({ x: px, y: py }); setCardRot(rot);
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e) => {
      if (!dragRef.current) return;
      velRef.current = { x: (e.clientX - prevMouse.current.x) * 0.45, y: (e.clientY - prevMouse.current.y) * 0.45 };
      dragRef.current = false; setIsDrag(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [W, H_ROPE]);

  const clipX = W / 2 + cardXY.x;
  const clipY = CARD_TOP_BASE_Y + cardXY.y;
  const c1x = ropePoints.cp1.x * W, c1y = ropePoints.cp1.y * H_ROPE;
  const c2x = ropePoints.cp2.x * W, c2y = ropePoints.cp2.y * H_ROPE;
  const pathD = `M ${PEG_X} ${PEG_Y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${clipX} ${clipY}`;
  const photoHeight = Math.round(cardHeight * 0.56);

  const totalHeight = H_ROPE + cardHeight + 60;

  return (
    <div style={{ position: "relative", width: W, height: totalHeight, userSelect: "none", flexShrink: 0 }}>
      {/* SVG Rope */}
      <svg width={W} height={H_ROPE + 80}
        style={{ position: "absolute", top: -20, left: 0, overflow: "visible", pointerEvents: "none", zIndex: 12 }}>
        <defs>
          <linearGradient id="ropeBase2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a0a0a" />
            <stop offset="50%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <filter id="dropShadow2" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.8)" floodOpacity="1" />
          </filter>
        </defs>
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth={14} strokeLinecap="round" filter="url(#dropShadow2)" />
        <path d={pathD} fill="none" stroke="url(#ropeBase2)" strokeWidth={9} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={4} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 8" />
        <circle cx={PEG_X} cy={PEG_Y} r={14} fill="#111" stroke="#333" strokeWidth={2} />
        <circle cx={PEG_X} cy={PEG_Y} r={8} fill="#1a1a1a" stroke="#555" strokeWidth={1.5} />
        <circle cx={PEG_X} cy={PEG_Y} r={4} fill="#2a2a2a" />
        <circle cx={PEG_X - 2} cy={PEG_Y - 2} r={1.5} fill="rgba(255,255,255,0.35)" />
        <g transform={`translate(${clipX},${clipY}) rotate(${cardRot})`}>
          <rect x={-9} y={-22} width={18} height={24} rx={3.5} fill="#2d2d2d" stroke="#555" strokeWidth={1.2} />
          <rect x={-5.5} y={-18} width={11} height={14} rx={2} fill="#111" stroke="#3a3a3a" strokeWidth={0.8} />
          <circle cx={0} cy={-11} r={2.5} fill="#444" stroke="#666" strokeWidth={0.8} />
          <line x1={-1.5} y1={-11} x2={1.5} y2={-11} stroke="#222" strokeWidth={0.8} />
        </g>
      </svg>

      {/* ID Card */}
      <div
        ref={cardEl}
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          top: H_ROPE + 10,
          left: "50%",
          width: cardWidth,
          height: cardHeight,
          borderRadius: 16,
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: isDrag
            ? "0 35px 90px rgba(0,0,0,0.9), 0 0 40px rgba(6,182,212,0.25)"
            : "0 20px 60px rgba(0,0,0,0.8)",
          transform: `translate(calc(-50% + ${cardXY.x}px), ${cardXY.y}px) rotate(${cardRot}deg)`,
          transformOrigin: "50% 19px",
          transition: isDrag ? "box-shadow 0.2s" : "box-shadow 0.4s",
          cursor: isDrag ? "grabbing" : "grab",
          overflow: "hidden",
          zIndex: 10,
          willChange: "transform",
        }}
      >
        {/* Notch */}
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: 34, height: 18,
          background: "#0d1117",
          borderRadius: "0 0 12px 12px",
          zIndex: 15, border: "1px solid rgba(255,255,255,0.07)", borderTop: "none",
        }} />

        {/* Photo */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: photoHeight, overflow: "hidden", background: "#111" }}>
          {profileImage ? (
            <img src={profileImage} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e, #16213e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "rgba(255,255,255,0.15)" }}>👤</div>
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #0d1117)" }} />
        </div>

        {/* Info */}
        <div style={{
          position: "absolute", top: photoHeight, left: 0, right: 0, bottom: 0,
          padding: isMobile ? "10px 14px 14px" : "12px 18px 16px",
          display: "flex", flexDirection: "column", background: "#0d1117",
        }}>
          <div style={{ color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 17 : 20, letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 3 }}>
            Alfi Fikri<br />Putra Saldan
          </div>
          <div style={{ color: "#06b6d4", fontSize: isMobile ? 8 : 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 7 }}>UI/UX · Web Dev</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 7 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {[["🏫", "Politeknik Caltex Riau"], ["📍", "Pekanbaru, ID"], ["💼", "Open Freelance"]].map(([ic, tx]) => (
              <div key={tx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: isMobile ? 8 : 9, color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace" }}>
                <span style={{ fontSize: isMobile ? 9 : 10 }}>{ic}</span><span>{tx}</span>
              </div>
            ))}
          </div>
          {/* Barcode */}
          <div style={{ marginTop: 8, background: "rgba(255,255,255,0.02)", borderRadius: 3, padding: "4px 6px", display: "flex", gap: 1.5, justifyContent: "center", alignItems: "flex-end" }}>
            {[3, 5, 2, 8, 4, 7, 3, 6, 2, 5, 8, 3, 7, 4, 6, 2, 5, 3, 4, 6, 2, 5, 7, 3].map((h, i) => (
              <div key={i} style={{ width: 1.5, height: h * (isMobile ? 1.6 : 2) + 3, background: i % 3 === 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)", borderRadius: 0.5 }} />
            ))}
          </div>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.1)", marginTop: 2, fontFamily: "'Space Mono', monospace", letterSpacing: 2, textAlign: "center" }}>AFPS-2024</div>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        fontSize: 9, color: "rgba(255,255,255,0.16)", fontFamily: "'Space Mono', monospace",
        letterSpacing: 2.5, whiteSpace: "nowrap", animation: "fadeHint 3s ease-in-out infinite",
      }}>drag me ↕</div>
    </div>
  );
};

/* ─── TECH STACK ──────────────────────────────────────────────────── */
const techStack1 = [
  { name: "React", category: "FRONTEND LIB", img: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "Tailwind", category: "CSS FRAMEWORK", img: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "Firebase", category: "BACKEND SERVICE", img: "https://cdn.simpleicons.org/firebase/FFCA28" },
  { name: "Next.js", category: "WEB FRAMEWORK", img: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
  { name: "Laravel", category: "PHP FRAMEWORK", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" },
  { name: "GitHub", category: "VERSION CONTROL", img: "https://cdn.simpleicons.org/github/ffffff" },
  { name: "Figma", category: "UI/UX DESIGN", img: "https://cdn.simpleicons.org/figma/F24E1E" },
  { name: "Photoshop", category: "IMAGE EDITING", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-plain.svg" },
  { name: "Illustrator", category: "VECTOR ART", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-plain.svg" },
];

const techStack2 = [
  { name: "Lightroom", category: "COLOR GRADING", img: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Adobe_Photoshop_Lightroom_CC_logo.svg" },
  { name: "Canva", category: "LAYOUT DESIGN", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg" },
  { name: "Postman", category: "API TESTING", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg" },
  { name: "Premiere Pro", category: "VIDEO EDITING", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/premierepro/premierepro-plain.svg" },
  { name: "After Effects", category: "MOTION VFX", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/aftereffects/aftereffects-plain.svg" },
  { name: "CapCut", category: "MOBILE EDITING", img: "https://images.seeklogo.com/logo-png/43/1/capcut-logo-png_seeklogo-437025.png" },
  { name: "MySQL", category: "DATABASE", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
  { name: "CodeIgniter", category: "PHP FRAMEWORK", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/codeigniter/codeigniter-plain.svg" },
  { name: "OBS Studio", category: "STREAMING", img: "https://cdn.simpleicons.org/obsstudio/ffffff" },
];

/* ─── SERTIFIKAT ──────────────────────────────────────────────────── */
const certFiles = import.meta.glob('./Asset/Sertifikat/*.pdf', { eager: true, query: '?url', import: 'default' });
// Membaca file gambar (png/jpg/jpeg) di folder yang sama untuk dijadikan thumbnail
const certImages = import.meta.glob('./Asset/Sertifikat/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' });

const certificates = Object.keys(certFiles).map((path) => {
  const fileName = path.split('/').pop();
  const baseName = fileName.replace('.pdf', '');
  const title = baseName.replace(/[-_]/g, ' ');
  
  // Cari gambar thumbnail yang namanya persis sama dengan file PDF-nya
  const imgPath = Object.keys(certImages).find(p => p.includes(`${baseName}.png`) || p.includes(`${baseName}.jpg`) || p.includes(`${baseName}.jpeg`));
  return {
    title,
    desc: `Sertifikat penghargaan dan kompetensi untuk pencapaian pada ${title}.`,
    url: certFiles[path],
    imgUrl: imgPath ? certImages[imgPath] : null,
  };
});

/* ─── PROYEK ──────────────────────────────────────────────────────── */
const projFiles = import.meta.glob('./Asset/Project/*/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' });

const projectsMap = {};
Object.keys(projFiles).forEach((path) => {
  const parts = path.split('/');
  const fileName = parts.pop();
  const projectName = parts.pop();
  
  if (!projectsMap[projectName]) {
    projectsMap[projectName] = {
      title: projectName.replace(/[-_]/g, ' '),
      mockup: null,
      images: [],
      desc: `Ini adalah detail penjelasan singkat mengenai proyek ${projectName.replace(/[-_]/g, ' ')}. Proyek ini dikembangkan dengan berfokus pada antarmuka modern dan memberikan solusi pengalaman pengguna yang interaktif.`,
    };
  }
  
  if (fileName.toLowerCase().includes('mockup')) {
    projectsMap[projectName].mockup = projFiles[path];
  } else {
    projectsMap[projectName].images.push(projFiles[path]);
  }
});

const allProjects = Object.values(projectsMap).filter(p => p.mockup);

/* ═══════════════════════════════════════════════════════════════════
   MAIN PORTFOLIO
═══════════════════════════════════════════════════════════════════ */
export default function Portfolio() {
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const visibleCerts = showAllCerts ? certificates : certificates.slice(0, 6);
  const visibleProjects = showAllProjects ? allProjects : allProjects.slice(0, 4);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sections = ["beranda", "tentang", "proyek", "kontak"];
      let current = "beranda";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useScrollReveal();

  // Mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedProject]);

  const taglines = [
    "UI/UX Designer & Web Developer",
    "Turning Ideas into Digital Reality",
    "Crafting Beautiful Code & Design",
    "Building Tomorrow's Web Today",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#0a0a0f;color:#e2e8f0;font-family:'DM Sans',sans-serif;overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a0f}::-webkit-scrollbar-thumb{background:#00c896;border-radius:2px}

        .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s cubic-bezier(.25,.46,.45,.94),transform .7s cubic-bezier(.25,.46,.45,.94)}
        .reveal.revealed{opacity:1;transform:translateY(0)}
        .reveal-delay-1{transition-delay:.1s}
        .reveal-delay-2{transition-delay:.2s}
        .reveal-delay-3{transition-delay:.3s}
        .reveal-delay-4{transition-delay:.4s}

        @keyframes glow{0%,100%{opacity:1;box-shadow:0 0 8px #22c55e,0 0 18px #22c55e55}50%{opacity:.6;box-shadow:0 0 4px #22c55e}}
        @keyframes fadeHint{0%,100%{opacity:.14}50%{opacity:.42}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes sweepMove{0%{transform:translate(120%, 120%)}100%{transform:translate(-120%, -120%)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .nav-link{color:rgba(255,255,255,.45);text-decoration:none;font-size:14px;letter-spacing:.3px;transition:color .25s;font-family:'DM Sans',sans-serif;font-weight:400}
        .nav-link:hover,.nav-link.active{color:#00c896}
        .nav-link.active{border-bottom:2px solid #00c896;padding-bottom:2px}

        .btn-primary{background:#fff;color:#0a0a0f;border:none;padding:14px 28px;border-radius:50px;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:transform .2s,box-shadow .2s;letter-spacing:0.2px}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,255,255,.25)}
        .btn-outline{background:transparent;color:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.18);padding:14px 28px;border-radius:50px;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:400;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .2s}
        .btn-outline:hover{border-color:rgba(255,255,255,.45);color:#fff;transform:translateY(-2px)}

        .tech-card{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:22px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;transition:transform .2s,border-color .2s,background .2s;cursor:default;flex-shrink:0;margin:0 7px}
        .tech-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.18);background:#161616}

        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scroll-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-container { overflow: hidden; width: 100%; position: relative; margin-top: 14px; }
        .marquee-container::before, .marquee-container::after { content: ""; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none; }
        .marquee-container::before { left: 0; background: linear-gradient(to right, #0a0a0f, transparent); }
        .marquee-container::after { right: 0; background: linear-gradient(to left, #0a0a0f, transparent); }
        .marquee-track { display: flex; width: max-content; padding: 10px 0; }
        .marquee-left { animation: scroll-left 40s linear infinite; }
        .marquee-right { animation: scroll-right 40s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        .project-card { background: #111; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform .3s, border-color .3s; cursor: pointer; text-decoration: none; }
        .project-card:hover { transform: translateY(-6px); border-color: rgba(0,200,150,.4); box-shadow: 0 10px 30px -10px rgba(0,200,150,0.15); }
        .project-preview { width: 100%; height: 240px; position: relative; overflow: hidden; background: #1a1a24; }
        .project-mockup { width: 100%; height: 100%; object-fit: cover; object-position: top; filter: brightness(0.5) blur(3px); transition: filter 0.4s, transform 0.4s; }
        .project-card:hover .project-mockup { filter: brightness(1) blur(0px); transform: scale(1.05); }
        .project-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; }
        .project-card:hover .project-overlay { opacity: 1; }
        .project-view-btn { background: #00c896; color: #000; padding: 8px 18px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px; transform: translateY(10px); transition: transform .3s; box-shadow: 0 4px 14px rgba(0,200,150,0.4); }
        .project-card:hover .project-view-btn { transform: translateY(0); }
        .project-info { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .project-title { color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 8px; line-height: 1.3; text-transform: capitalize; }
        .project-desc { color: rgba(255,255,255,.45); font-size: 14px; line-height: 1.5; font-weight: 300; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .modal-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; opacity: 0; animation: fadeIn .3s forwards; }
        .modal-content { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6); transform: scale(0.95); animation: scaleUp .3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-header { padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(17,17,17,0.95); z-index: 10; flex-shrink: 0; }
        .modal-body { padding: 32px; overflow-y: auto; flex: 1; }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes scaleUp { to { transform: scale(1); } }

        .social-icon{width:40px;height:40px;border:1px solid rgba(255,255,255,.14);border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.45);font-size:15px;text-decoration:none;transition:all .2s}
        .social-icon:hover{border-color:rgba(255,255,255,.45);color:#fff;transform:translateY(-2px)}

        .scroll-top{position:fixed;bottom:28px;right:28px;width:44px;height:44px;border-radius:50%;background:#00c896;border:none;color:#000;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,200,150,.4);z-index:999;transition:transform .2s,opacity .3s}
        .scroll-top:hover{transform:translateY(-3px)}

        .timeline-container { border-left: 2px solid rgba(255,255,255,.08); padding-left: 24px; margin-left: 12px; display: flex; flex-direction: column; gap: 24px; }
        .timeline-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 24px; position: relative; transition: all .3s ease; }
        .timeline-card:hover { background: rgba(255,255,255,.04); border-color: rgba(0,200,150,.3); transform: translateY(-4px); box-shadow: 0 10px 30px -10px rgba(0,200,150,0.15); }
        .timeline-dot { position: absolute; left: -31.5px; top: 28px; width: 13px; height: 13px; border-radius: 50%; background: #0a0a0f; border: 2px solid rgba(255,255,255,.2); transition: all .3s ease; }
        .timeline-card:hover .timeline-dot { background: #00c896; border-color: #00c896; box-shadow: 0 0 12px rgba(0,200,150,.6); transform: scale(1.2); }

        .cert-card { background: #111; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform .3s, border-color .3s; cursor: pointer; text-decoration: none; }
        .cert-card:hover { transform: translateY(-6px); border-color: rgba(0,200,150,.4); box-shadow: 0 10px 30px -10px rgba(0,200,150,0.15); }
        .cert-preview { width: 100%; height: 210px; position: relative; overflow: hidden; background: #1a1a24; }
        .cert-preview iframe { width: 100%; height: 100%; border: none; pointer-events: none; }
        .cert-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; }
        .cert-card:hover .cert-overlay { opacity: 1; }
        .cert-view-btn { background: #00c896; color: #000; padding: 8px 18px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px; transform: translateY(10px); transition: transform .3s; }
        .cert-card:hover .cert-view-btn { transform: translateY(0); }
        .cert-info { padding: 20px; }
        .cert-title { color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 8px; line-height: 1.3; text-transform: capitalize; }
        .cert-desc { color: rgba(255,255,255,.45); font-size: 13px; line-height: 1.5; font-weight: 300; }

        .typing-cursor{display:inline-block;width:2px;height:1em;background:#00c896;margin-left:3px;animation:blink .8s infinite;vertical-align:middle}
      `}</style>

      {/* Ambient bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 8% 12%, rgba(0,200,150,.07) 0%, transparent 45%), radial-gradient(ellipse at 92% 82%, rgba(108,99,255,.06) 0%, transparent 45%)"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: isMobile ? "16px 24px" : "20px 64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          background: "rgba(10,10,15,.88)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 24, color: "#fff", letterSpacing: -0.5 }}>
            Saldan<span style={{ color: "#00c896" }}>.</span>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 38, alignItems: "center" }}>
              {["Beranda", "Tentang", "Proyek", "Kontak"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`nav-link ${activeSection === item.toLowerCase() ? "active" : ""}`}
                  onClick={() => setActiveSection(item.toLowerCase())}
                >
                  {item}
                </a>
              ))}
              <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.12)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>🌐</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,.35)" }}>ID</span>
              </div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: "transparent", border: "none", color: "#fff",
                fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "4px"
              }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          )}

          {/* ── MOBILE MENU OVERLAY ── */}
          {isMobile && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "rgba(10,10,15,.98)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              borderBottom: isMobileMenuOpen ? "1px solid rgba(255,255,255,.05)" : "none",
              padding: isMobileMenuOpen ? "20px 24px" : "0 24px",
              display: "flex", flexDirection: "column", gap: 20,
              overflow: "hidden",
              maxHeight: isMobileMenuOpen ? 300 : 0,
              opacity: isMobileMenuOpen ? 1 : 0,
              transition: "all 0.3s ease-in-out",
            }}>
              {["Beranda", "Tentang", "Proyek", "Kontak"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`nav-link ${activeSection === item.toLowerCase() ? "active" : ""}`}
                  style={{ textDecoration: "none", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}
                  onClick={() => {
                    setActiveSection(item.toLowerCase());
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section id="beranda" style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "100px 24px 60px" : "120px 80px 80px",
          gap: isMobile ? 48 : 0,
          maxWidth: 1280, margin: "0 auto",
        }}>
          {/* Left text */}
          <div style={{ flex: 1, maxWidth: isMobile ? "100%" : 560 }}>
            <div style={{
              fontSize: isMobile ? 11 : 12, letterSpacing: 3,
              color: "rgba(255,255,255,.3)", marginBottom: 20,
              textTransform: "uppercase", fontFamily: "'Space Mono',monospace"
            }}>HALO, SAYA</div>

            <h1 style={{
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800,
              fontSize: isMobile ? "clamp(40px,10vw,58px)" : "clamp(52px,5.5vw,82px)",
              lineHeight: 1, color: "#fff", marginBottom: 22, letterSpacing: -1.5
            }}>
              Alfi Fikri<br />Putra Saldan
            </h1>

            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: isMobile ? 14 : 17, color: "rgba(255,255,255,.45)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>Seorang</span>
            </div>
            <div style={{ marginBottom: 30 }}>
              <span style={{
                fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
                fontSize: isMobile ? 18 : 26, color: "#fff",
                borderBottom: "3px solid #00c896", paddingBottom: 2
              }}>
                <TypingText phrases={taglines} speed={70} delay={2500} />
              </span>
              <span className="typing-cursor" />
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              {["⊕", "in", "◉", "♪"].map(ic => (
                <a key={ic} href="#" className="social-icon">{ic}</a>
              ))}
            </div>

            <p style={{
              color: "rgba(255,255,255,.4)", lineHeight: 1.9,
              maxWidth: 440, marginBottom: 38,
              fontSize: isMobile ? 14 : 15, fontWeight: 300
            }}>
              Saya membantu bisnis dan individu mengubah ide menjadi solusi digital yang indah dan berfungsi.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="#proyek" className="btn-primary">Lihat Proyek ↗</a>
              <a href="#kontak" className="btn-outline">Kontak Saya →</a>
            </div>
          </div>

          {/* Right: Profile Card — ALWAYS visible, mobile centered below */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            flex: isMobile ? "none" : 1,
            paddingLeft: isMobile ? 0 : 40,
            animation: "float 6s ease-in-out infinite",
            width: isMobile ? "100%" : "auto",
          }}>
            <ProfileCard isMobile={isMobile} profileImage={profileImg1} />
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="tentang" style={{ padding: isMobile ? "60px 24px" : "80px 64px" }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto",
            background: "#111213",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 20,
            padding: isMobile ? "36px 24px" : "64px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 48 : 80,
            alignItems: isMobile ? "center" : "flex-start",
          }}>
            {/* ID Card — always visible */}
            <div className="reveal" style={{
              display: "flex", justifyContent: "center", alignItems: "flex-start",
              paddingTop: isMobile ? 0 : 100,
              order: isMobile ? 2 : 1,
              flexShrink: 0,
            }}>
              <IDCard isMobile={isMobile} profileImage={profileImg2} />
            </div>

            {/* Text */}
            <div style={{ order: isMobile ? 1 : 2, flex: 1 }}>
              <div className="reveal">
                <h2 style={{
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 800,
                  fontSize: isMobile ? 38 : 56, lineHeight: 1.0,
                  color: "#fff", marginBottom: 20, letterSpacing: -1
                }}>
                  Tentang <span style={{ color: "#22c55e" }}>Saya</span>
                </h2>
              </div>
              <div className="reveal reveal-delay-1" style={{
                margin: "0 0 22px", paddingLeft: 14,
                borderLeft: "2px solid rgba(99, 255, 102, 0.55)",
                fontStyle: "italic", color: "rgba(255,255,255,.5)",
                fontSize: isMobile ? 14 : 15, lineHeight: 1.75,
              }}>
                Perpaduan logika kode dan estetika desain.
              </div>
              <div className="reveal reveal-delay-2" style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.9, fontSize: isMobile ? 14 : 15, marginBottom: 16, fontWeight: 300 }}>
                Saya merupakan seorang mahasiswa Teknik Informatika Politeknik Caltex Riau dengan bidang Web Developer (FrontEnd) dan UI/UX Designer.
              </div>
              <div className="reveal reveal-delay-2" style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.9, fontSize: isMobile ? 14 : 15, marginBottom: 38, fontWeight: 300 }}>
                Memiliki pengalaman dalam pengembangan project berbasis website seperti CodeIgniter, Laravel, dan ReactJS. Saya terampil dalam analisis masalah, manajemen data, serta komunikasi efektif dalam tim dan klien.
              </div>

              {/* Stats */}
              <div className="reveal reveal-delay-3" style={{ display: "flex", gap: isMobile ? 30 : 52, marginBottom: 40, flexWrap: "wrap" }}>
                {[["3+", "Tahun Pengalaman"], ["8+", "Proyek Selesai"], ["2+", "Penghargaan"]].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 44 : 64, color: "#22c55e", lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: isMobile ? 9 : 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginTop: 4, fontFamily: "'Space Mono',monospace" }}>{l}</div>
                  </div>
                ))}
              </div>

              <div className="reveal reveal-delay-4">
                <a href={cvFile} download="CV_Alfi_Fikri_Putra_Saldan.pdf" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Unduh CV <span style={{ fontSize: 14 }}>⬇</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── PENGALAMAN ── */}
        <section id="pengalaman" style={{ padding: isMobile ? "60px 24px" : "80px 64px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 50, color: "#fff", letterSpacing: -0.5 }}>
                Jejak <span style={{ color: "#00c896" }}>Perjalanan</span>
              </h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 64 }}>
              {/* Kolom Kiri: Pendidikan & Magang */}
              <div className="reveal reveal-delay-1">
                <h3 style={{ color: "#fff", fontSize: isMobile ? 20 : 22, marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#00c896" }}>🎓</span> Pendidikan & Magang
                </h3>
                <div className="timeline-container">
                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>Ags 2022 - Sekarang</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>D4 Teknik Informatika</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>Politeknik Caltex Riau</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>Aktif sebagai anggota ITSA dan mengikuti kegiatan baik tingkat organisasi mahasiswa maupun kampus.</div>
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>Sep 2025 - Jul 2026</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>Divisi MSDI, IT (Magang)</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>PT. Bank Riau Kepri Syariah</div>
                    <ul style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                      <li style={{ marginBottom: 4 }}>Mengembangkan Sistem Key Performance Indicator</li>
                      <li>Mengembangkan Sistem Work Load Analysis</li>
                    </ul>
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>Ags 2019 - Apr 2022</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>MIPA</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>SMAN 1 Tanah Putih Tanjung Melawan</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>Aktif sebagai anggota Pramuka dan mengikuti perlombaan di bidang akademik maupun non-akademik.</div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Organisasi & Penghargaan */}
              <div className="reveal reveal-delay-2">
                <h3 style={{ color: "#fff", fontSize: isMobile ? 20 : 22, marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#00c896" }}>💼</span> Organisasi & Penghargaan
                </h3>
                <div className="timeline-container">
                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>2022 - Sekarang</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>Penghargaan & Pencapaian</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>Politeknik Caltex Riau & Pemkab</div>
                    <ul style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                      <li style={{ marginBottom: 4 }}>Penerima Beasiswa Pemerintah Kab. Rokan Hilir 2022 - 2026</li>
                      <li>Meraih Penghargaan Sebagai BEST POSTER – JTI EXPO 2024</li>
                    </ul>
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>Ags 2022 - Sep 2025</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>Pengurus Organisasi</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>Keluarga Mahasiswa PCR-ROHIL & ITSA</div>
                    <ul style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                      <li style={{ marginBottom: 4 }}>Sekretaris Divisi Kominfo (2024-2025)</li>
                      <li style={{ marginBottom: 4 }}>Anggota Divisi Dokumentasi Event Kelas Desain</li>
                      <li>Anggota aktif Himpunan Mahasiswa Teknik Informatika (ITSA)</li>
                    </ul>
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: 12, color: "#00c896", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>Sep 2022 - 2024</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>Campus Level Activities</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>Kepanitiaan Tingkat Kampus</div>
                    <ul style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                      <li style={{ marginBottom: 4 }}>Ketua Div. Publikasi Event Upgrading Skill Competition</li>
                      <li style={{ marginBottom: 4 }}>Panitia PCR-GTS 2023 & 2024</li>
                      <li>Panitia Pembekalan Karir Calon Wisudawan PCR 2023 & 2024</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERTIFIKAT ── */}
        <section style={{ padding: isMobile ? "60px 24px" : "80px 64px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 50, color: "#fff", letterSpacing: -0.5 }}>
                Sertifikat <span style={{ color: "#00c896" }}>& Penghargaan</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,.35)", marginTop: 10, fontSize: 15, fontWeight: 300 }}>Beberapa pencapaian dan validasi kompetensi saya.</p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 24,
            }} className="reveal">
              {visibleCerts.length > 0 ? visibleCerts.map((cert, i) => (
                <a key={i} href={cert.url} target="_blank" rel="noreferrer" className="cert-card">
                  <div className="cert-preview">
                    {cert.imgUrl ? (
                      /* Menggunakan gambar sebagai thumbnail jika tersedia */
                      <img src={cert.imgUrl} alt={`Thumbnail ${cert.title}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      /* Fallback jika gambar thumbnail belum ada */
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", background: "#1a1a24" }}>
                        <span style={{ fontSize: 48, marginBottom: 8 }}>📄</span>
                        <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Sertifikat PDF</span>
                      </div>
                    )}
                    <div className="cert-overlay">
                      <span className="cert-view-btn">Lihat PDF ↗</span>
                    </div>
                  </div>
                  <div className="cert-info">
                    <h3 className="cert-title">{cert.title}</h3>
                    <p className="cert-desc">{cert.desc}</p>
                  </div>
                </a>
              )) : (
                <p style={{ color: "rgba(255,255,255,.4)", textAlign: "center", gridColumn: "1 / -1", fontSize: 14 }}>Belum ada sertifikat di dalam folder Asset/Sertifikat.</p>
              )}
            </div>

            {certificates.length > 3 && (
              <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
                <button onClick={() => setShowAllCerts(!showAllCerts)} className="btn-outline">
                  {showAllCerts ? "Tampilkan Lebih Sedikit ↑" : "Lihat Semua Sertifikat ↓"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── PROJECTS & TECH STACK ── */}
        <section id="proyek" style={{ padding: isMobile ? "60px 0" : "80px 0", overflow: "hidden" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 24px" : "0 64px" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 50, color: "#fff", letterSpacing: -0.5 }}>
                Proyek <span style={{ color: "#00c896" }}>Terpilih</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,.35)", marginTop: 10, fontSize: 15, fontWeight: 300 }}>Beberapa karya yang menyoroti keahlian saya.</p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: 24,
            }} className="reveal">
              {visibleProjects.length > 0 ? visibleProjects.map((p, i) => (
                <div key={i} className="project-card" onClick={() => setSelectedProject(p)}>
                  <div className="project-preview">
                    {p.mockup ? (
                      <img src={p.mockup} alt={`Mockup ${p.title}`} className="project-mockup" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)" }}>
                        <span style={{ fontSize: 48, marginBottom: 8 }}>🖼️</span>
                        <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Mockup Project</span>
                      </div>
                    )}
                    <div className="project-overlay">
                      <span className="project-view-btn">Lihat Detail ↗</span>
                    </div>
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{p.title}</h3>
                    <p className="project-desc">{p.desc}</p>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
                  Belum ada Proyek yang ditambahkan.<br/>
                  <span style={{ fontSize: 13, opacity: 0.6 }}>Buat folder di dalam <code>Asset/Project/</code> dan tambahkan file gambar <code>Mockup.jpg</code> beserta gambar lainnya.</span>
                </div>
              )}
            </div>

            {allProjects.length > 4 && (
              <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
                <button onClick={() => setShowAllProjects(!showAllProjects)} className="btn-outline">
                  {showAllProjects ? "Tampilkan Lebih Sedikit ↑" : "Lihat Semua Proyek ↓"}
                </button>
              </div>
            )}
          </div>

          {/* ── TECH STACK (Tergabung dalam Proyek) ── */}
          <div style={{ marginTop: isMobile ? 80 : 120 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 24px" : "0 64px" }}>
              <div className="reveal" style={{ textAlign: "center", marginBottom: isMobile ? 30 : 40 }}>
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 50, color: "#fff", letterSpacing: -0.5 }}>
                  Creative & Tech Stack
                </h2>
                <div style={{ width: 80, height: 3, background: "linear-gradient(90deg, #22c55e, #00c896)", margin: "14px auto 0", borderRadius: 2 }} />
              </div>
            </div>

            <div className="marquee-container reveal">
              <div className="marquee-track marquee-left">
                {/* Diulang 4 kali agar pergerakannya mulus dan tidak terputus walau layar sangat lebar */}
                {[...techStack1, ...techStack1, ...techStack1, ...techStack1].map((tech, i) => (
                  <div key={`row1-${tech.name}-${i}`} className="tech-card" style={{ width: 160 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12,
                      background: "#1a1a1a",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <img src={tech.img} alt={tech.name} style={{ width: 28, height: 28 }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: isMobile ? 11 : 13, textAlign: "center" }}>{tech.name}</div>
                      <div style={{ color: "rgba(255,255,255,.28)", fontSize: isMobile ? 7 : 9, letterSpacing: 1, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", textAlign: "center", marginTop: 2 }}>{tech.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marquee-container reveal">
              <div className="marquee-track marquee-right">
                {[...techStack2, ...techStack2, ...techStack2, ...techStack2].map((tech, i) => (
                  <div key={`row2-${tech.name}-${i}`} className="tech-card" style={{ width: 160 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12,
                      background: "#1a1a1a",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <img src={tech.img} alt={tech.name} style={{ width: 28, height: 28 }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: isMobile ? 11 : 13, textAlign: "center" }}>{tech.name}</div>
                      <div style={{ color: "rgba(255,255,255,.28)", fontSize: isMobile ? 7 : 9, letterSpacing: 1, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", textAlign: "center", marginTop: 2 }}>{tech.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="kontak" style={{ padding: isMobile ? "60px 24px" : "100px 64px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div className="reveal">
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 14, display: "flex", justifyContent: "center" }}></div>
              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 38 : 58, color: "#fff", marginBottom: 16, letterSpacing: -1.5, lineHeight: 1 }}>
                Mari <span style={{ color: "#00c896" }}>Berkolaborasi</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,.38)", lineHeight: 1.85, fontSize: isMobile ? 14 : 15, marginBottom: 40, fontWeight: 300 }}>
                Punya ide proyek? Saya siap membantu mengubahnya menjadi kenyataan digital.
              </p>
            </div>
            <div className="reveal reveal-delay-1" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:saldanputra46@gmail.com" className="btn-primary">Kirim Email ✉</a>
              <a href="#" className="btn-outline">WhatsApp →</a>
            </div>
            <div className="reveal reveal-delay-2" style={{ display: "flex", gap: 26, justifyContent: "center", marginTop: 42, flexWrap: "wrap" }}>
              {["⊕ GitHub", "in LinkedIn", "◉ Instagram", "♪ TikTok"].map(s => (
                <a key={s} href="#" style={{ color: "rgba(255,255,255,.22)", fontSize: 11, fontFamily: "'Space Mono',monospace", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "#00c896"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.22)"}>{s}</a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: isMobile ? "20px 24px" : "26px 64px",
          borderTop: "1px solid rgba(255,255,255,.04)",
          display: "flex", justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 0
        }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: isMobile ? 17 : 22, color: "rgba(255,255,255,.25)" }}>
            Saldan<span style={{ color: "#00c896" }}>.</span>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 9 : 10, color: "rgba(255,255,255,.15)" }}>© 2026 · Crafted with ♥</div>
        </footer>
      </div>

      {/* ── PROJECT MODAL ── */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "#fff", fontSize: isMobile ? 20 : 24, margin: 0, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: -0.5 }}>{selectedProject.title}</h3>
              <button onClick={() => setSelectedProject(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 14 : 16, lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>{selectedProject.desc}</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {selectedProject.images && selectedProject.images.length > 0 ? (
                  selectedProject.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Detail ${selectedProject.title} ${idx + 1}`} style={{ width: "100%", borderRadius: 12, objectFit: "cover", border: "1px solid rgba(255,255,255,0.05)" }} />
                  ))
                ) : (
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🖼️</span>
                    Belum ada gambar detail untuk proyek ini.<br />Tambahkan gambar lain di dalam folder proyek Anda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
      )}
    </>
  );
}