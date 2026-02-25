import {Sparkles} from "lucide-react";

export default function ShopBanner() {
  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] via-[#1e293b] to-[#0f172a]">
      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"/>
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"/>

      <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3 px-5 py-6 sm:px-8 sm:py-8">
        {/* Tag */}
        <div className="flex items-center gap-1.5 text-purple-300 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
          <Sparkles size={12} className="shrink-0"/>
          Новая коллекция
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
          Новый дизайн<br/>
          Новый{" "}
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            вайб
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300/80 max-w-xs">
          Примерь новую коллекцию мерча IT.Москва
        </p>

        {/* Decorative dots */}
        <div className="flex gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400"/>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
        </div>
      </div>
    </div>
  );
}
