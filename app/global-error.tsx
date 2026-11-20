"use client";

import "@fontsource/anton/latin-400.css";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="notfound">
          <h1 className="notfound-title">Something splatted.</h1>
          <p className="notfound-text">That one is on us. Give it another go.</p>
          <div className="notfound-actions">
            <button type="button" className="key key-red" onClick={() => reset()}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
