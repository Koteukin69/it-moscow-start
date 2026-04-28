'use client';

import { useCallback, useEffect, useState } from "react";
import Title from "../components/title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ExternalLink,
  AlertCircle,
  Newspaper,
} from "lucide-react";

interface VkPost {
  id: number;
  text: string;
  date: number;
  image: string | null;
  link: string;
}

const PAGE_SIZE = 10;

export default function News() {
  const [posts, setPosts] = useState<VkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);

  const fetchPosts = useCallback(async (offset = 0) => {
    const isFirst = offset === 0;

    if (isFirst) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(false);

    try {
      const res = await fetch(`/api/vk-posts?offset=${offset}&count=${PAGE_SIZE}`);

      if (!res.ok) {
        if (isFirst) setError(true);
        return;
      }

      const data: {
        posts: VkPost[];
        total: number;
      } = await res.json();

      setPosts((prev) => {
        if (isFirst) return data.posts;

        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = data.posts.filter((p) => !existingIds.has(p.id));

        return [...prev, ...fresh];
      });

      setTotal(data.total);
    } catch {
      if (isFirst) setError(true);
    } finally {
      if (isFirst) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <Title
        title="Новости сообщества"
        description="Следите за последними событиями и обновлениями IT.Москва в нашем сообществе [ВКонтакте](https://vk.com/it.moscowpro)"
      />

      <div className="w-full">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-white/50" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-2 py-12 text-white/50">
            <AlertCircle size={24} />
            <span className="text-sm">Лента недоступна</span>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-white/50">
            <span className="text-sm">Нет постов</span>
          </div>
        )}

        {!loading && !error && (
          <div className="flex w-full flex-row flex-nowrap gap-5 overflow-x-auto py-2 scrollbar-thin">
            {posts.filter(post => post.text).map((post) => (
              <Card
                key={post.id}
                className="flex w-3xs shrink-0 flex-col overflow-hidden sm:w-xs bg-white/10! glass border-none"
              >
                <CardContent className="flex flex-1 flex-col gap-3 px-5">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-white/10 rounded-lg">
                      <Newspaper className="size-10 text-primary/40" />
                    </div>
                  )}
                  {post.text && (
                    <p className="line-clamp-2 flex-1 text-sm">
                      {post.text}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      {new Date(post.date * 1000).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        timeZone: "Europe/Moscow",
                      })}
                    </span>

                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} />
                      ВКонтакте
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length < total && (
              <div className="flex shrink-0 items-stretch">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(posts.length)}
                  disabled={loadingMore}
                  className="flex h-full w-3xs flex-col gap-2 sm:w-xs glass bg-white/10! rounded-xl"
                >
                  {loadingMore ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <ExternalLink size={20} />
                      Показать ещё
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}