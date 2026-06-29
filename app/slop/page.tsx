import { SlopMachine } from "@/components/SlopMachine";

export const metadata = {
  title: "The Slop Machine",
  description: "Upload your face, spin the reels, receive AI-generated slop. Guaranteed bad.",
};

export default function SlopPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center bg-[#08001A] px-5 pb-16 pt-10">
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">🎰</div>
        <h1
          className="font-black uppercase tracking-tight text-white"
          style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}
        >
          The Slop Machine
        </h1>
        <p className="mt-2 text-sm text-purple-400">AI-generated art. Guaranteed bad.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {["✨ Award-winning", "👁️ Extra eyes", "🖐️ 7 fingers"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-purple-800/60 bg-purple-900/30 px-3 py-1 text-[11px] font-bold text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-purple-700/40 bg-[#100020] p-5 shadow-[0_0_60px_rgba(88,28,135,0.3)]">
        <SlopMachine />
      </div>

      <footer className="mt-10 text-center text-[11px] text-purple-700">
        AI slop as a service · no refunds
      </footer>
    </main>
  );
}
