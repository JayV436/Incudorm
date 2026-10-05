import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { homeFor } from "../lib/routes";
import { Footer } from "./Footer";
import { Avatar, Logo } from "./ui";

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
  const { currentUser, projects, applications } = useApp();
  const { pathname } = useLocation();
  const linkClass = ({ isActive }: { isActive: boolean }) => `inc-app-link${isActive ? " active" : ""}`;
  const inDashboard = pathname.startsWith("/dashboard") || pathname === "/settings";

  const myIds = new Set(projects.filter((p) => p.ownerId === currentUser?.id).map((p) => p.id));
  const pending = applications.filter((a) => a.status === "pending" && myIds.has(a.projectId)).length;

  return (
    <div className="incudorm">
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
            <Link className="inc-btn inc-btn-primary inc-btn-small" to="/projects/create">Post an idea</Link>
            <Link to={`/profile/${currentUser?.id}`} aria-label="Your profile" title="Your profile">
              <Avatar name={currentUser?.name ?? "?"} size={36} />
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
