import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { SECTIONS } from "./questions";

// ─── HELPERS ──────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const grade = (pct) => {
  if (pct >= 85) return { g: "A+", label: "Outstanding", color: "#00D4FF" };
  if (pct >= 70) return { g: "A",  label: "Excellent",   color: "#6BCB77" };
  if (pct >= 55) return { g: "B",  label: "Good",        color: "#FFD93D" };
  if (pct >= 40) return { g: "C",  label: "Average",     color: "#FF6B6B" };
  return           { g: "D",  label: "Keep Practicing", color: "#C77DFF" };
};

// ─── STYLES ───────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#080b12",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    color: "#fff",
  },
  btn: (bg = "#00D4FF", disabled = false) => ({
    padding: "13px 36px",
    background: disabled ? "rgba(255,255,255,0.06)" : bg === "ghost"
      ? "transparent" : `linear-gradient(135deg, ${bg}, ${bg}cc)`,
    border: bg === "ghost" ? "1px solid rgba(255,255,255,0.2)" : "none",
    borderRadius: 5,
    color: disabled ? "rgba(255,255,255,0.25)" : bg === "ghost" ? "rgba(255,255,255,0.7)" : "#000",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    transition: "all 0.15s",
    textTransform: "uppercase",
  }),
  input: {
    width: "100%",
    padding: "13px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 5,
    color: "#fff",
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    outline: "none",
    boxSizing: "border-box",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "20px 24px",
  },
};

// ═══════════════════════════════════════════════════════════════════
//  SCREEN: HOME
// ═══════════════════════════════════════════════════════════════════
function HomeScreen({ onStart }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [tab, setTab] = useState("register"); // register | leaderboard

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);
        setLeaderboard(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoadingLB(false);
    })();
  }, []);

  const valid = name.trim() && email.includes("@") && phone.length >= 10;

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
      {/* bg grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#00D4FF 1px,transparent 1px),linear-gradient(90deg,#00D4FF 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <div style={{ position: "absolute", top: "5%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%",  width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,107,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 820 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", border: "1px solid rgba(0,212,255,0.35)", padding: "4px 18px", borderRadius: 2, color: "#00D4FF", fontSize: 10, letterSpacing: 5, marginBottom: 20 }}>
            ◈ FREE MOCK TEST PLATFORM ◈
          </div>
          <h1 style={{ fontSize: "clamp(42px,8vw,80px)", fontWeight: 900, margin: "0 0 6px", letterSpacing: -3, lineHeight: 1 }}>TCS NQT</h1>
          <p style={{ fontSize: "clamp(13px,2vw,18px)", color: "rgba(255,255,255,0.4)", letterSpacing: 6, margin: 0 }}>NATIONAL QUALIFIER TEST</p>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 36 }}>
          {[
            { v: SECTIONS.reduce((a, s) => a + s.questions.length, 0), l: "Questions" },
            { v: `${SECTIONS.reduce((a, s) => a + s.duration, 0)} min`, l: "Duration" },
            { v: 5, l: "Sections" },
            { v: "FREE", l: "Cost" },
          ].map((i) => (
            <div key={i.l} style={{ ...S.card, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{i.v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 4 }}>{i.l.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {["register", "leaderboard"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 28px", background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === t ? "#00D4FF" : "transparent"}`,
              color: tab === t ? "#00D4FF" : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'IBM Plex Mono','Courier New',monospace",
              textTransform: "uppercase", transition: "all 0.2s",
            }}>{t === "register" ? "📝 Register" : "🏆 Leaderboard"}</button>
          ))}
        </div>

        {tab === "register" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 640, margin: "0 auto" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", marginBottom: 6 }}>FULL NAME *</label>
              <input style={S.input} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", marginBottom: 6 }}>EMAIL *</label>
              <input style={S.input} placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", marginBottom: 6 }}>PHONE *</label>
              <input style={S.input} placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" maxLength={10} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", marginBottom: 6 }}>COLLEGE / UNIVERSITY</label>
              <input style={S.input} placeholder="Your college name (optional)" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
            <div style={{ gridColumn: "1/-1", textAlign: "center", marginTop: 8 }}>
              <button style={S.btn("#00D4FF", !valid)} disabled={!valid}
                onClick={() => valid && onStart({ name: name.trim(), email: email.trim(), phone: phone.trim(), college: college.trim() })}>
                START TEST →
              </button>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 12, letterSpacing: 1 }}>
                Your data is saved securely. We'll use it to share results & study material.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {loadingLB ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>
                🏆 No scores yet — be the first to complete the test!
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {leaderboard.map((entry, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const g = grade(entry.score);
                  return (
                    <div key={entry.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, borderLeft: `4px solid ${g.color}` }}>
                      <span style={{ fontSize: 20, width: 30, textAlign: "center" }}>{medals[i] || `#${i + 1}`}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{entry.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{entry.college || "Student"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: g.color }}>{entry.score}%</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{entry.correct}/{entry.total} correct</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN: INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════
function InstructionsScreen({ candidate, onBegin, onBack }) {
  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 700, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ color: "#00D4FF", fontSize: 11, letterSpacing: 4, marginBottom: 10 }}>WELCOME, {candidate.name.toUpperCase()}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Test Instructions</h2>
        </div>
        <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          {[
            { icon: "⏱", t: "Timed Sections", d: "Each section has its own timer. When time expires you auto-advance to the next section." },
            { icon: "🚩", t: "Flag for Review", d: "Flag any question to revisit before ending the section." },
            { icon: "🧭", t: "Free Navigation", d: "Navigate freely between questions within the current section." },
            { icon: "✅", t: "No Negative Marking", d: "Attempt all questions — wrong answers carry no penalty." },
            { icon: "🏆", t: "Live Leaderboard", d: "Your score is saved to the leaderboard after you complete the test." },
          ].map((item) => (
            <div key={item.t} style={{ ...S.card, display: "flex", gap: 16 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{item.t}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, padding: "14px 20px", marginBottom: 28, fontSize: 12, color: "rgba(0,212,255,0.85)", lineHeight: 1.8 }}>
          <strong>Section order:</strong> {SECTIONS.map((s) => s.name).join(" → ")}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={S.btn("ghost")} onClick={onBack}>← BACK</button>
          <button style={S.btn("#00D4FF")} onClick={onBegin}>BEGIN TEST →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN: TEST
// ═══════════════════════════════════════════════════════════════════
function TestScreen({ candidate, onComplete }) {
  const [secIdx, setSecIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [secResults, setSecResults] = useState({});
  const timerRef = useRef(null);

  const sec = SECTIONS[secIdx];
  const key = (i) => `${sec.id}-${i}`;

  useEffect(() => {
    setTimeLeft(sec.duration * 60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(timerRef.current); endSection(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [secIdx]);

  const endSection = () => {
    clearInterval(timerRef.current);
    let correct = 0, attempted = 0;
    sec.questions.forEach((q, i) => {
      const k = `${sec.id}-${i}`;
      if (answers[k] !== undefined) { attempted++; if (answers[k] === q.answer) correct++; }
    });
    const updated = { ...secResults, [sec.id]: { correct, attempted, total: sec.questions.length } };
    setSecResults(updated);
    if (secIdx < SECTIONS.length - 1) {
      setSecIdx((p) => p + 1);
      setQIdx(0);
    } else {
      onComplete(updated);
    }
  };

  const q = sec.questions[qIdx];
  const answered = sec.questions.filter((_, i) => answers[key(i)] !== undefined).length;
  const timeWarn = timeLeft < sec.duration * 60 * 0.2;

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>SECTION {secIdx + 1}/{SECTIONS.length}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: sec.color }}>{sec.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: timeWarn ? "rgba(255,107,107,0.1)" : "rgba(0,212,255,0.06)", border: `1px solid ${timeWarn ? "rgba(255,107,107,0.4)" : "rgba(0,212,255,0.2)"}`, borderRadius: 6, padding: "7px 18px" }}>
          <span style={{ fontSize: 10, color: timeWarn ? "#FF6B6B" : "rgba(255,255,255,0.4)", letterSpacing: 1 }}>⏱ TIME</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: timeWarn ? "#FF6B6B" : "#00D4FF", fontVariantNumeric: "tabular-nums" }}>{fmt(timeLeft)}</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>✅ {answered}/{sec.questions.length} &nbsp;|&nbsp; {candidate.name}</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: `${(timeLeft / (sec.duration * 60)) * 100}%`, background: timeWarn ? "#FF6B6B" : sec.color, transition: "width 1s linear" }} />
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Question area */}
        <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>Q{qIdx + 1} of {sec.questions.length} · {q.topic}</span>
            <button onClick={() => setFlagged((p) => ({ ...p, [key(qIdx)]: !p[key(qIdx)] }))}
              style={{ background: flagged[key(qIdx)] ? "rgba(255,107,107,0.15)" : "transparent", border: `1px solid ${flagged[key(qIdx)] ? "#FF6B6B" : "rgba(255,255,255,0.2)"}`, borderRadius: 4, padding: "5px 12px", color: flagged[key(qIdx)] ? "#FF6B6B" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>
              {flagged[key(qIdx)] ? "🚩 FLAGGED" : "🏳 FLAG"}
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "24px 28px", marginBottom: 24, lineHeight: 1.9, fontSize: 15, whiteSpace: "pre-line" }}>
            {q.text}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {q.options.map((opt, i) => {
              const sel = answers[key(qIdx)] === i;
              return (
                <button key={i} onClick={() => setAnswers((p) => ({ ...p, [key(qIdx)]: i }))}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 22px", background: sel ? `${sec.color}15` : "rgba(255,255,255,0.03)", border: `2px solid ${sel ? sec.color : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", textAlign: "left", color: "#fff", fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 14, lineHeight: 1.6, transition: "all 0.15s" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? sec.color : "rgba(255,255,255,0.08)", color: sel ? "#000" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 12 }}>{["A","B","C","D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button style={S.btn("ghost", qIdx === 0)} disabled={qIdx === 0} onClick={() => setQIdx((p) => p - 1)}>← PREV</button>
            <button style={S.btn(sec.color)} onClick={() => { if (qIdx < sec.questions.length - 1) setQIdx((p) => p + 1); else endSection(); }}>
              {qIdx < sec.questions.length - 1 ? "NEXT →" : "END SECTION ⏩"}
            </button>
          </div>
        </div>

        {/* Palette sidebar */}
        <div style={{ width: 200, background: "#0d1117", borderLeft: "1px solid rgba(255,255,255,0.07)", padding: "18px 14px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 14 }}>QUESTION PALETTE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
            {sec.questions.map((_, i) => {
              const k = key(i);
              const isCur = i === qIdx, isAns = answers[k] !== undefined, isFlag = flagged[k];
              return (
                <button key={i} onClick={() => setQIdx(i)} style={{ aspectRatio: 1, border: `2px solid ${isCur ? sec.color : isFlag ? "#FF6B6B" : isAns ? "#6BCB77" : "rgba(255,255,255,0.1)"}`, background: isCur ? `${sec.color}20` : isFlag ? "rgba(255,107,107,0.1)" : isAns ? "rgba(107,203,119,0.1)" : "transparent", borderRadius: 4, color: isCur ? sec.color : isFlag ? "#FF6B6B" : isAns ? "#6BCB77" : "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>{i + 1}</button>
              );
            })}
          </div>
          <div style={{ marginTop: 20, fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 2.2 }}>
            <div style={{ color: "#6BCB77" }}>█ Answered</div>
            <div style={{ color: "#FF6B6B" }}>█ Flagged</div>
            <div style={{ color: sec.color }}>█ Current</div>
            <div>□ Not visited</div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>SECTIONS</div>
            {SECTIONS.map((s, i) => (
              <div key={s.id} style={{ padding: "5px 8px", borderRadius: 4, marginBottom: 3, fontSize: 10, color: i < secIdx ? "rgba(255,255,255,0.25)" : i === secIdx ? s.color : "rgba(255,255,255,0.2)", background: i === secIdx ? `${s.color}12` : "transparent" }}>
                {i < secIdx ? "✓ " : i === secIdx ? "▶ " : "○ "}{s.name.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN: RESULTS
// ═══════════════════════════════════════════════════════════════════
function ResultsScreen({ candidate, secResults, answers, onRetake }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(true);

  const total = SECTIONS.reduce((a, s) => a + s.questions.length, 0);
  const correct = Object.values(secResults).reduce((a, r) => a + r.correct, 0);
  const attempted = Object.values(secResults).reduce((a, r) => a + r.attempted, 0);
  const pct = Math.round((correct / total) * 100);
  const g = grade(pct);

  useEffect(() => {
    (async () => {
      try {
        await addDoc(collection(db, "scores"), {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          college: candidate.college || "",
          score: pct,
          correct,
          total,
          attempted,
          timestamp: serverTimestamp(),
        });
        setSaved(true);
      } catch (e) { console.error(e); }
      setSaving(false);
    })();
  }, []);

  return (
    <div style={{ ...S.page, padding: "40px 20px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 4, marginBottom: 14 }}>TEST COMPLETED</div>
          <h1 style={{ fontSize: "clamp(28px,6vw,52px)", fontWeight: 900, margin: "0 0 6px" }}>{candidate.name}</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
          {saving && <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Saving to leaderboard...</div>}
          {saved && <div style={{ marginTop: 10, fontSize: 11, color: "#6BCB77" }}>✓ Score saved to leaderboard!</div>}
        </div>

        {/* Big score */}
        <div style={{ ...S.card, border: `1px solid ${g.color}40`, textAlign: "center", padding: "44px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%,${g.color}08,transparent 65%)` }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: g.color, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Overall Score</div>
            <div style={{ display: "inline-block", padding: "6px 22px", borderRadius: 20, background: `${g.color}20`, border: `1px solid ${g.color}40`, color: g.color, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 28 }}>
              Grade {g.g} — {g.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 420, margin: "0 auto" }}>
              {[{ v: `${correct}/${total}`, l: "Correct" }, { v: attempted, l: "Attempted" }, { v: total - attempted, l: "Skipped" }].map((i) => (
                <div key={i.l}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{i.v}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>{i.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 16 }}>SECTION BREAKDOWN</div>
          <div style={{ display: "grid", gap: 10 }}>
            {SECTIONS.map((sec) => {
              const r = secResults[sec.id];
              if (!r) return null;
              const sp = Math.round((r.correct / r.total) * 100);
              return (
                <div key={sec.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 4, height: 44, borderRadius: 2, background: sec.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{sec.name}</div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${sp}%`, background: sec.color, borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: sec.color }}>{sp}%</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{r.correct}/{r.total}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer review */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 16 }}>ANSWER REVIEW</div>
          {SECTIONS.map((sec) => (
            <div key={sec.id} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: sec.color, letterSpacing: 2, marginBottom: 12 }}>{sec.name.toUpperCase()}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {sec.questions.map((q, i) => {
                  const k = `${sec.id}-${i}`;
                  const sel = answers[k];
                  const isAtt = sel !== undefined;
                  const isCor = sel === q.answer;
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${!isAtt ? "rgba(255,255,255,0.06)" : isCor ? "rgba(107,203,119,0.2)" : "rgba(255,107,107,0.2)"}`, borderLeft: `4px solid ${!isAtt ? "rgba(255,255,255,0.1)" : isCor ? "#6BCB77" : "#FF6B6B"}`, borderRadius: 8, padding: "12px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.6 }}>
                          <strong style={{ color: "rgba(255,255,255,0.4)" }}>Q{i + 1}. </strong>
                          {q.text.split("\n")[0].substring(0, 90)}{q.text.length > 90 ? "…" : ""}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, flexShrink: 0, padding: "2px 10px", borderRadius: 10, background: !isAtt ? "rgba(255,255,255,0.05)" : isCor ? "rgba(107,203,119,0.15)" : "rgba(255,107,107,0.15)", color: !isAtt ? "rgba(255,255,255,0.3)" : isCor ? "#6BCB77" : "#FF6B6B" }}>
                          {!isAtt ? "SKIPPED" : isCor ? "✓ CORRECT" : "✗ WRONG"}
                        </div>
                      </div>
                      {isAtt && !isCor && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "rgba(107,203,119,0.8)" }}>
                          ✓ Correct answer: {q.options[q.answer]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Share nudge */}
        <div style={{ ...S.card, border: "1px solid rgba(0,212,255,0.2)", textAlign: "center", padding: "28px", marginBottom: 32 }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>📢 Share Your Score!</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
            Share your result on WhatsApp and challenge your friends to beat your score!
          </p>
          <button onClick={() => {
            const text = `🎯 I scored ${pct}% (${correct}/${total}) on the TCS NQT Mock Test!\nGrade: ${g.g} — ${g.label}\n\nTry it free 👇\n${window.location.href}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
          }} style={{ ...S.btn("#25D366"), color: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
            📱 SHARE ON WHATSAPP
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={S.btn("#00D4FF")} onClick={onRetake}>RETAKE TEST</button>
          <button style={S.btn("ghost")} onClick={() => window.print()}>PRINT RESULT</button>
        </div>

        <p style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: 1 }}>
          Practice makes perfect. Keep attempting mock tests to ace TCS NQT!
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("home");
  const [candidate, setCandidate] = useState(null);
  const [secResults, setSecResults] = useState({});
  const [answers, setAnswers] = useState({});

  const handleStart = (info) => { setCandidate(info); setScreen("instructions"); };
  const handleBegin = () => setScreen("test");
  const handleComplete = (results) => { setSecResults(results); setScreen("results"); };
  const handleRetake = () => {
    setSecResults({}); setAnswers({}); setCandidate(null); setScreen("home");
  };

  if (screen === "home")         return <HomeScreen onStart={handleStart} />;
  if (screen === "instructions") return <InstructionsScreen candidate={candidate} onBegin={handleBegin} onBack={() => setScreen("home")} />;
  if (screen === "test")         return <TestScreen candidate={candidate} onComplete={handleComplete} />;
  if (screen === "results")      return <ResultsScreen candidate={candidate} secResults={secResults} answers={answers} onRetake={handleRetake} />;
  return null;
}
