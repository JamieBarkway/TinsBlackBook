"use server";

import { refresh } from "next/cache";
import { NAMES, TOP_LIMIT } from "@/lib/names";
import { archiveAndReset, updateCharges } from "@/lib/store";

export type SubmitState = { ok: boolean; message: string };

const MAX_CHARGE_LENGTH = 1000;

function isName(value: unknown): value is string {
  return typeof value === "string" && (NAMES as readonly string[]).includes(value);
}

export async function submitCharge(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const against = formData.get("against");
  const by = formData.get("by");
  const text = String(formData.get("charge") ?? "").trim();

  if (!isName(against) || !isName(by)) {
    return { ok: false, message: "Please select a name for both fields." };
  }
  if (against === "Anonymous") {
    return {
      ok: false,
      message: "Anonymous cannot be selected as the person charged.",
    };
  }
  if (!text) {
    return { ok: false, message: "Please enter the charge." };
  }
  if (text.length > MAX_CHARGE_LENGTH) {
    return { ok: false, message: `Charge must be ${MAX_CHARGE_LENGTH} characters or fewer.` };
  }

  await updateCharges((charges) => ({
    charges: [
      ...charges,
      {
        id: crypto.randomUUID(),
        against,
        by,
        charge: text,
        createdAt: new Date().toISOString(),
        top: false,
      },
    ],
    result: undefined,
  }));

  refresh();
  return { ok: true, message: "Charge recorded. Your secret is safe." };
}

export async function toggleTop(id: string): Promise<{ error?: string }> {
  const result = await updateCharges<{ error?: string }>((charges) => {
    const target = charges.find((c) => c.id === id);
    if (!target) return { charges, result: { error: "Charge not found." } };
    if (!target.top && charges.filter((c) => c.top).length >= TOP_LIMIT) {
      return { charges, result: { error: `You can only pick ${TOP_LIMIT}.` } };
    }
    return {
      charges: charges.map((c) => (c.id === id ? { ...c, top: !c.top } : c)),
      result: {},
    };
  });
  refresh();
  return result;
}

export async function resetCharges(): Promise<void> {
  await archiveAndReset();
  refresh();
}
