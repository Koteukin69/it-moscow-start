import React from "react";

export default function Badge({children, className, ...props}: Readonly<{
  children: React.ReactNode;
  className?: string;
}> & React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={`px-1.5 py-0.75 rounded-full text-12 font-bold ${className}`} {...props}>
    {children}
  </div>);
}