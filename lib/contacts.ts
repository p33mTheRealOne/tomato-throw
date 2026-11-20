/**
 * Dev's contact links shown in the Contact dialog.
 * Fill in your URLs below (or set the NEXT_PUBLIC_CONTACT_* env vars on Vercel).
 * Entries with an empty URL are simply not shown.
 */
export type Contact = { id: "x" | "github" | "linkedin" | "instagram"; label: string; url: string };

const clean = (v: string | undefined) => (v && /^https:\/\/[^\s]+$/.test(v) ? v : "");

export const CONTACTS: Contact[] = (
  [
    { id: "x", label: "X", url: clean(process.env.NEXT_PUBLIC_CONTACT_X) || "" },
    { id: "github", label: "GitHub", url: clean(process.env.NEXT_PUBLIC_CONTACT_GITHUB) || "https://github.com/p33mTheRealOne" },
    { id: "linkedin", label: "LinkedIn", url: clean(process.env.NEXT_PUBLIC_CONTACT_LINKEDIN) || "" },
    { id: "instagram", label: "Instagram", url: clean(process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM) || "" },
  ] satisfies Contact[]
).filter((c) => c.url);
