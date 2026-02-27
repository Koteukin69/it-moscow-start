import Link from "next/link";
import {Send} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";

export default function ParentCommunity() {
  return (
    <section className="mx-auto max-w-6xl px-10 py-20 sm:px-20 flex flex-col items-center">
      <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 w-fit">
        <CardContent className="flex flex-row gap-8 sm:items-center sm:justify-between sm:gap-12 h-fit">
            <div className="flex flex-col gap-8 items-start">
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Поступи в IT.Москва
              </h2>
              <p className="max-w-xl text-muted-foreground">
                Мы подготовили для наших абитуриентов самый интересный и актуальный контент от
                преподавателей. Мастер-классы, онлайн-уроки, лайфхаки и важные напоминания
                в период поступления — всё, чтобы помочь сделать правильный выбор профессии.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <div className="flex gap-3">
                <Link
                  href="https://t.me/itmoscowprivet1"
                  target="_blank"
                  className="flex w-fit items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Send className="size-4"/>
                  <span className={"hidden sm:inline"}>Telegram</span>
                </Link>
                <Link
                  href="https://vk.com/itmoscowprivet"
                  target="_blank"
                  className="flex w-fit items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z"/>
                  </svg>
                  <span className={"hidden sm:inline"}>ВКонтакте</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="self-stretch hidden lg:flex items-center">
            <Image className={"rounded-sm h-full w-auto object-cover mix-blend-multiply dark:mix-blend-screen"} src={"/community.png"} width={798} height={559} alt={""}/>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
