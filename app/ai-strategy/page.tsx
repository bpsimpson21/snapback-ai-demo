"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Animation hooks ────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
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

function CountUp({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let step = 0;
    const steps = 55;
    const id = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setN(Math.round(to * eased));
      if (step >= steps) { setN(to); clearInterval(id); }
    }, 28);
    return () => clearInterval(id);
  }, [active, to]);
  return <>{n}</>;
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

// ── Page data ──────────────────────────────────────────────────────────────────

const SYSTEMS = [
  {
    icon: "🎬",
    title: "Content Production Pipeline",
    problem:
      "Editors spend 60%+ of their time on repetitive tasks — clipping highlights, syncing audio, formatting for different platforms — instead of creative storytelling.",
    solution:
      "Automated highlight clipping from long-form content using moment detection. AI-assisted script outlines generated from trending topics. Auto-repurpose long-form into platform-optimized shorts.",
    impact:
      "If one editor currently produces 3 videos/week and AI handles 40% of mechanical work, that editor now produces 5/week. Across a team of 5 editors, that's 10 additional videos per week with zero new hires.",
  },
  {
    icon: "📊",
    title: "Content Intelligence System",
    problem:
      "Publishing decisions are based on gut feel. Which thumbnail performs better? What title pattern drives CTR? What's the optimal video length by format? Teams don't know until after they publish.",
    solution:
      "Predictive title optimization using historical YouTube patterns. AI-assisted thumbnail A/B testing before publishing. Retention curve analysis by video type to identify ideal formats and lengths.",
    impact:
      "A 15% improvement in CTR from better thumbnails and titles translates directly to views. On a channel doing 50M annual views, that's 7.5M incremental views — and the ad revenue that comes with them.",
  },
  {
    icon: "📡",
    title: "Distribution & Audience Engine",
    problem:
      "Content gets created once and posted. No systematic repurposing, no cross-platform optimization, no data-driven distribution timing.",
    solution:
      "Cross-platform reformatting engine (YouTube → TikTok → IG Reels → Shorts). Upload timing optimization based on audience behavior data. Predictive topic scoring before production — kill low-performers before spending resources.",
    impact:
      "73% of sports organizations expanding AI use are targeting content creation and distribution. The organizations that systematize distribution will out-distribute competitors 3–5× on the same production budget.",
  },
  {
    icon: "⚙️",
    title: "Operational Intelligence",
    problem:
      "Travel logistics, event coordination, content calendars, and production scheduling are managed manually — eating hours that should go to content.",
    solution:
      "AI-generated game-weekend ops briefs (already built — see our Travel Planner demo). Automated content calendar generation for tournament windows. Smart scheduling that accounts for travel, production capacity, and trending events.",
    impact:
      "If operational coordination consumes 10 hours/week across the team, and AI handles 70% of it, that's 7 hours/week redirected to content production. Over a year, that's 364 hours — equivalent to hiring a part-time coordinator for free.",
  },
  {
    icon: "🗄️",
    title: "Archive & Knowledge System",
    problem:
      "Years of content sitting in folders with no searchable structure. Finding a specific clip from 2022 means scrubbing through hours of footage.",
    solution:
      "AI auto-tagging and metadata enrichment of all archived content. Searchable internal video database — find any clip by player, team, moment, or emotion. Clip recommendation engine for editors based on current topics.",
    impact:
      "60% of sports organizations say digital platforms have already unlocked new direct revenue. A searchable archive turns dead content into a living asset — enabling compilation videos, nostalgia content, and evergreen packages that generate views indefinitely.",
  },
];

const INDUSTRY_STATS = [
  {
    value: 82,
    description:
      "of sports organizations are already using AI, with nearly all planning to increase investment in the next 12 months",
  },
  {
    value: 73,
    description: "say their AI initiatives have delivered tangible value so far",
  },
  {
    value: 72,
    description:
      "say AI is the technology with the greatest potential for their organization in the next five years",
  },
  {
    value: 78,
    description:
      "say advanced data analytics will have the most significant impact on the field of play in the next five years",
  },
  {
    value: 34,
    description:
      "say fan engagement activities are the #1 AI use case — exactly what Snapback does",
  },
  {
    value: 32,
    description:
      "say content creation and distribution is #2 — also exactly what Snapback does",
  },
];

const ROADMAP = [
  {
    phase: "Foundation",
    days: "Days 1–30",
    items: [
      "Audit existing content workflow end-to-end (hours per video, bottleneck mapping)",
      "Deploy AI-assisted thumbnail and title testing on 20 videos",
      "Set up automated highlight clipping pipeline for one content series",
      "Build searchable tag database for existing video archive",
      "Measure baseline: current videos/week, hours/video, CTR, retention rates",
    ],
  },
  {
    phase: "Scale",
    days: "Days 31–60",
    items: [
      "Roll out AI clipping and auto-repurposing across all content series",
      "Implement predictive topic scoring — test against editorial team picks",
      "Launch cross-platform distribution automation (YouTube → TikTok → IG)",
      "Deploy content calendar simulator for World Cup 2026 planning window",
      "Measure: videos/week increase, time savings per editor, CTR improvement",
    ],
  },
  {
    phase: "Compound",
    days: "Days 61–90",
    items: [
      "Build creator performance benchmarking dashboard",
      "Implement retention prediction model — flag underperformers before publishing",
      "Launch AI-generated script outlines for trending topics",
      "Deliver World Cup 2026 AI content strategy with format recommendations backed by Olympic performance data",
      "Final measurement: revenue per employee change, output per editor change, margin impact estimate",
    ],
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AiStrategyPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto pt-4">
          <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Economic Framework
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            AI Doesn&apos;t Replace Your Creators.
            <br />
            <span className="text-snap-yellow">
              It Turns Each One Into a 3-Person Team.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A margin expansion framework for Snapback Sports — backed by industry
            data from 500+ sports organizations.
          </p>
          <p className="text-xs text-gray-600">
            Built by Brennan Simpson &amp; David &nbsp;·&nbsp; Data sourced from{" "}
            <span className="text-gray-500">
              Sportradar Global SportsTech Report 2026
            </span>
          </p>
        </section>

        <Divider />

        {/* ── Section 2: Core Math ──────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>The Core Math</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              The 70% Problem — And the 10.5% Solution
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">
              The numbers are simple. The leverage is real.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                stat: "~70%",
                label: "Labor Cost Share",
                body: "of Snapback's operating expenses are labor costs — creators, editors, producers, coordinators",
                accent: false,
              },
              {
                stat: "15%",
                label: "Conservative AI Productivity Gain",
                body: "conservative productivity gain from AI-assisted content workflows (industry benchmarks show 20–40%)",
                accent: false,
              },
              {
                stat: "= 10.5%",
                label: "Margin Expansion",
                body: "operating expense leverage without cutting a single person. That's margin expansion, not cost cutting.",
                accent: true,
              },
            ].map((card, i) => (
              <FadeIn key={card.stat} delay={i * 100}>
                <div
                  className={`rounded-2xl p-6 h-full ${
                    card.accent
                      ? "border border-snap-yellow/50 bg-yellow-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <div
                    className={`text-4xl sm:text-5xl font-bold tabular-nums leading-none mb-3 ${
                      card.accent ? "text-snap-yellow" : "text-white"
                    }`}
                  >
                    {card.stat}
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                      card.accent ? "text-snap-yellow/70" : "text-gray-500"
                    }`}
                  >
                    {card.label}
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="border border-snap-yellow/30 bg-yellow-500/5 rounded-2xl p-6 sm:p-8">
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium max-w-3xl">
                &ldquo;This isn&apos;t about replacing people. It&apos;s about removing the
                friction that keeps talented creators from doing what they&apos;re best at
                — making content that fans care about.&rdquo;
              </p>
            </div>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 3: Five Systems ───────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>Where AI Creates Leverage</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Five Systems That Pay for Themselves
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">
              Each system targets a specific operational bottleneck. Together, they compound.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            {SYSTEMS.map((sys, i) => (
              <FadeIn
                key={sys.title}
                delay={i * 70}
                className={i === 4 ? "sm:col-span-2" : ""}
              >
                <div
                  className={`border border-white/10 rounded-2xl bg-white/5 p-6 hover:border-snap-yellow/30 transition-colors h-full ${
                    i === 4 ? "sm:max-w-2xl sm:mx-auto sm:w-full" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{sys.icon}</span>
                    <h3 className="text-base font-bold text-white">{sys.title}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1.5">
                        Problem
                      </p>
                      <p className="text-sm text-gray-400 leading-relaxed">{sys.problem}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1.5">
                        AI Solution
                      </p>
                      <p className="text-sm text-gray-400 leading-relaxed">{sys.solution}</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-1.5">
                        Economic Impact
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        {sys.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Section 4: Industry Stats ─────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>Industry Proof</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              What 500+ Sports Organizations Already Know
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">
              This isn&apos;t speculative. The industry has already moved. The question is
              whether Snapback moves with it or watches from the sideline.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {INDUSTRY_STATS.map((s, i) => {
              // Each StatCallout manages its own inView + animation
              return <IndustryStat key={i} value={s.value} description={s.description} delay={i * 80} />;
            })}
          </div>

          <FadeIn>
            <p className="text-xs text-gray-600 text-center italic">
              Source: Sportradar Global SportsTech Report 2026 — survey of 500+
              sports industry leaders, Q4 2025
            </p>
          </FadeIn>
        </section>

        <Divider />

        {/* ── Section 5: 90-Day Roadmap ─────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionLabel>The Plan</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              What We&apos;d Build in 90 Days With Access
            </h2>
            <p className="text-gray-400 text-sm mb-10 max-w-2xl leading-relaxed">
              Not a list of ideas — a sequenced build with defined outputs and
              measurement at every phase.
            </p>
          </FadeIn>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical spine — hidden on mobile */}
            <div
              aria-hidden
              className="hidden sm:block absolute left-[1.625rem] top-10 bottom-10 w-px bg-white/10"
            />

            <div className="space-y-5">
              {ROADMAP.map((phase, i) => (
                <FadeIn key={phase.phase} delay={i * 120}>
                  <div className="relative sm:pl-16">
                    {/* Phase number bubble */}
                    <div
                      className={`hidden sm:flex absolute left-0 top-5 w-[3.25rem] h-[3.25rem] rounded-xl items-center justify-center border-2 bg-snap-black z-10 ${
                        i === 1 ? "border-white/30" : "border-snap-yellow/60"
                      }`}
                    >
                      <span className="text-sm font-bold text-white tabular-nums">{i + 1}</span>
                    </div>

                    <div className="border border-white/10 rounded-2xl bg-white/5 p-6 hover:border-snap-yellow/20 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Mobile-only phase badge */}
                        <span className="sm:hidden text-xs font-bold text-snap-yellow border border-snap-yellow/40 px-2 py-0.5 rounded-full shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow">
                            {phase.days}
                          </p>
                          <h3 className="text-base font-bold text-white">{phase.phase}</h3>
                        </div>
                      </div>
                      <ul className="space-y-2.5">
                        {phase.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow/60 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Section 6: CTA ────────────────────────────────────────────────── */}
        <section className="pb-8">
          <FadeIn>
            <div className="border border-snap-yellow/20 rounded-2xl bg-yellow-500/5 p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4 max-w-2xl mx-auto">
                The Question Isn&apos;t Whether AI Will Transform Sports Media.
                <br />
                <span className="text-snap-yellow">
                  It&apos;s Whether Snapback Leads or Follows.
                </span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
                We built this entire site — five working AI demos, an economic
                framework, and a 90-day roadmap — in 24 hours. Imagine what
                we&apos;d build with 90 days and actual access to Snapback&apos;s data.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-snap-yellow text-snap-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition"
                >
                  Explore Our Demos →
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-lg hover:border-white/40 hover:bg-white/5 transition"
                >
                  Meet the Team →
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>

      </div>
    </main>
  );
}

// ── Industry stat card (owns its own IntersectionObserver + counter) ───────────

function IndustryStat({
  value,
  description,
  delay,
}: {
  value: number;
  description: string;
  delay: number;
}) {
  const { ref, inView } = useInView(0.2);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      <div className="border border-white/10 rounded-2xl bg-white/5 p-6 hover:border-snap-yellow/30 transition-colors h-full">
        <div className="text-5xl sm:text-6xl font-bold text-snap-yellow tabular-nums leading-none mb-3">
          <CountUp to={value} active={inView} />
          <span className="text-4xl sm:text-5xl">%</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
