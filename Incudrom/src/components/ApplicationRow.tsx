import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../appContext";
import type { Application, Project } from "../types";
import { Avatar, Chip } from "./ui";
import { timeAgo } from "../lib/format";

/** One incoming request on an idea, with accept, decline and chat actions. Used by the dashboard and the idea page. */
export function ApplicationRow({ application, project }: { application: Application; project: Project }) {
  const { getUser, respondToApplication, startThread } = useApp();
  const nav = useNavigate();
  const person = getUser(application.applicantId);
  const role = project.roles.find((r) => r.id === application.roleId);

  function openChat() {
    const t = startThread(application.applicantId, project.id);
    nav(`/messages/${t.id}`);
  }

  return (
    <div className="inc-applicant">
      <div className="top">
        <Link className="person" to={`/profile/${application.applicantId}`} style={{ textDecoration: "none" }}>
          <Avatar name={person?.name ?? "?"} size={38} />
          <span>
            <b>{person?.name ?? "Unknown student"}</b>
            <span className="inc-muted inc-small" style={{ display: "block" }}>
              {role?.title ?? "Role removed"} · {timeAgo(application.createdAt)}
            </span>
          </span>
        </Link>
        {application.status !== "pending" && (
          <Chip tone={application.status === "accepted" ? "mint" : "err"}>
            {application.status === "accepted" ? "Accepted" : "Declined"}
          </Chip>
        )}
      </div>

      <p className="msg">{application.message}</p>

      {person && person.skills.length > 0 && (
        <div className="inc-chips">
          {person.skills.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      )}

      <div className="acts">
        {application.status === "pending" && (
          <>
            <button type="button" className="inc-btn inc-btn-mint inc-btn-small" onClick={() => respondToApplication(application.id, "accepted")}>
              Accept
            </button>
            <button type="button" className="inc-btn inc-btn-danger inc-btn-small" onClick={() => respondToApplication(application.id, "declined")}>
              Decline
            </button>
          </>
        )}
        {application.status === "accepted" && (
          <button type="button" className="inc-btn inc-btn-primary inc-btn-small" onClick={openChat}>
            Open chat
          </button>
        )}
        <Link className="inc-btn inc-btn-ghost inc-btn-small" to={`/profile/${application.applicantId}`}>
          View profile
        </Link>
      </div>
    </div>
  );
}
