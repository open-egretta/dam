import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { listCategories } from "@/utils/categories.functions";
import { ImageIcon, Upload, X } from "lucide-react";
import { uploadMedia } from "@/utils/media.functions";

export const Route = createFileRoute("/admin/upload")({
  loader: () => listCategories(),
  component: RouteComponent,
});

interface FilePreview {
  file: File;
  url: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

function RouteComponent() {
  const categories = Route.useLoaderData();
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [category, setCategory] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted: File[]) => {
    const previews: FilePreview[] = accepted.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...previews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: true,
  });

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (!category || files.length === 0) return;
    setUploadState("uploading");
    setErrorMsg("");

    const body = new FormData();
    body.append("category", category);
    for (const fp of files) body.append("files", fp.file);

    try {
      const json = await uploadMedia({ data: body });

      files.forEach((fp) => URL.revokeObjectURL(fp.url));

      if (json.errors.length > 0) {
        setUploadState("error");
        setErrorMsg(json.errors.join("\n"));
      } else {
        setUploadState("done");

        await router.navigate({ to: "/media" });
      }
    } catch (err) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">上傳素材</h1>
        <p className="text-sm text-gray-400 mt-1">支援 JPEG、PNG、WebP、GIF</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors mb-6 ${
          isDragActive
            ? "border-cyan-400 bg-cyan-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload size={22} className="text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">
          {isDragActive ? "放開以新增圖片" : "拖曳圖片至此，或點擊選擇檔案"}
        </p>
        <p className="text-gray-300 text-xs">最大單檔 20MB</p>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {files.map((fp, i) => (
            <div
              key={fp.url}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
            >
              <img
                src={fp.url}
                alt={fp.file.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{fp.file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata form */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-600">素材資訊</h2>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">分類</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">請選擇分類</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ImageIcon size={14} />
              {files.length} 個檔案
            </div>
            <button
              onClick={handleUpload}
              disabled={!category || uploadState === "uploading"}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uploadState === "uploading" ? "上傳中…" : "確認上傳"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
