import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale, StringKey } from "../hooks/useLocale";

type Theme = "dark" | "light";

const STRINGS = {
  en: {
    swap: "SWAP", pool: "LIQUIDITY", perps: "PERPETUALS", farm: "YIELD FARM",
    locker: "LOCKER", quests: "QUESTS", staking: "STAKING", leaderboard: "LEADERBOARD",
    bridge: "BRIDGE", profile: "PROFILE", create: "CREATE", admin: "ADMIN",
    connect: "CONNECT", signIn: "SIGN IN", signedIn: "SIGNED IN", disconnect: "DISCONNECT",
    manageWallet: "MANAGE WALLET", viewProfile: "VIEW PROFILE", live: "LIVE",
  },
  zh: {
    swap: "兑换", pool: "流动性", perps: "永续合约", farm: "收益农场",
    locker: "锁仓", quests: "任务", staking: "质押", leaderboard: "排行榜",
    bridge: "跨链桥", profile: "个人资料", create: "创建", admin: "管理员",
    connect: "连接钱包", signIn: "登录", signedIn: "已登录", disconnect: "断开连接",
    manageWallet: "管理钱包", viewProfile: "查看资料", live: "实时",
  },
} as const;

interface UIContextValue {
  theme: Theme;
  toggleTheme: () => void;
  locale: Locale;
  toggleLocale: () => void;
  t: (key: StringKey) => string;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>("dark");
  const [locale, setLocale] = useState<Locale>(() =>
    (localStorage.getItem("jinkfi_locale") as Locale) ?? "en"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.removeItem("jinkfi_theme");
  }, []);

  const toggleTheme = () => {};
  const toggleLocale = () => {
    const next: Locale = locale === "en" ? "zh" : "en";
    localStorage.setItem("jinkfi_locale", next);
    setLocale(next);
  };

  const t = (key: StringKey): string => STRINGS[locale][key];

  return (
    <UIContext.Provider value={{ theme, toggleTheme, locale, toggleLocale, t }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
