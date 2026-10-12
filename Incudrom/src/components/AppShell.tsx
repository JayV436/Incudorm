import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { homeFor } from "../lib/routes";
import { Footer } from "./Footer";
import { Avatar, Logo } from "./ui";
import { APP_THEMES } from "../types";
import type { AppTheme } from "../types";

/**
 * Layout route for the signed in app. Sends visitors to the right step:
 * not signed in -> /auth, email not verified -> /auth, profile not set up -> /onboarding.
 */
export function RequireAuth() {
  const { currentUser } = useApp();
  const loc = useLocation();
  if (!currentUser) {
    return <Navigate to="/auth?mode=login" replace state={{ from: loc.pathname }} />;
  }
  if (!currentUser.verified || !currentUser.onboarded) {
    return <Navigate to={homeFor(currentUser)} replace />;
  }
  return <AppShell />;
}

function AppShell() {
  const { currentUser, projects, applications, appTheme, setAppTheme } = useApp();
  const { pathname } = useLocation();
  const linkClass = ({ isActive }: { isActive: boolean }) => `inc-app-link${isActive ? " active" : ""}`;
  const inDashboard = pathname.startsWith("/dashboard") || pathname === "/settings";

  const myIds = new Set(projects.filter((p) => p.ownerId === currentUser?.id).map((p) => p.id));
  const pending = applications.filter((a) => a.status === "pending" && myIds.has(a.projectId)).length;

  return (
    <div className="incudorm" data-theme={appTheme}>
      <AppStyles />
      <header className="inc-app-header">
        <div className="inc-wrap inc-app-bar">
          <Logo to="/projects" />
          <nav className="inc-app-nav" aria-label="App">
            <NavLink to="/projects" end className={linkClass}>Discover</NavLink>
            <NavLink to="/students" className={linkClass}>Students</NavLink>
            <NavLink to="/dashboard/my-projects" className={() => `inc-app-link${inDashboard ? " active" : ""}`}>
              Dashboard
              {pending > 0 && <span className="inc-count" aria-label={`${pending} pending requests`}>{pending}</span>}
            </NavLink>
            <NavLink to="/messages" className={linkClass}>Messages</NavLink>
          </nav>
          <div className="inc-app-right">
            <select
              className="inc-theme-quick-select"
              value={appTheme}
              onChange={(e) => setAppTheme(e.target.value as AppTheme)}
              aria-label="Switch app theme"
              title="Switch app theme"
            >
              {APP_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <Link className="inc-btn inc-btn-primary inc-btn-small" to="/projects/create">Post an idea</Link>
            <Link to={`/profile/${currentUser?.id}`} aria-label="Your profile" title="Your profile">
              <Avatar name={currentUser?.name ?? "?"} color={currentUser?.color} size={36} />
            </Link>
            <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/logout">Log out</Link>
          </div>
        </div>
      </header>
      <main className="inc-wrap inc-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
