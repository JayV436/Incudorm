import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../appContext";
import { Avatar, Chip, EmptyState, PageHead } from "../components/ui";
import { popFor } from "../lib/format";

/** Route: /students */
export default function TalentDirectoryPage() {
  const { users, currentUser, startThread } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");

  const others = useMemo(() => users.filter((u) => u.id !== currentUser?.id), [users, currentUser]);

  const skillsInUse = useMemo(() => {
    const set = new Set<string>();
    others.forEach((u) => u.skills.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [others]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return others
      .filter((u) => !skill || u.skills.includes(skill))
      .filter((u) => {
        if (!needle) return true;
        return [u.name, u.college, u.course, u.bio, ...u.skills].join(" ").toLowerCase().includes(needle);
      })
      .sort((a, b) => b.skills.length - a.skills.length || b.createdAt.localeCompare(a.createdAt));
  }, [others, q, skill]);

  function say(userId: string) {
    const t = startThread(userId);
    nav(`/messages/${t.id}`);
  }

  return (
    <>
      <PageHead title="Student talent" subtitle="Find students by skill, course or college and start a conversation." />

      <div className="inc-filters">
        <input
          className="inc-input"
          type="search"
          placeholder="Search by name, skill or college"
          aria-label="Search students"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="inc-select" aria-label="Skill" value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">Any skill</option>
          {skillsInUse.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(q || skill) && (
          <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={() => { setQ(""); setSkill(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {others.length === 0 ? (
        <EmptyState
          title="You're the first student here"
          text="Invite classmates to join Incudorm and they'll show up in this directory."
        >
          <Link className="inc-btn inc-btn-primary" to="/settings">Complete your profile</Link>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title="No students match" text="Try a different skill or search term.">
          <button type="button" className="inc-btn inc-btn-ghost" onClick={() => { setQ(""); setSkill(""); }}>
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <div className="inc-grid">
          {filtered.map((u) => (
            <article className="inc-tcard" key={u.id} style={{ "--pop": popFor(u.id) } as CSSProperties}>
              <div className="head">
                <Avatar name={u.name} size={46} />
                <div>
                  <h3>{u.name}</h3>
                  <span className="inc-muted inc-small">
                    {[u.course, u.year].filter(Boolean).join(" · ")}
                  </span>
                  <span className="inc-muted inc-small" style={{ display: "block" }}>{u.college}</span>
                </div>
              </div>
              {u.bio && <p className="bio">{u.bio}</p>}
              {u.skills.length > 0 ? (
                <div className="inc-chips">
                  {u.skills.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              ) : (
                <span className="inc-muted inc-small">No skills added yet</span>
              )}
              <span className="inc-muted inc-small">Can give {u.hoursPerWeek} hrs/week</span>
              <div className="actions">
                <Link className="inc-btn inc-btn-ghost inc-btn-small" to={`/profile/${u.id}`}>View profile</Link>
                <button type="button" className="inc-btn inc-btn-primary inc-btn-small" onClick={() => say(u.id)}>
                  Message
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
