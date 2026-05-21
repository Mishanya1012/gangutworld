"use client";

import { create } from "zustand";
import { Profile, profiles } from "@/lib/mock-data";

export type AppView = "search" | "profile" | "matches" | "chat" | "visitors" | "notifications" | "vip" | "admin";
export type UserRole = "USER" | "VIP" | "ADMIN";

export type NetworkUser = {
  id?: string;
  discord: string;
  discordId?: string;
  avatar?: string | null;
  ucpName: string;
  socialNickname: string;
  age: string;
  city: string;
  bio: string;
  role: UserRole;
  vipUntil?: string | null;
};

export type ApiUser = {
  id: string;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string | null;
  ucpName: string;
  socialNickname: string;
  role: UserRole;
  vipUntil?: string | null;
  profile?: {
    age?: number | null;
    city?: string | null;
    bio?: string | null;
  } | null;
};

type DatingState = {
  isAuthenticated: boolean;
  activeView: AppView;
  currentIndex: number;
  likedIds: number[];
  skippedIds: number[];
  activeProfile: Profile;
  user: NetworkUser;
  setActiveView: (view: AppView) => void;
  setUserFromApi: (payload: ApiUser) => void;
  register: (user: NetworkUser) => void;
  loginWithDiscord: () => void;
  logout: () => void;
  like: () => void;
  skip: () => void;
};

const defaultUser: NetworkUser = {
  discord: "discord_user",
  ucpName: "Player123_UCP",
  socialNickname: "Player123",
  age: "21",
  city: "Los Santos",
  bio: "Ищу общение вне игры и людей для красивых RP-историй.",
  role: "USER",
  vipUntil: null
};

export const useDatingStore = create<DatingState>((set, get) => ({
  isAuthenticated: false,
  activeView: "search",
  currentIndex: 0,
  likedIds: [],
  skippedIds: [],
  activeProfile: profiles[0],
  user: defaultUser,
  setActiveView: (view) => set({ activeView: view }),
  setUserFromApi: (payload) =>
    set({
      isAuthenticated: true,
      activeView: "search",
      user: {
        id: payload.id,
        discord: payload.discordUsername,
        discordId: payload.discordId,
        avatar: payload.discordAvatar,
        ucpName: payload.ucpName || "",
        socialNickname: payload.socialNickname || payload.discordUsername,
        age: payload.profile?.age ? String(payload.profile.age) : "18",
        city: payload.profile?.city || "Los Santos",
        bio: payload.profile?.bio || "Ищу общение вне игры и людей для красивых RP-историй.",
        role: payload.role,
        vipUntil: payload.vipUntil
      }
    }),
  register: (user) => set({ user, isAuthenticated: true, activeView: "search" }),
  loginWithDiscord: () => set({ user: defaultUser, isAuthenticated: true, activeView: "search" }),
  logout: () => {
    localStorage.removeItem("lsd_token");
    set({ isAuthenticated: false, activeView: "search" });
  },
  like: () => {
    const { activeProfile, currentIndex, likedIds } = get();
    const nextIndex = (currentIndex + 1) % profiles.length;

    set({
      likedIds: [...new Set([...likedIds, activeProfile.id])],
      currentIndex: nextIndex,
      activeProfile: profiles[nextIndex]
    });
  },
  skip: () => {
    const { activeProfile, currentIndex, skippedIds } = get();
    const nextIndex = (currentIndex + 1) % profiles.length;

    set({
      skippedIds: [...new Set([...skippedIds, activeProfile.id])],
      currentIndex: nextIndex,
      activeProfile: profiles[nextIndex]
    });
  }
}));
