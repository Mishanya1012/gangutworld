"use client";

import type { ReactNode } from "react";
import {
  Ban,
  Camera,
  CheckCheck,
  Crown,
  Eye,
  Heart,
  MessageCircle,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserX,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { matches, notifications, profiles, reports, visitors } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { useDatingStore } from "@/store/use-dating-store";

const stats = [
  ["Онлайн", "1 284"],
  ["Анкет", "18 920"],
  ["Матчей", "4 712"],
  ["VIP", "328"]
];

export function DatingDashboard() {
  const activeView = useDatingStore((state) => state.activeView);
  const role = useDatingStore((state) => state.user.role);

  return (
    <>
      <section className="min-w-0 space-y-5">
        <HeroStats />
        {activeView === "search" && <SearchPage />}
        {activeView === "profile" && <ProfilePage />}
        {activeView === "matches" && <MatchesPage />}
        {activeView === "chat" && <ChatPage />}
        {activeView === "visitors" && <VisitorsPage />}
        {activeView === "notifications" && <NotificationsPage />}
        {activeView === "vip" && <VipPage />}
        {activeView === "admin" && (role === "ADMIN" ? <AdminPage /> : <AccessDenied />)}
      </section>

      <aside className="hidden space-y-5 xl:block">
        <CompactMatches />
        <CompactChat />
        <CompactVisitors />
        <SessionLikes />
      </aside>
    </>
  );
}

function HeroStats() {
  return (
    <div className="glass rounded-lg p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-neonPink">Знакомства игроков вне самой игры</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">Смотри персонажей, находи соигроков, начинай RP-истории</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:w-[420px]">
          {stats.map(([label, value]) => (
            <div className="rounded-lg bg-white/[0.08] p-3" key={label}>
              <p className="text-lg font-black">{value}</p>
              <p className="text-xs text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const { activeProfile, like, skip } = useDatingStore();

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      <motion.article
        animate={{ scale: 1, opacity: 1 }}
        className="glass overflow-hidden rounded-lg"
        initial={{ scale: 0.98, opacity: 0 }}
        key={activeProfile.id}
        transition={{ duration: 0.25 }}
      >
        <div className="relative min-h-[560px]">
          <img alt={activeProfile.nickname} className="absolute inset-0 h-full w-full object-cover" src={activeProfile.avatar} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/25 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="rounded-md bg-black/[0.45] px-3 py-1 text-sm backdrop-blur">
              ID {activeProfile.id} · {activeProfile.online ? "online" : "offline"}
            </span>
            {activeProfile.vip && <span className="rounded-md bg-neonPink px-3 py-1 text-sm font-bold text-white shadow-neon">VIP</span>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {activeProfile.interests.map((interest) => (
                <span className="rounded-md bg-white/[0.12] px-3 py-1 text-sm backdrop-blur" key={interest}>
                  #{interest}
                </span>
              ))}
            </div>
            <h3 className="text-4xl font-black">
              {activeProfile.nickname}, {activeProfile.age}
            </h3>
            <p className="mt-1 text-white/70">
              {activeProfile.gender} · {activeProfile.city} · Discord @{activeProfile.discord}
            </p>
            <p className="mt-2 text-white/[0.7]">
              Персонаж: {activeProfile.character.name} · {activeProfile.character.faction}
            </p>
            <p className="mt-3 max-w-2xl text-white/[0.82]">{activeProfile.bio}</p>
            <p className="mt-2 max-w-2xl text-sm text-neonPurple">{activeProfile.character.status}</p>
            <div className="mt-5 flex gap-3">
              <button aria-label="Пропустить" className="grid h-14 w-14 place-items-center rounded-lg bg-white/[0.12] transition hover:bg-white/20" onClick={skip} type="button">
                <X size={26} />
              </button>
              <button aria-label="Лайк" className="grid h-14 flex-1 place-items-center rounded-lg bg-gradient-to-r from-neonPink to-neonPurple font-black shadow-neon transition hover:scale-[1.01]" onClick={like} type="button">
                <span className="flex items-center gap-2">
                  <Heart fill="currentColor" size={22} />
                  Лайк
                </span>
              </button>
              <button aria-label="Скрыть анкету" className="grid h-14 w-14 place-items-center rounded-lg bg-white/[0.12] transition hover:bg-white/20" type="button">
                <UserX size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      <Filters />
    </div>
  );
}

function Filters() {
  return (
    <aside className="glass rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black">Фильтры</h3>
        <Search size={18} />
      </div>
      <div className="space-y-4">
        <Field label="Возраст" value="18-35" />
        <Field label="Город" value="Vinewood" />
        <Field label="Пол" value="Любой" />
        <div className="grid grid-cols-2 gap-2">
          {["Онлайн", "Фото", "VIP", "Персонаж"].map((item) => (
            <button className="rounded-md bg-white/10 px-3 py-2 text-sm transition hover:bg-white/[0.15]" key={item} type="button">
              {item}
            </button>
          ))}
        </div>
        <button className="h-11 w-full rounded-md border border-neonPurple/50 bg-neonPurple/[0.15] font-bold text-white transition hover:bg-neonPurple/25" type="button">
          Применить
        </button>
      </div>
    </aside>
  );
}

function ProfilePage() {
  const user = useDatingStore((state) => state.user);

  return (
    <PagePanel title="Мой профиль" icon={<Camera size={20} />}>
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-lg bg-gradient-to-br from-neonPink to-neonPurple p-5 shadow-neon">
          <div className="grid aspect-square place-items-center rounded-lg bg-black/25 text-6xl font-black">
            {user.socialNickname.slice(0, 2).toUpperCase()}
          </div>
          <button className="mt-4 h-11 w-full rounded-md bg-white/15 font-bold transition hover:bg-white/25" type="button">
            Загрузить фото
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Ник в сети" value={user.socialNickname} />
          <Info label="Discord" value={`@${user.discord}`} />
          <Info label="UCP аккаунт" value={user.ucpName} />
          <Info label="Возраст" value={user.age} />
          <Info label="Игровой город" value={user.city} />
          <Info label="Статус" value="Анкета видна всем игрокам" />
          <div className="sm:col-span-2">
            <Info label="О себе и персонаже" value={user.bio} />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className="h-11 rounded-md bg-white/10 px-4 font-bold transition hover:bg-white/15" type="button">Изменить профиль</button>
            <button className="h-11 rounded-md bg-white/10 px-4 font-bold transition hover:bg-white/15" type="button">Скрыть анкету</button>
            <button className="h-11 rounded-md bg-red-500/20 px-4 font-bold text-red-100 transition hover:bg-red-500/30" type="button">Удалить фото</button>
          </div>
        </div>
      </div>
    </PagePanel>
  );
}

function MatchesPage() {
  return (
    <PagePanel title="Совпадения" icon={<Heart size={20} />}>
      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((match) => (
          <ActionRow
            action="Открыть чат"
            icon={<MessageCircle size={18} />}
            key={match.id}
            subtitle={match.last}
            title={match.name}
          />
        ))}
      </div>
    </PagePanel>
  );
}

function ChatPage() {
  return (
    <PagePanel title="Чат" icon={<MessageCircle size={20} />}>
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-2">
          {matches.map((match) => (
            <button className="flex w-full items-center gap-3 rounded-md bg-white/[0.08] p-3 text-left transition hover:bg-white/[0.14]" key={match.id} type="button">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white/[0.12] font-bold">{match.name.slice(0, 2)}</div>
              <div className="min-w-0">
                <p className="truncate font-bold">{match.name}</p>
                <p className="truncate text-sm text-white/50">{match.last}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-black/[0.18] p-4">
          <Bubble text="Привет, видел твою анкету. Сегодня играешь?" />
          <Bubble mine text="Да, после 21:00. Можно обсудить сюжет вне игры." />
          <Bubble text="Отлично, я тогда скину идею для персонажей." />
          <p className="mt-2 flex items-center gap-2 text-xs text-white/[0.45]">
            <CheckCheck size={14} /> прочитано · печатает...
          </p>
          <div className="mt-4 flex gap-2">
            <button className="grid h-11 w-11 place-items-center rounded-md bg-white/10" type="button">
              <Camera size={17} />
            </button>
            <input className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-3 outline-none focus:border-neonPink" placeholder="Сообщение, эмодзи или вложение" />
            <button className="grid h-11 w-11 place-items-center rounded-md bg-neonPink" type="button">
              <Send size={17} />
            </button>
          </div>
        </div>
      </div>
    </PagePanel>
  );
}

function VisitorsPage() {
  return (
    <PagePanel title="Гости профиля" icon={<Eye size={20} />}>
      <div className="space-y-2">
        {visitors.map((visitor) => (
          <ActionRow action="Открыть" icon={<Eye size={18} />} key={visitor.id} subtitle={visitor.time} title={visitor.name} />
        ))}
      </div>
    </PagePanel>
  );
}

function NotificationsPage() {
  return (
    <PagePanel title="Уведомления" icon={<BellIcon />}>
      <div className="grid gap-3 md:grid-cols-2">
        {notifications.map((item) => (
          <div className="rounded-lg bg-white/[0.08] p-4" key={item.id}>
            <p className="font-black">{item.title}</p>
            <p className="mt-1 text-sm text-white/[0.62]">{item.text}</p>
          </div>
        ))}
      </div>
    </PagePanel>
  );
}

function VipPage() {
  function requestVip() {
    void api.post("/payments/vip-request", {
      amount: 1000,
      note: "VIP requested after game balance top-up"
    }).catch(() => undefined);
  }

  return (
    <PagePanel title="VIP функции" icon={<Crown size={20} />}>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Просмотр лайков", "Видно, кто оценил твою анкету."],
          ["Расширенные фильтры", "Ищи по онлайну, VIP, фото, городу и RP-интересам."],
          ["Безлимит действий", "Больше лайков, сообщений и гостей профиля."]
        ].map(([title, text]) => (
          <div className="rounded-lg border border-neonPink/40 bg-neonPink/10 p-5" key={title}>
            <Crown className="mb-4 text-neonPink" size={24} />
            <p className="font-black">{title}</p>
            <p className="mt-2 text-sm text-white/[0.62]">{text}</p>
          </div>
        ))}
      </div>
      <button
        className="mt-5 h-12 rounded-md bg-gradient-to-r from-neonPink to-neonPurple px-5 font-black shadow-neon transition hover:scale-[1.01]"
        onClick={requestVip}
        type="button"
      >
        Отправить заявку на VIP после пополнения игрового баланса
      </button>
    </PagePanel>
  );
}

function AccessDenied() {
  return (
    <PagePanel title="Доступ закрыт" icon={<ShieldAlert size={20} />}>
      <p className="text-white/[0.68]">Админ-панель доступна только пользователям с ролью ADMIN. Роль выдается на backend через Discord ID.</p>
    </PagePanel>
  );
}

function AdminPage() {
  return (
    <PagePanel title="Админ-панель" icon={<ShieldAlert size={20} />}>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg bg-white/[0.08] p-4">
          <h3 className="mb-3 font-black">Пользователи</h3>
          {profiles.map((profile) => (
            <ActionRow action="Блок" icon={<Ban size={18} />} key={profile.id} subtitle={`${profile.ucpName} · ${profile.city}`} title={profile.nickname} />
          ))}
        </section>
        <section className="rounded-lg bg-white/[0.08] p-4">
          <h3 className="mb-3 font-black">Жалобы</h3>
          {reports.map((report) => (
            <ActionRow action={report.status} icon={<Trash2 size={18} />} key={report.id} subtitle={report.reason} title={report.target} />
          ))}
        </section>
        <section className="rounded-lg bg-white/[0.08] p-4 lg:col-span-2">
          <h3 className="mb-3 font-black">Статистика</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="DAU" value="1 284" />
            <Info label="Регистрации сегодня" value="97" />
            <Info label="Конверсия VIP" value="6.8%" />
          </div>
        </section>
      </div>
    </PagePanel>
  );
}

function CompactMatches() {
  return (
    <Panel title="Матчи" icon={<Heart size={18} />}>
      {matches.map((match) => (
        <button className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-white/10" key={match.id} type="button">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-white/[0.12] font-bold">{match.name.slice(0, 2)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{match.name}</p>
            <p className="truncate text-sm text-white/50">{match.last}</p>
          </div>
          {match.unread > 0 && <span className="grid h-6 w-6 place-items-center rounded-full bg-neonPink text-xs font-bold">{match.unread}</span>}
        </button>
      ))}
    </Panel>
  );
}

function CompactChat() {
  return (
    <Panel title="Чат" icon={<MessageCircle size={18} />}>
      <div className="space-y-3">
        <Bubble text="Привет, видел твою анкету. Сегодня играешь?" />
        <Bubble mine text="Да, после 21:00. Можно заехать к казино." />
        <p className="flex items-center gap-2 text-xs text-white/[0.45]">
          <CheckCheck size={14} /> прочитано
        </p>
        <div className="flex gap-2">
          <input className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-3 outline-none focus:border-neonPink" placeholder="Сообщение" />
          <button className="grid h-10 w-10 place-items-center rounded-md bg-neonPink" type="button">
            <Send size={17} />
          </button>
        </div>
      </div>
    </Panel>
  );
}

function CompactVisitors() {
  return (
    <Panel title="Гости" icon={<Sparkles size={18} />}>
      {visitors.map((visitor) => (
        <div className="flex items-center justify-between rounded-md p-2" key={visitor.id}>
          <span className="font-semibold">{visitor.name}</span>
          <span className="text-xs text-white/[0.45]">{visitor.time}</span>
        </div>
      ))}
    </Panel>
  );
}

function SessionLikes() {
  const likedIds = useDatingStore((state) => state.likedIds);

  return (
    <div className="glass rounded-lg p-4">
      <p className="text-sm text-white/50">Лайков за сессию</p>
      <p className="text-3xl font-black text-neonPink">{likedIds.length}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/[0.55]">{label}</span>
      <select className="h-11 w-full rounded-md border border-white/10 bg-black/[0.24] px-3 outline-none focus:border-neonPink" defaultValue={value}>
        <option>{value}</option>
        <option>Все</option>
      </select>
    </label>
  );
}

function PagePanel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="glass rounded-lg p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-black">{title}</h2>
        <span className="text-neonPink">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="glass rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">{title}</h3>
        <span className="text-neonPink">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function Bubble({ text, mine }: { text: string; mine?: boolean }) {
  return (
    <div className={`max-w-[86%] rounded-lg px-3 py-2 text-sm ${mine ? "ml-auto bg-neonPink text-white" : "bg-white/10 text-white/[0.86]"}`}>
      {text}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.08] p-4">
      <p className="text-sm text-white/[0.52]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function ActionRow({ action, icon, subtitle, title }: { action: string; icon: ReactNode; subtitle: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white/[0.12] font-black">{title.slice(0, 2)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{title}</p>
        <p className="truncate text-sm text-white/[0.55]">{subtitle}</p>
      </div>
      <button className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-bold transition hover:bg-white/[0.16]" type="button">
        {icon}
        <span className="hidden sm:inline">{action}</span>
      </button>
    </div>
  );
}

function BellIcon() {
  return <Sparkles size={20} />;
}
