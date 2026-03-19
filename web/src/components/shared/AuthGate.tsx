"use client";

import { useEffect, useState } from "react";
import { getAccessToken, clearAccessToken } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { UserProvider } from "@/components/shared/UserContext";

type User = {
  id: string;
  email: string;
  name: string | null;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
      return;
    }

    apiFetch<{ user: User }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setReady(true);
      })
      .catch((err) => {
        console.error("AuthGate failed:", err);
        clearAccessToken();
        const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/auth/login${next}`);
      });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider initialUser={user}>
      {children}
    </UserProvider>
  );
}
