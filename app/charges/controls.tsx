"use client";

import { useState, useTransition } from "react";
import { resetCharges, toggleTop } from "../actions";
import { TOP_LIMIT } from "@/lib/names";

export function TopToggle({
  id,
  top,
  disabled,
}: {
  id: string;
  top: boolean;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending || (!top && disabled)}
        title={!top && disabled ? `Top ${TOP_LIMIT} already chosen` : undefined}
        onClick={() =>
          startTransition(async () => {
            const res = await toggleTop(id);
            setError(res.error ?? "");
          })
        }
        className={`whitespace-nowrap rounded px-3 py-1 text-sm font-semibold ${
          top
            ? "bg-amber-500 text-black hover:bg-amber-400"
            : "border border-stone-500 text-stone-200 hover:bg-stone-800"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {top ? "★ Top 5" : "☆ Add to top 5"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function ResetButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Close this chapter? All current charges will be moved to the public archive.")) return;
        startTransition(() => resetCharges());
      }}
      className="rounded bg-red-800 px-4 py-2 font-semibold uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? "Resetting…" : "Reset"}
    </button>
  );
}
