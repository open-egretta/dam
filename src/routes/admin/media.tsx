import {
  listCategories,
  type CategoryWithCount,
} from "@/utils/categories.functions";
import { deleteMedia, listMedia, updateMedia } from "@/utils/media.functions";
import type { MediaRow } from "@/utils/media";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { filesize } from "filesize";

export const Route = createFileRoute("/admin/media")({
  loader: async () => {
    const [media, categories] = await Promise.all([
      listMedia({ data: { limit: 500, offset: 0 } }),
      listCategories(),
    ]);
    return { media, categories };
  },
  staleTime: 0,
  component: RouteComponent,
});

function thumbUrl(filename: string) {
  const uuid = filename.split(".")[0];
  return `/uploads/thumbs/${uuid}_thumb.webp`;
}

function MediaCard({
  row,
  categories,
  onDeleted,
  onEdited,
}: {
  row: MediaRow;
  categories: CategoryWithCount[];
  onDeleted: () => void;
  onEdited: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(row.originalName);
  const [editCategory, setEditCategory] = useState(row.category);
  const [saving, setSaving] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`確定要刪除「${row.originalName}」？`)) return;
    setDeleting(true);
    try {
      await deleteMedia({ data: { id: row.id } });
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  function handleEditOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setEditName(row.originalName);
    setEditCategory(row.category);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMedia({
        data: {
          id: row.id,
          originalName: editName !== row.originalName ? editName : undefined,
          category: editCategory !== row.category ? editCategory : undefined,
        },
      });
      setEditing(false);
      onEdited();
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
      <div className="relative aspect-square bg-gray-100">
        <img
          src={thumbUrl(row.filename)}
          alt={row.originalName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={handleEditOpen}
            className="p-1.5 bg-black/50 hover:bg-blue-600 text-white rounded-full"
            title="編輯"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 bg-black/50 hover:bg-red-600 disabled:opacity-50 text-white rounded-full"
            title="刪除"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="p-2 space-y-1.5 bg-blue-50 border-t border-blue-200">
          <input
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <select
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            onKeyDown={handleKeyDown}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-1">
            <button
              onClick={handleCancel}
              className="p-1 text-red-400 hover:text-red-600"
              title="取消"
            >
              <X size={14} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
              title="確認"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 space-y-0.5">
          <p
            className="text-xs font-medium text-gray-800 truncate"
            title={row.originalName}
          >
            {row.originalName}
          </p>
          <p className="text-xs text-gray-400">{row.category}</p>
          <p className="text-xs text-gray-400">
            {row.width && row.height ? `${row.width} × ${row.height}` : "—"}
            {" · "}
            {filesize(row.size, { standard: "jedec" })}
          </p>
          <p className="text-xs text-gray-300">{row.mimeType}</p>
        </div>
      )}
    </div>
  );
}

function RouteComponent() {
  const router = useRouter();
  const { media: allMedia, categories } = Route.useLoaderData();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? allMedia
      : allMedia.filter((m) => m.category === activeCategory);

  return (
    <div className="space-y-6 container px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">素材管理</h1>
        <span className="text-sm text-gray-400">{filtered.length} 個素材</span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-gray-200">
        {(["All", ...categories.map((c) => c.name)] as string[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeCategory === cat
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-light">此分類尚無素材</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((row) => (
            <MediaCard
              key={row.id}
              row={row}
              categories={categories}
              onDeleted={() => router.invalidate()}
              onEdited={() => router.invalidate()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
