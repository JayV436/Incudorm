import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../appContext";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState, PageHead } from "../components/ui";
import { STAGES } from "../types";

/** Route: /projects */
export default function ProjectFeedPage() {
  const { projects, currentUser, getUser } = useApp();
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [stage, setStage] = useState("");
  const [matchMe, setMatchMe] = useState(false);

  // Skills that real ideas are asking for right now.
  const skillsInUse = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.roles.forEach((r) => r.skills.forEach((s) => set.add(s))));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const mySkills = (currentUser?.skills ?? []).map((s) => s.toLowerCase());
    return projects
      .filter((p) => p.status === "open" || p.ownerId === currentUser?.id)
      .filter((p) => !stage || p.stage === stage)
      .filter((p) => !skill || p.roles.some((r) => r.skills.includes(skill)))
      .filter(
        (p) =>
          !matchMe ||
          p.roles.some((r) => r.skills.some((s) => mySkills.includes(s.toLowerCase()))),
      )
      .filter((p) => {
        if (!needle) return true;
        const owner = getUser(p.ownerId);
        const hay = [
          p.title,
          p.pitch,
          p.description,
          owner?.name ?? "",
          owner?.college ?? "",
          ...p.roles.map((r) => `${r.title} ${r.skills.join(" ")}`),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "open" ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [projects, q, skill, stage, matchMe, currentUser, getUser]);

  const hasFilters = !!(q || skill || stage || matchMe);
  function clear() {
    setQ("");
    setSkill("");
    setStage("");
    setMatchMe(false);
  }

  return (
    <>
      <PageHead title="Discover ideas" subtitle="Find a student project that needs what you're good at.">
        <Link className="inc-btn inc-btn-primary" to="/projects/create">
          Post an idea
        </Link>
      </PageHead>

      <div className="inc-filters">
        <input
          className="inc-input"
          type="search"
          placeholder="Search ideas, skills or colleges"
          aria-label="Search ideas"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="inc-select" aria-label="Skill needed" value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">Any skill</option>
          {skillsInUse.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="inc-select" aria-label="Stage" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">Any stage</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="button" className="inc-toggle" aria-pressed={matchMe} onClick={() => setMatchMe((v) => !v)}>
          Matches my skills
        </button>
        {hasFilters && (
          <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={clear}>
            Clear filters
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No ideas yet"
          text="Be the first to post one. Say what you're building and who you need."
        >
          <Link className="inc-btn inc-btn-primary" to="/projects/create">Post an idea</Link>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No ideas match these filters"
          text={
            matchMe && !(currentUser?.skills.length)
              ? "Add skills to your profile and we can match you to ideas that need them."
              : "Try removing a filter or searching for something else."
          }
        >
          <button type="button" className="inc-btn inc-btn-ghost" onClick={clear}>Clear filters</button>
          {matchMe && !(currentUser?.skills.length) && (
            <Link className="inc-btn inc-btn-primary" to="/settings">Add your skills</Link>
          )}
        </EmptyState>
      ) : (
        <div className="inc-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} owner={getUser(p.ownerId)} mine={p.ownerId === currentUser?.id} />
          ))}
        </div>
      )}
    </>
  );
}
