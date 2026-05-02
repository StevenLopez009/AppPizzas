import "server-only";
import { db, queryOne } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";
import { hashPassword } from "@/lib/auth/password";

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  phone: r.phone,
  role: r.role,
});

export async function findUserByEmail(email: string): Promise<{
  user: User;
  password_hash: string;
} | null> {
  const row = await queryOne<UserRow>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()],
  );
  if (!row) return null;
  return { user: toUser(row), password_hash: row.password_hash };
}

export async function findUserById(id: string): Promise<User | null> {
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
  return row ? toUser(row) : null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  role?: "user" | "admin";
}): Promise<User> {
  const id = uuid();
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
  const role: "user" | "admin" =
    input.role ?? (input.email.toLowerCase() === adminEmail ? "admin" : "user");
  const passwordHash = await hashPassword(input.password);

  await db.execute(
    `INSERT INTO users (id, email, password_hash, name, phone, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.email.toLowerCase(),
      passwordHash,
      input.name ?? null,
      input.phone ?? null,
      role,
    ],
  );

  const created = await findUserById(id);
  if (!created) throw new Error("No se pudo crear el usuario");
  return created;
}
