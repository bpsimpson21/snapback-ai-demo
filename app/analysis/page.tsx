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
};

type AuditData = {
  channelId: string;
  summary: {
    avgDurationTop: number | null;
    avgDurationBottom: number | null;
    avgEngagementTop: number | null;
    avgEngagementBottom: number | null;
    topTitleKeywords: { word: string; count: number }[];
  };
  topVideos: VideoMetric[];
  bottomVideos: VideoMetric[];
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

// ── Computed observations ──────────────────────────────────────────────────────

function buildObservations(data: AuditData): string[] {
  const obs: string[] = [];
  const { avgDurationTop: dTop, avgDurationBottom: dBot,
          avgEngagementTop: eTop, avgEngagementBottom: eBot,
          topTitleKeywords: kws } = data.summary;

  // a) Duration difference
  if (dTop !== null && dBot !== null) {
    if (dTop === dBot) {
      obs.push(
        `Top and bottom quartile videos have similar average durations (${fmtDuration(Math.round(dTop))}).`
      );
    } else {
      const diff = Math.abs(Math.round(dTop - dBot));
      const dir = dTop > dBot ? "longer" : "shorter";
      obs.push(
        `Top-quartile videos average ${fmtDuration(Math.round(dTop))}, vs ${fmtDuration(Math.round(dBot))} for the bottom quartile — ${fmtDuration(diff)} ${dir} on average.`
      );
    }
  }

  // b) Engagement vs velocity correlation
  if (eTop !== null && eBot !== null) {
    if (eTop > eBot * 1.1) {
      obs.push(
        `Higher-velocity videos also show stronger engagement (${fmtPct(eTop)} vs ${fmtPct(eBot)}), suggesting topic selection drives both metrics.`
      );
    } else if (eBot > eTop * 1.1) {
      obs.push(
        `Engagement rate does not predict velocity — bottom-quartile videos average higher engagement (${fmtPct(eBot)}) than the top (${fmtPct(eTop)}), indicating view speed is driven by other factors.`
      );
    } else {
      obs.push(
        `Engagement rates are similar across quartiles (top: ${fmtPct(eTop)}, bottom: ${fmtPct(eBot)}), suggesting engagement rate alone does not determine velocity.`
      );
    }
  }

  // c) Dominant topic signals
  const top3 = kws.slice(0, 3);
  if (top3.length > 0) {
    const kwStr = top3.map((k) => `"${k.word}"`).join(", ");
    obs.push(
      `Top-performing titles feature keywords like ${kwStr} — suggesting these topics consistently drive higher view velocity.`
    );
  }

  return obs;
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
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 ${
        accent
          ? "border border-yellow-400/40 bg-yellow-500/10"
          : "border border-white/10 bg-white/5"
      }`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-white" : "text-gray-300"}`}>
        {value}
      </p>
    </div>
  );
}

function VideoTable({ videos, label }: { videos: VideoMetric[]; label: string }) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Title", "Views", "Views/Day", "Engagement", "Duration", "Published"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [data, setData] = useState<AuditData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resolvedHandle, setResolvedHandle] = useState("");

  useEffect(() => {
    async function run() {
      const params = new URLSearchParams(window.location.search);
      const handle = params.get("handle") ?? "@SnapbackSports1";
      setResolvedHandle(handle);

      try {
        setStatus("resolving");
        const resolveRes = await fetch(
          `/api/resolve-channel?handle=${encodeURIComponent(handle)}`
        );
        if (!resolveRes.ok) {
          const body = await resolveRes.json().catch(() => ({}));
          throw new Error(body.error ?? `Resolve failed (${resolveRes.status})`);
        }
        const { channelId } = await resolveRes.json();

        setStatus("auditing");
        const auditRes = await fetch(
          `/api/youtube-audit?channelId=${channelId}&maxResults=100`
        );
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

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Internal tool
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Snapback Public YouTube Audit{" "}
              <span className="text-gray-500 font-normal text-2xl">v0.1</span>
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

        {/* ── Status ───────────────────────────────────────────────────────── */}
        {status === "resolving" && (
          <p className="text-sm text-gray-400">Resolving {resolvedHandle || "@SnapbackSports1"}...</p>
        )}
        {status === "auditing" && (
          <p className="text-sm text-gray-400">
            Fetching and analyzing 100 videos — this may take a moment...
          </p>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {status === "error" && (
          <div className="border border-red-300 bg-red-50 rounded-xl p-6 text-sm text-red-700">
            <span className="font-bold">Error: </span>{error}
          </div>
        )}

        {/* ── Data ─────────────────────────────────────────────────────────── */}
        {data && (
          <>
            {/* ── Section 1: Summary cards ───────────────────────────────── */}
            <section>
              <SectionLabel>Summary</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Avg Duration (Top)"
                  value={
                    data.summary.avgDurationTop !== null
                      ? fmtDuration(Math.round(data.summary.avgDurationTop))
                      : "—"
                  }
                  accent
                />
                <StatCard
                  label="Avg Duration (Bottom)"
                  value={
                    data.summary.avgDurationBottom !== null
                      ? fmtDuration(Math.round(data.summary.avgDurationBottom))
                      : "—"
                  }
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

            {/* ── Section 3: Top 15 ──────────────────────────────────────── */}
            <VideoTable videos={data.topVideos} label="Top 15 Videos by Views / Day" />

            {/* ── Section 4: Bottom 15 ───────────────────────────────────── */}
            <VideoTable videos={data.bottomVideos} label="Bottom 15 Videos by Views / Day" />

            {/* ── Section 5: Data-driven observations ────────────────────── */}
            <section>
              <SectionLabel>Observations</SectionLabel>
              <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
                <ul className="space-y-3">
                  {buildObservations(data).map((obs, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

      </div>
    </main>
  );
}
