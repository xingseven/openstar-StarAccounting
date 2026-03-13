export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">总览</h1>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <a className="rounded border p-4 hover:bg-gray-100" href="/consumption">
          消费分析
        </a>
        <a className="rounded border p-4 hover:bg-gray-100" href="/savings">
          储蓄分析
        </a>
        <a className="rounded border p-4 hover:bg-gray-100" href="/loans">
          贷款分析
        </a>
        <a className="rounded border p-4 hover:bg-gray-100" href="/connections">
          连接管理
        </a>
        <a className="rounded border p-4 hover:bg-gray-100" href="/settings">
          设置
        </a>
      </div>
    </div>
  );
}

