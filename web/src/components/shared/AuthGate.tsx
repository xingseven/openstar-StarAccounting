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

// 模块级缓存，避免每次导航重复鉴权
let cachedUser: User | null = null;
let authCheckPromise: Promise<User> | null = null;

export function setAuthUser(user: User) {
  cachedUser = user;
}

async function validateAuth(): Promise<User> {
  // 如果已有缓存的用户，直接返回
  if (cachedUser) {
    return cachedUser;
  }

  // 如果已有正在进行的鉴权请求，等待它
  if (authCheckPromise) {
    return authCheckPromise;
  }

  authCheckPromise = apiFetch<{ user: User }>("/api/auth/me")
    .then((data) => {
      cachedUser = data.user;
      authCheckPromise = null;
      return data.user;
    })
    .catch((err) => {
      authCheckPromise = null;
      throw err;
    });

  return authCheckPromise;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(Boolean(cachedUser));
  const [user, setUser] = useState<User | null>(cachedUser);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      cachedUser = null;
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
      return;
    }

    if (cachedUser) {
      return;
    }

    let active = true;

    validateAuth()
      .then((userData) => {
        if (!active) return;
        setUser(userData);
        setReady(true);
      })
      .catch((err) => {
        if (!active) return;
        console.error("AuthGate failed:", err);
        cachedUser = null;
        clearAccessToken();
        const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/auth/login${next}`);
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm"></p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider initialUser={user}>{children}</UserProvider>
  );
}
