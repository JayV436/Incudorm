import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../appContext";
import { Field } from "../components/ui";
import { supabase } from "../lib/supabase";

type FeedbackCategory = "feature" | "bug" | "college" | "general";

const CATEGORIES: { id: FeedbackCategory; label: string; icon: string; desc: string }[] = [
  { id: "feature", label: "Feature Idea", icon: "Idea", desc: "Something you wish Incudorm could do" },
  { id: "bug", label: "Bug Report", icon: "Bug", desc: "Something isn't working as expected" },
  { id: "college", label: "College Request", icon: "Campus", desc: "Request support for your campus or domain" },
  { id: "general", label: "General Feedback", icon: "Chat", desc: "Thoughts, praise, or suggestions" },
];

const RATINGS = [
  { val: 1, label: "Poor" },
  { val: 2, label: "Fair" },
  { val: 3, label: "Okay" },
  { val: 4, label: "Good" },
  { val: 5, label: "Loving it!" },
];

export default function FeedbackPage() {
  const { currentUser } = useApp();

  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!message.trim() || message.trim().length < 5) {
      setError("Please enter a short message describing your feedback (at least 5 characters).");
      return;
    }

    setSubmitting(true);

    const contactEmail = anonymous
      ? null
      : currentUser?.email || email.trim() || null;

    const payload = {
      user_id: anonymous ? null : currentUser?.id || null,
      user_name: anonymous ? null : currentUser?.name || null,
      contact_email: contactEmail,
      category,
      rating,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Attempt to insert into Supabase feedback table
      const { error: dbError } = await supabase.from("feedback").insert(payload);

      if (dbError) {
        // If the table does not exist yet or RLS blocks it, save locally as fallback
        console.warn("Supabase feedback insert fallback:", dbError.message);
        saveLocalFeedback(payload);
      }
    } catch (err) {
      console.warn("Feedback network error fallback:", err);
      saveLocalFeedback(payload);
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  function saveLocalFeedback(entry: Record<string, unknown>) {
    try {
      const existing = JSON.parse(localStorage.getItem("incudorm:feedback") || "[]");
      localStorage.setItem("incudorm:feedback", JSON.stringify([entry, ...existing]));
    } catch {
      // storage quota or blocked
    }
  }

  function handleReset() {
    setMessage("");
    setSubmitted(false);
    setError("");
  }

  return (
    <div className="inc-stack" style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem 0 3rem" }}>
      <div>
        <span className="inc-banner" style={{ display: "inline-block", padding: ".3rem .8rem", fontSize: ".88rem", marginBottom: "1rem" }}>
          Community & Product
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800 }}>Help us shape Incudorm</h1>
        <p className="inc-muted" style={{ fontSize: "1.1rem", marginTop: ".4rem", lineHeight: 1.5 }}>
          Built by students, for students. Share your thoughts, report a bug, or request a feature to make finding teammates effortless.
        </p>
      </div>

      {submitted ? (
        <section className="inc-card ink" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: ".6rem", color: "var(--inc-brand)" }}>Feedback received</div>
          <h2>Thank you for your feedback!</h2>
          <p className="inc-muted" style={{ margin: ".8rem auto 1.8rem", maxWidth: "48ch" }}>
            Every submission is reviewed by our team. Your input directly helps us make Incudorm better for creators and builders across campuses.
          </p>
          <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/projects" className="inc-btn inc-btn-primary">
              Explore ideas
            </Link>
            <button type="button" className="inc-btn inc-btn-ghost" onClick={handleReset}>
              Send another note
            </button>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="inc-card ink" noValidate>
          {/* Category Picker */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="inc-label" style={{ display: "block", marginBottom: ".6rem" }}>
              What kind of feedback do you have?
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: ".6rem" }}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className="inc-card"
                    style={{
                      padding: ".85rem .75rem",
                      textAlign: "left",
                      cursor: "pointer",
                      borderWidth: "2px",
                      borderColor: active ? "var(--inc-brand)" : "var(--inc-line)",
                      background: active ? "var(--inc-chip)" : "var(--inc-paper)",
                      boxShadow: active ? "3px 3px 0 var(--inc-brand)" : "none",
                      transition: "all .15s ease",
                    }}
                  >
                    <span style={{ fontSize: ".75rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", display: "inline-block", padding: ".15rem .45rem", borderRadius: "4px", background: "var(--inc-line)", color: "var(--inc-ink)", marginBottom: ".4rem" }}>{cat.icon}</span>
                    <b style={{ display: "block", fontSize: ".95rem", color: "var(--inc-ink)" }}>{cat.label}</b>
                    <span className="inc-muted inc-small" style={{ display: "block", marginTop: ".15rem", lineHeight: 1.3 }}>
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="inc-label" style={{ display: "block", marginBottom: ".5rem" }}>
              How is your experience with Incudorm so far?
            </label>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              {RATINGS.map((r) => {
                const selected = rating === r.val;
                return (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRating(r.val)}
                    className={`inc-toggle ${selected ? "active" : ""}`}
                    aria-pressed={selected}
                    style={{
                      padding: ".5rem .9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: ".4rem",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: ".9rem", minWidth: "1.2em", textAlign: "center" }}>{r.val}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <Field
            label="Your message"
            htmlFor="feedback-msg"
            hint={`${message.length}/3000. Describe your thoughts, suggestions, or issue in detail.`}
          >
            <textarea
              id="feedback-msg"
              className="inc-textarea"
              style={{ minHeight: "140px" }}
              maxLength={3000}
              placeholder={
                category === "feature"
                  ? "I'd love it if Incudorm could..."
                  : category === "bug"
                  ? "I noticed that when I click on..."
                  : category === "college"
                  ? "Could you add support for my college or email domain..."
                  : "Here's what I think about the platform..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          {/* User info / Anonymous toggle */}
          {currentUser ? (
            <div
              style={{
                background: "var(--inc-chip)",
                padding: "1rem",
                borderRadius: "14px",
                marginBottom: "1.5rem",
                border: "2px solid var(--inc-line)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div>
                  <span className="inc-muted inc-small" style={{ display: "block" }}>Submitting as:</span>
                  <b>{currentUser.name}</b> <span className="inc-muted">({currentUser.email})</span>
                </div>
                <label className="inc-radio" style={{ padding: ".4rem .6rem", margin: 0, fontSize: ".9rem" }}>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    style={{ marginTop: "2px" }}
                  />
                  <span>Submit anonymously</span>
                </label>
              </div>
            </div>
          ) : (
            <Field label="Your email (optional)" htmlFor="feedback-email" hint="If you'd like us to reply or follow up with you.">
              <input
                id="feedback-email"
                type="email"
                className="inc-input"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          )}

          {error && (
            <p className="inc-error" role="alert" style={{ marginBottom: "1.2rem" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: ".8rem" }}>
            <Link to="/projects" className="inc-btn inc-btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="inc-btn inc-btn-primary" disabled={submitting}>
              {submitting ? "Sending..." : "Submit feedback"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
