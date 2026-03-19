import { PageContainer } from "@/components/shared/PageContainer";

export default function ThemesPage() {
  return (
    <PageContainer>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">主题中心</h1>
        <p className="text-gray-500 mt-1">管理和切换系统主题</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md cursor-pointer ring-2 ring-blue-600">
          <div className="aspect-video bg-gray-100 p-4">
            <div className="h-full w-full bg-white rounded-lg shadow-sm p-2 space-y-2">
              <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 bg-blue-50 rounded"></div>
                <div className="h-16 bg-green-50 rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">默认主题</h3>
            <p className="text-sm text-gray-500 mt-1">当前正在使用的系统默认主题</p>
          </div>
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            使用中
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md cursor-not-allowed opacity-60">
          <div className="aspect-video bg-slate-900 p-4">
            <div className="h-full w-full bg-slate-800 rounded-lg shadow-sm p-2 space-y-2">
              <div className="h-2 w-1/3 bg-slate-600 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 bg-slate-700 rounded"></div>
                <div className="h-16 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">暗黑模式</h3>
            <p className="text-sm text-gray-500 mt-1">敬请期待...</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
