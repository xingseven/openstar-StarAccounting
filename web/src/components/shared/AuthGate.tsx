"use client";

import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  // 暂时绕过登录检查，直接渲染子组件
  return <>{children}</>;
}
