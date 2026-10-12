import { useState } from "react";
import type { Project } from "../types";
import { Modal } from "./Modal";
import { Chip } from "./ui";

interface Props {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ project, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/projects/${project.id}`;

  const shareText = `Check out "${project.title}" on Incudorm — ${project.pitch}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const input = document.getElementById("share-url-input") as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.pitch,
          url: shareUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const socials = [
    {
      name: "WhatsApp",
      tone: "mint",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      tone: "lilac",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      tone: "sun",
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l11.7 16h4.3L8.3 4H4z" />
          <path d="M4 20l6.8-7.3M13.2 11.3L20 4" />
        </svg>
      ),
    },
    {
      name: "Email",
      tone: "default",
      url: `mailto:?subject=${encodeURIComponent(`Incudorm idea: ${project.title}`)}&body=${encodeURIComponent(
        `Hey!\n\nCheck out this student project on Incudorm:\n\n${project.title}\n${project.pitch}\n\nView details & apply here: ${shareUrl}\n`
      )}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Share idea">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        {/* Project Mini Preview */}
        <div
          style={{
            padding: "1rem",
            background: "var(--inc-chip)",
            borderRadius: "14px",
            border: "2px solid var(--inc-line)",
          }}
        >
          <div style={{ display: "flex", gap: ".5rem", marginBottom: ".4rem" }}>
            <Chip tone="sun">{project.stage}</Chip>
            <Chip>{project.hoursPerWeek} hrs/week</Chip>
          </div>
          <b style={{ fontSize: "1.15rem", display: "block" }}>{project.title}</b>
          <p className="inc-muted inc-small" style={{ marginTop: ".25rem", lineHeight: 1.4 }}>
            {project.pitch}
          </p>
        </div>

        {/* Copy Link Input */}
        <div>
          <label htmlFor="share-url-input" className="inc-label" style={{ display: "block", marginBottom: ".4rem" }}>
            Direct project link
          </label>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <input
              id="share-url-input"
              className="inc-input"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              style={{ fontSize: ".92rem" }}
            />
            <button
              type="button"
              className={`inc-btn ${copied ? "inc-btn-mint" : "inc-btn-primary"}`}
              style={{ minWidth: "115px", whiteSpace: "nowrap" }}
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Native share on mobile */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            className="inc-btn inc-btn-ghost inc-btn-block"
            onClick={handleNativeShare}
            style={{ display: "flex", gap: ".6rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share via device...
          </button>
        )}

        {/* Social Quick Share */}
        <div>
          <span className="inc-label" style={{ display: "block", marginBottom: ".6rem" }}>
            Share to
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: ".6rem" }}>
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inc-btn inc-btn-ghost"
                style={{
                  padding: ".6rem .75rem",
                  fontSize: ".88rem",
                  display: "flex",
                  gap: ".45rem",
                  justifyContent: "center",
                }}
              >
                {s.icon}
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
