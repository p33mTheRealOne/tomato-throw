"use client";

import { useRef, useState } from "react";

const REASONS = [
  { id: "sexual", label: "Nude or sexual" },
  { id: "violence", label: "Violent or gory" },
  { id: "hate", label: "Hateful or harassing" },
  { id: "private", label: "Shows someone who didn't agree" },
  { id: "other", label: "Something else" },
] as const;

export default function ReportButton({ id }: { id: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const send = async (reason: string) => {
    setState("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button
        type="button"
        className="report-btn"
        aria-haspopup="dialog"
        onClick={() => {
          setState("idle");
          ref.current?.showModal();
        }}
      >
        Report
      </button>

      <dialog
        ref={ref}
        className="contact-dialog"
        aria-labelledby="report-title"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="contact-card">
          <h2 id="report-title" className="contact-title">
            Report this pic
          </h2>
          {state === "done" ? (
            <p className="contact-text" role="status">
              Thanks. Reported pages are reviewed and removed if they break the rules.
            </p>
          ) : (
            <>
              <p className="contact-text">What&apos;s wrong with it?</p>
              <ul className="contact-list">
                {REASONS.map((r) => (
                  <li key={r.id}>
                    <button type="button" className="contact-link report-reason" disabled={state === "sending"} onClick={() => send(r.id)}>
                      <span>{r.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {state === "error" && (
                <p className="notice notice-error" role="alert">
                  Couldn&apos;t send the report. Try again in a minute.
                </p>
              )}
            </>
          )}
          <button type="button" className="key key-small contact-close" onClick={() => ref.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
