"use client";

import { FormEvent, useState } from "react";
import { Gamepad2, LogIn, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { NetworkUser, useDatingStore } from "@/store/use-dating-store";
import { API_URL, api } from "@/lib/api";

export function AuthGateway() {
  const register = useDatingStore((state) => state.register);
  const loginWithDiscord = useDatingStore((state) => state.loginWithDiscord);
  const [form, setForm] = useState<NetworkUser>({
    discord: "",
    ucpName: "",
    socialNickname: "",
    age: "",
    city: "Los Santos",
    bio: "",
    role: "USER",
    vipUntil: null
  });

  function update(field: keyof NetworkUser, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = {
      discord: form.discord || "discord_user",
      ucpName: form.ucpName || "UCP_Player",
      socialNickname: form.socialNickname || "New_Player",
      age: form.age || "18",
      city: form.city || "Los Santos",
      bio: form.bio || "Ищу общение вне игры и людей для игровых историй.",
      role: "USER" as const,
      vipUntil: null
    };

    register(user);
    void api.post("/auth/complete-profile", {
      ucpName: user.ucpName,
      socialNickname: user.socialNickname,
      age: Number(user.age),
      city: user.city,
      bio: user.bio
    }).catch(() => undefined);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />
      <section className="relative mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.45 }}>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-neonPink">GTA 5 RP social network</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-none sm:text-6xl lg:text-7xl">Los Santos Dating</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/[0.72]">
            Сеть знакомств и общения вне игры: игроки привязывают Discord, указывают UCP-аккаунт без проверки и создают публичный ник для социальной сети.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Info title="Персонажи" text="Смотри анкеты соигроков и их RP-статусы." />
            <Info title="Общение" text="Матчи, личные сообщения, гости профиля." />
            <Info title="Вне игры" text="Пользуйся сайтом с телефона или ПК." />
          </div>
        </motion.div>

        <motion.div animate={{ opacity: 1, scale: 1 }} className="glass rounded-lg p-5 sm:p-6" initial={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45, delay: 0.08 }}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neonPink">Вход или регистрация</p>
              <h2 className="mt-1 text-2xl font-black">Начни с Discord</h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#5865F2]">
              <Gamepad2 size={24} />
            </div>
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#5865F2] font-black transition hover:scale-[1.01]"
            onClick={() => {
              loginWithDiscord();
              window.location.href = `${API_URL}/auth/discord`;
            }}
            type="button"
          >
            <LogIn size={18} />
            Войти через Discord
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            или создать анкету
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <Field label="Discord" placeholder="name#0000 или username" value={form.discord} onChange={(value) => update("discord", value)} />
            <Field label="Имя UCP аккаунта" placeholder="Вводится без проверки" value={form.ucpName} onChange={(value) => update("ucpName", value)} />
            <Field label="Ник в социальной сети" placeholder="Например, NightDriver" value={form.socialNickname} onChange={(value) => update("socialNickname", value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Возраст" placeholder="18" value={form.age} onChange={(value) => update("age", value)} />
              <Field label="Игровой город" placeholder="Los Santos" value={form.city} onChange={(value) => update("city", value)} />
            </div>
            <label className="block">
              <span className="mb-2 block text-sm text-white/[0.62]">О себе / персонаже</span>
              <textarea
                className="min-h-[96px] w-full resize-none rounded-md border border-white/10 bg-black/[0.24] px-3 py-3 outline-none transition focus:border-neonPink"
                onChange={(event) => update("bio", event.target.value)}
                placeholder="Кого ищешь, какие RP-сюжеты интересны, как зовут персонажа..."
                value={form.bio}
              />
            </label>
            <button className="h-12 w-full rounded-md bg-gradient-to-r from-neonPink to-neonPurple font-black shadow-neon transition hover:scale-[1.01]" type="submit">
              Зарегистрироваться
            </button>
          </form>

          <p className="mt-4 flex gap-2 text-sm text-white/[0.55]">
            <ShieldCheck className="shrink-0 text-neonPurple" size={18} />
            Это прототип: Discord и UCP сохраняются локально, без реальной OAuth-проверки и без проверки игрового аккаунта.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/[0.62]">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-white/10 bg-black/[0.24] px-3 outline-none transition focus:border-neonPink"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function Info({ text, title }: { text: string; title: string }) {
  return (
    <div className="glass rounded-lg p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-white/[0.62]">{text}</p>
    </div>
  );
}
