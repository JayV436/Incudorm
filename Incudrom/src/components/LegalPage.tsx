import type { ReactNode } from "react";
import { SITE } from "../lib/site";
import { longDate } from "../lib/format";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="inc-legal">
      <h1>{title}</h1>
      <p className="inc-muted">Last updated {longDate(SITE.legalUpdated)}</p>
      {children}
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
