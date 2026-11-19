import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { readArchive } from "@/lib/store";

export const metadata: Metadata = {
  title: "The Archive — Tin's Black Book",
};

export default function ArchivePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-bold">The Archive</h1>
        <Link
          href="/"
          className="rounded border border-stone-500 px-4 py-2 font-semibold hover:bg-stone-800"
        >
          ← Back to the book
        </Link>
      </header>
      <Suspense fallback={<p className="text-stone-400">Dusting off old pages…</p>}>
        <ArchiveList />
      </Suspense>
    </main>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });

async function ArchiveList() {
  await connection();
  const sections = (await readArchive()).toReversed();

  if (sections.length === 0) {
    return <p className="text-stone-400">No chapters have been closed yet.</p>;
  }

  return sections.map((section) => {
    // Top 5 first, then the rest newest first. "by" is deliberately omitted to keep accusers anonymous.
    const charges = section.charges
      .toReversed()
      .toSorted((a, b) => Number(b.top) - Number(a.top));
    return (
      <section key={section.id} className="flex flex-col gap-3">
        <h2 className="border-b border-stone-700 pb-2 text-2xl font-semibold">
          Reset {formatDate(section.resetAt)}{" "}
          <span className="text-base font-normal text-stone-400">
            ({charges.length} {charges.length === 1 ? "charge" : "charges"})
          </span>
        </h2>
        <ul className="flex flex-col gap-3">
          {charges.map((c) => (
            <li
              key={c.id}
              className={`flex flex-col gap-1 rounded border p-4 ${
                c.top ? "border-amber-500 bg-amber-950/30" : "border-stone-700 bg-stone-900"
              }`}
            >
              <p className="text-sm uppercase tracking-wider text-stone-400">
                Against <span className="font-semibold text-stone-100">{c.against}</span>
                {c.top && <span className="ml-2 text-amber-400">★ Top 5</span>}
              </p>
              <p className="whitespace-pre-wrap">{c.charge}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
