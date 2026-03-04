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

export const renameCategory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ id: z.string(), name: z.string().trim().min(1).max(50) }),
  )
  .handler(async ({ data }) => {
    await ensureSession();
    const current = db
      .prepare(`SELECT name FROM category WHERE id = ?`)
      .get(data.id) as { name: string } | undefined;
    if (!current) throw new Error("分類不存在");

    const conflict = db
      .prepare(`SELECT id FROM category WHERE name = ? AND id != ?`)
      .get(data.name, data.id);
    if (conflict) throw new Error(`分類「${data.name}」已存在`);

    db.transaction(() => {
      db.prepare(`UPDATE category SET name = ? WHERE id = ?`).run(
        data.name,
        data.id,
      );
      db.prepare(`UPDATE media SET category = ? WHERE category = ?`).run(
        data.name,
        current.name,
      );
    })();
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await ensureSession();
    const current = db
      .prepare(`SELECT name FROM category WHERE id = ?`)
      .get(data.id) as { name: string } | undefined;
    if (!current) throw new Error("分類不存在");

    db.transaction(() => {
      db.prepare(`UPDATE media SET category = '' WHERE category = ?`).run(
        current.name,
      );
      db.prepare(`DELETE FROM category WHERE id = ?`).run(data.id);
    })();
  });

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
