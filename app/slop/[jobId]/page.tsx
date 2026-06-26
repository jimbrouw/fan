import Link from "next/link";
import { SlopResultClient } from "./SlopResultClient";

export default async function SlopResultPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center bg-[#08001A] px-5 pb-12 pt-8">
      <Link
        href="/slop"
        className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-purple-500 hover:text-purple-400"
      >
        ← The Slop Machine
      </Link>

      <h1 className="mb-1 text-center text-2xl font-black tracking-tight text-white">
        Processing your slop
      </h1>
      <p className="mb-8 text-center text-sm text-purple-400">
        Award-winning AI quality. Guaranteed.
      </p>

      <div className="w-full max-w-sm">
        <SlopResultClient jobId={jobId} />
      </div>
    </main>
  );
}
