import { Link } from "react-router-dom";
import { useApp } from "../../appContext";
import { ApplicationRow } from "../../components/ApplicationRow";
import { Avatar, Chip, EmptyState } from "../../components/ui";
import { timeAgo } from "../../lib/format";
import type { ProjectVisibility } from "../../types";

/** Route: /dashboard/my-projects. Your ideas and the requests people sent to join them. */
export default function MyProjectsPage() {
  const { currentUser, projects, applications, getUser, setProjectStatus, setProjectVisibility } = useApp();

  const mine = projects
    .filter((p) => p.ownerId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const myIds = new Set(mine.map((p) => p.id));
  const pendingTotal = applications.filter((a) => a.status === "pending" && myIds.has(a.projectId)).length;
  const teammates = mine.reduce((n, p) => n + p.teamIds.length, 0);

  if (mine.length === 0) {
    return (
      <EmptyState
        title="You haven't posted an idea yet"
        text="Post what you want to build and say who you need. Requests from students will show up here."
      >
        <Link className="inc-btn inc-btn-primary" to="/projects/create">Post an idea</Link>
      </EmptyState>
    );
  }

  return (
    <div className="inc-stack">
      <div className="inc-stats">
        <div className="inc-stat"><b>{mine.length}</b><span>{mine.length === 1 ? "Idea" : "Ideas"}</span></div>
        <div className="inc-stat"><b>{pendingTotal}</b><span>Pending requests</span></div>
        <div className="inc-stat"><b>{teammates}</b><span>{teammates === 1 ? "Teammate" : "Teammates"}</span></div>
      </div>

      {mine.map((p) => {
        const apps = applications
          .filter((a) => a.projectId === p.id)
          .sort((a, b) => {
            if ((a.status === "pending") !== (b.status === "pending")) return a.status === "pending" ? -1 : 1;
            return b.createdAt.localeCompare(a.createdAt);
          });
        const pending = apps.filter((a) => a.status === "pending").length;
        const vis = p.visibility || "everyone";

        return (
          <section className="inc-card ink" key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ marginBottom: ".4rem" }}>
                  <Link to={`/projects/${p.id}`} style={{ textDecoration: "none" }}>{p.title}</Link>
                </h2>
                <div className="inc-chips">
                  <span className={`inc-vis-pill ${vis}`}>
                    {vis === "private" && "Private (Only you)"}
                    {vis === "campus" && "Campus only"}
                    {vis === "everyone" && "Everyone"}
                  </span>
                  <Chip tone="sun">{p.stage}</Chip>
                  <Chip>{p.hoursPerWeek} hrs/week</Chip>
                  <Chip tone={p.status === "open" ? "mint" : "solid"}>{p.status === "open" ? "Open" : "Closed"}</Chip>
                  <Chip>Posted {timeAgo(p.createdAt)}</Chip>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
                <select
                  className="inc-select"
                  style={{ width: "auto", padding: ".35rem .75rem", fontSize: ".88rem", borderRadius: 999 }}
                  value={vis}
                  onChange={(e) => setProjectVisibility(p.id, e.target.value as ProjectVisibility)}
                  title="Change visibility"
                >
                  <option value="private">Private</option>
                  <option value="campus">Campus</option>
                  <option value="everyone">Everyone</option>
                </select>
                <Link className="inc-btn inc-btn-ghost inc-btn-small" to={`/projects/${p.id}`}>View idea</Link>
                <button
                  type="button"
                  className="inc-btn inc-btn-ghost inc-btn-small"
                  onClick={() => setProjectStatus(p.id, p.status === "open" ? "closed" : "open")}
                >
                  {p.status === "open" ? "Close applications" : "Reopen applications"}
                </button>
              </div>
            </div>

            {p.teamIds.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <p className="inc-label" style={{ marginBottom: ".4rem" }}>Team</p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {p.teamIds.map((tid) => {
                    const m = getUser(tid);
                    if (!m) return null;
                    return (
                      <Link className="inc-member" to={`/profile/${m.id}`} key={tid}>
                        <Avatar name={m.name} color={m.color} size={32} />
                        <b>{m.name}</b>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "1.15rem", marginBottom: ".8rem" }}>
              Requests{pending > 0 ? ` (${pending} pending)` : ""}
            </h3>
            {apps.length === 0 ? (
              <p className="inc-muted">No requests yet. Share your idea with classmates to get started.</p>
            ) : (
              apps.map((a) => <ApplicationRow key={a.id} application={a} project={p} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
