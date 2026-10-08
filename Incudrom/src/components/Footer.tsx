import { Link } from "react-router-dom";
import { SITE } from "../lib/site";

export function Footer() {
  return (
    <footer className="inc-footer">
      <div className="inc-wrap inc-footer-row">
        <span>{SITE.name}. Made by students, for students.</span>
        <nav className="inc-footer-links" aria-label="Footer links">
          <Link to="/feedback">Feedback</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
}
