import Link from "next/link";

const DEMOS = [
  {
    href: "/travel-planner",
    icon: "✈",
    title: "Travel Planner",
    description:
      "AI-generated game-weekend ops briefs — travel, lodging, game-day run of show, content plan, and risk flags.",
  },
  {
    href: "/college-guess",
    icon: "🏈",
    title: "College Guess",
    description:
      "Trivia challenge — identify the school from progressive clues. Fewer hints used = more points.",
  },
  {
    href: "/world-cup-ai",
    icon: "⚽",
    title: "World Cup AI",
    description:
      "How we use AI to scale Snapback's storytelling and trivia strengths for a global World Cup audience.",
  },
  {
    href: "/about",
    icon: "👋",
    title: "Who We Are",
    description:
      "Meet Brennan and David — the team behind the lab, and why they built it for Snapback.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="max-w-3xl w-full">
        <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
          AI Ops Lab
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
          Less friction.<br />More game.
        </h1>

        <p className="mt-6 text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
          AI-powered operational tools for sports media teams.
          Built to eliminate friction from travel, content, and logistics.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-4 text-left">
          {DEMOS.map((demo, i) => (
            <Link
              key={demo.href}
              href={demo.href}
              className={`group block border border-white/10 rounded-xl p-6 hover:border-snap-yellow/50 hover:bg-white/5 transition${
                i === DEMOS.length - 1 && DEMOS.length % 2 !== 0
                  ? " sm:col-span-2 sm:max-w-sm sm:mx-auto sm:w-full"
                  : ""
              }`}
            >
              <div className="text-2xl mb-3">{demo.icon}</div>
              <h2 className="text-white font-semibold">{demo.title}</h2>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">{demo.description}</p>
              <span className="mt-4 inline-block text-xs font-semibold text-snap-yellow group-hover:underline underline-offset-2">
                {demo.href === "/about" ? "Meet the team →" : demo.href === "/world-cup-ai" ? "See the plan →" : "Open demo →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
