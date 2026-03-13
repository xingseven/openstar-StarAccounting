export function Header() {
  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <div className="font-medium">消费面板</div>
      <nav className="text-sm text-gray-600">
        <a className="hover:underline" href="/settings">
          设置
        </a>
      </nav>
    </header>
  );
}

