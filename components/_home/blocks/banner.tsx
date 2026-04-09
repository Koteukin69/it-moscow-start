export type Link = {
  name: string;
  href: string;
}

export default function Banner({title, subtitle, links}: {title: string, subtitle: string, links: Link[]}) {
  return (<div className={"grid grid-cols-[3fr_2fr] w-full bg-gradient-to-r from-[#7B9EFF]/20 to -[#7B9EFF]/4 glass-dark rounded-[10px]"}>
    <div className={"flex flex-col p-10 gap-5"}>
      <div className={"font-medium text-[32px]"}>{title}</div>
      <div className={"text-[20px]"}>{subtitle}</div>
      <div className={"flex gap-2.5 text-[20px] font-medium"}>
        {links.map((link, i) => (
          <a href={link.href} className={"px-7.5 py-2 bg-[#3053B2] rounded-[10px] hover:underline"} key={i}>{link.name}</a>
        ))}
      </div>
    </div>
    <div className={"h-full bg-gray-500/50 glass-dark rounded-[10px]"}/>
  </div>);
}