"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Gamepad2, Lock, Shield, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUEST_WARNING_DISMISSED_KEY = "itmoscow-store-guest-warning-dismissed";

type Game = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  href: string | null;
  external?: boolean;
  requiresAuth: boolean;
  gradient: string;
  icon: React.ReactNode;
  rating: number | null;
  players: string;
  isFeatured?: boolean;
  coverImage?: string;
  platforms?: string[];
};

const GAMES: Game[] = [
  {
    id: "gorod",
    title: "Город Мастеров",
    tagline: "Примерь профессию мечты в живом городе",
    description:
      "Погрузись в пиксельный город московских колледжей: выбирай профессию, проходи испытания и собирай команду. Ты — студент, который прокладывает собственный путь в мире IT, строительства, медицины и десятков других специальностей. Исследуй улицы, выполняй задания и открывай своё призвание.",
    tags: ["Ролевая", "Приключение", "Профессии"],
    href: "https://masterscitygame.ru/play",
    external: true,
    requiresAuth: false,
    gradient: "from-[#1a1000] via-[#2a1800] to-[#0e0a00]",
    icon: <Zap size={44} className="text-orange-400" />,
    rating: 4.9,
    players: "5к+",
    isFeatured: true,
    coverImage: "/gorod-masterov-hero.png",
    platforms: ["Windows", "Android"],
  },
  {
    id: "runner",
    title: "ИТ.Раннер",
    tagline: "Беги по коридорам колледжа, собирай монеты",
    description: "Бесконечный раннер в стенах ИТ.Москвы.",
    tags: ["Раннер", "Аркада"],
    href: "/game",
    requiresAuth: true,
    gradient: "from-[#0d1a40] via-[#0a2260] to-[#061028]",
    icon: <Zap size={36} className="text-[#7B9EFF]" />,
    rating: 4.8,
    players: "1.2к",
  },
  {
    id: "fly",
    title: "ИТ.Флай",
    tagline: "Лети сквозь здания московских колледжей",
    description: "Уворачивайся от стен и зарабатывай ИтКоины.",
    tags: ["Флай", "Рефлексы", "Монеты"],
    href: "/games/fly",
    requiresAuth: false,
    gradient: "from-[#0a1a30] via-[#102040] to-[#061018]",
    icon: <Star size={36} className="text-blue-400" />,
    rating: 4.5,
    players: "новинка",
  },
  {
    id: "2048",
    title: "ИТ.2048",
    tagline: "Классический 2048 в стиле ИТ.Москвы",
    description: "Складывай плитки и зарабатывай ИтКоины.",
    tags: ["Головоломка", "Монеты"],
    href: "/games/2048",
    requiresAuth: false,
    gradient: "from-[#0d1a30] via-[#0a1a3e] to-[#060e20]",
    icon: <Shield size={36} className="text-[#7B9EFF]" />,
    rating: 4.6,
    players: "новинка",
  },
  {
    id: "cyber",
    title: "Кибер-Олимпиада",
    tagline: "Турнир по программированию и кибербезу",
    description: "Соревнуйся в режиме реального времени.",
    tags: ["PvP", "Программирование"],
    href: null,
    requiresAuth: false,
    gradient: "from-[#1a0a2e] via-[#2d1a4e] to-[#0d0a1e]",
    icon: <Lock size={36} className="text-purple-400" />,
    rating: null,
    players: "—",
  },
];

const featured = GAMES.find(g => g.isFeatured)!;
const rest = GAMES.filter(g => !g.isFeatured);

export default function GameStore({ userId, userAvatar }: { userId?: string; userAvatar?: string }) {
  const isAuthenticated = !!userId;
  const hasAvatarUrl = !!userAvatar && /^https?:\/\//.test(userAvatar);
  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;
    const dismissed = sessionStorage.getItem(GUEST_WARNING_DISMISSED_KEY) === "1";
    if (!dismissed) setWarningOpen(true);
  }, [isAuthenticated]);

  function dismissWarning() {
    sessionStorage.setItem(GUEST_WARNING_DISMISSED_KEY, "1");
    setWarningOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      <header className="sticky top-0 z-20 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/abit"
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Назад
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <Gamepad2 size={18} className="text-[#7B9EFF]" />
              <span className="font-semibold text-sm">Игры ИТ.Москва</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop?from=/store" className="text-white/50 hover:text-white text-sm transition-colors">
              Магазин
            </Link>
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="block w-9 h-9 rounded-full overflow-hidden bg-white/10 hover:ring-2 hover:ring-white/40 transition-all"
                title="Профиль"
              >
                {hasAvatarUrl ? (
                  <Image
                    src={userAvatar!}
                    width={36}
                    height={36}
                    alt="Профиль"
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#7B9EFF] to-[#5b7be0] flex items-center justify-center text-sm font-bold text-white">
                    ?
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/api/auth/vk?mode=login&returnUrl=/store"
                className="px-4 py-2 rounded-lg bg-[#7B9EFF] hover:bg-[#a0b8ff] text-[#0f0f13] text-sm font-bold transition-colors shadow-lg shadow-[#7B9EFF]/30"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>

      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1a22] border border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-white">Прогресс не сохранится</h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Вы не вошли в аккаунт. Все монеты, достижения и результаты игр будут потеряны после закрытия вкладки.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/api/auth/vk?mode=login&returnUrl=/store"
                className="w-full text-center px-4 py-2.5 rounded-lg bg-[#7B9EFF] hover:bg-[#a0b8ff] text-[#0f0f13] text-sm font-bold transition-colors"
              >
                Войти и сохранять прогресс
              </Link>
              <button
                onClick={dismissWarning}
                className="w-full text-center px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
              >
                Продолжить без входа
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-8 sm:gap-12">
        <section className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[460px] flex items-end">
          {featured.coverImage && (
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          <div className={`absolute inset-0 ${featured.coverImage ? "" : `bg-gradient-to-br ${featured.gradient}`}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          <div className="relative z-10 p-5 sm:p-8 lg:p-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 w-full">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-xl">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium">
                  Хит сезона
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs sm:text-sm">
                  <Star size={12} fill="currentColor" />
                  <span className="font-medium">{featured.rating}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-white/40 text-sm">
                  <Users size={13} />
                  <span>{featured.players} игроков</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-lg">
                {featured.title}
              </h1>
              <p className="hidden sm:block text-white/75 text-base leading-relaxed">{featured.description}</p>
              <p className="sm:hidden text-white/70 text-sm leading-snug line-clamp-2">{featured.tagline}</p>

              <div className="hidden sm:flex flex-wrap gap-2">
                {featured.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {featured.platforms && (
                <div className="hidden sm:flex gap-2">
                  {featured.platforms.map(p => (
                    <span key={p} className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/12 text-white/50 text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              {featured.external ? (
                <a href={featured.href!} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-[#0f0f13] hover:bg-white/90 font-bold px-8 h-11 sm:h-12 w-full sm:w-auto">
                    Играть
                  </Button>
                </a>
              ) : featured.requiresAuth && !userId ? (
                <Link href="/api/auth/vk?mode=login&returnUrl=/game">
                  <Button size="lg" className="bg-white text-[#0f0f13] hover:bg-white/90 font-bold px-8 h-11 sm:h-12 w-full sm:w-auto">
                    Войти и играть
                  </Button>
                </Link>
              ) : (
                <Link href={featured.href!}>
                  <Button size="lg" className="bg-white text-[#0f0f13] hover:bg-white/90 font-bold px-8 h-11 sm:h-12 w-full sm:w-auto">
                    Играть бесплатно
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-lg sm:text-xl font-bold text-white/90">Все игры</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {rest.map(game => (
              <GameCard key={game.id} game={game} userId={userId} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function GameCard({ game, userId }: { game: Game; userId?: string }) {
  const comingSoon = !game.href;
  const needsAuth = game.href && game.requiresAuth && !userId;
  const canPlay = game.href && (!game.requiresAuth || !!userId);

  return (
    <div className="group rounded-xl border border-white/8 bg-white/4 overflow-hidden flex flex-col hover:border-white/16 transition-colors">
      <div className={`relative h-24 sm:h-36 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
        {game.icon}
        {comingSoon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs font-medium">
              Скоро
            </span>
          </div>
        )}
        {!comingSoon && game.rating !== null && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
            <Star size={10} fill="#facc15" className="text-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-medium">{game.rating}</span>
          </div>
        )}
        {!comingSoon && game.rating === null && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
            <span className="text-white/40 text-[10px]">новинка</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 flex-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold text-white/90 text-sm sm:text-base leading-tight">{game.title}</h3>
          <p className="text-white/50 text-xs sm:text-sm leading-snug line-clamp-2">{game.tagline}</p>
        </div>
        <div className="hidden sm:flex flex-wrap gap-1.5 mt-auto">
          {game.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/8 text-white/40 text-xs">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto">
          {canPlay && (
            game.external ? (
              <a href={game.href!} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full bg-white text-[#0f0f13] hover:bg-white/90 font-semibold text-xs sm:text-sm h-8 sm:h-9">
                  Играть
                </Button>
              </a>
            ) : (
              <Link href={game.href!}>
                <Button size="sm" className="w-full bg-white text-[#0f0f13] hover:bg-white/90 font-semibold text-xs sm:text-sm h-8 sm:h-9">
                  Играть
                </Button>
              </Link>
            )
          )}
          {needsAuth && (
            <Link href={`/api/auth/vk?mode=login&returnUrl=${game.href}`}>
              <Button size="sm" variant="outline" className="w-full border-white/20 text-white/70 hover:text-white text-xs sm:text-sm h-8 sm:h-9">
                Войти и играть
              </Button>
            </Link>
          )}
          {comingSoon && (
            <Button size="sm" disabled className="w-full opacity-40 text-xs sm:text-sm h-8 sm:h-9">Скоро</Button>
          )}
        </div>
      </div>
    </div>
  );
}
