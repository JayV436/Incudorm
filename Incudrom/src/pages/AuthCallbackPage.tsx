import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AppStyles } from "../styles";
import { Logo } from "../components/ui";

/**
 * Route: /auth/callback
 *
 * Supabase redirects here after the user clicks the email confirmation link.
 * Handles:
 *  - PKCE code: `?code=...` -> exchangeCodeForSession
 *  - OTP token hash: `?token_hash=...&type=signup` -> verifyOtp
 *  - Implicit hash: `#access_token=...&refresh_token=...` -> setSession
 *  - URL errors: `?error=...&error_description=...`
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchange() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      // Check if Supabase returned an error in query or hash
      const errorDesc =
        searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error");
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
        return;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as "signup" | "email" | "recovery" | null;
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        // PKCE flow
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) {
          setError(exchangeErr.message);
          return;
        }
      } else if (tokenHash && type) {
        // OTP verification flow
        const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (verifyErr) {
          setError(verifyErr.message);
          return;
        }
      } else if (accessToken) {
        // Implicit hash flow
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
        });
        if (sessionErr) {
          setError(sessionErr.message);
          return;
        }
      } else {
        // Check if a session already exists (e.g. Supabase client already auto-exchanged the token)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("No verification token found in URL. Please try signing up or logging in again.");
          return;
        }
      }

      // Check user profile and onboard status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Could not retrieve your account. Please log in.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();

      navigate(profile?.onboarded ? "/projects" : "/onboarding", { replace: true });
    }

    exchange();
  }, [navigate]);

  if (error) {
    return (
      <div className="incudorm">
        <AppStyles />
        <div className="inc-auth">
          <div className="inc-auth-box">
            <Logo />
            <div className="inc-card ink">
              <h1>Verification error</h1>
              <p className="inc-muted" style={{ margin: ".4rem 0 1.4rem" }}>
                {error}
              </p>
              <a className="inc-btn inc-btn-primary inc-btn-block" href="/auth?mode=login">
                Back to log in
              </a>
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
          <div className="inc-card ink" style={{ textAlign: "center" }}>
            <p className="inc-muted">Verifying your email…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
