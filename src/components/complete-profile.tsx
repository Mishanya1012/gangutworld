"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useDatingStore } from "@/store/use-dating-store";

export function CompleteProfile() {
  const { setUserFromApi, user } = useDatingStore();
  const [form, setForm] = useState({
    ucpName: user.ucpName,
    socialNickname: user.socialNickname,
    age: user.age,
    city: user.city,
    bio: user.bio
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await api.post("/auth/complete-profile", {
      ucpName: form.ucpName,
      socialNickname: form.socialNickname,
      age: Number(form.age),
      city: form.city,
      bio: form.bio
    });
    setUserFromApi(response.data);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />
      <section className="relative mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-2xl items-center">
        <form className="glass rounded-lg p-5 sm:p-6" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-neonPink to-neonPurple">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neonPink">Discord привязан</p>
              <h1 className="text-2xl font-black">Заполни профиль соцсети</h1>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Имя UCP аккаунта" placeholder="Без проверки, как ты просил" value={form.ucpName} onChange={(value) => update("ucpName", value)} />
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
                placeholder="Кого ищешь, какие RP-сюжеты интересны..."
                value={form.bio}
              />
            </label>
            <button className="h-12 w-full rounded-md bg-gradient-to-r from-neonPink to-neonPurple font-black shadow-neon transition hover:scale-[1.01]" type="submit">
              Сохранить и войти
            </button>
          </div>
        </form>
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
