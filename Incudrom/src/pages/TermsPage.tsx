import { LegalPage, LegalSection } from "../components/LegalPage";
import { SITE } from "../lib/site";

/** Route: /terms */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        By creating an account or using {SITE.name} you agree to these terms. If you don't agree, please
        don't use the service.
      </p>

      <LegalSection title="Who can use Incudorm">
        <p>
          {SITE.name} is for currently enrolled college and university students. You need a college email
          address you can access, and you must be old enough to enter a binding agreement where you live.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <ul>
          <li>Give accurate information and keep it up to date.</li>
          <li>Keep your password private. You're responsible for what happens under your account.</li>
          <li>One person, one account. Don't pretend to be someone else.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What we do and don't do">
        <p>
          {SITE.name} helps students find each other. We are not a party to any agreement between students,
          we don't check people's skills or claims, and we can't promise you'll find teammates or that a
          project will succeed.
        </p>
      </LegalSection>

      <LegalSection title="Ideas and content you post">
        <ul>
          <li>You own what you post. You give {SITE.name} permission to store it and show it to other users so the service works.</li>
          <li>Ideas you post are visible to other students. Don't post anything confidential, and don't share anything you can't afford to have others see.</li>
          <li>{SITE.name} doesn't provide confidentiality, non-disclosure or intellectual property protection for ideas.</li>
          <li>Only post content you have the right to share.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Working with other students">
        <p>
          Teams are responsible for their own arrangements. Before you invest serious time or money,
          agree in writing who owns what, who does what and how decisions are made. Your college may also have
          its own rules about work done with its resources, so check them.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>Don't use {SITE.name} to:</p>
        <ul>
          <li>harass, threaten, discriminate against or spam anyone;</li>
          <li>post illegal, hateful, sexual or misleading content;</li>
          <li>share other people's private information without permission;</li>
          <li>run scams, solicit money under false pretenses or advertise unrelated products;</li>
          <li>scrape, copy or collect data from the platform, or try to break or bypass its security.</li>
        </ul>
        <p>We may remove content or suspend accounts that break these rules.</p>
      </LegalSection>

      <LegalSection title="Staying safe">
        <p>
          Be careful when sharing personal details or meeting people in person. Meet in public places and
          tell someone you trust. If someone makes you uncomfortable, stop talking to them and report it.
        </p>
      </LegalSection>

      <LegalSection title="Ending your account">
        <p>
          You can delete your account at any time in Settings. We may suspend or remove accounts that
          break these terms or put others at risk.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers">
        <p>
          {SITE.name} is provided "as is" and "as available". We don't guarantee it will always work without
          interruption or errors, and we're not responsible for content posted by users.
        </p>
      </LegalSection>

      <LegalSection title="Limits on our liability">
        <p>
          To the fullest extent the law allows, {SITE.name} isn't liable for indirect or consequential losses,
          lost opportunities or disputes between users that arise from using the service.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as the product changes. If you keep using {SITE.name} after an update, you
          accept the new terms. The date at the top shows when they were last updated.
        </p>
      </LegalSection>

      {SITE.governingLaw && (
        <LegalSection title="Governing law">
          <p>These terms are governed by the laws of {SITE.governingLaw}.</p>
        </LegalSection>
      )}

      {SITE.contactEmail && (
        <LegalSection title="Contact">
          <p>
            Questions about these terms? Write to <a className="inc-link" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          </p>
        </LegalSection>
      )}
    </LegalPage>
  );
}
