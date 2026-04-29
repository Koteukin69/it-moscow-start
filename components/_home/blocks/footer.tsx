import {Card, CardContent} from "@/components/ui/card";
import {Phone, Mail, Send} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-[#71717B80] bg-[#18181B] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="flex flex-col gap-5 min-w-0">
            <div className={"flex flex-col gap-2.5"}>
              <h2 className="text-[32px] font-medium">Остались вопросы?</h2>
              <p className="text-[20px] font-medium text-[#bbb]">
                Задайте вопрос приёмной комиссии
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row items-start">
              <div className={"flex gap-2.5 p-5 glass-dark items-center rounded-[10px]"}>
                <Phone className="size-5"/>
                <div>
                  <Link
                    href="tel:+74996121498"
                    className="whitespace-nowrap font-semibold hover:underline text-red-500"
                  >
                    8 (499) 612-14-98
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    ПН–ПТ 9:00–19:00
                  </p>
                </div>
              </div>
              <div className={"flex gap-2.5 p-5 glass-dark items-center rounded-[10px]"}>
                <Mail className="size-5"/>
                <div>
                  <Link
                    href="mailto:priem@itmoscow.pro"
                    className="whitespace-nowrap font-semibold hover:underline"
                  >
                    priem@itmoscow.pro
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Круглосуточно
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 shrink-0 md:items-end">
            <h2 className="text-2xl font-bold">Наши соцсети</h2>
            <div className="flex gap-4">
              <Link
                href="https://t.me/itmoscow1"
                target="_blank"
                className="glass-dark flex size-12 items-center justify-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Send className="size-5"/>
              </Link>
              <Link
                href="https://vk.com/it.moscowpro"
                target="_blank"
                className="glass-dark flex size-12 items-center justify-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-center items-center gap-5 border-t border-[#71717B80] pt-8">
          <Image className={"max-w-[183px] w-[50dvw]"} src="/logo-big.svg" alt="IT.Москва" width={183} height={99}/>
          <p className="text-center text-[16px] font-medium text-muted-foreground">
            IT.Москва — колледж информационных технологий
          </p>
        </div>
      </div>
    </footer>
  );
}
