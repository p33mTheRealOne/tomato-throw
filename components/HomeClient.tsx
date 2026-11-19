"use client";

import { useEffect, useRef, useState } from "react";
import Tomato from "./Tomato";

const MAX_BYTES = 30 * 1024 * 1024;
const SHRINK_OVER = 3 * 1024 * 1024; // downscale bigger photos before upload

async function shrink(file: File): Promise<File> {
  if (file.size <= SHRINK_OVER || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export default function HomeClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (f: File | undefined) => {
    setLink(null);
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("ไฟล์นี้ไม่ใช่รูป! 🤨");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("รูปใหญ่เกิน 30MB! 😭");
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
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const extra = data.detail ? `\n(${data.detail})` : "";
        throw new Error((data.error || `อัปโหลดไม่สำเร็จ (${res.status})`) + extra);
      }
      setLink(`${window.location.origin}${data.path}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="home">
      <Tomato className="home-tomato" />

      <h1 className="meme-title">
        THROW<br />
        <span>THE TOMATO</span>
      </h1>
      <p className="meme-sub">อัปโหลดรูป → ได้ลิงก์ → ปามะเขือเทศใส่ 🍅</p>

      {preview && (
        <div className="polaroid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" />
        </div>
      )}

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

      <div className="btn-col">
        <button className="meme-btn meme-btn-blue" onClick={() => inputRef.current?.click()}>
          📸 UPLOAD รูป
        </button>
        <button className="meme-btn meme-btn-red" onClick={create} disabled={!file || busy}>
          {busy ? "กำลังสร้าง..." : "🍅 สร้างเว็บ PAGE"}
        </button>
      </div>

      {error && <div className="sticker sticker-error">{error}</div>}

      {link && (
        <div className="sticker sticker-ok">
          <div className="sticker-title">เสร็จแล้ว!!! 🎉</div>
          <a className="link-box" href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
          <div className="btn-row">
            <button className="meme-btn meme-btn-small" onClick={copy}>
              {copied ? "✅ COPIED" : "📋 COPY"}
            </button>
            <a className="meme-btn meme-btn-small meme-btn-green" href={link} target="_blank" rel="noreferrer">
              🚀 OPEN
            </a>
          </div>
        </div>
      )}

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>🍅 TOMATO TIME 🍅 SPLAT 🍅 </span>
          ))}
        </div>
      </div>
    </main>
  );
}
