import type { Metadata } from "next";
import Link from "next/link";
import { InfoSection, InfoShell } from "@/components/info-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How skill.supply handles pasted career data, API keys, queued reports, analytics, local browser storage, sharing, and optional talent-pool data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoShell
      eyebrow="Privacy · updated August 29, 2026"
      title="What skill.supply receives and why"
      introduction="skill.supply is a public beta operated by Adam Pangelinan. This page describes the collection and sharing paths present in the current source and production deployment."
    >
      <InfoSection title="Public pages, hosting, and analytics">
        <p>
          Vercel hosts skill.supply and necessarily receives technical request information needed
          to deliver the site, such as the requested URL, network address, device or browser
          details, response status, and timing. The initial public page response sets no cookies,
          and skill.supply has no user account or login system.
        </p>
        <p>
          The site includes Vercel Web Analytics for page-level usage measurement when Vercel
          enables its analytics script. The application defines no custom analytics events and
          does not intentionally send resume text, report text, Anthropic API keys, application
          fields, or contact-message content through analytics.
        </p>
      </InfoSection>

      <InfoSection title="Direct career-agent runs">
        <p>
          A direct run sends the pasted background and the user-supplied Anthropic API key to a
          skill.supply server function, which passes them to Anthropic to generate the report. The
          application code does not log or persist that API key or direct-run background
          server-side. The browser remembers the API key in local storage for later runs until the
          user selects Change it or clears site data.
        </p>
      </InfoSection>

      <InfoSection title="Optional free queue">
        <p>
          The free queue sends the pasted background to a Neon database with a random report ID.
          Adam&rsquo;s local worker reads that text and uses Claude to prepare the report. The worker
          clears the original background when processing ends, including after an error or a
          request for more information.
        </p>
        <p>
          The completed report, processing status, question, or error remains in the queue record
          so the submitting browser can retrieve it by random ID. The current code does not run an
          automatic deletion job for that finished record. A user can request deletion through the
          Contact page and should avoid the free queue for information they do not want stored in
          that form.
        </p>
      </InfoSection>

      <InfoSection title="Share links and application packets">
        <p>
          A shareable report is compressed into the URL fragment after the hash character. Browsers
          do not send that fragment to skill.supply during an ordinary page request, but anyone
          with the full link can decode and read the report. A user controls whether and where the
          link is copied or posted.
        </p>
        <p>
          The application-packet builder keeps its form fields in the browser. A report can place
          resume evidence in session storage long enough to open the application page, and the
          user can download the finished packet as a local JSON file. The page does not submit the
          packet to skill.supply or to an employer.
        </p>
      </InfoSection>

      <InfoSection title="Optional darktalent opt-in">
        <p>
          A completed report offers a separate, explicit opt-in to darktalent.tech. Submitting that
          form sends the GitHub username, report display name, report headline, skill.supply origin,
          and the user&rsquo;s display and contact-consent choices to darktalent.tech. It does not send
          the full resume or full report in that request. The user can leave the form untouched.
        </p>
      </InfoSection>

      <InfoSection title="Contact, payments, and choices">
        <p>
          The public contact link opens email, or WhatsApp when that deployment option is configured.
          Any message is then handled by the visitor&rsquo;s chosen provider and Adam&rsquo;s provider.
          skill.supply has no candidate checkout, payment processor, or stored payment details, and
          it does not sell candidate personal data.
        </p>
        <p>
          Users can clear the saved Anthropic key through Change it, clear browser storage through
          browser settings, avoid sharing a report link, skip the free queue, and skip the
          darktalent opt-in. Questions and deletion requests can be sent through the{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/contact">Contact page</Link>.
        </p>
      </InfoSection>
    </InfoShell>
  );
}
