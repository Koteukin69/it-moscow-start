export default function ParentVideo() {
  return (
    <section id="video" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">О колледже</h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Видео-экскурсия по колледжу — узнайте, как проходит обучение
          и чем живут наши студенты
        </p>
      </div>

      <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-xl border">
        <iframe
          src="https://vkvideo.ru/video_ext.php?oid=-172223119&id=456240004&hash=ec18a353bac01724&hd=3"
          title="Видео-экскурсия по IT.Москва"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
          allowFullScreen
          loading="eager"
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
