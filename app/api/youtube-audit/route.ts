import { NextRequest, NextResponse } from "next/server";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "the","a","an","and","or","but","to","of","in","on","for",
  "with","vs","we","our","you","your","this","that","is","are",
  "was","were",
]);

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") * 3600) +
         (parseInt(m[2] ?? "0") * 60) +
          parseInt(m[3] ?? "0");
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function ytFetch(url: URL): Promise<Response> {
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }
  return res;
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not set" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  const maxResults = Math.min(parseInt(searchParams.get("maxResults") ?? "100"), 200);

  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  try {
    // ── Step 1: Uploads playlist ID ──────────────────────────────────────────
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "contentDetails");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", apiKey);

    const channelData = await (await ytFetch(channelUrl)).json();
    const uploadsPlaylistId: string | undefined =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: "Could not find uploads playlist for this channel" }, { status: 404 });
    }

    // ── Step 2: Collect video IDs from playlist ──────────────────────────────
    const videoIds: string[] = [];
    let pageToken: string | undefined;

    while (videoIds.length < maxResults) {
      const pageSize = Math.min(maxResults - videoIds.length, 50);
      const listUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      listUrl.searchParams.set("part", "contentDetails");
      listUrl.searchParams.set("playlistId", uploadsPlaylistId);
      listUrl.searchParams.set("maxResults", String(pageSize));
      listUrl.searchParams.set("key", apiKey);
      if (pageToken) listUrl.searchParams.set("pageToken", pageToken);

      const listData = await (await ytFetch(listUrl)).json();

      for (const item of listData.items ?? []) {
        const id: string | undefined = item.contentDetails?.videoId;
        if (id) videoIds.push(id);
      }

      pageToken = listData.nextPageToken;
      if (!pageToken) break;
    }

    // ── Step 3: Fetch full video data in batches of 50 ───────────────────────
    const rawVideos: Record<string, unknown>[] = [];

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const vidUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      vidUrl.searchParams.set("part", "snippet,statistics,contentDetails");
      vidUrl.searchParams.set("id", batch.join(","));
      vidUrl.searchParams.set("key", apiKey);

      const vidData = await (await ytFetch(vidUrl)).json();
      rawVideos.push(...(vidData.items ?? []));
    }

    // ── Step 4: Compute per-video metrics ────────────────────────────────────
    const now = Date.now();

    type VideoMetric = {
      videoId: string;
      title: string;
      publishedAt: string;
      viewCount: number;
      likeCount: number;
      commentCount: number;
      durationSeconds: number;
      daysSincePublish: number;
      viewsPerDay: number;
      engagementRate: number | null;
    };

    const enriched: VideoMetric[] = rawVideos.map((v: any) => {
      const viewCount   = parseInt(v.statistics?.viewCount   ?? "0");
      const likeCount   = parseInt(v.statistics?.likeCount   ?? "0");
      const commentCount = parseInt(v.statistics?.commentCount ?? "0");
      const publishedMs = new Date(v.snippet?.publishedAt ?? 0).getTime();
      const durationSeconds = parseDuration(v.contentDetails?.duration ?? "");
      const daysSincePublish = Math.max(1, Math.floor((now - publishedMs) / 86_400_000));
      const viewsPerDay = viewCount / daysSincePublish;
      const engagementRate = viewCount > 0 ? (likeCount + commentCount) / viewCount : null;

      return {
        videoId: v.id,
        title: v.snippet?.title ?? "",
        publishedAt: v.snippet?.publishedAt ?? "",
        viewCount,
        likeCount,
        commentCount,
        durationSeconds,
        daysSincePublish,
        viewsPerDay,
        engagementRate,
      };
    });

    // Sort descending by viewsPerDay
    enriched.sort((a, b) => b.viewsPerDay - a.viewsPerDay);

    // ── Quartiles ────────────────────────────────────────────────────────────
    const qSize = Math.max(1, Math.floor(enriched.length / 4));
    const topQ    = enriched.slice(0, qSize);
    const bottomQ = enriched.slice(enriched.length - qSize);

    // ── Summary ──────────────────────────────────────────────────────────────
    const avgDurationTop    = avg(topQ.map(v => v.durationSeconds));
    const avgDurationBottom = avg(bottomQ.map(v => v.durationSeconds));
    const avgEngagementTop    = avg(topQ.map(v => v.engagementRate).filter((e): e is number => e !== null));
    const avgEngagementBottom = avg(bottomQ.map(v => v.engagementRate).filter((e): e is number => e !== null));

    // Top title keywords from topQuartile
    const wordFreq: Record<string, number> = {};
    for (const v of topQ) {
      const words = v.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w));
      for (const word of words) {
        wordFreq[word] = (wordFreq[word] ?? 0) + 1;
      }
    }
    const topTitleKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      channelId,
      summary: {
        avgDurationTop,
        avgDurationBottom,
        avgEngagementTop,
        avgEngagementBottom,
        topTitleKeywords,
      },
      topVideos:    enriched.slice(0, 15),
      bottomVideos: enriched.slice(-15),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
