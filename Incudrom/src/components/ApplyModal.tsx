import { useState } from "react";
import type { FormEvent } from "react";
import { useApp } from "../appContext";
import type { Project } from "../types";
import { Modal } from "./Modal";

interface Props {
  project: Project;
  open: boolean;
  onClose: () => void;
}

/** The apply flow for /projects/:id. Pick a role, say why you fit, send. */
export function ApplyModal({ project, open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${project.title}`}>
      <ApplyForm project={project} onDone={onClose} />
    </Modal>
  );
}

function ApplyForm({ project, onDone }: { project: Project; onDone: () => void }) {
  const { applyToProject } = useApp();
  const [roleId, setRoleId] = useState(project.roles[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (message.trim().length < 20) {
      setError("Tell the owner a bit more. Write at least 20 characters.");
      return;
    }
    const r = applyToProject(project.id, roleId, message);
    if (!r.ok) setError(r.error);
    else onDone();
  }

  return (
    <form onSubmit={submit} noValidate>
      <fieldset style={{ border: 0, padding: 0, margin: "0 0 1.1rem", display: "grid", gap: ".5rem" }}>
        <legend className="inc-label" style={{ marginBottom: ".5rem" }}>Pick a role</legend>
        {project.roles.map((r) => (
          <label className="inc-radio" key={r.id}>
            <input type="radio" name="role" value={r.id} checked={roleId === r.id} onChange={() => setRoleId(r.id)} />
            <span>
              {r.title}
              {r.skills.length > 0 && <span className="inc-muted inc-small" style={{ display: "block" }}>{r.skills.join(", ")}</span>}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="inc-field">
        <label htmlFor="apply-why">Why are you a good fit?</label>
        <textarea
          id="apply-why"
          className="inc-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you've built, what you can do in the time they need."
        />
      </div>

      {error && <p className="inc-error" role="alert" style={{ marginBottom: ".9rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
        <button type="submit" className="inc-btn inc-btn-primary">Send application</button>
        <button type="button" className="inc-btn inc-btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}
