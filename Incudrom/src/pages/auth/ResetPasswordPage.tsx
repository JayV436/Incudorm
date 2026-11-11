import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppStyles } from "../../styles";
import { Field, Logo } from "../../components/ui";
import { supabase } from "../../lib/supabase";

/**
 * Route: /auth/reset
 *
 * Two-phase flow:
 *  Phase 1 – User lands here directly (no session, no token).
 *            They enter their email and we call resetPasswordForEmail.
 *            We show a "check your inbox" confirmation.
 *
 *  Phase 2 – User clicks the link in the email, which Supabase redirects to
 *            /auth/reset#access_token=... (or /auth/callback which then
 *            navigates here).  At that point Supabase has established a
 *            PASSWORD_RECOVERY session, so we let them pick a new password.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Supabase appends ?type=recovery when redirecting from the magic link.
  // We use that (plus an active session) to decide which phase to show.
  const isRecovery = params.get("type") === "recovery";

  // ── Phase 1: request reset email ────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [requestError, setRequestError] = useState("");

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setRequestError("");
    if (!email.trim()) {
      setRequestError("Enter your college email address.");
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset?type=recovery`,
    });
    setSending(false);
    if (error) {
      setRequestError(error.message);
    } else {
      setSent(true);
    }
  }

  // ── Phase 2: set a new password ─────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updated, setUpdated] = useState(false);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setUpdateError("");
    if (password.length < 8) {
      setUpdateError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setUpdateError("Passwords don't match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setUpdateError(error.message);
    } else {
      setUpdated(true);
      // Give the user a moment to read the success message, then send them to login.
      setTimeout(() => navigate("/auth?mode=login"), 2500);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="incudorm">
      <AppStyles />
      <div className="inc-auth">
        <div className="inc-auth-box">
          <Logo />
          <div className="inc-card ink">
            {/* Phase 2: recovery link clicked – show set-new-password form */}
            {isRecovery ? (
              updated ? (
                <>
                  <h1>Password updated!</h1>
                  <p className="inc-muted" style={{ margin: ".4rem 0 1.4rem" }}>
                    Your password has been changed. Redirecting you to log in…
                  </p>
                </>
              ) : (
                <>
                  <h1>Set a new password</h1>
                  <p className="inc-muted" style={{ marginBottom: "1.4rem" }}>
                    Choose a strong password for your Incudorm account.
                  </p>
                  <form onSubmit={handleUpdate} noValidate>
                    <Field label="New password" htmlFor="new-password" hint="At least 8 characters.">
                      <div style={{ position: "relative" }}>
                        <input
                          id="new-password"
                          className="inc-input"
                          type={showPwd ? "text" : "password"}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ paddingRight: "2.8rem" }}
                        />
                        <button
                          type="button"
                          aria-label={showPwd ? "Hide password" : "Show password"}
                          onClick={() => setShowPwd((v) => !v)}
                          style={{
                            position: "absolute", right: ".75rem", top: "50%",
                            transform: "translateY(-50%)", background: "none",
                            border: "none", cursor: "pointer", color: "var(--inc-muted)",
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

                    <Field label="Confirm password" htmlFor="confirm-password">
                      <input
                        id="confirm-password"
                        className="inc-input"
                        type={showPwd ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </Field>

                    {updateError && (
                      <p className="inc-error" role="alert" style={{ marginBottom: "1rem" }}>
                        {updateError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="inc-btn inc-btn-primary inc-btn-block"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Update password"}
                    </button>
                  </form>
                </>
              )
            ) : /* Phase 1: request reset email */ sent ? (
              <>
                <h1>Check your inbox</h1>
                <p className="inc-muted" style={{ margin: ".4rem 0 1.4rem" }}>
                  We sent a password reset link to <b>{email.trim().toLowerCase()}</b>. Click it to
                  choose a new password.
                </p>
                <p className="inc-muted inc-small">
                  Can't find it? Check your spam folder, or{" "}
                  <button
                    type="button"
                    className="inc-link"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onClick={() => setSent(false)}
                  >
                    try again
                  </button>
                  .
                </p>
                <button
                  type="button"
                  className="inc-btn inc-btn-ghost inc-btn-small"
                  style={{ marginTop: "1.2rem" }}
                  onClick={() => navigate("/auth?mode=login")}
                >
                  Back to log in
                </button>
              </>
            ) : (
              <>
                <h1>Forgot password?</h1>
                <p className="inc-muted" style={{ marginBottom: "1.4rem" }}>
                  Enter your college email and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleRequest} noValidate>
                  <Field label="College email" htmlFor="reset-email">
                    <input
                      id="reset-email"
                      className="inc-input"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  {requestError && (
                    <p className="inc-error" role="alert" style={{ marginBottom: "1rem" }}>
                      {requestError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="inc-btn inc-btn-primary inc-btn-block"
                    disabled={sending}
                  >
                    {sending ? "Sending…" : "Send reset link"}
                  </button>
                </form>

                <button
                  type="button"
                  className="inc-btn inc-btn-ghost inc-btn-small"
                  style={{ marginTop: "1rem", width: "100%" }}
                  onClick={() => navigate("/auth?mode=login")}
                >
                  Back to log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
