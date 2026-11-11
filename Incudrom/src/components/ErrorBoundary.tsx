import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary.
 *
 * Catches any unhandled render/lifecycle error and shows a friendly
 * "Something went wrong" screen instead of a blank white page.
 *
 * To add Sentry, install @sentry/react and call Sentry.captureException
 * inside componentDidCatch (the TODO comment below marks the spot).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: replace this console.error with Sentry.captureException(error, { extra: info })
    // once you add @sentry/react to the project.
    console.error("[ErrorBoundary] Uncaught render error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Hard navigate so we exit whatever broken state caused the error.
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F3F2FF",
          color: "#14143A",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "480px" }}>
          {/* Icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#ECEBFF",
              border: "2px solid #14143A",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D62F4B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', 'Trebuchet MS', system-ui, sans-serif",
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "0.75rem",
              letterSpacing: "-0.025em",
            }}
          >
            Something went wrong
          </h1>

          <p style={{ color: "#55557A", lineHeight: 1.6, marginBottom: "2rem" }}>
            An unexpected error occurred and this page can't continue. Try reloading — if the
            problem keeps happening, let us know via the{" "}
            <a href="/feedback" style={{ color: "#3030E0", fontWeight: 600 }}>
              Feedback
            </a>{" "}
            page.
          </p>

          {/* Show the error message in development so devs can debug quickly */}
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                background: "#fff",
                border: "2px solid #D62F4B",
                borderRadius: "12px",
                padding: "1rem",
                fontSize: "0.82rem",
                textAlign: "left",
                overflowX: "auto",
                marginBottom: "1.5rem",
                color: "#D62F4B",
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "0.8rem 1.35rem",
                borderRadius: "999px",
                border: "2px solid transparent",
                background: "#3B3BFF",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "0.8rem 1.35rem",
                borderRadius: "999px",
                border: "2px solid #14143A",
                background: "transparent",
                color: "#14143A",
                cursor: "pointer",
              }}
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
