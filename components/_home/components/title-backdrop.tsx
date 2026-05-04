import { TITLE_OVERLAY_COLOR } from "./technologies-constants";

type Props = {
  text: string;
  variant: "mobile" | "desktop";
};

export function TitleBackdrop({ text, variant }: Props) {
  const fontSizeClass =
    variant === "mobile"
      ? "text-[12vw]"
      : "text-[clamp(6rem,16vw,16rem)]";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      style={{ height: variant === "mobile" ? "18vw" : "clamp(4rem,9vw,8rem)" }}
      aria-hidden
    >
      <span
        className={`block whitespace-nowrap font-black uppercase tracking-[-0.02em] ${fontSizeClass} scale-y-150 h-[50%]`}
        style={{ color: TITLE_OVERLAY_COLOR, transform: "translateY(-12%)" }}
      >
        {text}
      </span>
    </div>
  );
}
