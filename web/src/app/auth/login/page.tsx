"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { setAuthUser } from "@/components/shared/AuthGate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { THEME_DIALOG_INPUT_CLASS, ThemeFormField, ThemeHero, ThemeNotice, ThemeSurface } from "@/components/shared/theme-primitives";

type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string; name: string | null };
};

function WaveBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#edf4fc_50%,#e8eff8_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.58),transparent_64%)]" />

      <div className="login-wave-layer login-wave-layer-a absolute -left-[8%] top-[8%] h-[260px] w-[78%] opacity-90">
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 1200 360" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="login-wave-fill-a" x1="132" y1="28" x2="942" y2="286" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(226,238,252,0.98)" />
              <stop offset="0.48" stopColor="rgba(206,228,249,0.9)" />
              <stop offset="1" stopColor="rgba(242,247,255,0.42)" />
            </linearGradient>
          </defs>
          <path
            d="M0 176C88 128 162 102 244 104C333 107 385 152 467 163C561 176 645 135 738 120C842 103 934 114 1024 141C1099 164 1153 191 1200 217V360H0V176Z"
            fill="url(#login-wave-fill-a)"
          />
          <path
            d="M44 171C125 130 201 111 276 117C365 125 409 167 495 175C583 183 663 145 744 130C856 109 958 122 1081 178"
            stroke="rgba(255,255,255,0.66)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="login-wave-layer login-wave-layer-b absolute right-[-10%] top-[28%] h-[300px] w-[82%] opacity-85">
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 1200 360" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="login-wave-fill-b" x1="1038" y1="68" x2="269" y2="282" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(231,241,252,0.16)" />
              <stop offset="0.4" stopColor="rgba(201,226,250,0.78)" />
              <stop offset="1" stopColor="rgba(223,237,251,0.96)" />
            </linearGradient>
          </defs>
          <path
            d="M0 213C101 152 198 128 303 142C383 153 449 196 523 205C614 216 683 172 767 145C880 109 981 112 1072 140C1121 155 1164 177 1200 198V360H0V213Z"
            fill="url(#login-wave-fill-b)"
          />
          <path
            d="M31 210C122 160 221 140 314 154C394 166 456 208 526 215C608 223 679 186 756 160C860 124 977 126 1118 179"
            stroke="rgba(255,255,255,0.54)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="login-wave-crest absolute left-[12%] top-[50%] h-[212px] w-[54%] opacity-75">
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 960 220" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="login-wave-crest-line" x1="48" y1="98" x2="888" y2="98" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255,255,255,0.04)" />
              <stop offset="0.2" stopColor="rgba(255,255,255,0.68)" />
              <stop offset="0.55" stopColor="rgba(255,255,255,0.96)" />
              <stop offset="0.88" stopColor="rgba(255,255,255,0.42)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.04)" />
            </linearGradient>
            <linearGradient id="login-wave-crest-fill" x1="480" y1="44" x2="480" y2="212" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255,255,255,0.3)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M0 114C86 92 153 82 223 89C309 98 380 136 458 138C558 140 633 92 719 82C802 72 879 92 960 128V220H0V114Z"
            fill="url(#login-wave-crest-fill)"
          />
          <path
            d="M22 112C101 91 172 85 238 93C319 103 387 139 460 141C551 143 625 99 700 90C793 79 876 98 936 121"
            stroke="url(#login-wave-crest-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="login-wave-layer login-wave-layer-c absolute left-[34%] top-[61%] h-[182px] w-[44%] opacity-70">
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 860 180" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="login-wave-fill-c" x1="110" y1="38" x2="742" y2="146" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255,255,255,0.4)" />
              <stop offset="0.5" stopColor="rgba(224,239,253,0.76)" />
              <stop offset="1" stopColor="rgba(215,232,248,0.28)" />
            </linearGradient>
            <linearGradient id="login-wave-line-c" x1="42" y1="70" x2="808" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255,255,255,0)" />
              <stop offset="0.3" stopColor="rgba(255,255,255,0.82)" />
              <stop offset="0.7" stopColor="rgba(255,255,255,0.88)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M0 84C76 62 156 50 236 55C320 60 392 93 468 97C565 102 639 68 723 60C774 56 821 60 860 72V180H0V84Z"
            fill="url(#login-wave-fill-c)"
          />
          <path
            d="M28 81C103 60 177 53 246 58C327 64 394 95 468 100C562 106 636 76 712 68C758 63 793 64 831 71"
            stroke="url(#login-wave-line-c)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute bottom-[-8%] left-[-10%] h-[320px] w-[56%] rounded-full bg-blue-100/55 blur-3xl" />
      <div className="absolute right-[-12%] top-[10%] h-[280px] w-[34%] rounded-full bg-sky-100/60 blur-3xl" />

      <style jsx>{`
        .login-wave-layer-a {
          animation: loginWaveDriftA 16s cubic-bezier(0.37, 0, 0.24, 1) infinite alternate;
          filter: blur(2px);
        }

        .login-wave-layer-b {
          animation: loginWaveDriftB 22s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
          filter: blur(1px);
        }

        .login-wave-crest {
          animation: loginWaveCrest 10s cubic-bezier(0.45, 0, 0.3, 1) infinite alternate;
          filter: blur(0.3px);
        }

        .login-wave-layer-c {
          animation: loginWaveDriftC 13s cubic-bezier(0.42, 0, 0.26, 1) infinite alternate;
          filter: blur(0.4px);
        }

        @keyframes loginWaveDriftA {
          0% {
            transform: translate3d(-1.5%, 0%, 0) scale(1.02);
          }
          50% {
            transform: translate3d(2%, 1.2%, 0) scale(1);
          }
          100% {
            transform: translate3d(4.5%, -1%, 0) scale(1.03);
          }
        }

        @keyframes loginWaveDriftB {
          0% {
            transform: translate3d(2%, -1%, 0) scale(1);
          }
          50% {
            transform: translate3d(-1.5%, 1.5%, 0) scale(1.02);
          }
          100% {
            transform: translate3d(-4%, -0.5%, 0) scale(1.04);
          }
        }

        @keyframes loginWaveCrest {
          0% {
            transform: translate3d(0, 0, 0) scaleX(1);
            opacity: 0.64;
          }
          50% {
            transform: translate3d(2%, -4%, 0) scaleX(1.02);
            opacity: 0.82;
          }
          100% {
            transform: translate3d(-1.5%, 5%, 0) scaleX(0.985);
            opacity: 0.7;
          }
        }

        @keyframes loginWaveDriftC {
          0% {
            transform: translate3d(-1.5%, 2%, 0) scaleX(1.01);
          }
          50% {
            transform: translate3d(1%, -2.5%, 0) scaleX(0.99);
          }
          100% {
            transform: translate3d(3.5%, 1%, 0) scaleX(1.025);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-wave-layer-a,
          .login-wave-layer-b,
          .login-wave-layer-c,
          .login-wave-crest {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function DesktopHero() {
  return (
    <ThemeHero className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(243,247,255,0.95)_55%,rgba(230,238,248,0.92))] p-8 shadow-[0_28px_72px_rgba(15,23,42,0.1)] lg:flex">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute right-[-64px] top-24 h-56 w-56 rounded-full bg-sky-100/75 blur-3xl" />
      </div>

      <div className="relative max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/74 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          OpenStar Accounting
        </div>
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-blue-700/70">Personal Finance Cockpit</p>
        <div className="mt-4 text-[clamp(3.2rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-slate-950">星会计</div>
        <p className="mt-5 text-xl leading-8 text-slate-700">分析过去，规划未来。</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
          把资产、消费、预算与储蓄放回一个更清晰、更可信的个人财务工作台。
        </p>
      </div>

      <div className="relative rounded-[28px] border border-white/75 bg-white/74 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
            <LockKeyhole className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">登录后继续你的上次分析进度</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              资产走势、预算状态和储蓄计划会回到同一个工作台，不需要重新寻找入口。
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">资产总览</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">消费分析</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">预算与储蓄</span>
        </div>
      </div>
    </ThemeHero>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    router.prefetch(next);
  }, [next, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const actualEmail = formData.get("email")?.toString() || email;
    const actualPassword = formData.get("password")?.toString() || password;

    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: actualEmail, password: actualPassword }),
      });
      setAccessToken(data.accessToken);
      setAuthUser(data.user);
      router.replace(next);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "登录失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef4fb_52%,#e9eff8_100%)]">
      <WaveBackdrop />

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full items-center gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-8">
          <DesktopHero />

          <ThemeSurface className="relative border-white/75 bg-white/92 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(219,234,254,0.85),transparent_72%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[23px] bg-[linear-gradient(145deg,rgba(255,255,255,0.62),rgba(255,255,255,0)_28%,rgba(255,255,255,0)_72%,rgba(228,241,255,0.48))] opacity-90 sm:rounded-[27px]" />
            <div className="pointer-events-none absolute -left-10 top-8 h-36 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72),rgba(255,255,255,0)_70%)] opacity-75 blur-xl" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Access
              </div>

              <h1 className="mt-5 text-[clamp(1.9rem,3vw,2.5rem)] font-semibold tracking-tight text-slate-950">登录你的账户</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">继续进入你的财务工作台，查看资产、消费和储蓄进度。</p>
              <p className="mt-4 text-sm text-slate-500">
                还没有账户？
                <Link className="ml-1 font-medium text-slate-950 transition hover:text-blue-700" href="/auth/register">
                  立即注册
                </Link>
              </p>

              {error ? (
                <ThemeNotice tone="red" className="mt-5 border border-red-100" title="登录失败" description={error} />
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <ThemeFormField label="邮箱" htmlFor="login-email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      className={cn(THEME_DIALOG_INPUT_CLASS, "h-12 rounded-2xl border-slate-200/90 bg-white pl-10")}
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </ThemeFormField>

                <ThemeFormField label="密码" htmlFor="login-password">
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-password"
                      className={cn(THEME_DIALOG_INPUT_CLASS, "h-12 rounded-2xl border-slate-200/90 bg-white pl-10")}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="输入登录密码"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </ThemeFormField>

                <Button
                  className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    "正在登录..."
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      登录
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" />
                  当前设备安全保留登录
                </div>
                <Link className="transition hover:text-slate-900 hover:underline" href="/">
                  返回首页
                </Link>
              </div>
            </div>
          </ThemeSurface>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-slate-500">正在加载登录页...</div>}>
      <LoginForm />
    </Suspense>
  );
}
