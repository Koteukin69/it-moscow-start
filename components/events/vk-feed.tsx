'use client';

import {useState, useEffect, useCallback} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2, ExternalLink, AlertCircle} from "lucide-react";

interface VkPost {
  id: number;
  text: string;
  date: number;
  image: string | null;
  link: string;
}

const PAGE_SIZE = 10;

export default function VkFeed() {
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
        setPosts(prev => isFirst ? data.posts : [...prev, ...data.posts]);
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={20} className="animate-spin text-muted-foreground"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <AlertCircle size={24}/>
        <span className="text-sm">Лента недоступна</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <span className="text-sm">Нет постов</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {posts.map(post => (
        <Card key={post.id} className="bg-background/50 shrink-0 py-0">
          <CardContent className="flex flex-col gap-3 p-4">
            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-full aspect-square object-cover rounded-lg"
              />
            )}
            {post.text && (
              <p className="text-sm line-clamp-4">{post.text}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(post.date * 1000).toLocaleDateString("ru-RU", {
                  day: "numeric", month: "long",
                })}
              </span>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink size={12}/>
                Открыть в VK
              </a>
            </div>
          </CardContent>
        </Card>
      ))}

      {posts.length < total && (
        <Button
          variant="outline"
          onClick={() => fetchPosts(posts.length)}
          disabled={loadingMore}
          className="w-full shrink-0"
        >
          {loadingMore ? <Loader2 size={16} className="animate-spin"/> : "Показать ещё"}
        </Button>
      )}
    </div>
  );
}
