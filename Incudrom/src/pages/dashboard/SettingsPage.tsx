import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../appContext";
import { ProfileEditor } from "../../components/ProfileEditor";
import { Chip, Field } from "../../components/ui";

/** Route: /settings. Edit your profile, see your account, log out or delete it. */
export default function SettingsPage() {
  const nav = useNavigate();
  const { currentUser } = useApp();
  const [confirmText, setConfirmText] = useState("");

  if (!currentUser) return null;

  return (
    <div className="inc-stack">
      <ProfileEditor />

      <section className="inc-card">
        <h2>Account</h2>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <span>{currentUser.email}</span>
          {currentUser.verified && <Chip tone="mint">Email verified</Chip>}
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link className="inc-btn inc-btn-ghost" to={`/profile/${currentUser.id}`}>View my public profile</Link>
          <Link className="inc-btn inc-btn-ghost" to="/logout">Log out</Link>
        </div>
      </section>

      <section className="inc-card" style={{ borderColor: "var(--inc-err)" }}>
        <h2>Delete account</h2>
        <p className="inc-muted" style={{ marginBottom: "1rem", maxWidth: "60ch" }}>
          This permanently removes your profile, the ideas you posted, your applications and your messages. It can't be undone.
        </p>
        <Field label='Type "delete" to confirm' htmlFor="del-confirm">
          <input id="del-confirm" className="inc-input" style={{ maxWidth: 280 }} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </Field>
        <button
          type="button"
          className="inc-btn inc-btn-danger"
          disabled={confirmText.trim().toLowerCase() !== "delete"}
          onClick={() => nav("/logout", { state: { deleteAccount: true } })}
        >
          Delete my account
        </button>
      </section>
    </div>
  );
}
