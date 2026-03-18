"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);
          
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[PWA] New content available, please refresh.");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }
    
    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      
      const installBanner = document.createElement("div");
      installBanner.id = "pwa-install-banner";
      installBanner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          max-width: 400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">安装 XFDashboard</div>
            <div style="font-size: 12px; opacity: 0.9;">添加到主屏幕，获得更好体验</div>
          </div>
          <button id="pwa-install-btn" style="
            background: white;
            color: #667eea;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
          ">安装</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: none;
            padding: 8px;
            cursor: pointer;
            font-size: 18px;
          ">×</button>
        </div>
      `;
      
      document.body.appendChild(installBanner);
      
      document.getElementById("pwa-install-btn")?.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log("[PWA] Install prompt outcome:", outcome);
          deferredPrompt = null;
          installBanner.remove();
        }
      });
      
      document.getElementById("pwa-dismiss-btn")?.addEventListener("click", () => {
        installBanner.remove();
      });
    });
    
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed successfully");
      deferredPrompt = null;
      document.getElementById("pwa-install-banner")?.remove();
    });
  }, []);
  
  return null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
