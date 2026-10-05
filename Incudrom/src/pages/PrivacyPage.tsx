import { LegalPage, LegalSection } from "../components/LegalPage";
import { SITE } from "../lib/site";

/** Route: /privacy */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {SITE.name} is a platform where college students share startup ideas, find teammates and apply to
        projects. This policy explains what we collect, how we use it and the choices you have.
      </p>

      <LegalSection title="What we collect">
        <ul>
          <li><b>Account details:</b> your name, college email address, college, course and year of study.</li>
          <li><b>Profile details you add:</b> bio, skills, weekly availability, links and portfolio items.</li>
          <li><b>Things you create:</b> ideas you post, applications you send and messages you write.</li>
          <li><b>Technical data:</b> basic information from your browser and device, and data stored in your browser to keep you signed in.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use it">
        <ul>
          <li>To run {SITE.name}: show your profile and ideas to other students, match skills to roles and deliver messages.</li>
          <li>To verify that your college email belongs to you.</li>
          <li>To keep the platform safe, prevent abuse and enforce our Terms of Service.</li>
          <li>To contact you about your account or important changes to the service.</li>
          <li>To understand how the product is used and make it better.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Who can see what">
        <ul>
          <li>Other students on {SITE.name} can see your profile (name, college, course, year, bio, skills, availability, links and portfolio) and the ideas you post.</li>
          <li>An idea's owner can see the applications sent to that idea, including your message and your profile.</li>
          <li>Messages are visible only to the people in that conversation.</li>
          <li>Your email address is not shown to other students.</li>
        </ul>
        <p>Anything you put on your public profile or in an idea can be read by other students, so share only what you're comfortable with.</p>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          We don't sell your personal data. We share it only with service providers that help us run the
          platform (such as hosting, database and email delivery), when the law requires it, or to protect
          the safety of our users and the service.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and browser storage">
        <p>
          We use your browser's storage to keep you signed in and to remember your session. We don't use
          advertising trackers.
        </p>
      </LegalSection>

      <LegalSection title="Storage and security">
        <p>
          We take reasonable steps to protect your data. No online service can promise perfect security, so
          please use a strong password and keep it private.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>Edit your profile any time in Settings.</li>
          <li>Delete your account in Settings. This removes your profile, the ideas you posted, your applications and your messages.</li>
          <li>Ask us about the data we hold on you using the contact details below.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How long we keep data">
        <p>
          We keep your data while your account is active. When you delete your account we remove it, except
          where we must keep something to meet a legal obligation or resolve a dispute. Backups are cleared
          on a regular schedule.
        </p>
      </LegalSection>

      <LegalSection title="Who this is for">
        <p>
          {SITE.name} is for college students who are old enough to agree to these terms where they live. If
          you believe a child's information has been submitted, contact us and we'll remove it.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy as the product changes. When we make important changes we'll tell you in
          the app or by email. The date at the top shows when it was last updated.
        </p>
      </LegalSection>

      {SITE.contactEmail && (
        <LegalSection title="Contact">
          <p>
            Questions about your privacy? Write to <a className="inc-link" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          </p>
        </LegalSection>
      )}
    </LegalPage>
  );
}
