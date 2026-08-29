import type { Metadata } from "next";
import Link from "next/link";
import { InfoSection, InfoShell } from "@/components/info-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "What skill.supply does, who it serves, its current beta status, and who operates it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoShell
      eyebrow="About"
      title="A transfer market for human talent"
      introduction="skill.supply helps capable people turn a messy background into evidence a hiring team can understand. The current product is a public beta operated by Adam Pangelinan."
    >
      <InfoSection title="What the product does">
        <p>
          The career agent accepts a resume, LinkedIn profile, or a few honest paragraphs. It
          returns a positioning line, an ikigai-market read, five target companies or company
          archetypes, an ATS-friendly resume, and a draft opening message. Every output is a draft
          for the job seeker to review, not a verified hiring decision.
        </p>
        <p>
          The broader skill.supply site also publishes company research, live job-discovery tools,
          and an application-packet builder. The application tool prepares evidence for a browser
          agent, but the person keeps the final submission action. skill.supply does not submit an
          application or contact another person on the user&rsquo;s behalf.
        </p>
      </InfoSection>

      <InfoSection title="Who it is for">
        <p>
          Job seekers and career changers are the primary users. The product is most useful when
          someone has real work, responsibilities, or results but has not yet packaged that proof
          into a clear market story. The agent is instructed to preserve uncertainty and never
          invent employers, titles, dates, metrics, education, or skills.
        </p>
      </InfoSection>

      <InfoSection title="Price and commercial status">
        <p>
          The candidate price is $0. There is no paid seeker plan, free trial, checkout, refund
          policy, or placement guarantee on skill.supply. A direct report uses the job seeker&rsquo;s
          Anthropic API key, while the optional free queue uses Adam&rsquo;s local worker. Company-side
          talent work is handled separately by <a className="underline underline-offset-4 hover:text-foreground" href="https://darktalent.tech">darktalent.tech</a>.
        </p>
      </InfoSection>

      <InfoSection title="Operator and accountability">
        <p>
          skill.supply is built and operated by Adam Pangelinan. Adam&rsquo;s public work is available
          at <a className="underline underline-offset-4 hover:text-foreground" href="https://adampang.com">adampang.com</a>,
          and the source repository is available on <a className="underline underline-offset-4 hover:text-foreground" href="https://github.com/adamtpang/skill.supply">GitHub</a>.
          Product questions, corrections, and privacy requests can start on the <Link className="underline underline-offset-4 hover:text-foreground" href="/contact">Contact page</Link>.
        </p>
      </InfoSection>
    </InfoShell>
  );
}
