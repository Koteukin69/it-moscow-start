import { headers } from "next/headers";
import Back from "@/components/back";
import Link from "next/link";
import {
  Code2,
  Upload,
  ShieldCheck,
  Coins,
  Globe,
  Gamepad2,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: <ShieldCheck size={28} />,
    title: "Авторизация",
    color: "#7B9EFF",
    items: [
      "Войди через ВКонтакте или Яндекс — это обязательно для загрузки",
      "Авторизация привязывает игру к твоему профилю и позволяет начислять IT.Coin",
      "Без авторизации опубликовать игру невозможно — данные анонимных пользователей не сохраняются",
    ],
  },
  {
    number: "02",
    icon: <Code2 size={28} />,
    title: "Создание игры",
    color: "#5AFF9E",
    items: [
      "Игра должна быть веб-приложением — поддерживаются HTML5, JavaScript, TypeScript, Canvas, WebGL",
      "Фреймворки: Phaser, Three.js, Babylon.js, p5.js, PixiJS или чистый JS",
      "Игра обязана содержать интеграцию с API ИТ.Москва для начисления монет игрокам",
      "Размер проекта не должен превышать 50 МБ в ZIP-архиве",
      "Запрещены: монетизация, реклама, нарушение авторских прав",
    ],
  },
  {
    number: "03",
    icon: <Coins size={28} />,
    title: "Интеграция IT.Coin",
    color: "#FFD95A",
    items: [
      "Для начисления монет вызывай API: POST /api/games/reward",
      "Тело запроса: { \"amount\": число_монет }",
      "Токен игрока передаётся автоматически через cookie — убедись, что запрос идёт с того же домена",
      "Максимум за одну сессию: 500 монет. Лимит обновляется раз в 24 часа",
      "Попытки накрутки автоматически блокируются системой",
    ],
    code: `// Пример вызова в твоей игре
async function rewardPlayer(amount: number) {
  const res = await fetch("/api/games/reward", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("Начислено монет:", data.coins);
  }
}`,
  },
  {
    number: "04",
    icon: <FileArchive size={28} />,
    title: "Подготовка архива",
    color: "#FF9E7B",
    items: [
      "Упакуй всё в ZIP: index.html должен быть в корне архива",
      "Включи все ресурсы: изображения, звуки, шрифты — внешних CDN лучше избегать",
      "Добавь файл README.md с описанием игры, управлением и жанром",
      "Укажи имя автора и контакты для связи",
    ],
  },
  {
    number: "05",
    icon: <Upload size={28} />,
    title: "Загрузка и публикация",
    color: "#FF7BFF",
    items: [
      "Отправь архив на почту workshop@itmoscow.pro с темой «Мастерская — [название игры]»",
      "В теле письма: краткое описание игры (2–3 предложения) и скриншот",
      "Модерация занимает до 3 рабочих дней",
      "После одобрения игра появится в каталоге Мастерской и будет доступна всем студентам",
    ],
  },
  {
    number: "06",
    icon: <Globe size={28} />,
    title: "После публикации",
    color: "#7BFFEF",
    items: [
      "Твоя игра отображается в каталоге со ссылкой на твой профиль",
      "Студенты играют и зарабатывают монеты — твоя игра помогает сообществу",
      "Топ-3 игры по рейтингу каждый месяц получают специальный приз от ИТ.Москва",
      "Лучшие проекты презентуются на открытых мероприятиях колледжа",
    ],
  },
];

const REQUIREMENTS = [
  { ok: true, text: "Работает в браузере без установки" },
  { ok: true, text: "Файл index.html в корне архива" },
  { ok: true, text: "Размер до 50 МБ" },
  { ok: true, text: "Интеграция с /api/games/reward" },
  { ok: true, text: "README.md с описанием" },
  { ok: false, text: "Внешние сервисы с авторизацией" },
  { ok: false, text: "Встроенная реклама или монетизация" },
  { ok: false, text: "Контент 18+" },
  { ok: false, text: "Нарушение авторских прав" },
];

export default async function WorkshopPage() {
  const h = await headers();
  const userId = h.get("x-user-id");
  const rawName = h.get("x-user-name");
  const name = rawName ? decodeURIComponent(rawName) : null;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      <Back link="/" />

      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-16 px-5 sm:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6A5BFF]/20 via-transparent to-[#7B9EFF]/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#6A5BFF]/20 border border-[#6A5BFF]/40 rounded-full px-4 py-1.5 text-sm text-[#a09bff] mb-6">
            <Gamepad2 size={14} />
            ИТ.Москва Мастерская
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-4">
            Покажи свою игру
            <br />
            <span className="text-[#6A5BFF]">всей Москве</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Разработай игру, загрузи её в мастерскую и дай другим студентам заработать монеты.
            Лучшие проекты выйдут на большую аудиторию.
          </p>

          {!userId && (
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/api/auth/vk?mode=login&returnUrl=/workshop"
                className="flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Войти через ВКонтакте
              </Link>
              <Link
                href="/api/auth/yandex?mode=login&returnUrl=/workshop"
                className="flex items-center gap-2 bg-[#FC3F1D] hover:bg-[#E0380F] text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Войти через Яндекс
              </Link>
            </div>
          )}
          {userId && name && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm">
              <CheckCircle2 size={14} className="text-[#5AFF9E]" />
              <span className="text-white/70">Вы вошли как</span>
              <span className="font-semibold">{name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 pb-16 space-y-6">
        {STEPS.map(step => (
          <div
            key={step.number}
            className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${step.color}22`, color: step.color }}
              >
                {step.icon}
              </div>
              <div>
                <div className="text-xs font-mono text-white/30 mb-0.5">Шаг {step.number}</div>
                <h2 className="text-lg font-bold">{step.title}</h2>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              {step.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: step.color }} />
                  <p className="text-white/70 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
              {step.code && (
                <pre className="mt-4 bg-black/40 rounded-xl p-4 text-xs text-[#5AFF9E] overflow-x-auto border border-white/8 leading-relaxed">
                  <code>{step.code}</code>
                </pre>
              )}
            </div>
          </div>
        ))}

        {/* Requirements checklist */}
        <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/8">
            <h2 className="text-lg font-bold">Требования к игре</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REQUIREMENTS.map((req, i) => (
              <div key={i} className="flex items-center gap-3">
                {req.ok ? (
                  <CheckCircle2 size={16} className="text-[#5AFF9E] flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-[#FF7B7B] flex-shrink-0" />
                )}
                <span className={`text-sm ${req.ok ? "text-white/80" : "text-white/50"}`}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-white/50 text-sm mb-4">
            Есть вопросы? Пиши на{" "}
            <a href="mailto:workshop@itmoscow.pro" className="text-[#7B9EFF] hover:underline">
              workshop@itmoscow.pro
            </a>
          </p>
          {!userId && (
            <p className="text-white/30 text-xs">
              Для загрузки игры необходима авторизация
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
