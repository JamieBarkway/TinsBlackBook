"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitCharge, type SubmitState } from "./actions";
import { NAMES } from "@/lib/names";

const initialState: SubmitState = { ok: false, message: "" };

function NameSelect({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-20 text-right text-lg italic">{label}</span>
      <select
        name={name}
        required
        defaultValue=""
        className="flex-1 rounded border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100"
      >
        <option value="" disabled>
          Select a name…
        </option>
        {NAMES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ChargeForm() {
  const [state, formAction, pending] = useActionState(
    submitCharge,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <h2 className="text-center text-2xl font-semibold uppercase tracking-widest">
        Charges to be brought
      </h2>
      <NameSelect name="against" label="against" />
      <NameSelect name="by" label="by" />
      <label className="flex flex-col gap-2">
        <span className="text-lg italic">The charge</span>
        <textarea
          name="charge"
          required
          maxLength={1000}
          rows={5}
          placeholder="Describe the offence…"
          className="rounded border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-red-800 px-4 py-2 font-semibold uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Recording…" : "Enter into the book"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`text-center ${state.ok ? "text-green-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
