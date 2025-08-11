import { ZodSchema } from "zod";

export async function fetchWithSchema<T>(
  url: string,
  schema: ZodSchema<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path?.join(".") || "(root)";
    throw new Error(`Schema validation failed at ${where}: ${first.message}`);
  }
  return parsed.data;
}
