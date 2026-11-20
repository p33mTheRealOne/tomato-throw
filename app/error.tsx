"use client";

import Link from "next/link";
import Tomato from "@/components/Tomato";

// Never render error.message here: production visitors should not see internals.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="notfound">
      <Tomato className="notfound-tomato" />
      <h1 className="notfound-title">Something splatted.</h1>
      <p className="notfound-text">That one is on us. Give it another go.</p>
      <div className="notfound-actions">
        <button type="button" className="key key-red" onClick={() => reset()}>
          Try again
        </button>
        <Link className="key" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
