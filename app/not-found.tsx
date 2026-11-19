import Link from "next/link";
import Tomato from "@/components/Tomato";

export default function NotFound() {
  return (
    <main className="home">
      <Tomato className="home-tomato" />
      <h1 className="meme-title">404<br />TOMATO NOT FOUND</h1>
      <Link className="meme-btn meme-btn-green" href="/">กลับหน้าแรก</Link>
    </main>
  );
}
