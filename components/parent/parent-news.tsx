'use client';

import {useState, useEffect, useCallback} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2, ExternalLink, AlertCircle, Newspaper} from "lucide-react";

interface VkPost {
  id: number;
  text: string;
  date: number;
  image: string | null;
  link: string;
}

const PAGE_SIZE = 10;

export default function ParentNews() {
  const [posts, setPosts] = useState<VkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);

  const fetchPosts = useCallback(async (offset = 0) => {
    const isFirst = offset === 0;
    isFirst ? setLoading(true) : setLoadingMore(true);
    setError(false);
    try {
      const res = await fetch(`/api/vk-posts?offset=${offset}&count=${PAGE_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => {
          if (isFirst) return data.posts;
          const existingIds = new Set(prev.map((p: VkPost) => p.id));
          const fresh = data.posts.filter((p: VkPost) => !existingIds.has(p.id));
          return [...prev, ...fresh];
        });
        setTotal(data.total);
      } else {
        if (isFirst) setError(true);
      }
    } catch {
      if (isFirst) setError(true);
    }
    isFirst ? setLoading(false) : setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <section className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Новости сообщества
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Следите за последними событиями и обновлениями IT.Москва в нашем сообществе ВКонтакте
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground"/>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <AlertCircle size={24}/>
          <span className="text-sm">Лента недоступна</span>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <span className="text-sm">Нет постов</span>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="flex flex-row flex-nowrap gap-4 overflow-x-auto pb-2">
            {posts.map(post => (
              <Card key={post.id} className="flex flex-col overflow-hidden w-3xs sm:w-xs shrink-0">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                )}
                {!post.image && (
                  <div className="w-full aspect-square bg-primary/10 flex items-center justify-center">
                    <Newspaper className="size-10 text-primary/40"/>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  {post.text && (
                    <p className="text-sm line-clamp-4 flex-1">{post.text}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.date * 1000).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "long",
                        timeZone: "Europe/Moscow",
                      })}
                    </span>
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12}/>
                      ВКонтакте
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length < total && (
              <div className="flex items-center shrink-0">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(posts.length)}
                  disabled={loadingMore}
                  className="h-full w-3xs sm:w-xs flex flex-col gap-2"
                >
                  {loadingMore
                    ? <Loader2 size={20} className="animate-spin"/>
                    : <>
                        <ExternalLink size={20}/>
                        Показать ещё
                      </>
                  }
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
