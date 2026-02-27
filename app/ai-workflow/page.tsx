"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ── Animation hooks ────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-white/5" />;
}

// ── Video Player ───────────────────────────────────────────────────────────────

function VideoPlayer({
  src,
  citation,
}: {
  src: string;
  citation: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play();
      setPlaying(true);
    }
  }, [playing]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
  }, []);

  return (
    <div className="space-y-2">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black cursor-pointer group"
        style={{ aspectRatio: "16 / 9" }}
        onClick={handlePlay}
        role="button"
        tabIndex={0}
        aria-label={playing ? "Pause video" : "Play video"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePlay();
          }
        }}
      >
        <video
          ref={videoRef}
          src={src}
          preload="metadata"
          playsInline
          onEnded={handleEnded}
          className="w-full h-full object-cover"
        />
        {/* Play button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            playing ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-5 group-hover:bg-snap-yellow/20 group-hover:scale-110 transition-all duration-200">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white ml-1"
            >
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 italic">{citation}</p>
    </div>
  );
}

// ── Flywheel Diagram ───────────────────────────────────────────────────────────

const FLYWHEEL_STEPS = [
  { label: "Create\nContent", angle: 270 },
  { label: "Grow\nFollowing", angle: 0 },
  { label: "Monetize\nContent", angle: 90 },
  { label: "Re-Invest\nProfits", angle: 180 },
];

function FlywheelDiagram() {
  const { ref, inView } = useInView(0.2);
  const radius = 130;
  const cx = 200;
  const cy = 200;

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        inView ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[400px] mx-auto"
        role="img"
        aria-label="Jack Settleman's flywheel: Create Content, Grow Following, Monetize Content, Re-Invest Profits"
      >
        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 30}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Curved arrows between nodes */}
        {FLYWHEEL_STEPS.map((_, i) => {
          const nextI = (i + 1) % 4;
          const a1 = (FLYWHEEL_STEPS[i].angle * Math.PI) / 180;
          const a2 = (FLYWHEEL_STEPS[nextI].angle * Math.PI) / 180;
          const r = radius;

          // Start and end points on the circle
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2);
          const y2 = cy + r * Math.sin(a2);

          // Midpoint for the arc (offset outward slightly)
          const midAngle = (a1 + a2) / 2 + (a2 < a1 ? Math.PI : 0);
          const arcR = r + 20;
          const mx = cx + arcR * Math.cos(midAngle);
          const my = cy + arcR * Math.sin(midAngle);

          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                fill="none"
                stroke="rgba(250,204,21,0.3)"
                strokeWidth="2"
                strokeDasharray="6 4"
                className={`transition-all duration-1000 ${
                  inView ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: `${400 + i * 150}ms` }}
              />
              {/* Arrowhead */}
              <circle
                cx={x2}
                cy={y2}
                r="3"
                fill="rgba(250,204,21,0.5)"
                className={`transition-all duration-500 ${
                  inView ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: `${700 + i * 150}ms` }}
              />
            </g>
          );
        })}

        {/* Node circles and labels */}
        {FLYWHEEL_STEPS.map((step, i) => {
          const a = (step.angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(a);
          const y = cy + radius * Math.sin(a);
          const lines = step.label.split("\n");

          return (
            <g
              key={step.label}
              className={`transition-all duration-700 ${
                inView ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: `${200 + i * 120}ms` }}
            >
              <circle
                cx={x}
                cy={y}
                r="42"
                fill="rgba(250,204,21,0.08)"
                stroke="rgba(250,204,21,0.4)"
                strokeWidth="1.5"
              />
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={x}
                  y={y + (li - (lines.length - 1) / 2) * 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-[11px] font-semibold"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Center label */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-snap-yellow text-[13px] font-bold"
        >
          Snapback
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-snap-yellow text-[13px] font-bold"
        >
          Flywheel
        </text>
      </svg>
    </div>
  );
}

// ── Page data ──────────────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  {
    phase: "Day 1",
    steps: [
      "Download from Dropbox (~100GB+ per project folder)",
      "Manage and archive data during download",
      "Import into Final Cut Pro / Premiere",
      "Watch through ALL footage to learn what they're working with, verify everything is accounted for",
      "Mark b-roll, cut irrelevant pieces — this takes the entire first day",
    ],
  },
  {
    phase: "Day 2",
    steps: [
      "Trim and reorganize footage to build narrative",
      "Establish pacing and story structure",
      "Get feedback and collaborate with talent",
    ],
  },
  {
    phase: "Days 3–4",
    steps: [
      "Brainstorm and source b-roll and graphics (1–2 days)",
      "Music sourcing from Soundstripe (described as \"exhausting\")",
      "Intro saved for last — it's the most important piece",
    ],
  },
];

const TEAM_SPLIT = [
  {
    name: "Matt Batson",
    responsibilities: ["Assembly Cut", "B-Roll", "Graphics", "Music"],
  },
  {
    name: "Ryan Marshall",
    responsibilities: ["Intro", "Final Score", "Punchline", "Social Content"],
  },
];

const BOTTLENECKS = [
  {
    label: "Linear footage review",
    detail: "Watching 4+ hours of raw footage start to finish",
    hours: "4–6 hrs",
  },
  {
    label: "Manual b-roll logging",
    detail: "Identifying and tagging every usable b-roll clip by hand",
    hours: "2–3 hrs",
  },
  {
    label: "Clip extraction",
    detail: "Scrubbing through footage they've already watched to find and extract specific moments",
    hours: "1–2 hrs",
  },
  {
    label: "Music search",
    detail: "Searching Soundstripe for the right track across hundreds of options",
    hours: "1–2 hrs",
  },
];

const AI_TOOLS = [
  {
    name: "OpenAI Whisper",
    type: "Open Source — Runs Locally",
    typeColor: "text-emerald-400",
    badge: "Local",
    badgeColor: "border-emerald-400/40 text-emerald-400",
    description:
      "Transcribes all dialogue with timestamps. Auto-detects silence gaps for removal. Generates a full searchable transcript of every word said in 4+ hours of footage.",
    replaces: "Manual dialogue logging and silence identification",
    processingTime: "~30–45 min for 4 hrs of footage on MacBook M-series",
  },
  {
    name: "PySceneDetect",
    type: "Open Source Python Library — Runs Locally",
    typeColor: "text-emerald-400",
    badge: "Local",
    badgeColor: "border-emerald-400/40 text-emerald-400",
    description:
      "Detects scene boundaries, hard cuts, and motion intensity changes. Outputs timecoded cut lists exportable to XML/EDL for direct import into Final Cut Pro and Premiere.",
    replaces: "Manual scrubbing for cuts and action moments",
    processingTime: "~15–25 min for 4 hrs of footage",
  },
  {
    name: "Twelve Labs",
    type: "Cloud API",
    typeColor: "text-blue-400",
    badge: "Cloud",
    badgeColor: "border-blue-400/40 text-blue-400",
    description:
      "Semantic video search. Editors query natural language like \"touchdown celebration\" or \"sideline interview\" and get timestamped results. Eliminates the need to watch all footage linearly.",
    replaces: "The entire Day 1 first-watch logging process",
    processingTime: "~45–60 min indexing for 4 hrs of footage",
  },
  {
    name: "Google Cloud Video Intelligence",
    type: "Cloud API",
    typeColor: "text-blue-400",
    badge: "Cloud",
    badgeColor: "border-blue-400/40 text-blue-400",
    description:
      "Detects faces, emotions, on-screen text, and crowd energy. Auto-generates tagged metadata for every frame. Replaces manual reaction tagging and b-roll flagging.",
    replaces: "Manual reaction tagging and b-roll flagging",
    processingTime: "~40–60 min for 4 hrs of footage",
  },
];

const CURRENT_WORKFLOW = [
  { task: "Ingest + full footage watch + logging + initial cuts", time: "8–10 hrs", day: "Day 1" },
  { task: "Narrative assembly + pacing", time: "6–8 hrs", day: "Day 2" },
  { task: "B-roll, graphics, music, intro", time: "12–16 hrs", day: "Days 3–4" },
];

const AI_WORKFLOW = [
  { task: "Ingest + kick off AI pipeline", time: "0.5–1 hr", note: "Machine runs 1.5–2.5 hrs in parallel" },
  { task: "AI-assisted review (query indexed footage vs linear watch)", time: "1–1.5 hrs", note: null },
  { task: "Smart clip extraction (approve AI-suggested cuts vs scrubbing)", time: "0.5–1 hr", note: null },
  { task: "Story prep + assembly", time: "1.5–2 hrs", note: "Unchanged — stays human and creative" },
  { task: "B-roll, graphics, music, intro", time: "8–12 hrs", note: "Still creative, but starts 1–2 days earlier" },
];

const FLYWHEEL_BENEFITS = [
  "Faster editing → more content output per editor",
  "More content → faster audience growth",
  "No need to hire overflow editors during peak seasons (like Nate during CFB)",
  "Saved capacity reinvested into higher quality intros, more brainstorm time, more social content",
  "Capital stays in the flywheel instead of leaking to temporary labor",
  "The 12% of total expenses that editors represent becomes dramatically more productive",
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AiWorkflowPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto pt-4">
          <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Post-Production Pipeline
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            How AI Saves Snapback
            <br />
            <span className="text-snap-yellow">2 Days Per Video.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A tool-by-tool breakdown of how AI removes mechanical editing work —
            mapped directly to Snapback&apos;s actual production process.
          </p>
          <p className="text-xs text-gray-600">
            Built by Brennan Simpson &amp; David &nbsp;·&nbsp; Workflow sourced from{" "}
            <span className="text-gray-500">
              Jack Settleman, LinkedIn, 2025
            </span>
          </p>
        </section>

        <Divider />

        {/* ── Section 1: Current Workflow ──────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>Current Workflow</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              How Matt &amp; Ryan Edit Today
            </h2>
            <p className="text-gray-400 text-sm mb-10 max-w-2xl leading-relaxed">
              Sourced from Jack Settleman&apos;s LinkedIn breakdown of Snapback&apos;s
              editing process. This is the real workflow — not a guess.
            </p>
          </FadeIn>

          {/* Timeline */}
          <div className="relative">
            <div
              aria-hidden
              className="hidden sm:block absolute left-[1.625rem] top-10 bottom-10 w-px bg-white/10"
            />
            <div className="space-y-5">
              {WORKFLOW_STEPS.map((phase, i) => (
                <FadeIn key={phase.phase} delay={i * 120}>
                  <div className="relative sm:pl-16">
                    <div
                      className={`hidden sm:flex absolute left-0 top-5 w-[3.25rem] h-[3.25rem] rounded-xl items-center justify-center border-2 bg-snap-black z-10 ${
                        i === 0
                          ? "border-red-400/60"
                          : "border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-white">{phase.phase}</span>
                    </div>
                    <div className="border border-white/10 rounded-2xl bg-white/5 p-6 hover:border-snap-yellow/20 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="sm:hidden text-xs font-bold text-snap-yellow border border-snap-yellow/40 px-2 py-0.5 rounded-full shrink-0">
                          {phase.phase}
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {phase.steps.map((step, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed"
                          >
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                              i === 0 ? "bg-red-400/60" : "bg-snap-yellow/60"
                            }`} />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Team split */}
          <FadeIn delay={400}>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {TEAM_SPLIT.map((editor) => (
                <div
                  key={editor.name}
                  className="border border-white/10 rounded-2xl bg-white/5 p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    {editor.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editor.responsibilities.map((r) => (
                      <span
                        key={r}
                        className="text-xs border border-white/10 bg-white/5 text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Capacity note */}
          <FadeIn delay={500}>
            <div className="border border-red-400/20 bg-red-500/5 rounded-2xl p-6 mt-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="text-red-400 font-semibold">Capacity already maxed:</span>{" "}
                During CFB season, Snapback had to bring on a third editor (Nate) just for assembly
                cuts and b-roll — proving the current 2-person team has already hit its limit.
              </p>
            </div>
          </FadeIn>

          {/* Video embed */}
          <FadeIn delay={600}>
            <div className="mt-8 max-w-2xl mx-auto">
              <VideoPlayer
                src="/videos/workflow-clip.mp4"
                citation="Source: Jack Settleman, LinkedIn, 2025"
              />
            </div>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 2: The Bottleneck ───────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>The Bottleneck</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Where the Hours Actually Go
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">
              2 editors spending Day 1 entirely on mechanical logging — not creative work.
              These are the specific time sinks holding the pipeline back.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {BOTTLENECKS.map((b, i) => (
              <FadeIn key={b.label} delay={i * 80}>
                <div className="border border-red-400/20 rounded-2xl bg-red-500/5 p-6 h-full hover:border-red-400/40 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-base font-bold text-white">{b.label}</h3>
                    <span className="text-sm font-bold text-red-400 tabular-nums whitespace-nowrap">
                      {b.hours}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{b.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="border border-snap-yellow/30 bg-yellow-500/5 rounded-2xl p-6">
              <p className="text-white text-base leading-relaxed font-medium">
                Total Day 1 mechanical work: <span className="text-snap-yellow font-bold">8–13 hours</span> across
                both editors. That&apos;s an entire workday spent on tasks a machine can do in 2 hours.
              </p>
            </div>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 3: AI-Augmented Workflow ─────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>AI-Augmented Workflow</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Four Tools. All Run in Parallel.
            </h2>
            <p className="text-gray-400 text-sm mb-4 max-w-2xl leading-relaxed">
              Specific, real AI tools mapped to specific bottleneck steps. Every tool listed
              here is implementable today — no vapor, no &ldquo;coming soon.&rdquo;
            </p>
            <p className="text-xs text-gray-500 mb-10 max-w-2xl">
              All 4 tools run in parallel after footage ingest. Estimated machine processing:
              ~1.5–2.5 hours for 4 hours of footage. Editors can work on other tasks during this time.
            </p>
          </FadeIn>

          {/* Pipeline visualization */}
          <FadeIn delay={100}>
            <div className="border border-snap-yellow/20 rounded-2xl bg-yellow-500/5 p-5 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-snap-yellow animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow">
                  Parallel Processing Pipeline
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AI_TOOLS.map((tool, i) => (
                  <div
                    key={tool.name}
                    className="border border-white/10 rounded-lg bg-snap-black/50 p-3 text-center"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <p className="text-xs font-bold text-white mb-1">{tool.name}</p>
                    <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-px bg-snap-yellow/20" />
                <span className="text-xs text-snap-yellow font-semibold">~1.5–2.5 hrs total</span>
                <div className="flex-1 h-px bg-snap-yellow/20" />
              </div>
            </div>
          </FadeIn>

          {/* Tool cards */}
          <div className="space-y-4">
            {AI_TOOLS.map((tool, i) => (
              <FadeIn key={tool.name} delay={200 + i * 100}>
                <div className="border border-white/10 rounded-2xl bg-white/5 p-6 hover:border-snap-yellow/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                      <p className={`text-xs font-semibold ${tool.typeColor}`}>{tool.type}</p>
                    </div>
                    <span className={`text-xs border px-2.5 py-1 rounded-full font-semibold self-start ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border-t border-white/5 pt-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
                        Replaces
                      </p>
                      <p className="text-sm text-gray-300">{tool.replaces}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                        Processing Time
                      </p>
                      <p className="text-sm text-gray-300">{tool.processingTime}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Section 4: Before vs After ──────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>Before vs After</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              The Same Project. Half the Hours.
            </h2>
            <p className="text-gray-400 text-sm mb-10 max-w-2xl leading-relaxed">
              Side-by-side comparison for a single video project.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            {/* Current */}
            <FadeIn delay={0}>
              <div className="border border-red-400/20 rounded-2xl bg-red-500/5 p-6 h-full">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                    Current Workflow
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {CURRENT_WORKFLOW.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-500">{item.day}</p>
                        <p className="text-sm text-gray-300">{item.task}</p>
                      </div>
                      <span className="text-sm font-bold text-red-400 tabular-nums whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-red-400/20 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-400 tabular-nums">26–34</span>
                      <span className="text-sm text-gray-500 ml-1">hrs</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">3–4 days per project</p>
                </div>
              </div>
            </FadeIn>

            {/* AI-Augmented */}
            <FadeIn delay={150}>
              <div className="border border-emerald-400/20 rounded-2xl bg-emerald-500/5 p-6 h-full">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    AI-Augmented Workflow
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {AI_WORKFLOW.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-gray-300">{item.task}</p>
                        {item.note && (
                          <p className="text-xs text-emerald-400/60 mt-0.5">{item.note}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-emerald-400/20 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-400 tabular-nums">12–18</span>
                      <span className="text-sm text-gray-500 ml-1">hrs</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1.5–2.5 days per project</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Impact callout */}
          <FadeIn delay={300}>
            <div className="border border-snap-yellow/30 bg-yellow-500/5 rounded-2xl p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-2">
                    Time Savings
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-snap-yellow tabular-nums leading-none mb-2">
                    ~40–50%
                  </p>
                  <p className="text-sm text-gray-400">reduction in human hours per project</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-2">
                    Day 1 Compression
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-snap-yellow tabular-nums leading-none mb-2">
                    8–10 hrs → 2–3 hrs
                  </p>
                  <p className="text-sm text-gray-400">mechanical work compressed to a fraction</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 5: Flywheel Impact ──────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>Flywheel Impact</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Jack&apos;s Flywheel — Accelerated
            </h2>
            <p className="text-gray-400 text-sm mb-10 max-w-2xl leading-relaxed">
              Jack&apos;s business model is a flywheel: create content, grow following, monetize,
              reinvest. AI doesn&apos;t change the model — it makes every rotation faster.
            </p>
          </FadeIn>

          {/* Flywheel diagram */}
          <FadeIn delay={100}>
            <FlywheelDiagram />
          </FadeIn>

          {/* Video embed */}
          <FadeIn delay={200}>
            <div className="mt-10 max-w-2xl mx-auto">
              <VideoPlayer
                src="/videos/flywheel-clip.mp4"
                citation="Source: Jack Settleman, LinkedIn, 2025"
              />
            </div>
          </FadeIn>

          {/* Benefits */}
          <FadeIn delay={300}>
            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-4">
                How AI Accelerates Each Rotation
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {FLYWHEEL_BENEFITS.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 border border-white/10 rounded-xl bg-white/5 p-4"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-snap-yellow/60 shrink-0" />
                    <p className="text-sm text-gray-400 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Assumptions */}
          <FadeIn delay={400}>
            <div className="mt-8 border border-white/5 rounded-2xl bg-white/[0.02] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Assumptions
              </p>
              <ul className="space-y-1.5">
                {[
                  "60% of 2025 operating expenses are labor (per Jack Settleman)",
                  "10 full-time employees",
                  "Equal cost distribution assumed per employee",
                  "Each employee ≈ 6% of total expenses",
                  "2 editors ≈ 12% of total expenses",
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-600 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 6: Strategic Takeaway ───────────────────────────────── */}
        <section className="pb-8">
          <FadeIn>
            <div className="border border-snap-yellow/20 rounded-2xl bg-yellow-500/5 p-8 sm:p-12 text-center">
              <SectionLabel>Strategic Takeaway</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6 max-w-2xl mx-auto">
                AI Doesn&apos;t Replace Matt &amp; Ryan.
                <br />
                <span className="text-snap-yellow">
                  It Removes Everything That Isn&apos;t Their Job.
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-8">
                {[
                  {
                    label: "Not replacing creativity",
                    detail: "AI handles logging, scanning, and mechanical prep. Matt and Ryan's creative judgment stays untouched.",
                  },
                  {
                    label: "Editors become storytellers",
                    detail: "Shift from \"watching content\" to \"crafting stories\" — starting creative work on Day 1 instead of Day 2.",
                  },
                  {
                    label: "Scale without proportional headcount",
                    detail: "Snapback can produce more content at higher quality without hiring proportionally more editors.",
                  },
                  {
                    label: "No more overflow hires",
                    detail: "Peak seasons like CFB won't require temporary editors like Nate. The existing team absorbs the load.",
                  },
                ].map((point, i) => (
                  <div key={i} className="border border-white/10 rounded-xl bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white mb-1">{point.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{point.detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/ai-strategy"
                  className="px-6 py-3 bg-snap-yellow text-snap-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition"
                >
                  Read the Full AI Case →
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-lg hover:border-white/40 hover:bg-white/5 transition"
                >
                  Explore All Demos →
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>

      </div>
    </main>
  );
}
