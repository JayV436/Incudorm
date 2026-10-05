import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Project, Student } from "../types";
import { Avatar, Chip } from "./ui";
import { popFor, timeAgo } from "../lib/format";
import { CARD_COLORS } from "../types";

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
  const colorObj = project.color ? CARD_COLORS.find((c) => c.id === project.color) : null;
  const style = {
    "--pop": colorObj?.value ?? popFor(project.id),
    "--tilt": tilt ?? "0deg",
  } as CSSProperties;
  const content = (
    <>
      <div className="inc-pcard-top">
        <span>{project.stage}</span>
        <span>{project.hoursPerWeek} hrs/week</span>
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
    <Link className="inc-pcard" style={style} to={`/projects/${project.id}`}>
      {content}
    </Link>
  );
}
