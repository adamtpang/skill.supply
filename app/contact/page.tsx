import type { Metadata } from "next";
import Link from "next/link";
import { InfoSection, InfoShell } from "@/components/info-shell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Adam Pangelinan about skill.supply product feedback, corrections, support, or privacy requests.",
  alternates: { canonical: "/contact" },
};

const CONTACT_EMAIL = "adamtpang@gmail.com";

export default function ContactPage() {
  return (
    <InfoShell
      eyebrow="Contact"
      title="Contact the operator"
      introduction="skill.supply is operated by Adam Pangelinan. There is no contact form, account system, or support ticket database on this page."
    >
      <InfoSection title="Email">
        <p>
          Product feedback, factual corrections, accessibility problems, queue deletion requests,
          and privacy questions can be sent to Adam at{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4 hover:text-brand"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("skill.supply")}`}
          >
            {CONTACT_EMAIL}
          </a>
          . The link opens the visitor&rsquo;s own email application, so nothing is submitted to
          skill.supply merely by viewing or selecting it.
        </p>
      </InfoSection>

      <InfoSection title="What to include">
        <p>
          A useful support note names the page, the action taken, and what happened. A free-queue
          deletion request should include the random report ID from the polling URL if it is still
          available. Never email an Anthropic API key, password, payment card, full private resume,
          or another person&rsquo;s personal information.
        </p>
      </InfoSection>

      <InfoSection title="Privacy and scope">
        <p>
          Email is a person-to-person channel and is handled by the sender&rsquo;s provider and Google,
          not by the skill.supply application. Review the <Link className="underline underline-offset-4 hover:text-foreground" href="/privacy">Privacy page</Link> for
          the product&rsquo;s current data flow. skill.supply is a public beta and does not promise a
          response time, hiring outcome, or placement guarantee.
        </p>
      </InfoSection>
    </InfoShell>
  );
}
