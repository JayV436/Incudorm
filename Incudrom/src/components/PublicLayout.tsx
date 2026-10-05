import { Link, Outlet } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { homeFor } from "../lib/routes";
import { Footer } from "./Footer";
import { Logo } from "./ui";

/** Layout for pages anyone can open, signed in or not (Privacy, Terms). */
export function PublicLayout() {
  const { currentUser } = useApp();
  return (
    <div className="incudorm">
      <AppStyles />
      <header className="inc-app-header">
        <div className="inc-wrap inc-app-bar">
          <Logo />
          <div className="inc-app-right" style={{ marginLeft: "auto" }}>
            {currentUser ? (
              <Link className="inc-btn inc-btn-primary inc-btn-small" to={homeFor(currentUser)}>Open app</Link>
            ) : (
              <>
                <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/auth?mode=login">Log in</Link>
                <Link className="inc-btn inc-btn-primary inc-btn-small" to="/auth?mode=signup">Sign up</Link>
              </>
            )}
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
