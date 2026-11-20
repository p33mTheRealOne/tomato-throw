import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rules & Privacy",
  description: "The rules for pictures on Tomato Throw, how reports work, and what data the site keeps.",
  alternates: { canonical: "/privacy-terms" },
  robots: { index: true, follow: true },
};

export default function PrivacyTerms() {
  return (
    <main className="about legal">
      <h1 className="about-title">Rules &amp; Privacy</h1>

      <h2 className="legal-h">Pictures</h2>
      <ul className="legal-list">
        <li>Only upload pictures you are allowed to share.</li>
        <li>No nude or sexual pictures, no violence or gore, no hate or harassment.</li>
        <li>No photos of people who have not agreed to it. Never upload pictures of children.</li>
        <li>Anyone with the link can see a picture. Don&apos;t upload anything private.</li>
      </ul>

      <h2 className="legal-h">Reports and removal</h2>
      <p>
        Every picture page has a Report button. When enough different people report a picture, it is deleted
        automatically. Pictures that break the rules can also be removed by hand, without notice.
      </p>

      <h2 className="legal-h">What the site keeps</h2>
      <ul className="legal-list">
        <li>Your picture and the name you typed, until it is removed. There are no accounts.</li>
        <li>For reports, a short one-way hash of the reporter&apos;s network address, so one person can&apos;t report the same picture many times. The address itself is not stored.</li>
        <li>Your server host may keep normal request logs.</li>
      </ul>

      <h2 className="legal-h">No promises</h2>
      <p>Tomato Throw is a free fun project, provided as is. Pictures may be deleted at any time.</p>

      <p>
        <Link className="key key-small" href="/">
          Back home
        </Link>
      </p>
    </main>
  );
}
