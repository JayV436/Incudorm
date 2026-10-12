import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../appContext";
import { makeId } from "../lib/id";
import { ProjectCard } from "../components/ProjectCard";
import { ColorPicker } from "../components/ColorPicker";
import { Field, PageHead, SkillPicker } from "../components/ui";
import { HOURS_OPTIONS, STAGES, CARD_COLORS, CARD_THEMES } from "../types";
import type { Project, RoleNeed, Stage, CardColor, CardTheme, ProjectVisibility } from "../types";

const MAX_ROLES = 6;
const newRole = (): RoleNeed => ({ id: makeId(), title: "", skills: [] });

/** Route: /projects/create */
export default function CreateProjectPage() {
  const nav = useNavigate();
  const { currentUser, createProject } = useApp();

  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>(STAGES[0]);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(6);
  const [roles, setRoles] = useState<RoleNeed[]>(() => [newRole()]);
  const [color, setColor] = useState<CardColor>(CARD_COLORS[0].id);
  const [cardTheme, setCardTheme] = useState<CardTheme>(CARD_THEMES[0].id);
  const [visibility, setVisibility] = useState<ProjectVisibility>("campus");
  const [error, setError] = useState("");
  // Created once so the preview card has a stable timestamp (keeps render pure for React Compiler).
  const [previewTime] = useState(() => new Date().toISOString());

  function updateRole(id: string, patch: Partial<RoleNeed>) {
    setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const cleanRoles = roles
      .map((r) => ({ ...r, title: r.title.trim() }))
      .filter((r) => r.title);

    if (title.trim().length < 3) return setError("Give your idea a title.");
    if (pitch.trim().length < 10) return setError("Write a one-line pitch (at least 10 characters).");
    if (description.trim().length < 30) return setError("Describe your idea in at least 30 characters.");
    if (cleanRoles.length === 0) return setError("Add at least one role you need.");

    const r = await createProject({
      title,
      pitch,
      description,
      stage,
      hoursPerWeek,
      roles: cleanRoles,
      color,
      cardTheme,
      visibility,
    });
    if (!r.ok) return setError(r.error);
    nav(`/projects/${r.value.id}`);
  }

  const preview: Project = {
    id: "preview",
    ownerId: currentUser?.id ?? "",
    title: title.trim(),
    pitch: pitch.trim(),
    description,
    stage,
    hoursPerWeek,
    roles: roles.filter((r) => r.title.trim()).map((r) => ({ ...r, title: r.title.trim() })),
    teamIds: [],
    status: "open",
    createdAt: previewTime,
    color,
    cardTheme,
    visibility,
  };

  const campusName = currentUser?.college || "your campus";

  return (
    <>
      <PageHead title="Post an idea" subtitle="Say what you're building, pick who can see it, and who you need." />

      <div className="inc-create">
        <form className="inc-card ink" onSubmit={submit} noValidate>
          {/* Visibility Section */}
          <div className="inc-field" style={{ marginBottom: "1.6rem" }}>
            <span className="inc-label" style={{ fontSize: "1.05rem" }}>Who can see this idea? (Visibility)</span>
            <p className="inc-hint" style={{ marginBottom: ".6rem" }}>
              Control who can discover this card and apply to join your team.
            </p>
            <div className="inc-vis-selector" role="radiogroup" aria-label="Idea visibility">
              <label className={`inc-vis-option ${visibility === "private" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                <div className="vis-info">
                  <strong>Private (Only you)</strong>
                  <span>Only you can see this idea. Perfect for drafts, notes, or brainstorming.</span>
                </div>
              </label>

              <label className={`inc-vis-option ${visibility === "campus" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="campus"
                  checked={visibility === "campus"}
                  onChange={() => setVisibility("campus")}
                />
                <div className="vis-info">
                  <strong>Campus Only ({campusName})</strong>
                  <span>People from your campus can see and apply. Classmates-only collaboration.</span>
                </div>
              </label>

              <label className={`inc-vis-option ${visibility === "everyone" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="everyone"
                  checked={visibility === "everyone"}
                  onChange={() => setVisibility("everyone")}
                />
                <div className="vis-info">
                  <strong>Everyone (Global)</strong>
                  <span>Anyone on Incudorm across all campuses can discover and apply.</span>
                </div>
              </label>
            </div>
          </div>

          <Field label="Idea title" htmlFor="c-title">
            <input id="c-title" className="inc-input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="One-line pitch" htmlFor="c-pitch" hint={`${pitch.length}/140. This shows on your card.`}>
            <input id="c-pitch" className="inc-input" maxLength={140} value={pitch} onChange={(e) => setPitch(e.target.value)} />
          </Field>

          <Field label="Describe your idea" htmlFor="c-desc" hint="What problem does it solve, who is it for, and what will the first version do?">
            <textarea id="c-desc" className="inc-textarea" style={{ minHeight: 160 }} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <div className="inc-row two">
            <Field label="Stage" htmlFor="c-stage">
              <select id="c-stage" className="inc-select" value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Time you expect from teammates" htmlFor="c-hours">
              <select id="c-hours" className="inc-select" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))}>
                {HOURS_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h} hrs/week</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Card Theme Picker */}
          <div className="inc-field" style={{ marginBottom: "1.4rem" }}>
            <span className="inc-label">Card Theme</span>
            <p className="inc-hint" style={{ marginBottom: ".5rem" }}>
              Choose a visual style for how your idea card looks across feeds.
            </p>
            <div className="inc-themes-grid">
              {CARD_THEMES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`inc-theme-btn ${cardTheme === t.id ? "active" : ""}`}
                  onClick={() => setCardTheme(t.id)}
                >
                  <span className="name">{t.label}</span>
                  <span className="desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Card color">
            <ColorPicker<CardColor>
              value={color}
              onChange={(next) => setColor(next)}
              name="card-color"
              hint="Vibrant accent color for your idea banner, tags and badges."
            />
          </Field>

          <h2 style={{ fontSize: "1.4rem", margin: "1.4rem 0 .3rem" }}>Who do you need?</h2>
          <p className="inc-muted inc-small" style={{ marginBottom: "1rem" }}>
            Add each teammate role and the skills it needs. Students whose skills match will find your idea.
          </p>

          {roles.map((r, i) => (
            <div className="inc-roleedit" key={r.id}>
              <header>
                <strong>Role {i + 1}</strong>
                {roles.length > 1 && (
                  <button type="button" className="inc-btn inc-btn-danger inc-btn-small" onClick={() => setRoles((rs) => rs.filter((x) => x.id !== r.id))}>
                    Remove
                  </button>
                )}
              </header>
              <Field label="Role title" htmlFor={`role-${r.id}`}>
                <input
                  id={`role-${r.id}`}
                  className="inc-input"
                  placeholder="Frontend developer"
                  value={r.title}
                  onChange={(e) => updateRole(r.id, { title: e.target.value })}
                />
              </Field>
              <div className="inc-field" style={{ marginBottom: 0 }}>
                <span className="inc-label">Skills needed</span>
                <SkillPicker value={r.skills} max={6} onChange={(skills) => updateRole(r.id, { skills })} />
              </div>
            </div>
          ))}

          {roles.length < MAX_ROLES && (
            <button type="button" className="inc-btn inc-btn-ghost" onClick={() => setRoles((rs) => [...rs, newRole()])}>
              Add another role
            </button>
          )}

          {error && <p className="inc-error" role="alert" style={{ margin: "1.2rem 0 0" }}>{error}</p>}

          <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: "1.6rem" }}>
            <button type="submit" className="inc-btn inc-btn-primary">Post idea</button>
            <button type="button" className="inc-btn inc-btn-ghost" onClick={() => nav(-1)}>Cancel</button>
          </div>
        </form>

        <aside className="inc-sticky" aria-label="Card preview">
          <p className="inc-label" style={{ marginBottom: ".8rem" }}>This is how students will see it</p>
          <ProjectCard project={preview} owner={currentUser ?? undefined} preview tilt="-2deg" />
        </aside>
      </div>
    </>
  );
}
