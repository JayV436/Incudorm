import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { SKILL_OPTIONS } from "../types";
import { initials, popFor } from "../lib/format";

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    "--pop": popFor(name),
  } as CSSProperties;
  return (
    <span className="inc-avatar" style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Chip({ children, tone }: { children: ReactNode; tone?: "solid" | "sun" | "mint" | "err" }) {
  return <span className={`inc-chip${tone ? ` ${tone}` : ""}`}>{children}</span>;
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="inc-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {children && <div className="acts">{children}</div>}
    </div>
  );
}

export function PageHead({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="inc-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="inc-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="inc-hint">{hint}</span>}
    </div>
  );
}

/** Toggle chips for choosing skills, plus a box to add your own. */
export function SkillPicker({
  value,
  onChange,
  max = 10,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const [custom, setCustom] = useState("");
  const options: string[] = [...SKILL_OPTIONS];
  const extras = value.filter((v) => !options.includes(v));
  const all = [...options, ...extras];

  function toggle(skill: string) {
    if (value.includes(skill)) onChange(value.filter((v) => v !== skill));
    else if (value.length < max) onChange([...value, skill]);
  }

  function addCustom() {
    const v = custom.trim();
    if (!v || value.some((s) => s.toLowerCase() === v.toLowerCase()) || value.length >= max) {
      setCustom("");
      return;
    }
    onChange([...value, v]);
    setCustom("");
  }

  return (
    <div className="inc-skillpick">
      <div className="inc-chips" role="group" aria-label="Skills">
        {all.map((s) => (
          <button key={s} type="button" className="inc-toggle" aria-pressed={value.includes(s)} onClick={() => toggle(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="inc-addskill">
        <input
          className="inc-input"
          value={custom}
          placeholder="Add another skill"
          aria-label="Add another skill"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={addCustom}>
          Add
        </button>
      </div>
      {value.length >= max && <span className="inc-hint">You can pick up to {max} skills.</span>}
    </div>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link className="inc-logo" to={to}>
      <span className="inc-logo-mark" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19L19 5M9 5h10v10" />
        </svg>
      </span>
      Incudorm
    </Link>
  );
}

export { ColorPicker } from "./ColorPicker";
