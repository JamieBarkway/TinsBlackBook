import { promises as fs } from "fs";
import path from "path";

export type Charge = {
  id: string;
  against: string;
  by: string;
  charge: string;
  createdAt: string;
  top: boolean;
};

export type ArchiveSection = {
  id: string;
  resetAt: string;
  charges: Charge[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const CHARGES_FILE = path.join(DATA_DIR, "charges.json");
const ARCHIVE_FILE = path.join(DATA_DIR, "archive.json");

// Serialise writes so concurrent submissions don't clobber each other.
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

async function readJson<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export function readCharges(): Promise<Charge[]> {
  return readJson<Charge>(CHARGES_FILE);
}

export function readArchive(): Promise<ArchiveSection[]> {
  return readJson<ArchiveSection>(ARCHIVE_FILE);
}

export function updateCharges<T>(
  fn: (charges: Charge[]) => { charges: Charge[]; result: T },
): Promise<T> {
  return enqueue(async () => {
    const { charges, result } = fn(await readCharges());
    await writeJson(CHARGES_FILE, charges);
    return result;
  });
}

/** Moves all current charges into a new archive section, then clears them. */
export function archiveAndReset(): Promise<void> {
  return enqueue(async () => {
    const charges = await readCharges();
    if (charges.length === 0) return;
    const archive = await readArchive();
    archive.push({ id: crypto.randomUUID(), resetAt: new Date().toISOString(), charges });
    // Write the archive first so a failure never loses charges.
    await writeJson(ARCHIVE_FILE, archive);
    await writeJson(CHARGES_FILE, []);
  });
}
