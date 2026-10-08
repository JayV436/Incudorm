import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Project, Student } from "../types";
import { Avatar, Chip } from "./ui";
import { popFor, timeAgo } from "../lib/format";
import { CARD_COLORS } from "../types";
import { ShareModal } from "./ShareModal";

interface Props {
  project: Project;
  owner?: Student;
  /** Shows a "Your idea" tag. */
  mine?: boolean;
  /** Renders a plain (non-link) card, used for the live preview while posting. */
  preview?: boolean;
  tilt?: string;
}

export function ProjectCard({ project, owner, mine, preview, tilt }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const colorObj = project.color ? CARD_COLORS.find((c) => c.id === project.color) : null;
  const style = {
    "--pop": colorObj?.value ?? popFor(project.id),
    "--tilt": tilt ?? "0deg",
  } as CSSProperties;
  const content = (
    <>
      <div className="inc-pcard-top">
        <span>{project.stage} · {project.hoursPerWeek} hrs/week</span>
        {!preview && (
          <button
            type="button"
            className="inc-card-share-btn"
            title="Share this idea"
            aria-label="Share this idea"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShareOpen(true);
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        )}
      </div>
      <div className="inc-pcard-body">
        <h3>{project.title || "Your idea title"}</h3>
        <p className="pitch">{project.pitch || "Your one-line pitch shows up here."}</p>
        <div>
          <div className="inc-looking">Looking for</div>
          <div className="inc-chips">
            {project.roles.length === 0 && <span className="inc-muted inc-small">Add a role to see it here</span>}
            {project.roles.map((r) => (
              <Chip key={r.id}>{r.title}</Chip>
            ))}
          </div>
        </div>
        <div className="inc-pcard-foot">
          <span className="who">
            <Avatar name={owner?.name ?? "?"} size={32} />
            <span>
              <b>{owner?.name ?? "Unknown student"}</b>
              {owner?.college}
            </span>
          </span>
          <span style={{ textAlign: "right" }}>
            {mine && <Chip tone="sun">Your idea</Chip>}
            {project.status === "closed" && <Chip tone="solid">Closed</Chip>}
            {!mine && project.status === "open" && <span>{timeAgo(project.createdAt)}</span>}
          </span>
        </div>
      </div>
    </>
  );

  if (preview) {
    return (
      <div className="inc-pcard" style={style}>
        {content}
      </div>
    );
  }
  return (
    <>
      <Link className="inc-pcard" style={style} to={`/projects/${project.id}`}>
        {content}
      </Link>
      <ShareModal project={project} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
