import Link from "next/link";

// ── Page data ──────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "See the player",
    body: "An NFL player's name appears — active roster, retired legend, or recent draft pick. The question pool is always live.",
  },
  {
    step: "02",
    title: "Name their college",
    body: "Type the school they attended before the draft. Request AI-generated hints if you're stuck, but every hint costs you a point.",
  },
  {
    step: "03",
    title: "Learn and score",
    body: "Get instant feedback plus a fun fact connecting the player to their school. Your score compounds across rounds.",
  },
];

const AI_IDEAS = [
  {
    title: "AI-generated game creation",
    body: "Point AI at any roster, box score, or historical record and it generates a full playable trivia game — questions, answer validation, and fun facts included. New league, new team, or new season? New game in minutes, not weeks.",
  },
  {
    title: "Ranked 1v1 mode",
    body: "Two players, one question, real-time buzzer. AI manages skill-based matchmaking so games stay competitive, tracks win streaks and seasonal rankings, and generates balanced question pools so no one has a home-field advantage in the question set.",
  },
  {
    title: "Hyperlocal team packs",
    body: '"What Maryland Blue Crabs player previously played for the Dodgers?" AI generates location-specific packs for minor league baseball, semi-pro football, indoor soccer — any league with a roster. Instant local relevance for any city or fanbase, at minimal cost.',
  },
  {
    title: "In-venue activation",
    body: "Deploy a live trivia screen at a local ballpark or arena. Fans scan a QR code between innings and play together on the scoreboard. AI generates questions about the specific team they\'re watching right now. Low setup cost, high floor engagement.",
  },
  {
    title: "Multi-format game modes",
    body: "Same AI-generated content, different formats for different contexts: 30-second speed rounds, elimination brackets, weekly league play, or a daily challenge. One content pipeline powers every surface — no duplicated work.",
  },
  {
    title: "Low-cost local brand introduction",
    body: "Sponsor a Best Fan leaderboard at a semi-pro or minor league game. The Snapback name is on every question screen. Fans associate the brand with knowing sports — not with a banner they walk past. More memorable than flyers, and a fraction of the cost.",
  },
];

// ── Shared card shell ──────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-xl bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-3">
      {children}
    </p>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CollegeGuessPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Concept Demo
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              College Guess
            </h1>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-xl">
              An NFL player&apos;s name. One question.{" "}
              <span className="text-white font-medium">Which college did they attend?</span>
              {" "}Build your sports knowledge one player at a time — with AI-powered hints,
              dynamic scoring, and challenges that adapt to how well you actually know the game.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 transition mt-1"
          >
            Back home
          </Link>
        </section>

        {/* ── 2. How it works ─────────────────────────────────────────────── */}
        <section>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">Three steps. Zero setup.</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((item) => (
              <Card key={item.step} className="p-6">
                <span className="text-3xl font-bold text-snap-yellow/30 leading-none">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-snap-black">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 3. Why Snapback ─────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Why it&apos;s interesting for Snapback</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">
            Proof of alignment, not competition.
          </h2>
          <Card className="p-8">
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed max-w-3xl">
              <p>
                Snapback has already built something impressive in the sports trivia space — a
                platform that puts fan knowledge front and center and understands how games drive
                engagement. We have genuine respect for that work, and we&apos;re not trying to
                replicate it.
              </p>
              <p>
                This prototype is our way of showing that we think about the same problems from the
                same angle. Sports trivia works because it activates fan identity — knowing that
                Joe Burrow spent three years at Ohio State before transferring to LSU, where he
                then won the Heisman, says something real about what kind of fan you are. Most
                people know the LSU chapter. Fewer know the Ohio State one. That gap is exactly
                where the game lives. And that&apos;s not just entertainment; it&apos;s{" "}
                <span className="font-semibold text-snap-black">
                  retention, shareability, and community in one mechanic.
                </span>
              </p>
              <p>
                The &quot;NFL Player → College&quot; angle specifically bridges two fan communities
                that don&apos;t always overlap: NFL fandom and college loyalty. For a sports
                content team, that crossover is valuable territory. Every correct answer surfaces
                natural story angles — a forgotten program that quietly produced stars, a draft
                class dominated by one school, a player whose college career was undersold before
                his NFL breakout.
              </p>
              <p className="text-gray-500 italic border-l-2 border-snap-yellow pl-4">
                Consider this a proof of interest, not a pitch deck. We built it because we care
                about the same things Snapback cares about — and wanted to demonstrate that in
                working code rather than slides.
              </p>
            </div>
          </Card>
        </section>

        {/* ── 4. AI expansion ideas ────────────────────────────────────────── */}
        <section>
          <SectionLabel>AI expansion ideas</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">
            New games, new modes, new markets.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {AI_IDEAS.map((idea) => (
              <Card key={idea.title} className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                  <h3 className="text-sm font-semibold text-snap-black">{idea.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{idea.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 5. Try the app ───────────────────────────────────────────────── */}
        <section>
          <Card className="p-10 text-center">
            <SectionLabel>Try the app</SectionLabel>
            <h2 className="text-2xl font-bold text-snap-black mt-1">
              The prototype is live.
            </h2>
            <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Try it, play a few rounds, and see how it feels. We&apos;d love your feedback on
              where to take it next.
            </p>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-8 py-3.5 bg-snap-yellow text-snap-black font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition text-sm tracking-wide"
            >
              Try the demo →
            </a>
            <p className="mt-3 text-xs text-gray-400">Opens in a new tab</p>
          </Card>
        </section>

        {/* ── 6. Footer note ───────────────────────────────────────────────── */}
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
