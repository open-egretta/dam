import { listCategories } from "@/utils/categories.functions";
import { createFileRoute } from "@tanstack/react-router";
import { HardDrive, Images, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [categories] = await Promise.all([listCategories()]);
    return { categories };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { categories } = Route.useLoaderData();

  const stats = [
    {
      label: "素材總數",
      // value: totalFiles,
      value: 0,
      icon: Images,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      label: "分類數",
      value: categories.length,
      icon: HardDrive,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">儀表板</h1>
        <p className="text-sm text-gray-400 mt-1">數位資產管理總覽</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`${bg} p-3 rounded-xl`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
