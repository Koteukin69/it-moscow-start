import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GorodPage() {
  return (
    <div className="fixed inset-0 bg-[#0a0a14]">
      <Link
        href="/store"
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        В магазин
      </Link>
      <iframe
        src="/Game/index.html"
        className="w-full h-full border-0"
        allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope; xr-spatial-tracking"
        allowFullScreen
      />
    </div>
  );
}
