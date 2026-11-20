"use client";

import { useRef } from "react";
import { FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { CONTACTS } from "@/lib/contacts";

const ICONS = {
  x: FaXTwitter,
  github: FaGithub,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
} as const;

export default function ContactButton() {
  const ref = useRef<HTMLDialogElement>(null);
  if (CONTACTS.length === 0) return null;

  return (
    <>
      <button type="button" className="key key-small contact-btn" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        Contact
      </button>

      <dialog
        ref={ref}
        className="contact-dialog"
        aria-labelledby="contact-title"
        onClick={(e) => {
          // click on the backdrop (the <dialog> itself) closes it
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="contact-card">
          <h2 id="contact-title" className="contact-title">
            Dev&apos;s contact
          </h2>
          <p className="contact-text">Found a bug or made a great splat? Say hi.</p>
          <ul className="contact-list">
            {CONTACTS.map((c) => {
              const Icon = ICONS[c.id];
              return (
                <li key={c.id}>
                  <a className="contact-link" href={c.url} target="_blank" rel="noopener noreferrer">
                    <Icon aria-hidden="true" className="contact-icon" />
                    <span>{c.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <button type="button" className="key key-small contact-close" onClick={() => ref.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
