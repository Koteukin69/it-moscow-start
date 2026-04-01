
export default function Title({title, description, ...props}: {title: string, description?: string} & React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={"flex flex-col text-center gap-2.5"} {...props}>
    <h1 className={"text-[32px] sm:text-[48px] lg:text-[64px] tracking-tighter font-bold"}>{title}</h1>
    {description && (<h2 className={"text-[16px] lg:text-[24px]"}>{description}</h2>)}
  </div>);
}