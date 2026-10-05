import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../appContext";
import { Avatar, EmptyState, PageHead } from "../components/ui";
import { clockTime } from "../lib/format";

/** Routes: /messages and /messages/:threadId */
export default function MessagesPage() {
  const { threadId } = useParams();
  const { currentUser, threads, messages, projects, getUser, sendMessage } = useApp();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const me = currentUser?.id ?? "";

  const rows = useMemo(() => {
    return threads
      .filter((t) => t.participantIds.includes(me))
      .map((t) => {
        const msgs = messages.filter((m) => m.threadId === t.id);
        const last = msgs[msgs.length - 1];
        return { thread: t, msgs, last, activity: last?.createdAt ?? t.createdAt };
      })
      .sort((a, b) => b.activity.localeCompare(a.activity));
  }, [threads, messages, me]);

  const active = rows.find((r) => r.thread.id === threadId);
  const activeCount = active?.msgs.length ?? 0;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [threadId, activeCount]);

  if (threadId && !active) return <Navigate to="/messages" replace />;

  const otherOf = (participantIds: string[]) => getUser(participantIds.find((p) => p !== me) ?? "");

  function send() {
    if (!active || !text.trim()) return;
    sendMessage(active.thread.id, text);
    setText("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const activeOther = active ? otherOf(active.thread.participantIds) : undefined;
  const activeProject = active?.thread.projectId ? projects.find((p) => p.id === active.thread.projectId) : undefined;

  return (
    <>
      <PageHead title="Messages" subtitle="Your matches and conversations with other students." />

      {rows.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          text="When an owner accepts your application, or you message a student, the chat shows up here."
        >
          <Link className="inc-btn inc-btn-primary" to="/projects">Discover ideas</Link>
          <Link className="inc-btn inc-btn-ghost" to="/students">Browse students</Link>
        </EmptyState>
      ) : (
        <div className={`inc-chat${active ? " has-thread" : ""}`}>
          <div className="inc-threads">
            <h2>Conversations</h2>
            {rows.map(({ thread, last }) => {
              const other = otherOf(thread.participantIds);
              const proj = thread.projectId ? projects.find((p) => p.id === thread.projectId) : undefined;
              return (
                <Link
                  key={thread.id}
                  to={`/messages/${thread.id}`}
                  className={`inc-thread${thread.id === threadId ? " active" : ""}`}
                >
                  <Avatar name={other?.name ?? "?"} size={40} />
                  <span className="t">
                    <b>{other?.name ?? "Unknown student"}</b>
                    <span>{proj ? `Matched on ${proj.title}` : last ? last.text : "Say hello"}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="inc-convo">
            {active ? (
              <>
                <div className="inc-convo-head">
                  <Link className="inc-btn inc-btn-ghost inc-btn-small inc-back" to="/messages">Back</Link>
                  <Avatar name={activeOther?.name ?? "?"} size={40} />
                  <div className="t">
                    <b>{activeOther?.name ?? "Unknown student"}</b>
                    <span className="inc-muted inc-small">
                      {activeProject ? (
                        <>
                          Matched on{" "}
                          <Link className="inc-link" to={`/projects/${activeProject.id}`}>{activeProject.title}</Link>
                        </>
                      ) : (
                        activeOther?.college
                      )}
                    </span>
                  </div>
                  {activeOther && (
                    <Link className="inc-btn inc-btn-ghost inc-btn-small" to={`/profile/${activeOther.id}`}>Profile</Link>
                  )}
                </div>

                <div className="inc-msgs" ref={listRef}>
                  {active.msgs.length === 0 && (
                    <p className="inc-convo-empty">No messages yet. Start the conversation.</p>
                  )}
                  {active.msgs.map((m) =>
                    m.senderId === null ? (
                      <div className="inc-sys" key={m.id}>{m.text}</div>
                    ) : (
                      <div className={`inc-bubble ${m.senderId === me ? "me" : "them"}`} key={m.id}>
                        {m.text}
                        <time dateTime={m.createdAt}>{clockTime(m.createdAt)}</time>
                      </div>
                    ),
                  )}
                </div>

                <div className="inc-composer">
                  <textarea
                    className="inc-textarea"
                    rows={1}
                    placeholder="Write a message"
                    aria-label="Message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                  />
                  <button type="button" className="inc-btn inc-btn-primary" onClick={send} disabled={!text.trim()}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <p className="inc-convo-empty">Pick a conversation to start chatting.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
