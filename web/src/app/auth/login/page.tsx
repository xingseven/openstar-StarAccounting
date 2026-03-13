export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded border p-6">
        <h1 className="text-lg font-semibold">登录</h1>
        <form className="space-y-3">
          <label className="block space-y-1">
            <div className="text-sm">邮箱</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              name="email"
              type="email"
              autoComplete="email"
            />
          </label>
          <label className="block space-y-1">
            <div className="text-sm">密码</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button
            className="w-full rounded bg-black px-3 py-2 text-sm text-white"
            type="submit"
          >
            登录
          </button>
        </form>
        <div className="text-sm text-gray-600">
          <a className="hover:underline" href="/">
            返回
          </a>
        </div>
      </div>
    </div>
  );
}

