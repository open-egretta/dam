import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import * as z from "zod";
import { randomUUID } from "node:crypto";
import { ensureSession } from "@/lib/auth.functions";
import { db } from "@/lib/db";
import { listCategories } from "@/utils/categories.functions";

const createCategory = createServerFn({ method: "POST" })
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

export const Route = createFileRoute("/admin/categories")({
  loader: () => listCategories(),
  component: RouteComponent,
});

function RouteComponent() {
  const categories = Route.useLoaderData();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    router.invalidate();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
    setError("");
  }

  async function confirmEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || !editingId) return;
    try {
      // await renameCategory({ data: { id: editingId, name: trimmed } });
      setEditingId(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失敗");
    }
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await createCategory({ data: { name: trimmed } });
      setNewName("");
      setShowAdd(false);
      setError("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "新增失敗");
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">分類管理</h1>
          <p className="text-sm text-gray-400 mt-1">管理媒體庫的分類項目</p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setNewName("");
            setError("");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          新增分類
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>分類名稱</span>
          <span className="mr-8">素材數</span>
          <span>操作</span>
        </div>

        {/* Add row */}
        {showAdd && (
          <div className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 border-b border-cyan-100 bg-cyan-50 gap-4">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setShowAdd(false);
              }}
              placeholder="輸入分類名稱"
              className="border border-cyan-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
            />
            <span />
            <div className="flex items-center gap-1">
              <button
                onClick={handleAdd}
                className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1.5 text-red-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Category rows */}
        {categories.map((cat, i) => {
          const isEditing = editingId === cat.id;
          return (
            <div
              key={cat.id}
              className={`grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 gap-4 ${
                i < categories.length - 1 ? "border-b border-gray-100" : ""
              } hover:bg-gray-50 transition-colors`}
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === "Enter") confirmEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="border border-cyan-300 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              )}

              <span className="text-sm text-gray-400 mr-8">
                {cat.mediaCount > 0 ? (
                  `${cat.mediaCount} 筆`
                ) : (
                  <span className="text-gray-200">—</span>
                )}
              </span>

              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={confirmEdit}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      // onClick={() => startEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      // onClick={() => handleDelete(cat.id, cat.mediaCount)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
