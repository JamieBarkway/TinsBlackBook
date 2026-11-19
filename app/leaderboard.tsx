import { connection } from "next/server";
import { readArchive, readCharges } from "@/lib/store";

type Row = { name: string; round: number; total: number };

export async function Leaderboard() {
  await connection();
  const [current, archive] = await Promise.all([readCharges(), readArchive()]);

  const rows = new Map<string, Row>();
  const row = (name: string) => {
    if (!rows.has(name)) rows.set(name, { name, round: 0, total: 0 });
    return rows.get(name)!;
  };
  for (const c of current) {
    row(c.against).round++;
    row(c.against).total++;
  }
  for (const c of archive.flatMap((s) => s.charges)) row(c.against).total++;

  const sorted = [...rows.values()].sort(
    (a, b) => b.round - a.round || b.total - a.total || a.name.localeCompare(b.name),
  );

  if (sorted.length === 0) {
    return <p className="text-center text-stone-400">No charges yet. The book awaits.</p>;
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-stone-600 text-sm uppercase tracking-wider text-stone-400">
          <th className="py-2 pr-2 w-10">#</th>
          <th className="py-2 pr-2">Name</th>
          <th className="py-2 pr-2 text-right">This round</th>
          <th className="py-2 text-right">All time</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={r.name} className="border-b border-stone-800">
            <td className="py-2 pr-2 text-stone-400">{i + 1}</td>
            <td className="py-2 pr-2 font-semibold">{r.name}</td>
            <td className="py-2 pr-2 text-right tabular-nums">{r.round}</td>
            <td className="py-2 text-right tabular-nums">{r.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
