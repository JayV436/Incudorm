import { useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";

/**
 * Incudorm landing page.
 * Drop-in usage:
 *   <IncudormLanding onSignUp={async (email) => { await api.join(email); }} onLogin={() => navigate("/login")} />
 * No dependencies beyond React. Styles are scoped to .incudorm and injected by the component.
 */

export interface IncudormLandingProps {
  /** Called with a valid email when the visitor signs up. Throw to show an error. */
  onSignUp?: (email: string) => void | Promise<void>;
  /** If provided, a "Log in" button appears in the nav. */
  onLogin?: () => void;
  /** Links shown on the right of the footer, e.g. Privacy Policy and Terms of Service. */
  footerLinks?: ReactNode;
}

type Pitch = {
  id: string;
  status: string;
  hours: string;
  title: string;
  blurb: string;
  needs: string[];
  author: string;
  year: string;
  color: string;
  tilt: string;
  delay: string;
};

const PITCHES: Pitch[][] = [
  [
    {
      id: "quizzer",
      status: "Prototype",
      hours: "6 hrs/week",
      title: "Quizzer for lectures",
      blurb: "Turns your lecture slides into practice quizzes before exams.",
      needs: ["ML", "Frontend"],
      author: "Aanya",
      year: "2nd year CS",
      color: "var(--inc-sun)",
      tilt: "-3deg",
      delay: ".1s",
    },
    {
      id: "canteen",
      status: "Just an idea",
      hours: "4 hrs/week",
      title: "Canteen queue",
      blurb: "Order from the mess before you leave class. No more 20 minute lines.",
      needs: ["Backend", "Designer"],
      author: "Rohan",
      year: "3rd year ECE",
      color: "var(--inc-lilac)",
      tilt: "2deg",
      delay: ".4s",
    },
  ],
  [
    {
      id: "thrift",
      status: "Validating",
      hours: "8 hrs/week",
      title: "Thrift loop",
      blurb: "Buy and sell used dorm furniture within your campus.",
      needs: ["Marketing", "Developer"],
      author: "Meera",
      year: "MBA 1st year",
      color: "var(--inc-mint)",
      tilt: "3deg",
      delay: ".25s",
    },
  ],
];

const STEPS = [
  {
    title: "Post your idea",
    text: "Describe what you're building, what stage it's at, and how many hours a week you can give it.",
  },
  {
    title: "Say who you need",
    text: "List the skills you're missing, like developer, designer, marketer or hardware. Add the time commitment you expect.",
  },
  {
    title: "Match and start building",
    text: "Students whose skills fit your requirements send a request. Pick your teammates and start your first project together.",
  },
];

const FACTS = [
  {
    title: "Verified college email",
    text: "Everyone on the platform is a current student, so you always know who you're talking to.",
  },
  {
    title: "Your campus or any campus",
    text: "Search teammates in your hostel or across the country. You choose.",
  },
  {
    title: "Built around your timetable",
    text: "Every idea lists the weekly hours it needs, so exams and projects don't clash.",
  },
  {
    title: "Start small",
    text: "Team up on a weekend project first. Turn it into a startup if it works.",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function IncudormLanding({ onSignUp, onLogin, footerLinks }: IncudormLandingProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "err"; text: string }>({
    kind: "idle",
    text: "",
  });
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus({ kind: "err", text: "Enter a valid email, like you@college.edu." });
      return;
    }
    setBusy(true);
    try {
      await onSignUp?.(value);
      setStatus({ kind: "ok", text: "You're in. Check your inbox to verify your college email." });
      setEmail("");
    } catch {
      setStatus({ kind: "err", text: "Couldn't sign you up. Try again in a moment." });
    } finally {
      setBusy(false);
    }
  }

  function focusSignup() {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="incudorm">
      <style>{CSS}</style>

      <header className="inc-hero">
        <div className="inc-wrap">
          <nav className="inc-nav" aria-label="Main">
            <a className="inc-logo" href="#top" id="top">
              <span className="inc-logo-mark" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 19L19 5M9 5h10v10" />
                </svg>
              </span>
              Incudorm
            </a>
            <div className="inc-nav-links">
              <a className="inc-navlink" href="#how">How it works</a>
              <a className="inc-navlink" href="#students-only">Students only</a>
              {onLogin && (
                <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={onLogin}>
                  Log in
                </button>
              )}
              <button type="button" className="inc-btn inc-btn-primary inc-btn-small" onClick={focusSignup}>
                Sign up
              </button>
            </div>
          </nav>

          <div className="inc-hero-grid">
            <div>
              <div className="inc-badge">
                <i aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14143A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </i>
                Open to verified students only
              </div>
              <h1>Got an idea? Find the students who'll build it with you.</h1>
              <p className="inc-lead">
                Post your startup idea, say exactly who you need, and match with students on any campus who want in.
                Build the first version together.
              </p>

              <form className="inc-signup" onSubmit={handleSubmit} noValidate>
                <input
                  ref={inputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@college.edu"
                  aria-label="College email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="inc-btn inc-btn-primary" type="submit" disabled={busy}>
                  {busy ? "Signing up..." : "Join with college email"}
                </button>
                <p className={`inc-msg ${status.kind}`} role="status" aria-live="polite">
                  {status.text}
                </p>
              </form>
              <p className="inc-fine">Free for students. We'll verify your college when you sign up.</p>
            </div>

            <div className="inc-pitches" aria-label="Example idea cards">
              {PITCHES.map((col, ci) => (
                <div className="inc-col" key={ci}>
                  {col.map((p) => {
                    const on = !!requested[p.id];
                    return (
                      <article
                        key={p.id}
                        className="inc-pitch"
                        style={{ "--pop": p.color, "--tilt": p.tilt, "--d": p.delay } as CSSProperties}
                      >
                        <div className="inc-pitch-top">
                          <span>{p.status}</span>
                          <span>{p.hours}</span>
                        </div>
                        <div className="inc-pitch-body">
                          <h3>{p.title}</h3>
                          <p>{p.blurb}</p>
                          <div className="inc-looking">Looking for</div>
                          <div className="inc-chips">
                            {p.needs.map((n) => (
                              <span className="inc-chip" key={n}>{n}</span>
                            ))}
                          </div>
                          <div className="inc-who">
                            <span>
                              <b>{p.author}</b>, {p.year}
                            </span>
                            <button
                              className="inc-join"
                              type="button"
                              aria-pressed={on}
                              onClick={() => setRequested((r) => ({ ...r, [p.id]: !r[p.id] }))}
                            >
                              {on ? "Request sent" : "I'm in"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="how" className="inc-section">
          <div className="inc-wrap">
            <div className="inc-sec-head">
              <h2>From a rough idea to a working team in three steps</h2>
              <p>No pitch decks and no investors. Just you, your idea, and people who want to build it.</p>
            </div>
            <ol className="inc-steps">
              {STEPS.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="students-only" className="inc-section inc-only-section">
          <div className="inc-wrap inc-only">
            <div className="inc-sec-head" style={{ marginBottom: 0 }}>
              <h2>A space made only for students</h2>
              <p>Founders in college have different problems than founders in an office. Incudorm is built around them.</p>
            </div>
            <dl className="inc-facts">
              {FACTS.map((f) => (
                <div key={f.title}>
                  <dt>{f.title}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="inc-footer">
        <div className="inc-wrap inc-footer-row">
          <span>Incudorm. Made by students, for students.</span>
          {footerLinks && <nav className="inc-footer-links" aria-label="Legal">{footerLinks}</nav>}
        </div>
      </footer>
    </div>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap");

.incudorm{
  --inc-bg:#F3F2FF; --inc-ink:#14143A; --inc-muted:#55557A; --inc-paper:#FFFFFF; --inc-line:#D6D4F4;
  --inc-brand:#3B3BFF; --inc-sun:#FFD23F; --inc-mint:#46E0A0; --inc-lilac:#CFCBFF; --inc-pop-ink:#14143A;
  --inc-dot:#C9C6EF; --inc-chip:#ECEBFF; --inc-ok:#0C8A5B; --inc-err:#D62F4B;
  --inc-display:"Bricolage Grotesque","Trebuchet MS",system-ui,sans-serif;
  --inc-body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  background:var(--inc-bg);color:var(--inc-ink);min-height:100vh;
  font-family:var(--inc-body);font-size:1.0625rem;line-height:1.55;-webkit-font-smoothing:antialiased;
}
@media (prefers-color-scheme:dark){
  .incudorm{
    --inc-bg:#0E0E26; --inc-ink:#F1F0FF; --inc-muted:#A8A7D2; --inc-paper:#1A1A44; --inc-line:#34346E;
    --inc-dot:#25254F; --inc-chip:#25255A; --inc-ok:#46E0A0; --inc-err:#FF8FA3;
  }
}
.incudorm *,.incudorm *::before,.incudorm *::after{box-sizing:border-box}
.incudorm h1,.incudorm h2,.incudorm h3{font-family:var(--inc-display);line-height:1.05;letter-spacing:-.025em;margin:0}
.incudorm a{color:inherit}
.incudorm :focus-visible{outline:3px solid var(--inc-brand);outline-offset:3px;border-radius:6px}
.incudorm .inc-wrap{width:min(1120px,100% - 2.5rem);margin-inline:auto}

.incudorm .inc-nav{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 0}
.incudorm .inc-logo{display:flex;align-items:center;gap:.55rem;font-family:var(--inc-display);font-weight:800;font-size:1.4rem;text-decoration:none;letter-spacing:-.03em}
.incudorm .inc-logo-mark{width:34px;height:34px;border-radius:10px;background:var(--inc-brand);display:grid;place-items:center}
.incudorm .inc-nav-links{display:flex;align-items:center;gap:1.25rem;font-weight:500}
.incudorm .inc-navlink{text-decoration:none;color:var(--inc-muted)}
.incudorm .inc-navlink:hover{color:var(--inc-ink)}
@media (max-width:760px){.incudorm .inc-navlink{display:none}}

.incudorm .inc-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  font:600 1rem var(--inc-body);padding:.85rem 1.4rem;border-radius:999px;border:2px solid transparent;
  cursor:pointer;text-decoration:none;transition:transform .15s ease,background .15s ease;
}
.incudorm .inc-btn:active{transform:translateY(1px)}
.incudorm .inc-btn:disabled{opacity:.7;cursor:progress}
.incudorm .inc-btn-primary{background:var(--inc-brand);color:#fff}
.incudorm .inc-btn-primary:hover:not(:disabled){background:#2A2AEE}
.incudorm .inc-btn-ghost{background:transparent;color:var(--inc-ink);border-color:var(--inc-ink)}
.incudorm .inc-btn-ghost:hover{background:var(--inc-chip)}
.incudorm .inc-btn-small{padding:.55rem 1.05rem;font-size:.95rem}

.incudorm .inc-hero{background-image:radial-gradient(var(--inc-dot) 1.4px,transparent 1.4px);background-size:26px 26px}
.incudorm .inc-hero-grid{display:grid;gap:3rem;padding:2.5rem 0 5rem;align-items:center}
@media (min-width:940px){.incudorm .inc-hero-grid{grid-template-columns:1.05fr .95fr;padding-top:3.5rem}}
.incudorm .inc-hero h1{font-size:clamp(2.6rem,6.2vw,4.7rem);font-weight:800;max-width:14ch}
.incudorm .inc-lead{font-size:1.2rem;color:var(--inc-muted);max-width:46ch;margin:1.5rem 0 2rem}
.incudorm .inc-badge{
  display:inline-flex;align-items:center;gap:.5rem;background:var(--inc-paper);border:1.5px solid var(--inc-line);
  border-radius:999px;padding:.35rem .9rem .35rem .45rem;font-size:.92rem;font-weight:500;margin-bottom:1.5rem;
}
.incudorm .inc-badge i{width:22px;height:22px;border-radius:50%;background:var(--inc-mint);display:grid;place-items:center}

.incudorm .inc-signup{display:flex;flex-wrap:wrap;gap:.6rem;max-width:520px}
.incudorm .inc-signup input{
  flex:1 1 230px;min-width:0;font:500 1rem var(--inc-body);color:var(--inc-ink);background:var(--inc-paper);
  border:2px solid var(--inc-line);border-radius:999px;padding:.85rem 1.2rem;
}
.incudorm .inc-signup input::placeholder{color:var(--inc-muted)}
.incudorm .inc-signup input:focus-visible{outline-offset:2px;border-color:var(--inc-brand)}
.incudorm .inc-msg{flex-basis:100%;margin:.15rem .4rem 0;font-size:.95rem;min-height:1.4em}
.incudorm .inc-msg.ok{color:var(--inc-ok);font-weight:600}
.incudorm .inc-msg.err{color:var(--inc-err);font-weight:600}
.incudorm .inc-fine{font-size:.92rem;color:var(--inc-muted);margin:.9rem 0 0}

.incudorm .inc-pitches{display:grid;gap:1.25rem}
@media (min-width:600px){
  .incudorm .inc-pitches{grid-template-columns:1fr 1fr;align-items:start}
  .incudorm .inc-pitches .inc-col:nth-child(2){margin-top:3.5rem}
}
.incudorm .inc-col{display:grid;gap:1.25rem}
.incudorm .inc-pitch{
  background:var(--inc-paper);border:2px solid var(--inc-ink);border-radius:22px;overflow:hidden;
  box-shadow:6px 6px 0 var(--inc-ink);transform:rotate(var(--tilt,0deg));
  animation:inc-drop .7s cubic-bezier(.2,.9,.3,1.15) both;animation-delay:var(--d,0s);
}
.incudorm .inc-pitch-top{background:var(--pop);color:var(--inc-pop-ink);padding:.7rem 1rem;font-weight:600;font-size:.9rem;display:flex;justify-content:space-between;gap:.5rem}
.incudorm .inc-pitch-body{padding:1rem 1.1rem 1.1rem}
.incudorm .inc-pitch h3{font-size:1.35rem;margin-bottom:.4rem}
.incudorm .inc-pitch p{margin:0 0 .9rem;color:var(--inc-muted);font-size:.97rem;line-height:1.45}
.incudorm .inc-looking{font-size:.85rem;font-weight:600;margin-bottom:.4rem}
.incudorm .inc-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:1rem}
.incudorm .inc-chip{background:var(--inc-chip);border-radius:8px;padding:.2rem .6rem;font-size:.88rem;font-weight:500}
.incudorm .inc-who{display:flex;align-items:center;justify-content:space-between;gap:.5rem;font-size:.9rem;color:var(--inc-muted)}
.incudorm .inc-who b{color:var(--inc-ink);font-weight:600}
@keyframes inc-drop{
  from{opacity:0;transform:translateY(-26px) rotate(calc(var(--tilt,0deg) * -2))}
  to{opacity:1;transform:rotate(var(--tilt,0deg))}
}
.incudorm .inc-join{
  font:600 .9rem var(--inc-body);border:2px solid var(--inc-ink);background:transparent;color:var(--inc-ink);
  border-radius:999px;padding:.4rem .9rem;cursor:pointer;white-space:nowrap;transition:background .15s ease,color .15s ease;
}
.incudorm .inc-join:hover{background:var(--inc-ink);color:var(--inc-bg)}
.incudorm .inc-join[aria-pressed="true"]{background:var(--inc-mint);border-color:var(--inc-mint);color:var(--inc-pop-ink)}

.incudorm .inc-section{padding:5rem 0}
.incudorm .inc-sec-head{max-width:42rem;margin-bottom:2.75rem}
.incudorm .inc-sec-head h2{font-size:clamp(2rem,4.4vw,3.1rem);font-weight:800}
.incudorm .inc-sec-head p{color:var(--inc-muted);font-size:1.15rem;margin:1rem 0 0}

.incudorm .inc-steps{display:grid;gap:2rem;counter-reset:s;padding:0;margin:0;list-style:none}
@media (min-width:860px){.incudorm .inc-steps{grid-template-columns:repeat(3,1fr);gap:2.5rem}}
.incudorm .inc-steps li{counter-increment:s;border-top:3px solid var(--inc-ink);padding-top:1.1rem}
.incudorm .inc-steps li::before{
  content:counter(s);display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;
  background:var(--inc-sun);color:var(--inc-pop-ink);font:800 1.1rem var(--inc-display);margin-bottom:1rem;
}
.incudorm .inc-steps h3{font-size:1.5rem;margin-bottom:.5rem}
.incudorm .inc-steps p{margin:0;color:var(--inc-muted)}

.incudorm .inc-only-section{background:var(--inc-paper);border-top:2px solid var(--inc-ink)}
.incudorm .inc-only{display:grid;gap:3rem}
@media (min-width:900px){.incudorm .inc-only{grid-template-columns:1fr 1fr;align-items:start}}
.incudorm .inc-facts{margin:0;display:grid}
.incudorm .inc-facts div{padding:1.15rem 0;border-bottom:2px solid var(--inc-line)}
.incudorm .inc-facts div:first-child{border-top:2px solid var(--inc-line)}
.incudorm .inc-facts dt{font:700 1.25rem var(--inc-display);letter-spacing:-.02em;margin-bottom:.25rem}
.incudorm .inc-facts dd{margin:0;color:var(--inc-muted)}

.incudorm .inc-footer{padding:2rem 0 2.5rem;color:var(--inc-muted);font-size:.95rem;border-top:2px solid var(--inc-ink)}
.incudorm .inc-footer-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem}
.incudorm .inc-footer-links{display:flex;gap:1.25rem;flex-wrap:wrap}
.incudorm .inc-footer-links a{color:var(--inc-muted)}
.incudorm .inc-footer-links a:hover{color:var(--inc-ink)}

@media (prefers-reduced-motion:reduce){
  .incudorm .inc-pitch{animation:none}
  .incudorm .inc-btn,.incudorm .inc-join{transition:none}
}
`;
