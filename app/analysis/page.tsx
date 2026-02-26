"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type VideoMetric = {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  durationSeconds: number;
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

type FormatCluster = {
  name: string;
  count: number;
  avgViewsPerDay: number;
  avgEngagementRate: number | null;
};

type UploadCadence = {
  avgDaysBetweenUploads: number;
  uploadsPerWeek: number;
  bestDayOfWeek: string;
  bestDayAvgVpd: number;
  bestHourBucket: string;
  bestHourAvgVpd: number;
};

type AuditData = {
  channelId: string;
  channelAvgVpd: number;
  summary: {
    avgDurationTop: number | null;
    avgDurationBottom: number | null;
    avgEngagementTop: number | null;
    avgEngagementBottom: number | null;
    topTitleKeywords: { word: string; count: number }[];
    velocityDistribution: {
      exploding: number;
      outperforming: number;
      baseline: number;
      underperforming: number;
    };
  };
  topVideos: VideoMetric[];
  bottomVideos: VideoMetric[];
  titleAnalysis: {
    topQuartile: TitleMetrics;
    bottomQuartile: TitleMetrics;
  };
  uploadCadence: UploadCadence;
  formatClusters: FormatCluster[];
  aiSummary: {
    keyObservations: string[];
    recommendedExperiments: string[];
  };
};

type Status = "idle" | "resolving" | "auditing" | "done" | "error";

// ── Formatters ─────────────────────────────────────────────────────────────────

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}m ${s}s`;
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return (n * 100).toFixed(2) + "%";
}

function fmtPctShort(n: number): string {
  return (n * 100).toFixed(0) + "%";
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtVpd(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(1);
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10);
}

function fmtDiff(a: number, b: number, isRaw = false): string {
  const diff = a - b;
  const sign = diff >= 0 ? "+" : "";
  if (isRaw) return `${sign}${diff.toFixed(1)}`;
  return `${sign}${(diff * 100).toFixed(0)}pp`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Existing observations helper ───────────────────────────────────────────────

function buildObservations(data: AuditData): string[] {
  const obs: string[] = [];
  const { avgDurationTop: dTop, avgDurationBottom: dBot,
          avgEngagementTop: eTop, avgEngagementBottom: eBot,
          topTitleKeywords: kws } = data.summary;

  if (dTop !== null && dBot !== null) {
    if (dTop === dBot) {
      obs.push(`Top and bottom quartile videos have similar average durations (${fmtDuration(Math.round(dTop))}).`);
    } else {
      const diff = Math.abs(Math.round(dTop - dBot));
      const dir  = dTop > dBot ? "longer" : "shorter";
      obs.push(`Top-quartile videos average ${fmtDuration(Math.round(dTop))}, vs ${fmtDuration(Math.round(dBot))} for the bottom quartile — ${fmtDuration(diff)} ${dir} on average.`);
    }
  }

  if (eTop !== null && eBot !== null) {
    if (eTop > eBot * 1.1) {
      obs.push(`Higher-velocity videos also show stronger engagement (${fmtPct(eTop)} vs ${fmtPct(eBot)}), suggesting topic selection drives both metrics.`);
    } else if (eBot > eTop * 1.1) {
      obs.push(`Engagement rate does not predict velocity — bottom-quartile videos average higher engagement (${fmtPct(eBot)}) than the top (${fmtPct(eTop)}), indicating view speed is driven by other factors.`);
    } else {
      obs.push(`Engagement rates are similar across quartiles (top: ${fmtPct(eTop)}, bottom: ${fmtPct(eBot)}), suggesting engagement rate alone does not determine velocity.`);
    }
  }

  const top3 = kws.slice(0, 3);
  if (top3.length > 0) {
    const kwStr = top3.map(k => `"${k.word}"`).join(", ");
    obs.push(`Top-performing titles feature keywords like ${kwStr} — suggesting these topics consistently drive higher view velocity.`);
  }

  return obs;
}

// ── Velocity badge ─────────────────────────────────────────────────────────────

function VelocityBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    Exploding:       "bg-yellow-100 text-yellow-800 border border-yellow-200",
    Outperforming:   "bg-green-100 text-green-700 border border-green-200",
    Baseline:        "bg-gray-100 text-gray-500 border border-gray-200",
    Underperforming: "bg-red-100 text-red-600 border border-red-200",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${styles[label] ?? styles.Baseline}`}>
      {label}
    </span>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-4">
      {children}
    </p>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 ${accent ? "border border-yellow-400/40 bg-yellow-500/10" : "border border-white/10 bg-white/5"}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-white" : "text-gray-300"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function VideoTable({ videos, label }: { videos: VideoMetric[]; label: string }) {
  const headers = ["Title", "Views", "Views/Day", "Velocity", "Engagement", "Duration", "Published"];
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {videos.map((v) => (
              <tr key={v.videoId} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 max-w-xs">
                  <a
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-snap-black font-medium hover:text-snap-yellow transition leading-snug line-clamp-2"
                  >
                    {v.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">
                  {fmtNum(v.viewCount)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">
                  {fmtVpd(v.viewsPerDay)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <VelocityBadge label={v.velocityLabel} />
                </td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">
                  {fmtPct(v.engagementRate)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">
                  {fmtDuration(v.durationSeconds)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 tabular-nums whitespace-nowrap">
                  {fmtDate(v.publishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TitleStructureSection({
  titleAnalysis,
}: {
  titleAnalysis: { topQuartile: TitleMetrics; bottomQuartile: TitleMetrics };
}) {
  const tq = titleAnalysis.topQuartile;
  const bq = titleAnalysis.bottomQuartile;

  const rows = [
    {
      metric:   "Has Numbers",
      top:      fmtPctShort(tq.pctWithNumbers),
      bottom:   fmtPctShort(bq.pctWithNumbers),
      diff:     fmtDiff(tq.pctWithNumbers, bq.pctWithNumbers),
      positive: tq.pctWithNumbers >= bq.pctWithNumbers,
    },
    {
      metric:   "Has Question Mark (?)",
      top:      fmtPctShort(tq.pctWithQuestion),
      bottom:   fmtPctShort(bq.pctWithQuestion),
      diff:     fmtDiff(tq.pctWithQuestion, bq.pctWithQuestion),
      positive: tq.pctWithQuestion >= bq.pctWithQuestion,
    },
    {
      metric:   "Has Comparison (vs / versus)",
      top:      fmtPctShort(tq.pctWithComparison),
      bottom:   fmtPctShort(bq.pctWithComparison),
      diff:     fmtDiff(tq.pctWithComparison, bq.pctWithComparison),
      positive: tq.pctWithComparison >= bq.pctWithComparison,
    },
    {
      metric:   "Has Emotional Keywords",
      top:      fmtPctShort(tq.pctWithEmotional),
      bottom:   fmtPctShort(bq.pctWithEmotional),
      diff:     fmtDiff(tq.pctWithEmotional, bq.pctWithEmotional),
      positive: tq.pctWithEmotional >= bq.pctWithEmotional,
    },
    {
      metric:   "Avg Title Length (chars)",
      top:      tq.avgCharLength.toFixed(1),
      bottom:   bq.avgCharLength.toFixed(1),
      diff:     fmtDiff(tq.avgCharLength, bq.avgCharLength, true),
      positive: tq.avgCharLength >= bq.avgCharLength,
    },
    {
      metric:   "Avg Word Count",
      top:      tq.avgWordCount.toFixed(1),
      bottom:   bq.avgWordCount.toFixed(1),
      diff:     fmtDiff(tq.avgWordCount, bq.avgWordCount, true),
      positive: tq.avgWordCount >= bq.avgWordCount,
    },
  ];

  return (
    <section>
      <SectionLabel>Title Structure Analysis</SectionLabel>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Metric", "Top Quartile", "Bottom Quartile", "Difference"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.metric} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700 font-medium">{r.metric}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums">{r.top}</td>
                <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{r.bottom}</td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums ${r.positive ? "text-green-600" : "text-red-500"}`}>
                  {r.diff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Top / Bottom quartile ranked by views-per-day. "Difference" = top minus bottom; positive (green) means the trait is more common in top performers.
      </p>
    </section>
  );
}

function UploadCadenceSection({ cadence }: { cadence: UploadCadence }) {
  return (
    <section>
      <SectionLabel>Upload Cadence Analysis</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Avg Days Between Uploads"
          value={`${cadence.avgDaysBetweenUploads}d`}
        />
        <StatCard
          label="Uploads Per Week"
          value={`${cadence.uploadsPerWeek}×`}
        />
        <StatCard
          label="Best Performing Day"
          value={cadence.bestDayOfWeek}
          sub={`${fmtVpd(cadence.bestDayAvgVpd)} avg views/day`}
          accent
        />
        <StatCard
          label="Best Hour Bucket"
          value={capitalize(cadence.bestHourBucket)}
          sub={`${fmtVpd(cadence.bestHourAvgVpd)} avg views/day`}
          accent
        />
        <StatCard
          label="Best Day Avg Views/Day"
          value={fmtVpd(cadence.bestDayAvgVpd)}
        />
        <StatCard
          label="Best Hour Avg Views/Day"
          value={fmtVpd(cadence.bestHourAvgVpd)}
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Hour buckets: Morning 6–11, Afternoon 12–17, Evening 18–21, Night 22–5 (UTC).
      </p>
    </section>
  );
}

function FormatClustersSection({ clusters }: { clusters: FormatCluster[] }) {
  return (
    <section>
      <SectionLabel>Format Clustering</SectionLabel>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["#", "Format Pattern", "Videos", "Avg Views/Day", "Avg Engagement"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${i <= 1 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clusters.map((c, i) => (
              <tr key={c.name} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-xs font-bold text-snap-yellow/70 w-8">#{i + 1}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{c.count}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums">{fmtVpd(c.avgViewsPerDay)}</td>
                <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{fmtPct(c.avgEngagementRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Patterns are not mutually exclusive — one video can match multiple formats. Ranked by avg views/day descending.
      </p>
    </section>
  );
}

function VelocityDistRow({
  dist,
}: {
  dist: { exploding: number; outperforming: number; baseline: number; underperforming: number };
}) {
  const items = [
    { label: "Exploding",       count: dist.exploding,       cls: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
    { label: "Outperforming",   count: dist.outperforming,   cls: "bg-green-100 text-green-700 border border-green-200" },
    { label: "Baseline",        count: dist.baseline,        cls: "bg-gray-100 text-gray-600 border border-gray-200" },
    { label: "Underperforming", count: dist.underperforming, cls: "bg-red-100 text-red-600 border border-red-200" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {items.map(({ label, count, cls }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>
          {label}
          <span className="font-bold">{count}</span>
        </span>
      ))}
    </div>
  );
}

function AiSummarySection({
  aiSummary,
}: {
  aiSummary: { keyObservations: string[]; recommendedExperiments: string[] };
}) {
  return (
    <section>
      <SectionLabel>AI Strategic Summary</SectionLabel>
      <div className="space-y-4">
        {/* Key Observations */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Key Observations</h3>
          <ul className="space-y-3">
            {aiSummary.keyObservations.map((obs, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                {obs}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Experiments */}
        <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/5 p-6">
          <h3 className="text-sm font-bold text-snap-yellow uppercase tracking-wide mb-4">Recommended Experiments</h3>
          <ol className="space-y-3">
            {aiSummary.recommendedExperiments.map((exp, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-0.5 text-xs font-bold text-snap-yellow/70 w-5 shrink-0 tabular-nums">
                  {i + 1}.
                </span>
                {exp}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-600">
        Generated entirely from computed metrics. No external AI or LLM calls. All claims are directly supported by the data above.
      </p>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [data, setData]               = useState<AuditData | null>(null);
  const [status, setStatus]           = useState<Status>("idle");
  const [error, setError]             = useState<string | null>(null);
  const [resolvedHandle, setResolvedHandle] = useState("");

  useEffect(() => {
    async function run() {
      const params = new URLSearchParams(window.location.search);
      const handle = params.get("handle") ?? "@SnapbackSports1";
      setResolvedHandle(handle);

      try {
        setStatus("resolving");
        const resolveRes = await fetch(`/api/resolve-channel?handle=${encodeURIComponent(handle)}`);
        if (!resolveRes.ok) {
          const body = await resolveRes.json().catch(() => ({}));
          throw new Error(body.error ?? `Resolve failed (${resolveRes.status})`);
        }
        const { channelId } = await resolveRes.json();

        setStatus("auditing");
        const auditRes = await fetch(`/api/youtube-audit?channelId=${channelId}&maxResults=100`);
        if (!auditRes.ok) {
          const body = await auditRes.json().catch(() => ({}));
          throw new Error(body.error ?? `Audit failed (${auditRes.status})`);
        }
        const auditData: AuditData = await auditRes.json();
        setData(auditData);
        setStatus("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }
    run();
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Internal tool
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Snapback Public YouTube Audit{" "}
              <span className="text-gray-500 font-normal text-2xl">v0.2</span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Based on 100 recent public videos. No retention or internal metrics.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 mt-1 transition"
          >
            Back home
          </Link>
        </section>

        {/* ── Status ────────────────────────────────────────────────────────── */}
        {status === "resolving" && (
          <p className="text-sm text-gray-400">Resolving {resolvedHandle || "@SnapbackSports1"}…</p>
        )}
        {status === "auditing" && (
          <p className="text-sm text-gray-400">
            Fetching and analyzing 100 videos — this may take a moment…
          </p>
        )}

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {status === "error" && (
          <div className="border border-red-300 bg-red-50 rounded-xl p-6 text-sm text-red-700">
            <span className="font-bold">Error: </span>{error}
          </div>
        )}

        {/* ── Data ──────────────────────────────────────────────────────────── */}
        {data && (
          <>
            {/* ── Section 1: Summary cards ───────────────────────────────── */}
            <section>
              <SectionLabel>Summary</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Avg Duration (Top)"
                  value={data.summary.avgDurationTop !== null ? fmtDuration(Math.round(data.summary.avgDurationTop)) : "—"}
                  accent
                />
                <StatCard
                  label="Avg Duration (Bottom)"
                  value={data.summary.avgDurationBottom !== null ? fmtDuration(Math.round(data.summary.avgDurationBottom)) : "—"}
                />
                <StatCard
                  label="Avg Engagement (Top)"
                  value={fmtPct(data.summary.avgEngagementTop)}
                  accent
                />
                <StatCard
                  label="Avg Engagement (Bottom)"
                  value={fmtPct(data.summary.avgEngagementBottom)}
                />
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Top / Bottom defined by Views-Per-Day quartiles (velocity), not by engagement rate.
              </p>
              <VelocityDistRow dist={data.summary.velocityDistribution} />
            </section>

            {/* ── Section 2: Top title keywords ──────────────────────────── */}
            <section>
              <SectionLabel>Top Title Keywords</SectionLabel>
              <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
                {data.summary.topTitleKeywords.map(({ word, count }, i) => (
                  <div key={word} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-snap-yellow/70 w-5">#{i + 1}</span>
                      <span className="text-sm font-medium text-snap-black">{word}</span>
                    </div>
                    <span className="text-sm text-gray-400 tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section 3: Title Structure Analysis ────────────────────── */}
            <TitleStructureSection titleAnalysis={data.titleAnalysis} />

            {/* ── Section 4: Top 15 ──────────────────────────────────────── */}
            <VideoTable videos={data.topVideos} label="Top 15 Videos by Views / Day" />

            {/* ── Section 5: Bottom 15 ───────────────────────────────────── */}
            <VideoTable videos={data.bottomVideos} label="Bottom 15 Videos by Views / Day" />

            {/* ── Section 6: Upload Cadence ───────────────────────────────── */}
            <UploadCadenceSection cadence={data.uploadCadence} />

            {/* ── Section 7: Format Clustering ───────────────────────────── */}
            <FormatClustersSection clusters={data.formatClusters} />

            {/* ── Section 8: Observations ─────────────────────────────────── */}
            <section>
              <SectionLabel>Observations</SectionLabel>
              <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
                <ul className="space-y-3">
                  {buildObservations(data).map((obs, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── Section 9: AI Strategic Summary ─────────────────────────── */}
            <AiSummarySection aiSummary={data.aiSummary} />
          </>
        )}

      </div>
    </main>
  );
}
