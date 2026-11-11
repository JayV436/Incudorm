import { Link } from "react-router-dom";
import { AppStyles } from "../styles";
import { Logo } from "../components/ui";

/**
 * Route: * (catch-all)
 *
 * Shows a proper 404 page instead of silently redirecting to /.
 * The link back to Discover (/projects) is behind RequireAuth,
 * so we also offer a link to the landing page for logged-out visitors.
 */
export default function NotFoundPage() {
  return (
    <div className="incudorm">
      <AppStyles />
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1.25rem",
          backgroundImage: "radial-gradient(var(--inc-dot) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
            <Logo />
          </div>

          {/* Big 404 */}
          <div
            style={{
              fontFamily: "var(--inc-display)",
              fontSize: "clamp(5rem, 20vw, 9rem)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "var(--inc-brand)",
              marginBottom: "0.5rem",
              userSelect: "none",
            }}
          >
            404
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 800,
              marginBottom: "0.75rem",
            }}
          >
            Page not found
          </h1>

          <p
            className="inc-muted"
            style={{ lineHeight: 1.65, marginBottom: "2rem", maxWidth: "40ch", margin: "0 auto 2rem" }}
          >
            The URL <code style={{ background: "var(--inc-chip)", borderRadius: "6px", padding: "0.1em 0.4em", fontSize: "0.9em" }}>{window.location.pathname}</code> doesn't
            exist. It might have been moved, deleted, or you may have mistyped it.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/projects" className="inc-btn inc-btn-primary">
              Discover projects
            </Link>
            <Link to="/" className="inc-btn inc-btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
