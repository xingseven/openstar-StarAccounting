"use client";

import { apiFetch } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MeResponse = {
  user: { id: string; email: string; name: string | null };
};

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
      });
  }, []);

  function logout() {
    clearAccessToken();
    router.replace("/auth/login");
  }

  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <div className="font-medium">消费面板</div>
      <nav className="text-sm text-gray-600 flex items-center gap-4">
        {user ? <div className="text-gray-500">{user.email}</div> : null}
        <a className="hover:underline" href="/settings">
          设置
        </a>
        <button className="hover:underline" type="button" onClick={logout}>
          退出
        </button>
      </nav>
    </header>
  );
}

