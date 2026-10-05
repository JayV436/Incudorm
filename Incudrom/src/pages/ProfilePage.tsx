import type { CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../appContext";
import { ProjectCard } from "../components/ProjectCard";
import { Avatar, Chip, EmptyState } from "../components/ui";
import { popFor, safeUrl } from "../lib/format";

/** Route: /profile/:id. Any student's public profile. Your own links to Settings for editing. */
export default function ProfilePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { currentUser, getUser, projects, startThread } = useApp();

  const student = id ? getUser(id) : undefined;

  if (!student) {
    return (
      <EmptyState title="Student not found" text="This profile doesn't exist or the student deleted their account.">
        <Link className="inc-btn inc-btn-primary" to="/students">Browse students</Link>
      </EmptyState>
    );
  }

  const isMe = student.id === currentUser?.id;
  const ideas = projects.filter((p) => p.ownerId === student.id && (isMe || p.status === "open"));
  const links = [
    { label: "GitHub", url: safeUrl(student.links.github) },
    { label: "LinkedIn", url: safeUrl(student.links.linkedin) },
    { label: "Website", url: safeUrl(student.links.website) },
  ].filter((l) => l.url);
  const first = student.name.split(" ")[0];

  function message() {
    const t = startThread(student!.id);
    nav(`/messages/${t.id}`);
  }

  return (
    <>
      <section className="inc-card ink">
        <div className="inc-profile-head">
          <Avatar name={student.name} size={84} />
          <div>
            <h1>{student.name}</h1>
            <p className="inc-muted" style={{ marginTop: ".3rem" }}>
              {[student.course, student.year].filter(Boolean).join(" · ")}
              {student.course || student.year ? " at " : ""}
              {student.college}
            </p>

            {student.bio ? (
              <p style={{ margin: "1rem 0", maxWidth: "62ch" }}>{student.bio}</p>
            ) : (
              isMe && <p className="inc-muted" style={{ margin: "1rem 0" }}>Add a short bio so people know who you are.</p>
            )}

            <div className="inc-chips" style={{ marginBottom: "1rem" }}>
              {student.verified && <Chip tone="mint">Email verified</Chip>}
              <Chip tone="sun">Can give {student.hoursPerWeek} hrs/week</Chip>
            </div>

            {student.skills.length > 0 && (
              <div className="inc-chips" style={{ marginBottom: "1rem" }}>
                {student.skills.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {links.map((l) => (
                  <a key={l.label} className="inc-link" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              {isMe ? (
                <Link className="inc-btn inc-btn-primary" to="/settings">Edit profile</Link>
              ) : (
                <button type="button" className="inc-btn inc-btn-primary" onClick={message}>Message {first}</button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="inc-section">
        <h2>Portfolio</h2>
        {student.portfolio.length === 0 ? (
          <EmptyState
            title={isMe ? "Show what you've built" : "Nothing here yet"}
            text={isMe ? "Add projects, designs or research. Owners look at this before accepting you." : "This student hasn't added any work yet."}
          >
            {isMe && <Link className="inc-btn inc-btn-primary" to="/settings">Add to portfolio</Link>}
          </EmptyState>
        ) : (
          <div className="inc-portfolio">
            {student.portfolio.map((p) => {
              const url = safeUrl(p.url);
              return (
                <div className="inc-pf" key={p.id} style={{ "--pop": popFor(p.id) } as CSSProperties}>
                  <h3>{p.title}</h3>
                  {p.description && <p className="inc-muted inc-small">{p.description}</p>}
                  {url && (
                    <a className="inc-link inc-small" href={url} target="_blank" rel="noopener noreferrer">View work</a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="inc-section">
        <h2>{isMe ? "Your ideas" : `Ideas by ${first}`}</h2>
        {ideas.length === 0 ? (
          <EmptyState
            title={isMe ? "You haven't posted an idea yet" : "No open ideas"}
            text={isMe ? "Post what you want to build and say who you need." : "This student hasn't posted an idea."}
          >
            {isMe && <Link className="inc-btn inc-btn-primary" to="/projects/create">Post an idea</Link>}
          </EmptyState>
        ) : (
          <div className="inc-grid">
            {ideas.map((p) => (
              <ProjectCard key={p.id} project={p} owner={student} mine={isMe} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
