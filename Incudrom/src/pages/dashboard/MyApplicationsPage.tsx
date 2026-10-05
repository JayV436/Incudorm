import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../appContext";
import { Avatar, Chip, EmptyState } from "../../components/ui";
import { timeAgo } from "../../lib/format";
import type { ApplicationStatus } from "../../types";

type Filter = "all" | ApplicationStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
];

/** Route: /dashboard/applications. Everything you've applied to and where it stands. */
export default function MyApplicationsPage() {
  const nav = useNavigate();
  const { currentUser, applications, projects, getUser, withdrawApplication, startThread } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirming, setConfirming] = useState<string | null>(null);

  const mine = applications
    .filter((a) => a.applicantId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shown = mine.filter((a) => filter === "all" || a.status === filter);

  function openChat(ownerId: string, projectId: string) {
    const t = startThread(ownerId, projectId);
    nav(`/messages/${t.id}`);
  }

  if (mine.length === 0) {
    return (
      <EmptyState title="You haven't applied to anything yet" text="Find an idea that needs your skills and send your first application.">
        <Link className="inc-btn inc-btn-primary" to="/projects">Discover ideas</Link>
      </EmptyState>
    );
  }

  return (
    <div className="inc-stack">
      <div className="inc-filters" style={{ marginBottom: 0 }} role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="inc-toggle" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} ({f.id === "all" ? mine.length : mine.filter((a) => a.status === f.id).length})
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="inc-muted">Nothing here yet.</p>}

      {shown.map((a) => {
        const project = projects.find((p) => p.id === a.projectId);
        const owner = project ? getUser(project.ownerId) : undefined;
        const role = project?.roles.find((r) => r.id === a.roleId);

        return (
          <article className="inc-card" key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
              <div>
                <h3 style={{ marginBottom: ".3rem" }}>
                  {project ? <Link to={`/projects/${project.id}`} style={{ textDecoration: "none" }}>{project.title}</Link> : "This idea was removed"}
                </h3>
                <p className="inc-muted inc-small">
                  {role?.title ?? "Role removed"} · Sent {timeAgo(a.createdAt)}
                </p>
              </div>
              <Chip tone={a.status === "accepted" ? "mint" : a.status === "declined" ? "err" : "sun"}>
                {a.status === "pending" ? "Pending" : a.status === "accepted" ? "Accepted" : "Declined"}
              </Chip>
            </div>

            {owner && (
              <Link className="inc-member" to={`/profile/${owner.id}`} style={{ padding: 0, marginBottom: ".8rem" }}>
                <Avatar name={owner.name} size={32} />
                <span>
                  <b>{owner.name}</b>
                  <span className="inc-muted inc-small">Idea owner · {owner.college}</span>
                </span>
              </Link>
            )}

            <p className="inc-desc inc-small" style={{ background: "var(--inc-chip)", borderRadius: 12, padding: ".7rem .9rem", marginBottom: "1rem" }}>
              {a.message}
            </p>

            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
              {a.status === "accepted" && project && (
                <button type="button" className="inc-btn inc-btn-primary inc-btn-small" onClick={() => openChat(project.ownerId, project.id)}>
                  Open chat
                </button>
              )}
              {a.status === "declined" && (
                <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/projects">Browse other ideas</Link>
              )}
              {a.status === "pending" &&
                (confirming === a.id ? (
                  <>
                    <span className="inc-small">Withdraw this application?</span>
                    <button type="button" className="inc-btn inc-btn-danger inc-btn-small" onClick={() => { withdrawApplication(a.id); setConfirming(null); }}>
                      Yes, withdraw
                    </button>
                    <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={() => setConfirming(null)}>Keep it</button>
                  </>
                ) : (
                  <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={() => setConfirming(a.id)}>Withdraw</button>
                ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
