import Link from "next/link";

const LINK_PATTERN = /\[([^\]]+)\]\(((?:https?:\/\/|\/|\.\/|\.\.\/)[^\)]+)\)/;

export function parseInlineLinks(text: string): React.ReactNode[] {
  return text.split(LINK_PATTERN).map((part, index, parts) => {
    if (index % 3 === 0) return part;
    if (index % 3 === 1) return <Link className={"underline decoration-[1.5px] hover:decoration-[2px] active:opacity-50"} key={index} href={parts[index + 1]}>{part}</Link>;
    return null;
  });
}

export default function Title({title, description, className, ...props}: {title: string, description?: string, className?: string} & React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={`flex flex-col text-center gap-2.5 ${className}`} {...props}>
    <h1 className={"text-[32px] sm:text-[48px] lg:text-[64px] tracking-tighter font-bold"}>{parseInlineLinks(title)}</h1>
    {description && (<h2 className={"text-[16px] lg:text-[24px]"}>{parseInlineLinks(description)}</h2>)}
  </div>);
}