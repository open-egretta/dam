import { listCategories } from "@/utils/categories.functions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Images, FolderOpen, ArrowRight, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const categories = await listCategories();
    const totalMedia = categories.reduce((sum, c) => sum + c.mediaCount, 0);
    return { totalMedia, categoryCount: categories.length };
  },
  component: HomePage,
});

function HomePage() {
  const { totalMedia, categoryCount } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
            Egretta{" "}
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              DAM
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-3">
            Self-hosted Digital Asset Management
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            輕量、快速的數位資產管理系統。上傳、分類、瀏覽與分享你的圖片素材。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/media"
              className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
            >
              瀏覽素材
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-8 py-3 border border-slate-600 hover:border-slate-400 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              <Shield size={18} />
              管理後台
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <Images className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <p className="text-4xl font-bold text-white">{totalMedia}</p>
            <p className="text-gray-400 mt-1">素材總數</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <FolderOpen className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <p className="text-4xl font-bold text-white">{categoryCount}</p>
            <p className="text-gray-400 mt-1">分類數</p>
          </div>
        </div>
      </section>
    </div>
  );
}
