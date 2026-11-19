import { Suspense } from "react";
import Link from "next/link";
import { ChargeForm } from "./charge-form";
import { Leaderboard } from "./leaderboard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-5xl font-bold tracking-tight">Tin&apos;s Black Book</h1>
        <p className="text-stone-400">All charges are anonymous.</p>
      </header>
      <div className="rounded-lg border border-stone-700 bg-stone-950 p-6 shadow-xl">
        <ChargeForm />
      </div>
      <Link
        href="/archive"
        className="self-center rounded border border-stone-500 px-4 py-2 font-semibold hover:bg-stone-800"
      >
        View the archive
      </Link>
      <section className="flex flex-col gap-4 rounded-lg border border-stone-700 bg-stone-950 p-6">
        <h2 className="text-center text-2xl font-semibold uppercase tracking-widest">
          Most wanted
        </h2>
        <Suspense fallback={<p className="text-center text-stone-400">Tallying charges…</p>}>
          <Leaderboard />
        </Suspense>
      </section>
    </main>
  );
}
