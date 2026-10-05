import { useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../appContext";
import { ApplicationRow } from "../components/ApplicationRow";
import { ApplyModal } from "../components/ApplyModal";
import { Avatar, Chip, EmptyState } from "../components/ui";
import { popFor, timeAgo } from "../lib/format";

/** Route: /projects/:id. Idea details, the apply modal, and (for the owner) incoming requests. */
export default function ProjectDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { projects, applications, currentUser, getUser, setProjectStatus, startThread } = useApp();
  const [applyOpen, setApplyOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project || !currentUser) {
    return (
      <EmptyState title="Idea not found" text="It may have been removed, or the link is wrong.">
        <Link className="inc-btn inc-btn-primary" to="/projects">Back to Discover</Link>
      </EmptyState>
    );
  }

  const owner = getUser(project.ownerId);
  const isOwner = project.ownerId === currentUser.id;
  const onTeam = project.teamIds.includes(currentUser.id);
  const myApp = applications.find((a) => a.projectId === project.id && a.applicantId === currentUser.id);
  const projectApps = applications.filter((a) => a.projectId === project.id);
  const pendingCount = projectApps.filter((a) => a.status === "pending").length;
  const roleTitle = (rid: string) => project.roles.find((r) => r.id === rid)?.title ?? "Role removed";

  function openChat(otherId: string) {
    const t = startThread(otherId, project!.id);
    nav(`/messages/${t.id}`);
  }

  function messageOwner() {
    if (!owner) return;
    const t = startThread(owner.id);
    nav(`/messages/${t.id}`);
  }

  const pop = { "--pop": popFor(project.id) } as CSSProperties;

  return (
    <div className="inc-detail">
      <div className="inc-stack">
        <div>
          <div className="inc-chips" style={{ marginBottom: "1rem" }}>
            <Chip tone="sun">{project.stage}</Chip>
            <Chip>{project.hoursPerWeek} hrs/week</Chip>
            <Chip>Posted {timeAgo(project.createdAt)}</Chip>
            {project.status === "closed" && <Chip tone="solid">Closed</Chip>}
          </div>
          <h1>{project.title}</h1>
          <p className="inc-pitchline">{project.pitch}</p>
          {owner && (
            <Link to={`/profile/${owner.id}`} className="inc-member" style={{ padding: 0 }}>
              <Avatar name={owner.name} size={40} />
              <span>
                <b>{owner.name}</b>
                <span className="inc-muted inc-small">
                  {[owner.course, owner.year, owner.college].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          )}
        </div>

        <section className="inc-card">
          <h2>About this idea</h2>
          <p className="inc-desc">{project.description}</p>
        </section>

        <section>
          <h2 style={{ marginBottom: "1rem" }}>Who they need</h2>
          <div className="inc-stack" style={{ gap: ".9rem" }}>
            {project.roles.map((r) => (
              <div key={r.id} className="inc-role" style={pop}>
                <h3>{r.title}</h3>
                {r.skills.length > 0 && (
                  <div className="inc-chips">
                    {r.skills.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {isOwner && (
          <section className="inc-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".8rem", flexWrap: "wrap", alignItems: "center", marginBottom: ".8rem" }}>
              <h2 style={{ margin: 0 }}>Requests{pendingCount > 0 ? ` (${pendingCount} pending)` : ""}</h2>
              <Link className="inc-btn inc-btn-ghost inc-btn-small" to="/dashboard/my-projects">Open dashboard</Link>
            </div>
            {projectApps.length === 0 ? (
              <p className="inc-muted">No requests yet. Share your idea with classmates to get started.</p>
            ) : (
              projectApps.map((a) => <ApplicationRow key={a.id} application={a} project={project} />)
            )}
          </section>
        )}
      </div>

      <aside className="inc-stack">
        {isOwner ? (
          <div className="inc-card ink">
            <h3>Your idea</h3>
            <p className="inc-muted" style={{ marginBottom: "1rem" }}>
              {project.status === "open"
                ? "Students can apply right now."
                : "Applications are closed. Nobody new can apply."}
            </p>
            <button
              type="button"
              className="inc-btn inc-btn-ghost inc-btn-block"
              onClick={() => setProjectStatus(project.id, project.status === "open" ? "closed" : "open")}
            >
              {project.status === "open" ? "Close applications" : "Reopen applications"}
            </button>
          </div>
        ) : onTeam ? (
          <div className="inc-card ink">
            <h3>You're on the team</h3>
            <p className="inc-muted" style={{ marginBottom: "1rem" }}>Chat with the owner to plan your first steps.</p>
            <button type="button" className="inc-btn inc-btn-primary inc-btn-block" onClick={() => owner && openChat(owner.id)}>
              Open chat
            </button>
          </div>
        ) : myApp ? (
          <div className="inc-card ink">
            <h3>
              {myApp.status === "pending" && "Application sent"}
              {myApp.status === "accepted" && "You're in"}
              {myApp.status === "declined" && "Not this time"}
            </h3>
            <p className="inc-muted">
              {myApp.status === "pending" && `You applied as ${roleTitle(myApp.roleId)}. The owner will review it.`}
              {myApp.status === "accepted" && "The owner accepted your application."}
              {myApp.status === "declined" && "The owner chose other teammates for this role. Other ideas may fit you better."}
            </p>
            <Link className="inc-btn inc-btn-ghost inc-btn-block" style={{ marginTop: "1rem" }} to={myApp.status === "declined" ? "/projects" : "/dashboard/applications"}>
              {myApp.status === "declined" ? "Browse other ideas" : "See my applications"}
            </Link>
          </div>
        ) : project.status === "open" ? (
          <div className="inc-card ink">
            <h3>Want to join?</h3>
            <p className="inc-muted" style={{ marginBottom: "1rem" }}>
              Pick the role that fits you and tell the owner why.
            </p>
            <button type="button" className="inc-btn inc-btn-primary inc-btn-block" onClick={() => setApplyOpen(true)}>
              Apply to join
            </button>
          </div>
        ) : (
          <div className="inc-card ink">
            <h3>Applications closed</h3>
            <p className="inc-muted">This idea isn't taking new teammates right now.</p>
          </div>
        )}

        <div className="inc-card">
          <h3>Team</h3>
          {owner && (
            <Link className="inc-member" to={`/profile/${owner.id}`}>
              <Avatar name={owner.name} size={36} />
              <span>
                <b>{owner.name}</b>
                <span className="inc-muted inc-small">Owner</span>
              </span>
            </Link>
          )}
          {project.teamIds.map((tid) => {
            const m = getUser(tid);
            if (!m) return null;
            return (
              <Link className="inc-member" to={`/profile/${m.id}`} key={tid}>
                <Avatar name={m.name} size={36} />
                <span>
                  <b>{m.name}</b>
                  <span className="inc-muted inc-small">Teammate</span>
                </span>
              </Link>
            );
          })}
          {project.teamIds.length === 0 && <p className="inc-muted inc-small">No teammates yet.</p>}
          {!isOwner && owner && (
            <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" style={{ marginTop: ".8rem" }} onClick={messageOwner}>
              Message {owner.name.split(" ")[0]}
            </button>
          )}
        </div>
      </aside>

      <ApplyModal project={project} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
