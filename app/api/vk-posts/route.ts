import {NextResponse} from "next/server";

interface VKPhoto {
  sizes: Array<{url: string; width: number; height: number}>;
}

interface VKAttachment {
  type: string;
  photo?: VKPhoto;
}

interface VKPost {
  id: number;
  text: string;
  date: number;
  attachments?: VKAttachment[];
  copy_history?: VKPost[];
}

let cache: {data: unknown; timestamp: number} | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function pickImage(photo: VKPhoto | undefined): string | null {
  if (!photo?.sizes?.length) return null;
  const sorted = [...photo.sizes].sort((a, b) => b.width - a.width);
  return sorted.find(s => s.width <= 807)?.url ?? sorted[0].url;
}

export async function GET(request: Request): Promise<NextResponse> {
  const {searchParams} = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);

  const token = process.env.VK_SERVICE_TOKEN;
  const groupId = process.env.VK_GROUP_ID;

  if (!token || !groupId) {
    return NextResponse.json({error: "VK not configured"}, {status: 500});
  }

  if (offset === 0 && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const vkUrl = new URL("https://api.vk.com/method/wall.get");
    vkUrl.searchParams.set("owner_id", `-${groupId}`);
    vkUrl.searchParams.set("count", String(count));
    vkUrl.searchParams.set("offset", String(offset));
    vkUrl.searchParams.set("access_token", token);
    vkUrl.searchParams.set("v", "5.199");

    const res = await fetch(vkUrl.toString());
    const json = await res.json();

    if (json.error) {
      return NextResponse.json({error: json.error.error_msg}, {status: 502});
    }

    const posts = (json.response.items as VKPost[]).map((post) => {
      const original = (!post.text && post.copy_history?.length)
        ? post.copy_history[0]
        : post;
      const attachments = original.attachments ?? post.attachments;
      const photoAttachment = attachments?.find(a => a.type === "photo");
      return {
        id: post.id,
        text: original.text || post.text,
        date: post.date,
        image: pickImage(photoAttachment?.photo),
        link: `https://vk.com/it.moscowpro?w=wall-${groupId}_${post.id}`,
      };
    });

    const result = {posts, total: json.response.count};

    if (offset === 0) {
      cache = {data: result, timestamp: Date.now()};
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({error: "Ошибка при получении постов VK"}, {status: 500});
  }
}
