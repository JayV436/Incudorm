import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { Field, Logo } from "../components/ui";
import { YEARS } from "../types";

/** Route: /auth?mode=signup|login&email=you@college.edu. Also shows the verification step after sign up. */
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

  const from = (loc.state as { from?: string } | null)?.from;

  // Fully set up students go straight into the app (or back to the page they wanted).
  if (currentUser?.verified) {
    return <Navigate to={currentUser.onboarded ? (from ?? "/projects") : "/onboarding"} replace />;
  }

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function switchMode(next: "signup" | "login") {
    setError("");
    const p = new URLSearchParams(params);
    p.set("mode", next);
    setParams(p, { replace: true });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!form.name.trim()) return setError("Enter your full name.");
      if (!form.college.trim()) return setError("Enter your college name.");
      if (form.password.length < 8) return setError("Use a password with at least 8 characters.");
      const r = signUp(form);
      if (!r.ok) setError(r.error);
      // On success the student is signed in but unverified, so this page switches to the code step.
    } else {
      const r = logIn(form.email, form.password);
      if (!r.ok) setError(r.error);
    }
  }

  return (
    <div className="incudorm">
      <AppStyles />
      <div className="inc-auth">
        <div className="inc-auth-box">
          <Logo />

          {currentUser ? (
            <VerifyStep />
          ) : (
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
                  <input
                    id="password"
                    className="inc-input"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={form.password}
                    onChange={set("password")}
                  />
                </Field>

                {error && (
                  <p className="inc-error" role="alert" style={{ marginBottom: "1rem" }}>
                    {error}
                  </p>
                )}

                <button type="submit" className="inc-btn inc-btn-primary inc-btn-block">
                  {mode === "signup" ? "Create account" : "Log in"}
                </button>

                {mode === "signup" && (
                  <p className="inc-hint" style={{ marginTop: "1rem", textAlign: "center" }}>
                    By creating an account you agree to our <Link className="inc-link" to="/terms">Terms of Service</Link> and{" "}
                    <Link className="inc-link" to="/privacy">Privacy Policy</Link>.
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Step 2 of sign up: enter the 6 digit code sent to the student's college email. */
function VerifyStep() {
  const { currentUser, verifyEmail, resendVerification, logOut, devVerificationCode } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6 digit code.");
      return;
    }
    const r = verifyEmail(code);
    if (!r.ok) setError(r.error);
    // On success currentUser.verified flips to true and the page redirects.
  }

  return (
    <div className="inc-card ink">
      <h1>Verify your college email</h1>
      <p className="inc-muted" style={{ margin: ".4rem 0 1.4rem" }}>
        We sent a 6 digit code to <b>{currentUser?.email}</b>. Enter it below to continue.
      </p>

      {devVerificationCode && (
        <p className="inc-banner" role="note">
          Dev build: no email is sent. Your code is <b>{devVerificationCode}</b>.
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Field label="Verification code" htmlFor="code">
          <input
            id="code"
            className="inc-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </Field>

        {error && <p className="inc-error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}
        {resent && !error && <p className="inc-ok" role="status" style={{ marginBottom: "1rem" }}>We sent you a new code.</p>}

        <button type="submit" className="inc-btn inc-btn-primary inc-btn-block">Verify and continue</button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap", marginTop: "1.2rem" }}>
        <button
          type="button"
          className="inc-btn inc-btn-ghost inc-btn-small"
          onClick={() => {
            resendVerification();
            setResent(true);
            setError("");
          }}
        >
          Send a new code
        </button>
        <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={logOut}>
          Use a different account
        </button>
      </div>
    </div>
  );
}
