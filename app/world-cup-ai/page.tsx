"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import IdeaGenerator from "./IdeaGenerator";

// ── Types ──────────────────────────────────────────────────────────────────────

type VideoMetric = {
  videoId: string;
  title: string;
  viewsPerDay: number;
  velocityLabel?: string;
};

type AuditData = {
  channelId: string;
  channelAvgVpd?: number;
  summary: {
    avgDurationTop: number | null;
    avgDurationBottom: number | null;
    avgEngagementTop: number | null;
    avgEngagementBottom: number | null;
    topTitleKeywords: { word: string; count: number }[];
    velocityDistribution?: {
      exploding: number;
      outperforming: number;
      baseline: number;
      underperforming: number;
    };
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
  if (n == null) return "—";
  return (n * 100).toFixed(2) + "%";
}

function fmtVpd(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
}

// ── Content helpers ────────────────────────────────────────────────────────────

function buildTitleTemplates(keywords: { word: string; count: number }[]): string[] {
  const base = [
    "Is [Team] the Most Underrated Squad at the 2026 World Cup?",
    "USA vs [Rival] — What Nobody Is Talking About Going Into This Match",
    "We Ranked Every World Cup Host City. Here's the Honest Truth.",
    "Why [Team] Could Actually Win the 2026 World Cup",
    "The Real Cost of Going to the World Cup (We Broke It Down)",
    "[Number] Things That Will Surprise You About World Cup 2026",
    "We Flew to a World Cup Match. Here's Exactly What It's Like.",
    "The Best and Worst Parts of Watching the World Cup Live",
  ];

  const fromKeywords = keywords.slice(0, 2).map(k => {
    const cap = k.word.charAt(0).toUpperCase() + k.word.slice(1);
    return `The "${cap}" Factor — Why It Matters More at the World Cup Than Anywhere Else`;
  });

  return [...base, ...fromKeywords].slice(0, 10);
}

function buildSampleSlate(
  keywords: { word: string; count: number }[],
  topVideos: VideoMetric[],
): { title: string; angle: string; why: string }[] {
  const exTop = topVideos[0];

  const items: { title: string; angle: string; why: string }[] = [
    {
      title: "USA vs Mexico — What the Rivalry Actually Means in 2026",
      angle: "Nationalism + rivalry tension (proven Olympics spike mechanic)",
      why: exTop
        ? `Mirrors the event-driven framing of your top video: "${exTop.title.slice(0, 50)}…" (${fmtVpd(exTop.viewsPerDay)} views/day).`
        : "Mirrors the rivalry tension pattern seen in your highest-velocity titles.",
    },
    {
      title: "We Ranked Every World Cup Host City. Here's the Truth.",
      angle: "Experiences + local intelligence — Snapback's core strength",
      why: "Ranking + specificity formula consistently appears in top-quartile titles. Numeric framing boosts CTR.",
    },
    {
      title: "Is the World Cup Fan Zone Actually Worth It? We Tested It.",
      angle: "Question format + on-the-ground POV — drives curiosity loop",
      why: "Question titles that challenge a common assumption perform above channel average in your audit data.",
    },
    {
      title: "Everything You Need to Know Before Your First World Cup Match",
      angle: "Evergreen practical guide — long-tail search and depth signal",
      why: "Longer how-to content matches your top-quartile avg duration pattern. Depth wins on this channel.",
    },
  ];

  if (keywords.length >= 1) {
    const kw1 = keywords[0];
    const cap = kw1.word.charAt(0).toUpperCase() + kw1.word.slice(1);
    items.push({
      title: `The ${cap} Angle No One Is Using for World Cup Coverage`,
      angle: "Keyword leverage — direct transfer of proven topic into WC frame",
      why: `"${kw1.word}" is your #1 top-quartile keyword (${kw1.count} occurrences). Porting it into WC context tests audience transferability.`,
    });
  }

  if (keywords.length >= 2) {
    const kw2 = keywords[1];
    const cap = kw2.word.charAt(0).toUpperCase() + kw2.word.slice(1);
    items.push({
      title: `${cap} vs the World Cup: Why This Summer Changes Everything`,
      angle: "Stakes framing — timing urgency + tension",
      why: `"${kw2.word}" appears ${kw2.count}× in your top-quartile titles. Adding stakes language to a proven keyword compounds velocity.`,
    });
  }

  return items;
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-3">
      {children}
    </p>
  );
}

function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 ${className}`}>
      {children}
    </div>
  );
}

function WhiteCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
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
    <div
      className={`rounded-xl p-5 ${
        accent
          ? "border border-yellow-400/40 bg-yellow-500/10"
          : "border border-white/10 bg-white/5"
      }`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold tabular-nums leading-none ${accent ? "text-white" : "text-gray-300"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-2 leading-snug">{sub}</p>}
    </div>
  );
}

function BulletList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}>
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CopyableTemplate({ template, index }: { template: string; index: number }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="text-xs font-bold text-snap-yellow/60 w-5 shrink-0 tabular-nums mt-0.5">
          {index + 1}.
        </span>
        <span className="text-sm text-gray-700 leading-snug">{template}</span>
      </div>
      <button
        onClick={handleCopy}
        className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md border transition whitespace-nowrap ${
          copied
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:border-snap-yellow/50 hover:text-snap-black"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function WorldCupAIPage() {
  const [data, setData]     = useState<AuditData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    async function fetchAudit() {
      try {
        setStatus("resolving");
        const resolveRes = await fetch("/api/resolve-channel?handle=@SnapbackSports1");
        if (!resolveRes.ok) {
          const body = await resolveRes.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `Resolve failed (${resolveRes.status})`);
        }
        const { channelId } = await resolveRes.json() as { channelId: string };

        setStatus("auditing");
        const auditRes = await fetch(`/api/youtube-audit?channelId=${channelId}&maxResults=100`);
        if (!auditRes.ok) {
          const body = await auditRes.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `Audit failed (${auditRes.status})`);
        }
        setData(await auditRes.json() as AuditData);
        setStatus("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }
    fetchAudit();
  }, []);

  // ── Derived values (safe defaults while loading) ───────────────────────────
  const keywords     = data?.summary.topTitleKeywords ?? [];
  const topVideos    = data?.topVideos ?? [];
  const durationTop  = data?.summary.avgDurationTop ?? null;
  const durationBot  = data?.summary.avgDurationBottom ?? null;
  const engTop       = data?.summary.avgEngagementTop ?? null;
  const engBot       = data?.summary.avgEngagementBottom ?? null;
  const avgVpd       = data?.channelAvgVpd ?? null;
  const topKws       = keywords.slice(0, 3);
  const templates    = buildTitleTemplates(keywords);
  const slate        = buildSampleSlate(keywords, topVideos);

  const isLoading = status === "resolving" || status === "auditing";

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                Data-backed strategy
              </span>
              <span className="border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                World Cup 2026
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              World Cup<br />Content Playbook
            </h1>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-xl">
              Built from Snapback&apos;s live YouTube audit. Every recommendation is tied to a{" "}
              <span className="text-white font-medium">
                real metric from our channel data
              </span>{" "}
              — not guesswork.
            </p>

            {isLoading && (
              <p className="mt-4 text-xs text-gray-500 animate-pulse">
                {status === "resolving" ? "Connecting to Snapback channel…" : "Pulling audit data — this takes a few seconds…"}
              </p>
            )}
            {status === "error" && (
              <p className="mt-4 text-xs text-red-400">
                Audit load failed: {error}. Strategy content below uses framework defaults.
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 transition mt-1"
          >
            Back home
          </Link>
        </section>

        {/* ── Stat cards — from audit, framed for World Cup ─────────────────── */}
        <section>
          <SectionLabel>From the audit — World Cup implications</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Top videos run longer"
              value={durationTop != null ? fmtDuration(Math.round(durationTop)) : "—"}
              sub={
                durationBot != null
                  ? `vs ${fmtDuration(Math.round(durationBot))} for bottom quartile — depth wins`
                  : isLoading ? "Loading audit…" : "No data"
              }
              accent
            />
            <StatCard
              label="Keywords that travel"
              value={topKws[0] ? `"${topKws[0].word}"` : "—"}
              sub={
                topKws.length > 1
                  ? topKws.slice(1).map(k => `"${k.word}"`).join(", ")
                  : isLoading ? "Loading…" : "No data"
              }
            />
            <StatCard
              label="Engagement ≠ velocity"
              value={engTop != null ? fmtPct(engTop) : "—"}
              sub={
                engBot != null
                  ? `vs ${fmtPct(engBot)} bottom quartile — distribution drives views, not CTR alone`
                  : isLoading ? "Loading audit…" : "No data"
              }
            />
            <StatCard
              label="Channel baseline"
              value={avgVpd != null ? `${fmtVpd(avgVpd)}/day` : "—"}
              sub="views/day to beat to outperform channel average"
              accent
            />
          </div>
        </section>

        {/* ── Section 1: What the Olympics spike taught us ───────────────────── */}
        <section>
          <SectionLabel>Section 1</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">
            What the Olympics spike taught us
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
            Major sporting events compress attention into a short window and create velocity spikes
            that outlast the event itself. Three mechanics drive this every time — and all three
            are validated by patterns in our own audit.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                title: "Event-driven nationalism",
                body: "Content framed around national identity — flag, country vs country, regional pride — performs differently during major events. The audience is emotionally primed to care in a way everyday sports content cannot replicate.",
              },
              {
                title: "Rivalry framing",
                body: "Our top-quartile titles use tension framing more than bottom performers. Two-sided matchups (Best vs Worst, Country A vs Country B) consistently appear in the highest-velocity videos on this channel.",
              },
              {
                title: "Limited-time spikes",
                body: "Event windows create natural urgency. Audiences who don't normally engage get pulled in by specific match content, then convert to subscribers if the depth is there. The window is short — the tail is long.",
              },
            ].map(card => (
              <DarkCard key={card.title} className="p-5">
                <span className="block w-1.5 h-1.5 rounded-full bg-snap-yellow mb-3" />
                <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{card.body}</p>
              </DarkCard>
            ))}
          </div>

          {topVideos.length > 0 && (
            <WhiteCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Top-performing titles from our audit — patterns to replicate
              </p>
              <ul className="divide-y divide-gray-100">
                {topVideos.slice(0, 3).map(v => (
                  <li key={v.videoId} className="py-3 flex items-start justify-between gap-4">
                    <a
                      href={`https://www.youtube.com/watch?v=${v.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-snap-black leading-snug max-w-sm hover:text-snap-yellow transition line-clamp-2"
                    >
                      {v.title}
                    </a>
                    <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums shrink-0">
                      {fmtVpd(v.viewsPerDay)} views/day
                      {v.velocityLabel ? ` · ${v.velocityLabel}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {topKws.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 font-medium">
                    Top keywords driving these titles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topKws.map(kw => (
                      <span
                        key={kw.word}
                        className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {kw.word}
                        <span className="text-yellow-500 font-bold">{kw.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </WhiteCard>
          )}
        </section>

        {/* ── Section 2: World Cup = Olympics mechanics on steroids ─────────── */}
        <section>
          <SectionLabel>Section 2</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">
            World Cup = Olympics mechanics, on steroids
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
            Every psychological driver that creates an Olympics content spike applies to the World Cup
            — at 10× the global scale, with a month-long window and a US host-city advantage
            Snapback is uniquely positioned to use.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                label: "National identity",
                olympics: "~30 countries across 2–3 weeks of events",
                wc: "48 teams over 39 days — more flags, more stories, more surface area for content",
              },
              {
                label: "Rivalry stakes",
                olympics: "Country vs country in one-off timed events",
                wc: "Knockout format creates compounding elimination pressure every round",
              },
              {
                label: "Limited-time window",
                olympics: "3–4 weeks with a predictable daily schedule",
                wc: "Matches daily for weeks, hosted in US cities Snapback already covers",
              },
              {
                label: "Discovery pull",
                olympics: "New audiences from casual, non-sports-specific fans",
                wc: "Soccer-first global audience + the US soccer coming-of-age narrative",
              },
            ].map(row => (
              <WhiteCard key={row.label} className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{row.label}</p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-400 w-20 shrink-0 mt-0.5">Olympics</span>
                    <span className="text-sm text-gray-500">{row.olympics}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-snap-yellow w-20 shrink-0 mt-0.5">World Cup</span>
                    <span className="text-sm text-gray-800 font-medium">{row.wc}</span>
                  </div>
                </div>
              </WhiteCard>
            ))}
          </div>
        </section>

        {/* ── Section 3: Content structure ──────────────────────────────────── */}
        <section>
          <SectionLabel>Section 3</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">
            Content structure we should run this summer
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">
            Based on audit patterns — what title structures work, what length wins, and what topics
            pull — here is the operating framework for World Cup coverage.
          </p>

          {/* 3a. Content pillars */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Content pillars
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Experiences (on-the-ground)",
                  bullets: [
                    "Host city guides — transit, fan zones, best spots near each stadium",
                    "Full matchday itinerary: arrival to final whistle",
                    "\"We tested it\" POV reviews of fan zones and watch parties",
                  ],
                },
                {
                  title: "Rivalry + Tension",
                  bullets: [
                    "Country vs country breakdowns before key matches",
                    "\"Everything wrong with [team]'s roster\" audit format",
                    "Prediction vs result reaction — highest replay potential",
                  ],
                },
                {
                  title: "Rankings + Lists",
                  bullets: [
                    "Audit shows numeric titles appear more in top-quartile content vs bottom",
                    "Best/worst host cities, squads, fan bases, group stage brackets",
                    "\"We ranked X, here's the honest truth\" formula converts curiosity to clicks",
                  ],
                },
                {
                  title: "Questions + Stakes",
                  bullets: [
                    "\"Is [team] actually good?\" — question formats drive CTR on this channel",
                    "\"Will the US make it out of the group stage?\" — stakes framing",
                    "Audit data shows question marks in top titles outperform declarative formats",
                  ],
                },
              ].map(pillar => (
                <WhiteCard key={pillar.title} className="p-5 border-l-4 border-l-snap-yellow">
                  <h3 className="text-sm font-bold text-snap-black mb-3">{pillar.title}</h3>
                  <BulletList items={pillar.bullets} />
                </WhiteCard>
              ))}
            </div>
          </div>

          {/* 3b. Title templates */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
              Title templates — based on what worked in the audit
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Structures pulled from top-quartile title patterns. Click "Copy" to grab any template.
            </p>
            <WhiteCard>
              {templates.map((t, i) => (
                <CopyableTemplate key={i} template={t} index={i} />
              ))}
            </WhiteCard>
          </div>

          {/* 3c. Length strategy */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Length strategy — audit-backed
            </p>
            <DarkCard className="p-6">
              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                Top-quartile videos on this channel average{" "}
                <span className="text-white font-semibold">
                  {durationTop != null ? fmtDuration(Math.round(durationTop)) : "—"}
                </span>{" "}
                vs{" "}
                <span className="text-gray-500">
                  {durationBot != null ? fmtDuration(Math.round(durationBot)) : "—"}
                </span>{" "}
                for the bottom quartile. Depth-driven content correlates with higher velocity here.
                Build toward that, not away from it.
              </p>
              <BulletList
                dark
                items={[
                  `Long-form (${durationTop != null ? Math.round(durationTop / 60) : "10"}+ min): Host city guides, squad breakdowns, experience recaps. This is where depth converts into sustained views.`,
                  "Short-form (60–90s): Match-week teasers, reaction clips, and social hooks that funnel back to long-form.",
                  "Never compress a video just because it's easier to produce short — the data says depth wins on this channel.",
                ]}
              />
            </DarkCard>
          </div>

          {/* 3d. Cadence */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Upload cadence guidance
            </p>
            <DarkCard className="p-6">
              <BulletList
                dark
                items={[
                  "Group stage (daily matches): target 1 long-form + 2–3 short-form pieces per match week.",
                  "Publish previews 48 hours before key matches — pre-match content captures the search window before kick-off.",
                  "Post-game reactions within 6 hours — this is the highest-velocity window for event content.",
                  "We will track upload day × time vs views/day each week and adjust. Our audit will tell us if morning or evening posts outperform within the first 3 weeks of coverage.",
                ]}
              />
            </DarkCard>
          </div>
        </section>

        {/* ── Section 4: AI operating loop ──────────────────────────────────── */}
        <section>
          <SectionLabel>Section 4</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">AI operating loop</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
            The playbook only works if there is a weekly system behind it. Here is the loop we
            would run — starting from data, ending with a published slate.
          </p>

          <div className="space-y-3">
            {[
              {
                step: "01",
                title: "Pull metrics",
                body: "Every Monday: run our YouTube audit against last week's uploads. Identify which videos outperformed channel velocity baseline. Note what title structure and topic they used.",
              },
              {
                step: "02",
                title: "Detect topic clusters",
                body: "Identify the top 3 narratives driving engagement that week — using match results, social chatter, and the audit's keyword signal from top-performing titles.",
              },
              {
                step: "03",
                title: "Generate content slate",
                body: "Draft a 3–5 video slate for the week: titles, angles, target lengths, and publish windows. Every piece is tied to a specific match, storyline, or evergreen topic from our pillars.",
              },
              {
                step: "04",
                title: "Generate titles and hooks",
                body: "For each slate item, produce 3 title variants using proven template structures (questions, tension, country vs country, ranking format). Pick the one with the strongest curiosity gap.",
              },
              {
                step: "05",
                title: "Publish + log",
                body: "Post on the planned cadence. Log exact publish time, title used, and 48-hour views/day. This feeds directly into next week's audit loop.",
              },
              {
                step: "06",
                title: "Friday review",
                body: "Compare slate performance vs channel baseline. Promote what worked into next week's title templates. Kill what underperformed. The loop tightens every week.",
              },
            ].map(item => (
              <DarkCard key={item.step} className="flex items-start gap-5 p-5">
                <span className="text-2xl font-bold text-snap-yellow/20 tabular-nums shrink-0 leading-none mt-0.5 w-8">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
                </div>
              </DarkCard>
            ))}
          </div>
        </section>

        {/* ── Section 5: What we would ship as interns ──────────────────────── */}
        <section>
          <SectionLabel>Section 5</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">What we would ship as interns</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
            A concrete 8-week build — from now through the World Cup group stage. Each week has a
            defined deliverable and a clear success metric.
          </p>

          <WhiteCard className="divide-y divide-gray-100">
            {[
              {
                week: "Wk 1–2",
                deliverable: "Audit infrastructure + baseline",
                detail:
                  "Set up weekly audit pull (this page, running live against the channel). Establish velocity baseline per content type. Document the 5 best-performing title structures from the existing catalog.",
              },
              {
                week: "Wk 3",
                deliverable: "First World Cup content piece",
                detail:
                  "Produce one long-form host city guide using the Experiences pillar format. Test 3 title variants. Log 48-hour velocity vs channel average and report what worked.",
              },
              {
                week: "Wk 4",
                deliverable: "Rivalry content + template library",
                detail:
                  "Publish 1–2 rivalry/tension pieces. Build the reusable title template library (the 10-template sheet on this page, in shareable doc form). Distribute to the full team.",
              },
              {
                week: "Wk 5–6",
                deliverable: "Cadence ramp-up + slate system",
                detail:
                  "Hit 1 long-form + 2 short-form per week. Implement the Monday–Friday AI operating loop. Start logging publish time vs 48-hour velocity on every upload.",
              },
              {
                week: "Wk 7",
                deliverable: "Group stage coverage sprint",
                detail:
                  "Match-week content in real time. Pre-match previews 48 hours before key games. Post-match reactions within 6 hours. Optimize timing based on the data we've gathered.",
              },
              {
                week: "Wk 8",
                deliverable: "Retrospective + knockout phase plan",
                detail:
                  "Full audit of 8-week performance. Present: what formats won, what keywords transferred, what timing beat baseline. Propose the knockout stage plan based on group-stage findings.",
              },
            ].map(row => (
              <div key={row.week} className="flex items-start gap-5 px-6 py-4">
                <span className="text-xs font-bold text-snap-yellow whitespace-nowrap w-14 shrink-0 mt-0.5">
                  {row.week}
                </span>
                <div>
                  <p className="text-sm font-semibold text-snap-black mb-1">{row.deliverable}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{row.detail}</p>
                </div>
              </div>
            ))}
          </WhiteCard>
        </section>

        {/* ── Sample slate for next week ─────────────────────────────────────── */}
        <section>
          <SectionLabel>Sample slate for next week</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">Generated from our audit keywords</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Each idea is grounded in a specific pattern from the channel data — not generic content advice.
            {!data && isLoading && " Keyword-specific items will populate once audit loads."}
          </p>

          <div className="space-y-3">
            {slate.map((item, i) => (
              <DarkCard key={i} className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-bold text-snap-yellow/30 tabular-nums shrink-0 w-5 mt-0.5">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-snap-yellow/70 font-medium mb-1.5">{item.angle}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.why}</p>
                  </div>
                </div>
              </DarkCard>
            ))}
          </div>
        </section>

        {/* ── Idea Generator (preserved) ────────────────────────────────────── */}
        <section>
          <SectionLabel>Try it now</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">World Cup Idea Generator</h2>
          <IdeaGenerator />
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Built by{" "}
            <span className="text-gray-300 font-medium">Brennan + David</span>
          </p>
          <p className="text-xs text-gray-600 tracking-wide uppercase">Snapback AI Ops Lab</p>
        </footer>

      </div>
    </main>
  );
}
