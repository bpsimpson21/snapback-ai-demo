import { NextRequest, NextResponse } from "next/server";

// ── Constants ──────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "the","a","an","and","or","but","to","of","in","on","for",
  "with","vs","we","our","you","your","this","that","is","are",
  "was","were",
]);

const EMOTIONAL_KEYWORDS = new Set([
  "crazy","insane","unbelievable","worst","best","epic","shocking",
  "incredible","amazing","legendary","brutal","disaster","genius",
  "overrated","goat","greatest","terrible","awful","perfect","ultimate",
  "historic","dangerous","impossible","unforgettable","embarrassing",
  "dominated","underrated","controversial","wild","absurd",
  "ridiculous","stunning","spectacular","unreal",
]);

const COUNTRY_TERMS = [
  "usa","united states","america","american","canada","canadian",
  "uk","england","english","british","australia","australian",
  "france","french","germany","german","spain","spanish",
  "italy","italian","brazil","brazilian","mexico","mexican",
  "china","chinese","japan","japanese","russia","russian",
  "india","indian","argentina","argentinian",
];

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const FORMAT_PATTERNS: Array<{ name: string; test: (t: string) => boolean }> = [
  { name: "Question (Has ?)",  test: (t) => t.includes("?") },
  { name: "Is X",              test: (t) => /\bis\b/i.test(t) },
  { name: "Why",               test: (t) => /\bwhy\b/i.test(t) },
  { name: "Best",              test: (t) => /\bbest\b/i.test(t) },
  { name: "vs / Versus",       test: (t) => /\bvs\.?\b|\bversus\b/i.test(t) },
  { name: "Numbers",           test: (t) => /\d+/.test(t) },
  { name: "Country Mention",   test: (t) => COUNTRY_TERMS.some(c => t.toLowerCase().includes(c)) },
];

// ── Types ──────────────────────────────────────────────────────────────────────

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
  velocityScore: number;
  velocityLabel: string;
};

type TitleMetrics = {
  pctWithNumbers: number;
  pctWithQuestion: number;
  pctWithComparison: number;
  pctWithEmotional: number;
  avgCharLength: number;
  avgWordCount: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function getVelocityLabel(score: number): string {
  if (score >= 1.5) return "Exploding";
  if (score >= 1.1) return "Outperforming";
  if (score >= 0.9) return "Baseline";
  return "Underperforming";
}

// ── Analysis functions ─────────────────────────────────────────────────────────

function computeTitleMetrics(videos: VideoMetric[]): TitleMetrics {
  if (!videos.length) {
    return { pctWithNumbers: 0, pctWithQuestion: 0, pctWithComparison: 0, pctWithEmotional: 0, avgCharLength: 0, avgWordCount: 0 };
  }
  let withNumbers = 0, withQuestion = 0, withComparison = 0, withEmotional = 0;
  let totalChars = 0, totalWords = 0;

  for (const v of videos) {
    const t = v.title;
    const words = t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    if (/\d/.test(t)) withNumbers++;
    if (t.includes("?")) withQuestion++;
    if (/\bvs\.?\b|\bversus\b/i.test(t)) withComparison++;
    if (words.some(w => EMOTIONAL_KEYWORDS.has(w))) withEmotional++;
    totalChars += t.length;
    totalWords += t.trim().split(/\s+/).length;
  }

  const n = videos.length;
  return {
    pctWithNumbers:    withNumbers / n,
    pctWithQuestion:   withQuestion / n,
    pctWithComparison: withComparison / n,
    pctWithEmotional:  withEmotional / n,
    avgCharLength:     totalChars / n,
    avgWordCount:      totalWords / n,
  };
}

function computeUploadCadence(videos: VideoMetric[]) {
  const sorted = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const dayGaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].publishedAt).getTime() - new Date(sorted[i - 1].publishedAt).getTime()) /
      86_400_000;
    if (diff >= 0) dayGaps.push(diff);
  }
  const avgDaysBetweenUploads = avg(dayGaps) ?? 0;
  const uploadsPerWeek = avgDaysBetweenUploads > 0 ? +(7 / avgDaysBetweenUploads).toFixed(2) : 0;

  // Best day of week by avg viewsPerDay
  const dayGroups: Record<number, number[]> = {};
  for (const v of videos) {
    const day = new Date(v.publishedAt).getDay();
    (dayGroups[day] ??= []).push(v.viewsPerDay);
  }
  let bestDay = 0, bestDayAvgVpd = -1;
  for (const [day, vpds] of Object.entries(dayGroups)) {
    const a = vpds.reduce((x, y) => x + y, 0) / vpds.length;
    if (a > bestDayAvgVpd) { bestDayAvgVpd = a; bestDay = parseInt(day); }
  }

  // Best hour bucket
  const hourGroups: Record<string, number[]> = { morning: [], afternoon: [], evening: [], night: [] };
  for (const v of videos) {
    const hour = new Date(v.publishedAt).getUTCHours();
    const bucket =
      hour >= 6 && hour < 12  ? "morning"   :
      hour >= 12 && hour < 18 ? "afternoon" :
      hour >= 18 && hour < 22 ? "evening"   : "night";
    hourGroups[bucket].push(v.viewsPerDay);
  }
  let bestBucket = "morning", bestHourAvgVpd = -1;
  for (const [bucket, vpds] of Object.entries(hourGroups)) {
    if (!vpds.length) continue;
    const a = vpds.reduce((x, y) => x + y, 0) / vpds.length;
    if (a > bestHourAvgVpd) { bestHourAvgVpd = a; bestBucket = bucket; }
  }

  return {
    avgDaysBetweenUploads: +avgDaysBetweenUploads.toFixed(1),
    uploadsPerWeek,
    bestDayOfWeek:   DAY_NAMES[bestDay],
    bestDayAvgVpd:   +bestDayAvgVpd.toFixed(0),
    bestHourBucket:  bestBucket,
    bestHourAvgVpd:  +bestHourAvgVpd.toFixed(0),
  };
}

function computeFormatClusters(videos: VideoMetric[]) {
  return FORMAT_PATTERNS
    .map(({ name, test }) => {
      const matched = videos.filter(v => test(v.title));
      const avgVpd = avg(matched.map(v => v.viewsPerDay)) ?? 0;
      const validEng = matched.map(v => v.engagementRate).filter((e): e is number => e !== null);
      const avgEng = avg(validEng);
      return {
        name,
        count:            matched.length,
        avgViewsPerDay:   +avgVpd.toFixed(1),
        avgEngagementRate: avgEng !== null ? +avgEng.toFixed(4) : null,
      };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.avgViewsPerDay - a.avgViewsPerDay);
}

function buildAiSummary(
  titleAnalysis:  { topQuartile: TitleMetrics; bottomQuartile: TitleMetrics },
  uploadCadence:  ReturnType<typeof computeUploadCadence>,
  formatClusters: ReturnType<typeof computeFormatClusters>,
  summaryData: {
    avgDurationTop:      number | null;
    avgDurationBottom:   number | null;
    avgEngagementTop:    number | null;
    avgEngagementBottom: number | null;
  },
  velocityDist: { exploding: number; outperforming: number; baseline: number; underperforming: number },
  total: number,
) {
  const obs:  string[] = [];
  const exps: string[] = [];
  const tq = titleAnalysis.topQuartile;
  const bq = titleAnalysis.bottomQuartile;

  // 1. Velocity distribution
  const outpct = Math.round(((velocityDist.exploding + velocityDist.outperforming) / total) * 100);
  obs.push(
    `${outpct}% of videos outperform the channel baseline — ${velocityDist.exploding} are "Exploding" and ${velocityDist.outperforming} are "Outperforming." ${velocityDist.underperforming} videos currently pull below average velocity.`
  );

  // 2. Duration
  if (summaryData.avgDurationTop !== null && summaryData.avgDurationBottom !== null) {
    const topMin  = (summaryData.avgDurationTop  / 60).toFixed(1);
    const botMin  = (summaryData.avgDurationBottom / 60).toFixed(1);
    const diffSec = Math.abs(summaryData.avgDurationTop - summaryData.avgDurationBottom);
    if (diffSec > 30) {
      obs.push(
        `Top-quartile videos average ${topMin} min vs ${botMin} min for the bottom quartile — a ${(diffSec / 60).toFixed(1)}-minute gap. ${summaryData.avgDurationTop > summaryData.avgDurationBottom ? "Longer" : "Shorter"} content correlates with higher velocity on this channel.`
      );
    }
  }

  // 3. Title: numbers
  const numDiff = tq.pctWithNumbers - bq.pctWithNumbers;
  if (Math.abs(numDiff) >= 0.05) {
    obs.push(
      `Numbers in titles: ${(tq.pctWithNumbers * 100).toFixed(0)}% of top-quartile vs ${(bq.pctWithNumbers * 100).toFixed(0)}% of bottom-quartile — a ${numDiff > 0 ? "+" : ""}${(numDiff * 100).toFixed(0)}pp gap. Numeric specificity ${numDiff > 0 ? "positively correlates" : "negatively correlates"} with velocity.`
    );
  }

  // 4. Title: emotional keywords
  const emoDiff = tq.pctWithEmotional - bq.pctWithEmotional;
  if (Math.abs(emoDiff) >= 0.05) {
    obs.push(
      `Emotional keywords appear in ${(tq.pctWithEmotional * 100).toFixed(0)}% of top-quartile titles vs ${(bq.pctWithEmotional * 100).toFixed(0)}% for bottom — ${emoDiff > 0 ? "emotive framing positively correlates with clicks" : "overuse of hype language correlates with lower velocity"}.`
    );
  }

  // 5. Upload cadence
  obs.push(
    `Uploads land every ${uploadCadence.avgDaysBetweenUploads} days on average (≈ ${uploadCadence.uploadsPerWeek}×/week). ${uploadCadence.bestDayOfWeek} ${uploadCadence.bestHourBucket} uploads average the highest views/day in this dataset.`
  );

  // 6. Best format
  if (formatClusters.length > 0) {
    const best   = formatClusters[0];
    const second = formatClusters[1];
    obs.push(
      `"${best.name}" is the top-performing format at ${best.avgViewsPerDay.toFixed(0)} avg views/day across ${best.count} videos${second ? ` — outpacing "${second.name}" (${second.avgViewsPerDay.toFixed(0)}/day)` : ""}.`
    );
  }

  // Experiments
  if (summaryData.avgDurationTop !== null) {
    const topMin = Math.round(summaryData.avgDurationTop / 60);
    exps.push(
      `Target ${topMin}-minute video length — this matches the top-quartile average. Produce 5 consecutive videos at this length and track 14-day views/day against your channel baseline.`
    );
  }

  exps.push(
    `Schedule 3 consecutive uploads on ${uploadCadence.bestDayOfWeek} ${uploadCadence.bestHourBucket} and compare their 14-day views/day against the dataset average for that slot (${uploadCadence.bestDayAvgVpd.toLocaleString()} views/day).`
  );

  if (formatClusters.length > 0) {
    exps.push(
      `Build a 4-part series using the "${formatClusters[0].name}" format — it currently leads with ${formatClusters[0].avgViewsPerDay.toFixed(0)} avg views/day and provides a repeatable production template to optimize over time.`
    );
  }

  if (Math.abs(numDiff) >= 0.05 && numDiff > 0) {
    exps.push(
      `Add specific numbers to 5 upcoming titles ("Top 3…," "Why X Costs $Y"). Top-quartile titles use numerics ${(tq.pctWithNumbers * 100).toFixed(0)}% of the time vs ${(bq.pctWithNumbers * 100).toFixed(0)}% for bottom performers — measure whether this lifts CTR.`
    );
  }

  if (Math.abs(emoDiff) >= 0.05) {
    exps.push(
      emoDiff > 0
        ? `Lead 4 upcoming titles with a clear emotional hook ("crazy," "insane," "legendary"). Top-quartile titles use emotional keywords ${(tq.pctWithEmotional * 100).toFixed(0)}% of the time vs ${(bq.pctWithEmotional * 100).toFixed(0)}% for bottom performers.`
        : `Strip hype language from 4 upcoming titles and replace with specific, factual framing — emotional keywords are currently over-represented in your lower-performing videos.`
    );
  }

  while (exps.length < 3) {
    exps.push(
      `A/B test question-format titles against declarative titles for 4 pairs of similar videos. Track which format drives higher views/day over a 14-day window.`
    );
  }

  return {
    keyObservations:        obs,
    recommendedExperiments: exps.slice(0, 5),
  };
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not set" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const channelId  = searchParams.get("channelId");
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
      const listUrl  = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
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
      const batch  = videoIds.slice(i, i + 50);
      const vidUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      vidUrl.searchParams.set("part", "snippet,statistics,contentDetails");
      vidUrl.searchParams.set("id", batch.join(","));
      vidUrl.searchParams.set("key", apiKey);

      const vidData = await (await ytFetch(vidUrl)).json();
      rawVideos.push(...(vidData.items ?? []));
    }

    // ── Step 4: Base per-video metrics ────────────────────────────────────────
    const now = Date.now();

    const baseVideos = rawVideos.map((v: any) => {
      const viewCount    = parseInt(v.statistics?.viewCount    ?? "0");
      const likeCount    = parseInt(v.statistics?.likeCount    ?? "0");
      const commentCount = parseInt(v.statistics?.commentCount ?? "0");
      const publishedMs  = new Date(v.snippet?.publishedAt ?? 0).getTime();
      const durationSeconds  = parseDuration(v.contentDetails?.duration ?? "");
      const daysSincePublish = Math.max(1, Math.floor((now - publishedMs) / 86_400_000));
      const viewsPerDay      = viewCount / daysSincePublish;
      const engagementRate   = viewCount > 0 ? (likeCount + commentCount) / viewCount : null;

      return {
        videoId:          v.id as string,
        title:            (v.snippet?.title ?? "") as string,
        publishedAt:      (v.snippet?.publishedAt ?? "") as string,
        viewCount,
        likeCount,
        commentCount,
        durationSeconds,
        daysSincePublish,
        viewsPerDay,
        engagementRate,
      };
    });

    // ── Step 5: Velocity scores ───────────────────────────────────────────────
    const channelAvgVpd = avg(baseVideos.map(v => v.viewsPerDay)) ?? 1;

    const enriched: VideoMetric[] = baseVideos.map(v => ({
      ...v,
      velocityScore: +(v.viewsPerDay / channelAvgVpd).toFixed(3),
      velocityLabel: getVelocityLabel(v.viewsPerDay / channelAvgVpd),
    }));

    // Sort descending by viewsPerDay
    enriched.sort((a, b) => b.viewsPerDay - a.viewsPerDay);

    // ── Quartiles ─────────────────────────────────────────────────────────────
    const qSize   = Math.max(1, Math.floor(enriched.length / 4));
    const topQ    = enriched.slice(0, qSize);
    const bottomQ = enriched.slice(enriched.length - qSize);

    // ── Velocity distribution ─────────────────────────────────────────────────
    const velocityDist = {
      exploding:       enriched.filter(v => v.velocityScore >= 1.5).length,
      outperforming:   enriched.filter(v => v.velocityScore >= 1.1 && v.velocityScore < 1.5).length,
      baseline:        enriched.filter(v => v.velocityScore >= 0.9 && v.velocityScore < 1.1).length,
      underperforming: enriched.filter(v => v.velocityScore <  0.9).length,
    };

    // ── Summary ───────────────────────────────────────────────────────────────
    const avgDurationTop      = avg(topQ.map(v => v.durationSeconds));
    const avgDurationBottom   = avg(bottomQ.map(v => v.durationSeconds));
    const avgEngagementTop    = avg(topQ.map(v => v.engagementRate).filter((e): e is number => e !== null));
    const avgEngagementBottom = avg(bottomQ.map(v => v.engagementRate).filter((e): e is number => e !== null));

    // Top title keywords from topQuartile
    const wordFreq: Record<string, number> = {};
    for (const v of topQ) {
      const words = v.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOPWORDS.has(w));
      for (const word of words) {
        wordFreq[word] = (wordFreq[word] ?? 0) + 1;
      }
    }
    const topTitleKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // ── Title structure analysis ──────────────────────────────────────────────
    const titleAnalysis = {
      topQuartile:    computeTitleMetrics(topQ),
      bottomQuartile: computeTitleMetrics(bottomQ),
    };

    // ── Upload cadence ────────────────────────────────────────────────────────
    const uploadCadence = computeUploadCadence(enriched);

    // ── Format clustering ─────────────────────────────────────────────────────
    const formatClusters = computeFormatClusters(enriched);

    // ── AI strategic summary ──────────────────────────────────────────────────
    const summaryData = { avgDurationTop, avgDurationBottom, avgEngagementTop, avgEngagementBottom };
    const aiSummary   = buildAiSummary(
      titleAnalysis, uploadCadence, formatClusters,
      summaryData, velocityDist, enriched.length,
    );

    // ── Response ──────────────────────────────────────────────────────────────
    return NextResponse.json({
      channelId,
      channelAvgVpd: +channelAvgVpd.toFixed(1),
      summary: {
        avgDurationTop,
        avgDurationBottom,
        avgEngagementTop,
        avgEngagementBottom,
        topTitleKeywords,
        velocityDistribution: velocityDist,
      },
      topVideos:    enriched.slice(0, 15),
      bottomVideos: enriched.slice(-15),
      titleAnalysis,
      uploadCadence,
      formatClusters,
      aiSummary,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
