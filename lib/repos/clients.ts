import "server-only";
import { db } from "@/lib/db";
import { uuid } from "@/lib/uuid";

export async function createClient(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ id: string }> {
  const id = uuid();
  await db.execute(
    "INSERT INTO clients (id, name, email, phone) VALUES (?, ?, ?, ?)",
    [id, input.name, input.email, input.phone],
  );
  return { id };
}
