import Link from "next/link";
import Tomato from "@/components/Tomato";

export default function NotFound() {
  return (
    <main className="notfound">
      <Tomato className="notfound-tomato" />
      <h1 className="notfound-title">No tomato here.</h1>
      <p className="notfound-text">This page does not exist, or the picture was removed.</p>
      <div className="notfound-actions">
        <Link className="key key-red" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
