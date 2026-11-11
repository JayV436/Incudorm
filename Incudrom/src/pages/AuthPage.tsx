import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { Field, Logo } from "../components/ui";
import { YEARS } from "../types";

/** Route: /auth?mode=signup|login
 *
 * Flow:
 *  - signup  → Supabase sends a confirmation email → user clicks link → /auth/callback → app
 *  - login   → Supabase password check → onAuthStateChange fires → currentUser set → redirect
 */
export default function AuthPage() {
  const [params, setParams] = useSearchParams();
  const loc = useLocation();
  const { currentUser, signUp, logIn } = useApp();
  const mode = params.get("mode") === "login" ? "login" : "signup";

  const [form, setForm] = useState({
    name: "",
    email: params.get("email") ?? "",
    college: "",
    course: "",
    year: YEARS[0] as string,
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  /** Set to the email address we just sent a confirmation link to. */
  const [sentTo, setSentTo] = useState<string | null>(null);

  const from = (loc.state as { from?: string } | null)?.from;

  // Fully set up students go straight into the app (or back to the page they wanted).
  if (currentUser?.verified && currentUser.onboarded) {
    return <Navigate to={from ?? "/projects"} replace />;
  }
  if (currentUser?.verified && !currentUser.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function switchMode(next: "signup" | "login") {
    setError("");
    setSentTo(null);
    setShowPwd(false);
    const p = new URLSearchParams(params);
    p.set("mode", next);
    setParams(p, { replace: true });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!form.name.trim()) return setError("Enter your full name.");
      if (!form.college.trim()) return setError("Enter your college name.");
      if (form.password.length < 8) return setError("Use a password with at least 8 characters.");
      setLoading(true);
      const r = await signUp(form);
      setLoading(false);
      if (r.ok) {
        // Supabase has sent a confirmation email. Show the "check your inbox" screen.
        setSentTo(form.email.trim().toLowerCase());
      } else {
        setError(r.error);
      }
    } else {
      setLoading(true);
      const r = await logIn(form.email, form.password);
      setLoading(false);
      if (!r.ok) {
        setError(r.error);
      }
      // On success onAuthStateChange fires → currentUser is set → the redirect above handles navigation.
    }
  }

  // After signup: prompt the user to click the link in their email.
  if (sentTo) {
    return (
      <div className="incudorm">
        <AppStyles />
        <div className="inc-auth">
          <div className="inc-auth-box">
            <Logo />
            <div className="inc-card ink">
              <h1>Check your inbox</h1>
              <p className="inc-muted" style={{ margin: ".4rem 0 1.4rem" }}>
                We sent a confirmation link to <b>{sentTo}</b>. Click it to verify your
                college email and finish setting up your account.
              </p>
              <p className="inc-muted inc-small">
                Can't find it? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="inc-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={async () => {
                    setSentTo(null);
                    setForm((f) => ({ ...f, email: sentTo }));
                  }}
                >
                  try again
                </button>
                .
              </p>
              <button
                type="button"
                className="inc-btn inc-btn-ghost inc-btn-small"
                style={{ marginTop: "1.2rem" }}
                onClick={() => switchMode("login")}
              >
                Back to log in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="incudorm">
      <AppStyles />
      <div className="inc-auth">
        <div className="inc-auth-box">
          <Logo />

          <div className="inc-card ink">
            <div className="inc-tabs" role="tablist" aria-label="Account">
              <button type="button" role="tab" className="inc-tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")}>
                Sign up
              </button>
              <button type="button" role="tab" className="inc-tab" aria-selected={mode === "login"} onClick={() => switchMode("login")}>
                Log in
              </button>
            </div>

            <h1>{mode === "signup" ? "Join Incudorm" : "Welcome back"}</h1>
            <p className="inc-muted" style={{ marginBottom: "1.4rem" }}>
              {mode === "signup"
                ? "Create your student account and start finding teammates."
                : "Log in with your college email."}
            </p>

            <form onSubmit={submit} noValidate>
              {mode === "signup" && (
                <Field label="Full name" htmlFor="name">
                  <input id="name" className="inc-input" autoComplete="name" value={form.name} onChange={set("name")} />
                </Field>
              )}

              <Field label="College email" htmlFor="email">
                <input
                  id="email"
                  className="inc-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={set("email")}
                />
              </Field>

              {mode === "signup" && (
                <>
                  <Field label="College" htmlFor="college">
                    <input id="college" className="inc-input" value={form.college} onChange={set("college")} />
                  </Field>
                  <div className="inc-row two">
                    <Field label="Course" htmlFor="course">
                      <input id="course" className="inc-input" placeholder="B.Tech CSE" value={form.course} onChange={set("course")} />
                    </Field>
                    <Field label="Year" htmlFor="year">
                      <select id="year" className="inc-select" value={form.year} onChange={set("year")}>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              <Field label="Password" htmlFor="password" hint={mode === "signup" ? "At least 8 characters." : undefined}>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    className="inc-input"
                    type={showPwd ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={form.password}
                    onChange={set("password")}
                    style={{ paddingRight: "2.8rem" }}
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((v) => !v)}
                    style={{
                      position: "absolute", right: ".75rem", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--inc-muted)",
                      display: "grid", placeItems: "center", padding: 0,
                    }}
                  >
                    {showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </Field>

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: "-.4rem", marginBottom: ".8rem" }}>
                  <Link className="inc-link" to="/auth/reset" style={{ fontSize: ".9rem" }}>
                    Forgot password?
                  </Link>
                </div>
              )}

              {error && (
                <p className="inc-error" role="alert" style={{ marginBottom: "1rem" }}>
                  {error}
                </p>
              )}

              <button type="submit" className="inc-btn inc-btn-primary inc-btn-block" disabled={loading}>
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
              </button>

              {mode === "signup" && (
                <p className="inc-hint" style={{ marginTop: "1rem", textAlign: "center" }}>
                  By creating an account you agree to our <Link className="inc-link" to="/terms">Terms of Service</Link> and{" "}
                  <Link className="inc-link" to="/privacy">Privacy Policy</Link>.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
