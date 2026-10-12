import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../appContext";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState, PageHead } from "../components/ui";
import { STAGES } from "../types";
import type { Project } from "../types";

type SectionTab = "all" | "private" | "campus" | "everyone";

/** Route: /projects */
export default function ProjectFeedPage() {
  const { projects, currentUser, getUser } = useApp();
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [stage, setStage] = useState("");
  const [matchMe, setMatchMe] = useState(false);
  const [sectionTab, setSectionTab] = useState<SectionTab>("all");

  // Skills that real ideas are asking for right now.
  const skillsInUse = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.roles.forEach((r) => r.skills.forEach((s) => set.add(s))));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  // Determine which ideas are accessible to this user based on visibility
  const accessibleProjects = useMemo(() => {
    return projects.filter((p) => {
      const isMine = p.ownerId === currentUser?.id;
      const vis = p.visibility || "everyone";

      // 1. Private: ONLY the owner can see
      if (vis === "private") {
        return isMine;
      }

      // 2. Campus: Only students from the same campus can see (or owner)
      if (vis === "campus") {
        if (isMine) return true;
        const owner = getUser(p.ownerId);
        const myCollege = (currentUser?.college ?? "").trim().toLowerCase();
        const ownerCollege = (owner?.college ?? "").trim().toLowerCase();
        return myCollege && ownerCollege && myCollege === ownerCollege;
      }

      // 3. Everyone: anyone can see
      return true;
    });
  }, [projects, currentUser, getUser]);

  // Apply search, stage, skill, and match filters to the accessible list
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const mySkills = (currentUser?.skills ?? []).map((s) => s.toLowerCase());

    return accessibleProjects
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
  }, [accessibleProjects, q, skill, stage, matchMe, currentUser, getUser]);

  // Split into the 3 visibility sections
  const privateIdeas = useMemo(
    () => filtered.filter((p) => p.visibility === "private"),
    [filtered],
  );

  const campusIdeas = useMemo(
    () => filtered.filter((p) => p.visibility === "campus"),
    [filtered],
  );

  const everyoneIdeas = useMemo(
    () => filtered.filter((p) => !p.visibility || p.visibility === "everyone"),
    [filtered],
  );

  const hasFilters = !!(q || skill || stage || matchMe);
  function clear() {
    setQ("");
    setSkill("");
    setStage("");
    setMatchMe(false);
  }

  const campusName = currentUser?.college || "Your Campus";

  const renderCardGrid = (list: Project[]) => (
    <div className="inc-grid">
      {list.map((p) => (
        <ProjectCard key={p.id} project={p} owner={getUser(p.ownerId)} mine={p.ownerId === currentUser?.id} />
      ))}
    </div>
  );

  return (
    <>
      <PageHead title="Discover ideas" subtitle="Explore student projects across private, campus, and global communities.">
        <Link className="inc-btn inc-btn-primary" to="/projects/create">
          Post an idea
        </Link>
      </PageHead>

      {/* Visibility Section Tabs */}
      <div className="inc-vis-tabs" role="tablist" aria-label="Idea visibility sections">
        <button
          type="button"
          className={`inc-vis-tab ${sectionTab === "all" ? "active" : ""}`}
          onClick={() => setSectionTab("all")}
        >
          All Sections
          <span className="count">{filtered.length}</span>
        </button>
        <button
          type="button"
          className={`inc-vis-tab ${sectionTab === "private" ? "active" : ""}`}
          onClick={() => setSectionTab("private")}
        >
          Private
          <span className="count">{privateIdeas.length}</span>
        </button>
        <button
          type="button"
          className={`inc-vis-tab ${sectionTab === "campus" ? "active" : ""}`}
          onClick={() => setSectionTab("campus")}
        >
          Campus ({campusName})
          <span className="count">{campusIdeas.length}</span>
        </button>
        <button
          type="button"
          className={`inc-vis-tab ${sectionTab === "everyone" ? "active" : ""}`}
          onClick={() => setSectionTab("everyone")}
        >
          Everyone
          <span className="count">{everyoneIdeas.length}</span>
        </button>
      </div>

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

      {accessibleProjects.length === 0 ? (
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
        <div className="inc-feed-sections">
          {/* Section 1: Private (Only user should be able to see) */}
          {(sectionTab === "all" || sectionTab === "private") && (
            <section className="inc-feed-section private-section">
              <div className="inc-feed-sec-head">
                <div className="sec-title-wrap">
                  <div>
                    <h2>Private Ideas</h2>
                    <p>Only you can see these ideas. Perfect for brainstorming and works in progress.</p>
                  </div>
                </div>
                <span className="inc-sec-tag private">
                  {privateIdeas.length} {privateIdeas.length === 1 ? "idea" : "ideas"} · Only you
                </span>
              </div>

              {privateIdeas.length === 0 ? (
                <div className="inc-empty-sec">
                  <p>No private ideas right now. When you post with <strong>Private</strong> visibility, only you can see it here.</p>
                  <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/projects/create">Post a private idea</Link>
                </div>
              ) : (
                renderCardGrid(privateIdeas)
              )}
            </section>
          )}

          {/* Section 2: Campus (People from same campus can see) */}
          {(sectionTab === "all" || sectionTab === "campus") && (
            <section className="inc-feed-section campus-section">
              <div className="inc-feed-sec-head">
                <div className="sec-title-wrap">
                  <div>
                    <h2>Campus Ideas — {campusName}</h2>
                    <p>Visible to students from your college campus. Collaborate with classmates.</p>
                  </div>
                </div>
                <span className="inc-sec-tag campus">
                  {campusIdeas.length} {campusIdeas.length === 1 ? "idea" : "ideas"} · Same campus
                </span>
              </div>

              {campusIdeas.length === 0 ? (
                <div className="inc-empty-sec">
                  <p>No campus ideas posted for <strong>{campusName}</strong> yet. Be the first to share one with your campus!</p>
                  <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/projects/create">Post for your campus</Link>
                </div>
              ) : (
                renderCardGrid(campusIdeas)
              )}
            </section>
          )}

          {/* Section 3: Everyone (Anyone using this can see) */}
          {(sectionTab === "all" || sectionTab === "everyone") && (
            <section className="inc-feed-section everyone-section">
              <div className="inc-feed-sec-head">
                <div className="sec-title-wrap">
                  <div>
                    <h2>Everyone</h2>
                    <p>Visible to all students across every university and college on Incudorm.</p>
                  </div>
                </div>
                <span className="inc-sec-tag everyone">
                  {everyoneIdeas.length} {everyoneIdeas.length === 1 ? "idea" : "ideas"} · Global
                </span>
              </div>

              {everyoneIdeas.length === 0 ? (
                <div className="inc-empty-sec">
                  <p>No global ideas found matching your filters.</p>
                </div>
              ) : (
                renderCardGrid(everyoneIdeas)
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}
