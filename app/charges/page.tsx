import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { readCharges, type Charge } from "@/lib/store";
import { TOP_LIMIT } from "@/lib/names";
import { ResetButton, TopToggle } from "./controls";

export const metadata: Metadata = {
  title: "The Charges — Tin's Black Book",
};

export default function ChargesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-bold">The Charges</h1>
        <ResetButton />
      </header>
      <Suspense fallback={<p className="text-stone-400">Opening the book…</p>}>
        <ChargeList />
      </Suspense>
    </main>
  );
}

async function ChargeList() {
  await connection();
  const charges = (await readCharges()).toReversed();
  const top = charges.filter((c) => c.top);
  const topFull = top.length >= TOP_LIMIT;

  if (charges.length === 0) {
    return <p className="text-stone-400">The book is empty. For now.</p>;
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">
          Top {TOP_LIMIT}{" "}
          <span className="text-base font-normal text-stone-400">
            ({top.length}/{TOP_LIMIT} chosen)
          </span>
        </h2>
        {top.length === 0 ? (
          <p className="text-stone-400">None chosen yet.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {top.map((c) => (
              <ChargeCard key={c.id} charge={c} topFull={topFull} />
            ))}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">
          All charges{" "}
          <span className="text-base font-normal text-stone-400">({charges.length})</span>
        </h2>
        <ul className="flex flex-col gap-3">
          {charges.map((c) => (
            <ChargeCard key={c.id} charge={c} topFull={topFull} />
          ))}
        </ul>
      </section>
    </>
  );
}

function ChargeCard({ charge, topFull }: { charge: Charge; topFull: boolean }) {
  return (
    <li
      className={`flex items-start justify-between gap-4 rounded border p-4 ${
        charge.top ? "border-amber-500 bg-amber-950/30" : "border-stone-700 bg-stone-900"
      }`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-wider text-stone-400">
          Against <span className="font-semibold text-stone-100">{charge.against}</span>
          {" · "}by <span className="font-semibold text-stone-100">{charge.by}</span>
        </p>
        <p className="whitespace-pre-wrap">{charge.charge}</p>
        <p className="text-xs text-stone-500">
          {new Date(charge.createdAt).toLocaleString("en-GB")}
        </p>
      </div>
      <TopToggle id={charge.id} top={charge.top} disabled={topFull} />
    </li>
  );
}
