import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "@/lib/auth.functions";
import { db } from "@/lib/db";
import * as z from "zod";

export interface CategoryRow {
  id: string;
  name: string;
  createdAt: string;
}

export interface CategoryWithCount extends CategoryRow {
  mediaCount: number;
}

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    return db
      .prepare(
        `SELECT c.id, c.name, c.createdAt,
              COUNT(m.id) AS mediaCount
       FROM category c
       LEFT JOIN media m ON m.category = c.name
       GROUP BY c.id
       ORDER BY c.name ASC`,
      )
      .all() as CategoryWithCount[];
  },
);

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().trim().min(1).max(50) }))
  .handler(async ({ data }) => {
    await ensureSession();
    const existing = db
      .prepare(`SELECT id FROM category WHERE name = ?`)
      .get(data.name);
    if (existing) throw new Error(`分類「${data.name}」已存在`);

    const id = randomUUID();
    db.prepare(
      `INSERT INTO category (id, name, createdAt) VALUES (?, ?, ?)`,
    ).run(id, data.name, new Date().toISOString());

    return { id, name: data.name };
  });
