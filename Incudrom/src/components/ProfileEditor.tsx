import { useState } from "react";
import { useApp } from "../appContext";
import { makeId } from "../lib/id";
import { HOURS_OPTIONS, YEARS, USER_COLORS, APP_THEMES } from "../types";
import type { PortfolioItem, Student, UserColor, AppTheme } from "../types";
import { ColorPicker } from "./ColorPicker";
import { Avatar, Field, SkillPicker } from "./ui";

type Draft = Pick<Student, "name" | "college" | "course" | "year" | "bio" | "skills" | "hoursPerWeek" | "links" | "portfolio">;

/** Full profile form: details, skills, availability, links, appearance and portfolio. */
export function ProfileEditor() {
  const { currentUser, updateProfile, setAppTheme } = useApp();

  const [draft, setDraft] = useState<Draft>(() => ({
    name: currentUser?.name ?? "",
    college: currentUser?.college ?? "",
    course: currentUser?.course ?? "",
    year: currentUser?.year ?? YEARS[0],
    bio: currentUser?.bio ?? "",
    skills: currentUser?.skills ?? [],
    hoursPerWeek: currentUser?.hoursPerWeek ?? 6,
    links: currentUser?.links ?? { github: "", linkedin: "", website: "" },
    portfolio: currentUser?.portfolio ?? [],
  }));
  const [color, setColor] = useState<UserColor>(currentUser?.color ?? "sun");
  const [theme, setTheme] = useState<AppTheme>(currentUser?.theme ?? "classic");
  const [item, setItem] = useState({ title: "", description: "", url: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleThemeChange(t: AppTheme) {
    setTheme(t);
    setAppTheme(t);
    setSaved(false);
  }

  function addItem() {
    if (!item.title.trim()) {
      setError("Give your portfolio item a title.");
      return;
    }
    const entry: PortfolioItem = {
      id: makeId(),
      title: item.title.trim(),
      description: item.description.trim(),
      url: item.url.trim(),
    };
    set("portfolio", [...draft.portfolio, entry]);
    setItem({ title: "", description: "", url: "" });
    setError("");
  }

  function save() {
    if (!draft.name.trim() || !draft.college.trim()) {
      setError("Name and college can't be empty.");
      return;
    }
    updateProfile({
      ...draft,
      name: draft.name.trim(),
      college: draft.college.trim(),
      course: draft.course.trim(),
      bio: draft.bio.trim(),
      color,
      theme,
    });
    setAppTheme(theme);
    setError("");
    setSaved(true);
  }

  return (
    <div className="inc-stack">
      <section className="inc-card">
        <h2>About you</h2>
        <div className="inc-row two">
          <Field label="Full name" htmlFor="s-name">
            <input id="s-name" className="inc-input" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="College" htmlFor="s-college">
            <input id="s-college" className="inc-input" value={draft.college} onChange={(e) => set("college", e.target.value)} />
          </Field>
        </div>
        <div className="inc-row two">
          <Field label="Course" htmlFor="s-course">
            <input id="s-course" className="inc-input" value={draft.course} onChange={(e) => set("course", e.target.value)} />
          </Field>
          <Field label="Year" htmlFor="s-year">
            <select id="s-year" className="inc-select" value={draft.year} onChange={(e) => set("year", e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Bio" htmlFor="s-bio" hint={`${draft.bio.length}/280`}>
          <textarea
            id="s-bio"
            className="inc-textarea"
            maxLength={280}
            placeholder="What you study, what you've built, what you want to build next."
            value={draft.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
      </section>

      <section className="inc-card">
        <h2>Profile appearance & personalization</h2>
        <p className="inc-muted inc-small" style={{ marginBottom: "1.2rem" }}>
          Personalize your avatar signature color and choose an app theme to make Incudorm yours.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.2rem", padding: "1rem", background: "var(--inc-chip)", borderRadius: 14 }}>
          <Avatar name={draft.name || "?"} color={color} size={64} />
          <div>
            <strong>{draft.name || "Your Name"}</strong>
            <p className="inc-hint">Avatar preview with your chosen signature color.</p>
          </div>
        </div>

        <div className="inc-field">
          <span className="inc-label">Your profile color</span>
          <ColorPicker<UserColor>
            value={color}
            colors={USER_COLORS}
            onChange={(next) => setColor(next)}
            name="user-color-picker"
            hint="Shows on your avatar, profile page, and identity cards across Incudorm."
          />
        </div>

        <div className="inc-field" style={{ marginTop: "1.4rem", marginBottom: 0 }}>
          <span className="inc-label">App theme</span>
          <p className="inc-hint" style={{ marginBottom: ".6rem" }}>
            Select your preferred visual style across all screens.
          </p>
          <div className="inc-themes-grid">
            {APP_THEMES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`inc-theme-btn ${theme === t.id ? "active" : ""}`}
                onClick={() => handleThemeChange(t.id)}
              >
                <span className="name">{t.label}</span>
                <span className="desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="inc-card">
        <h2>Skills and availability</h2>
        <div className="inc-field">
          <span className="inc-label">Your skills</span>
          <SkillPicker value={draft.skills} onChange={(skills) => set("skills", skills)} />
        </div>
        <Field label="Hours per week you can give a project" htmlFor="s-hours">
          <select id="s-hours" className="inc-select" style={{ maxWidth: 220 }} value={draft.hoursPerWeek} onChange={(e) => set("hoursPerWeek", Number(e.target.value))}>
            {HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>{h} hrs/week</option>
            ))}
          </select>
        </Field>
        <div className="inc-row three">
          <Field label="GitHub" htmlFor="s-gh">
            <input id="s-gh" className="inc-input" placeholder="github.com/you" value={draft.links.github} onChange={(e) => set("links", { ...draft.links, github: e.target.value })} />
          </Field>
          <Field label="LinkedIn" htmlFor="s-li">
            <input id="s-li" className="inc-input" placeholder="linkedin.com/in/you" value={draft.links.linkedin} onChange={(e) => set("links", { ...draft.links, linkedin: e.target.value })} />
          </Field>
          <Field label="Website" htmlFor="s-web">
            <input id="s-web" className="inc-input" placeholder="yoursite.com" value={draft.links.website} onChange={(e) => set("links", { ...draft.links, website: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="inc-card">
        <h2>Portfolio</h2>
        {draft.portfolio.length === 0 ? (
          <p className="inc-muted" style={{ marginBottom: "1rem" }}>
            Add projects, designs or research. Idea owners look at this before accepting you.
          </p>
        ) : (
          <div style={{ display: "grid", gap: ".6rem", marginBottom: "1.2rem" }}>
            {draft.portfolio.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: ".8rem", alignItems: "center", border: "2px solid var(--inc-line)", borderRadius: 12, padding: ".6rem .9rem" }}>
                <span>
                  <b>{p.title}</b>
                  {p.description && <span className="inc-muted inc-small" style={{ display: "block" }}>{p.description}</span>}
                </span>
                <button type="button" className="inc-btn inc-btn-danger inc-btn-small" onClick={() => set("portfolio", draft.portfolio.filter((x) => x.id !== p.id))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="inc-row two">
          <Field label="Title" htmlFor="pf-title">
            <input id="pf-title" className="inc-input" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
          </Field>
          <Field label="Link (optional)" htmlFor="pf-url">
            <input id="pf-url" className="inc-input" placeholder="github.com/you/project" value={item.url} onChange={(e) => setItem({ ...item, url: e.target.value })} />
          </Field>
        </div>
        <Field label="What is it?" htmlFor="pf-desc">
          <textarea id="pf-desc" className="inc-textarea" style={{ minHeight: 80 }} value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} />
        </Field>
        <button type="button" className="inc-btn inc-btn-ghost" onClick={addItem}>Add to portfolio</button>
      </section>

      <div style={{ display: "flex", gap: ".8rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="inc-btn inc-btn-primary" onClick={save}>Save changes</button>
        {saved && <span className="inc-ok" role="status">Saved.</span>}
        {error && <span className="inc-error" role="alert">{error}</span>}
      </div>
    </div>
  );
}
