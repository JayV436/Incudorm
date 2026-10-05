import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../appContext";
import { AppStyles } from "../styles";
import { Field, Logo, SkillPicker } from "../components/ui";
import { GOALS, HOURS_OPTIONS, YEARS } from "../types";
import type { Goal } from "../types";

const GOAL_COPY: Record<Goal, { title: string; text: string }> = {
  post: { title: "I have an idea", text: "I want to find teammates for something I'm building." },
  join: { title: "I want to join a project", text: "I want to put my skills to work on someone's idea." },
  both: { title: "Both", text: "I'd like to post an idea and also join other projects." },
};

const STEPS = ["Goal", "About you", "Skills", "Availability"] as const;

/** Route: /onboarding. Shown once after email verification. */
export default function OnboardingPage() {
  const { currentUser, updateProfile } = useApp();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>(currentUser?.goal ?? "both");
  const [college, setCollege] = useState(currentUser?.college ?? "");
  const [course, setCourse] = useState(currentUser?.course ?? "");
  const [year, setYear] = useState<string>(currentUser?.year ?? YEARS[0]);
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [skills, setSkills] = useState<string[]>(currentUser?.skills ?? []);
  const [hours, setHours] = useState(currentUser?.hoursPerWeek ?? 6);
  const [links, setLinks] = useState(currentUser?.links ?? { github: "", linkedin: "", website: "" });
  const [error, setError] = useState("");
  // Set when setup is finished so we always land on the page the student chose.
  const [doneTo, setDoneTo] = useState<string | null>(null);

  if (doneTo) return <Navigate to={doneTo} replace />;
  if (!currentUser) return <Navigate to="/auth?mode=login" replace />;
  if (!currentUser.verified) return <Navigate to="/auth?mode=verify" replace />;
  if (currentUser.onboarded) return <Navigate to="/projects" replace />;

  const last = step === STEPS.length - 1;

  function next() {
    setError("");
    if (step === 1 && !college.trim()) {
      setError("Enter your college name.");
      return;
    }
    setStep((s) => s + 1);
  }

  function finish() {
    updateProfile({
      goal,
      college: college.trim(),
      course: course.trim(),
      year,
      bio: bio.trim(),
      skills,
      hoursPerWeek: hours,
      links,
      onboarded: true,
    });
    setDoneTo(goal === "post" ? "/projects/create" : "/projects");
  }

  return (
    <div className="incudorm">
      <AppStyles />
      <div className="inc-auth">
        <div className="inc-auth-box" style={{ width: "min(620px,100%)" }}>
          <Logo />

          <div className="inc-card ink">
            <p className="inc-muted inc-small" aria-live="polite">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
            <div className="inc-progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
              <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            {step === 0 && (
              <div>
                <h1>What brings you to Incudorm?</h1>
                <p className="inc-muted" style={{ margin: ".4rem 0 1.2rem" }}>
                  We'll point you to the right place first. You can do both later.
                </p>
                <div style={{ display: "grid", gap: ".6rem" }}>
                  {GOALS.map((g) => (
                    <label className="inc-radio" key={g}>
                      <input type="radio" name="goal" checked={goal === g} onChange={() => setGoal(g)} />
                      <span>
                        <b>{GOAL_COPY[g].title}</b>
                        <span className="inc-muted inc-small" style={{ display: "block" }}>{GOAL_COPY[g].text}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1>Tell us about you</h1>
                <p className="inc-muted" style={{ margin: ".4rem 0 1.2rem" }}>
                  Other students see this on your profile.
                </p>
                <Field label="College" htmlFor="o-college">
                  <input id="o-college" className="inc-input" value={college} onChange={(e) => setCollege(e.target.value)} />
                </Field>
                <div className="inc-row two">
                  <Field label="Course" htmlFor="o-course">
                    <input id="o-course" className="inc-input" value={course} onChange={(e) => setCourse(e.target.value)} />
                  </Field>
                  <Field label="Year" htmlFor="o-year">
                    <select id="o-year" className="inc-select" value={year} onChange={(e) => setYear(e.target.value)}>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Short bio" htmlFor="o-bio" hint={`${bio.length}/280. What you've built or want to build.`}>
                  <textarea id="o-bio" className="inc-textarea" maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1>What are you good at?</h1>
                <p className="inc-muted" style={{ margin: ".4rem 0 1.2rem" }}>
                  Pick the skills you can bring to a team. We use them to match you with ideas that need them.
                </p>
                <SkillPicker value={skills} onChange={setSkills} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h1>How much time can you give?</h1>
                <p className="inc-muted" style={{ margin: ".4rem 0 1.2rem" }}>
                  Be honest. Idea owners list the hours they expect, so this helps you find a fit.
                </p>
                <Field label="Hours per week" htmlFor="o-hours">
                  <select id="o-hours" className="inc-select" style={{ maxWidth: 220 }} value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                    {HOURS_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h} hrs/week</option>
                    ))}
                  </select>
                </Field>
                <p className="inc-label" style={{ margin: "1rem 0 .6rem" }}>Links (optional)</p>
                <div className="inc-row three">
                  <Field label="GitHub" htmlFor="o-gh">
                    <input id="o-gh" className="inc-input" placeholder="github.com/you" value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} />
                  </Field>
                  <Field label="LinkedIn" htmlFor="o-li">
                    <input id="o-li" className="inc-input" placeholder="linkedin.com/in/you" value={links.linkedin} onChange={(e) => setLinks({ ...links, linkedin: e.target.value })} />
                  </Field>
                  <Field label="Website" htmlFor="o-web">
                    <input id="o-web" className="inc-input" placeholder="yoursite.com" value={links.website} onChange={(e) => setLinks({ ...links, website: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}

            {error && <p className="inc-error" role="alert" style={{ marginTop: ".6rem" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap", marginTop: "1.6rem" }}>
              {step > 0 ? (
                <button type="button" className="inc-btn inc-btn-ghost" onClick={() => setStep((s) => s - 1)}>Back</button>
              ) : (
                <span />
              )}
              <div style={{ display: "flex", gap: ".6rem" }}>
                {step === 2 && skills.length === 0 && (
                  <button type="button" className="inc-btn inc-btn-ghost" onClick={next}>Skip for now</button>
                )}
                {last ? (
                  <button type="button" className="inc-btn inc-btn-primary" onClick={finish}>Finish setup</button>
                ) : (
                  <button type="button" className="inc-btn inc-btn-primary" onClick={next}>Continue</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
