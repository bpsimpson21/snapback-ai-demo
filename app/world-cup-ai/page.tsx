import Link from "next/link";
import IdeaGenerator from "./IdeaGenerator";

// ── Page data ──────────────────────────────────────────────────────────────────

const WEEKLY_OUTPUTS = [
  {
    icon: "🗺️",
    title: "Matchday Travel Guides",
    bullets: [
      "City logistics — transit, hotels, fan zones near each stadium",
      "Stadium-specific filming tips and shot list starters",
      "Crowd and atmosphere context to frame content around",
    ],
  },
  {
    icon: "🧠",
    title: "Daily Trivia Games",
    bullets: [
      "World Cup edition: squads, histories, qualifying drama",
      "Auto-generated question pools tied to that day's fixtures",
      "Shareable results built for social loop engagement",
    ],
  },
  {
    icon: "📱",
    title: "Short-Form Content Kits",
    bullets: [
      "AI-drafted hooks, on-screen text lines, and caption variants",
      "Shot list suggestions matched to the day's matchup",
      "Platform-ready copy for TikTok, Instagram, and YouTube Shorts",
    ],
  },
  {
    icon: "🏟️",
    title: "Local Fan Culture Highlights",
    bullets: [
      "Best supporter bars and watch party spots per host city",
      "Chants, rivalries, and traditions with context for a US audience",
      "Story angles that travel beyond the scoreline",
    ],
  },
];

const WORKFLOWS = [
  {
    title: "Trend Radar",
    description:
      "Monitor match storylines daily and surface content angles before they peak.",
    steps: [
      "Pull daily match previews, lineup news, and social chatter",
      "AI summarizes the top 3 storylines with a content angle for each",
      "Brief delivered each morning before filming starts",
    ],
  },
  {
    title: "Script & Caption Builder",
    description:
      "Turn any team, match, or theme into ready-to-use copy written in Snapback's voice.",
    steps: [
      "Input: team name, match, or content theme",
      "AI generates a hook, body copy, and CTA variants",
      "Output: 3 caption options + a short-form script draft",
    ],
  },
  {
    title: "Clip-to-Post Assist",
    description:
      "Go from raw footage notes to a publish-ready post in one pass.",
    steps: [
      "Creator inputs rough clip description or timestamp notes",
      "AI returns a cut list, caption, and full hashtag set",
      "One-click export to content calendar draft",
    ],
  },
  {
    title: "Localization Engine",
    description:
      "Extend reach to international audiences without extra production overhead.",
    steps: [
      "Original caption written once in English",
      "AI translates into Spanish, Portuguese, and French — tone-matched",
      "Flagged for a quick human review before posting",
    ],
  },
];

const METRICS = [
  {
    label: "Weekly content output",
    target: "4–6 pieces per match week, up from current baseline",
  },
  {
    label: "Editing prep time",
    target: "Reduce by 30–50% using AI-generated cut lists and caption drafts",
  },
  {
    label: "Content turnaround",
    target: "Same-day post from match kick-off to published short-form",
  },
  {
    label: "Trivia engagement rate",
    target: "Beat standard baseline by 20%+ with World Cup-specific question packs",
  },
  {
    label: "International reach",
    target: "Measurable lift in non-US impressions via localized caption variants",
  },
];

// ── Shared components ──────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-xl bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-3">
      {children}
    </p>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function WorldCupAIPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                Content ops
              </span>
              <span className="border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                World Cup 2026-ready
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              World Cup AI<br />Content Engine
            </h1>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-xl">
              We use AI to scale Snapback&apos;s core strengths —{" "}
              <span className="text-white font-medium">
                experiences-style storytelling and trivia-driven engagement
              </span>{" "}
              — for a global audience that will be watching this summer.
            </p>
            <Link
              href="/travel-planner"
              className="inline-block mt-6 px-6 py-3 bg-snap-yellow text-snap-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition"
            >
              Try the Travel Planner →
            </Link>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 transition mt-1"
          >
            Back home
          </Link>
        </section>

        {/* ── 2. What we will produce weekly ───────────────────────────────── */}
        <section>
          <SectionLabel>Weekly output</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">What we will produce weekly</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {WEEKLY_OUTPUTS.map((item) => (
              <Card key={item.title} className="p-6">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-base font-semibold text-snap-black mb-3">{item.title}</h3>
                <ul className="space-y-2">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 3. AI workflows ──────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Under the hood</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">
            AI workflows that make this scalable
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {WORKFLOWS.map((wf) => (
              <Card key={wf.title} className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                  <h3 className="text-sm font-bold text-snap-black">{wf.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed pl-3.5">
                  {wf.description}
                </p>
                <ol className="space-y-2 pl-3.5">
                  {wf.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-0.5 text-xs font-bold text-snap-yellow/60 shrink-0 w-4">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 4. Ties into Snapback's strengths ────────────────────────────── */}
        <section>
          <SectionLabel>Build on what already works</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">
            How this ties into Snapback&apos;s existing strengths
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6 border-l-4 border-l-snap-yellow">
              <h3 className="text-base font-bold text-snap-black mb-3">Experiences angle</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Snapback already ranks cities, builds itineraries, and removes travel friction
                for sports fans. The World Cup is the largest version of that problem.
              </p>
              <ul className="space-y-2">
                {[
                  "AI-generated host city rankings for different fan types",
                  "Full matchday itinerary from landing to final whistle",
                  "Travel friction removal at scale — logistics, transport, stays",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-l-4 border-l-snap-yellow">
              <h3 className="text-base font-bold text-snap-black mb-3">Trivia angle</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Daily trivia games are already a proven engagement mechanic. A World Cup edition
                runs on the same infrastructure with a global audience ready to play.
              </p>
              <ul className="space-y-2">
                {[
                  "Daily games tied to that day's fixtures and storylines",
                  "Leaderboard-driven engagement that compounds over the tournament",
                  "Quick share loops designed to pull in new fans from international markets",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* ── 5. What success looks like ───────────────────────────────────── */}
        <section>
          <SectionLabel>Outcomes</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">What success looks like</h2>
          <Card className="divide-y divide-gray-100">
            {METRICS.map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-6 px-6 py-4">
                <span className="text-sm font-semibold text-snap-black">{m.label}</span>
                <span className="text-sm text-gray-500 text-right max-w-xs">{m.target}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* ── 6. Idea Generator ────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Try it now</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">World Cup Idea Generator</h2>
          <IdeaGenerator />
        </section>

        {/* ── 7. Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Built by{" "}
            <span className="text-gray-300 font-medium">Brennan + David</span>
          </p>
          <p className="text-xs text-gray-600 tracking-wide uppercase">
            Snapback AI Ops Lab
          </p>
        </footer>

      </div>
    </main>
  );
}
