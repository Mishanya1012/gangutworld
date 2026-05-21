"use client";

import { useEffect } from "react";
import {
  Bell,
  Crown,
  Heart,
  LogOut,
  MessageCircle,
  Search,
  Shield,
  UserRound,
  UsersRound,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGateway } from "@/components/auth-gateway";
import { CompleteProfile } from "@/components/complete-profile";
import { DatingDashboard } from "@/components/dating-dashboard";
import { api } from "@/lib/api";
import { AppView, useDatingStore } from "@/store/use-dating-store";

const navigation: Array<{ label: string; view: AppView; icon: LucideIcon }> = [
  { label: "Поиск", view: "search", icon: Search },
  { label: "Профиль", view: "profile", icon: UserRound },
  { label: "Матчи", view: "matches", icon: Heart },
  { label: "Чат", view: "chat", icon: MessageCircle },
  { label: "Гости", view: "visitors", icon: UsersRound },
  { label: "Уведомления", view: "notifications", icon: Bell },
  { label: "VIP", view: "vip", icon: Crown },
  { label: "Админ", view: "admin", icon: Shield }
];

export function AppShell() {
  const { activeView, isAuthenticated, logout, setActiveView, setUserFromApi, user } = useDatingStore();
  const visibleNavigation = navigation.filter((item) => item.view !== "admin" || user.role === "ADMIN");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("lsd_token", token);
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (token || localStorage.getItem("lsd_token")) {
      void api.get("/auth/me").then((response) => setUserFromApi(response.data)).catch(() => undefined);
    }
  }, [setUserFromApi]);

  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  if (!user.ucpName) {
    return <CompleteProfile />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass sticky top-4 z-20 flex items-center justify-between rounded-lg px-4 py-3">
          <button className="text-left" onClick={() => setActiveView("search")} type="button">
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">GTA 5 RP Social</p>
            <h1 className="text-xl font-black sm:text-2xl">Los Santos Dating</h1>
          </button>

          <nav className="hidden items-center gap-1 xl:flex">
            {visibleNavigation.slice(0, 7).map((item) => (
              <NavButton active={activeView === item.view} item={item} key={item.view} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Уведомления"
              className="relative grid h-10 w-10 place-items-center rounded-md bg-white/10 transition hover:bg-white/[0.15]"
              onClick={() => setActiveView("notifications")}
              type="button"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neonPink" />
            </button>
            <button
              className="hidden h-10 items-center gap-2 rounded-md bg-gradient-to-r from-neonPink to-neonPurple px-4 text-sm font-bold shadow-neon transition hover:scale-[1.02] sm:flex"
              onClick={() => setActiveView("vip")}
              type="button"
            >
              <Crown size={16} />
              VIP
            </button>
            <button aria-label="Выйти" className="grid h-10 w-10 place-items-center rounded-md bg-white/10 transition hover:bg-white/[0.15]" onClick={logout} type="button">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="grid flex-1 gap-5 py-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.5 }}
        >
          <aside className="glass hidden rounded-lg p-4 lg:block">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-neonPink to-neonPurple font-black">
                {user.socialNickname.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{user.socialNickname}</p>
                <p className="truncate text-sm text-white/50">
                  @{user.discord} · {user.ucpName} · {user.role}
                </p>
              </div>
            </div>

            <div className="space-y-2">
          {visibleNavigation.map((item) => (
                <NavButton active={activeView === item.view} full item={item} key={item.view} />
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-neonPurple/[0.35] bg-neonPurple/10 p-4">
              <Zap className="mb-3 text-neonPurple" size={22} />
              <p className="font-bold">Игровая соцсеть вне игры</p>
              <p className="mt-1 text-sm text-white/[0.55]">
                Discord привязан, UCP указан без проверки. Пользователи общаются здесь и следят за персонажами друг друга.
              </p>
            </div>
          </aside>

          <DatingDashboard />
        </motion.section>

        <nav className="glass sticky bottom-3 z-20 grid grid-cols-5 gap-1 rounded-lg p-2 lg:hidden">
          {visibleNavigation.slice(0, 5).map((item) => (
            <button
              aria-label={item.label}
              className={`grid h-11 place-items-center rounded-md transition ${activeView === item.view ? "bg-white/[0.14] text-white" : "text-white/60 hover:bg-white/10"}`}
              key={item.view}
              onClick={() => setActiveView(item.view)}
              type="button"
            >
              <item.icon size={19} />
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

function NavButton({
  active,
  full,
  item
}: {
  active: boolean;
  full?: boolean;
  item: { label: string; view: AppView; icon: LucideIcon };
}) {
  const setActiveView = useDatingStore((state) => state.setActiveView);

  return (
    <button
      className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm transition ${
        full ? "w-full text-left" : ""
      } ${active ? "bg-white/[0.14] text-white" : "text-white/[0.72] hover:bg-white/10 hover:text-white"}`}
      onClick={() => setActiveView(item.view)}
      type="button"
    >
      <item.icon size={16} />
      {item.label}
    </button>
  );
}
