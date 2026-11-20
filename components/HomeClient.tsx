"use client";

import { useEffect, useRef, useState } from "react";
import Tomato from "./Tomato";
import Splat from "./Splat";
import ContactButton from "./ContactButton";

const MAX_INPUT = 40 * 1024 * 1024; // before downsizing
const UPLOAD_LIMIT = 4 * 1024 * 1024; // Vercel request bodies max out at 4.5 MB

const MESSAGES: Record<string, string> = {
  no_file: "Pick a picture first.",
  too_large: "That picture is too big. Try a smaller one.",
  not_image: "Only PNG, JPG, WEBP or GIF files work.",
  bad_request: "Upload failed. Try again.",
  server: "Upload failed. Please try again in a minute.",
  rate_limited: "Slow down! Too many uploads. Try again in a few minutes.",
};
const GENERIC_ERROR = "Upload failed. Please try again.";

/** Shrink big photos in the browser so they fit the upload limit (GIFs are sent as-is). */
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size <= UPLOAD_LIMIT * 0.85) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const g = canvas.getContext("2d");
  if (!g) return file;
  g.fillStyle = "#fff"; // JPEG has no transparency
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  for (let q = 0.88; q >= 0.4; q -= 0.12) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
    if (blob && blob.size <= UPLOAD_LIMIT) {
      return new File([blob], "photo.jpg", { type: "image/jpeg" });
    }
  }
  return file;
}

// Fixed background splats so the page looks "already thrown at" (purely decorative).
const DECOR = [
  { left: "7%", top: "14%", scale: 0.9, seed: 11, rot: 20 },
  { left: "93%", top: "22%", scale: 1.15, seed: 42, rot: 200 },
  { left: "10%", top: "84%", scale: 1.1, seed: 77, rot: 95 },
  { left: "90%", top: "82%", scale: 0.8, seed: 5, rot: 310 },
];

type Stage = "empty" | "picked" | "busy" | "done";

const CAPTIONS: Record<Stage, [string, string]> = {
  empty: ["Upload any pic", "Then throw tomatoes"],
  picked: ["Nice pic", "Now create the page"],
  busy: ["Hold on", "Washing the tomatoes"],
  done: ["Page is live", "Go throw some"],
};

export default function HomeClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const stage: Stage = busy ? "busy" : link ? "done" : file ? "picked" : "empty";
  const [top, bottom] = CAPTIONS[stage];

  const onPick = (f: File | undefined) => {
    setLink(null);
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That file is not a picture.");
      return;
    }
    if (f.size > MAX_INPUT || (f.type === "image/gif" && f.size > UPLOAD_LIMIT)) {
      setError("That picture is too big. Try a smaller one (GIFs: 4 MB max).");
      return;
    }
    setFile(f);
  };

  const create = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", await shrink(file));
      body.append("name", name.trim());
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) {
        const known = typeof data.error === "string" ? MESSAGES[data.error] : undefined;
        setError(known ?? (res.status === 413 ? MESSAGES.too_large : GENERIC_ERROR));
        return;
      }
      setLink(`${window.location.origin}${data.path}`);
    } catch {
      setError("No connection. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: the link is still selectable */
    }
  };

  return (
    <main>
    <section className="home">
      <div className="decor" aria-hidden="true">
        {DECOR.map((d) => (
          <div key={d.seed} className="decor-item" style={{ left: d.left, top: d.top, transform: `translate(-50%, -50%) scale(${d.scale})` }}>
            <Splat seed={d.seed} size={200} x={100} y={100} rot={d.rot} />
          </div>
        ))}
      </div>

      <div className="home-grid">
        <header className="wordmark">
          <Tomato className="wordmark-tomato" />
          <h1>
            Tomato <br />
            Throw
          </h1>
        </header>

        <button
          type="button"
          className={`canvas${dragging ? " canvas-drag" : ""}${preview ? " canvas-filled" : ""}`}
          aria-label={file ? "Change picture" : "Choose a picture to upload"}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onPick(e.dataTransfer.files?.[0]);
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="canvas-img" src={preview} alt="Preview of your picture" />
          ) : (
            <Tomato className="canvas-tomato" />
          )}
          {busy && <span className="canvas-shimmer skeleton" aria-hidden="true" />}
          <span className="caption caption-top" aria-hidden="true">
            {top}
          </span>
          <span className="caption caption-bottom" aria-hidden="true">
            {bottom}
          </span>
        </button>

        <form
          className="controls"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {file && !link && (
            <div className="field">
              <label className="field-label" htmlFor="pic-name">
                Name your pic <span className="field-optional">(optional)</span>
              </label>
              <input
                id="pic-name"
                className="field-input"
                type="text"
                name="title"
                value={name}
                maxLength={40}
                placeholder="e.g. My cat Gary"
                autoComplete="off"
                enterKeyHint="go"
                spellCheck={false}
                disabled={busy}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="field-count" aria-hidden="true">
                {name.length}/40
              </span>
            </div>
          )}

          <div className="key-row">
            <button type="button" className="key" onClick={() => inputRef.current?.click()}>
              Upload pic
            </button>
            <button type="submit" className="key key-red" disabled={!file || busy}>
              {busy ? "Creating…" : "Create page"}
            </button>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {stage === "picked" && "Picture ready. Press Create page."}
            {stage === "busy" && "Creating your page."}
            {stage === "done" && "Your page is live."}
          </p>

          <p className="rules">
            By uploading you confirm you may share this picture. No nude, violent or hateful pics, and no photos of
            people who haven&apos;t agreed. Anyone can report a page and reported pages get removed.
          </p>

          {error && (
            <p className="notice notice-error" role="alert">
              {error}
            </p>
          )}

          {link && (
            <div className="notice notice-link">
              <span className="notice-label">Your link</span>
              <a className="link-text" href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
              <div className="key-row key-row-small">
                <button type="button" className="key key-small" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
                <a className="key key-small key-green" href={link} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
              <span className="sr-only" role="status" aria-live="polite">
                {copied ? "Link copied to clipboard" : ""}
              </span>
            </div>
          )}
        </form>
      </div>

      <div className="contact-wrap">
        <ContactButton />
      </div>
    </section>

    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title" className="about-title">
        How Tomato Throw works
      </h2>
      <ol className="about-steps">
        <li>
          <strong>Upload any picture.</strong> Pick a PNG, JPG, WEBP or GIF from your phone or computer, or drag it onto the page.
        </li>
        <li>
          <strong>Name it and create the page.</strong> Give your picture a name, press Create page, and get a shareable link in seconds.
        </li>
        <li>
          <strong>Throw tomatoes.</strong> Open the link, tap or click anywhere, and a tomato flies in and splats exactly where you aimed.
        </li>
      </ol>
      <p className="about-note">
        Tomato Throw is free, needs no account and works on phones, tablets and desktops. Anyone with your link can see your picture, so
        do not upload anything private.
      </p>
    </section>
    </main>
  );
}
