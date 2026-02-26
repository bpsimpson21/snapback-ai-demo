import Image from "next/image";
import Link from "next/link";

// ── Profile data ───────────────────────────────────────────────────────────────

const PROFILES = [
  {
    name: "Brennan Simpson",
    image: "/brennan.jpg",
    bio: [
      "MBA Candidate at Clemson University, concentrating in Data Analytics.",
      "Background in analytics, dashboards, and cost optimization — building tools that turn data into decisions.",
      "Lifelong DC sports fan with deep knowledge in the NFL, college football, and soccer.",
      "Focused on applying AI to sports media and fan engagement to create smarter, more connected experiences.",
    ],
  },
  {
    name: "David Glorioso",
    image: "/david.jpg",
    bio: [
      "Coastal Carolina University graduate in Recreation and Sport Management.",
      "Strong background in sports operations, strategy, and executing at the team level.",
      "Experience in event coordination and operations — from planning to real-time execution.",
      "Passionate about content, teamwork, and building in the sports space with people who care about the craft.",
    ],
  },
];

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow mb-3">
      {children}
    </p>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
        <section className="text-center max-w-2xl mx-auto">
          <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            The Team
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
            Who We Are
          </h1>
          <p className="mt-6 text-gray-400 text-lg leading-relaxed">
            Brennan Simpson and David Glorioso are lifelong friends united by a shared passion for
            sports, content, and the belief that{" "}
            <span className="text-white font-medium">
              AI-driven innovation will define the next era of sports media.
            </span>{" "}
            We built this lab to show what that future looks like in working code.
          </p>
        </section>

        {/* ── 2. Profile cards ─────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Meet the team</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROFILES.map((person) => (
              <div
                key={person.name}
                className="border border-white/10 rounded-2xl bg-white/5 p-8 flex flex-col gap-6 hover:border-snap-yellow/30 transition"
              >
                <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-lg shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={person.image}
                    alt={`Headshot of ${person.name}`}
                    fill
                    className="object-cover object-top"
                    sizes="112px"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">{person.name}</h2>
                  <ul className="space-y-2.5">
                    {person.bio.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Why Snapback ──────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Our fit</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">Why Snapback</h2>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-8 space-y-4 text-sm text-gray-400 leading-relaxed">
            <p>
              We genuinely admire what Snapback has built — the culture, the content, and the
              community around it. That kind of success doesn&apos;t come from strategy decks; it
              comes from{" "}
              <span className="text-white font-medium">authentic team chemistry.</span>
            </p>
            <p>
              We believe that chemistry is Snapback&apos;s real competitive edge. And as lifelong
              friends who have worked, competed, and built things together for years, we think our
              dynamic fits naturally into that culture. We don&apos;t need a warm-up period to
              figure out how to work together — we already know.
            </p>
            <p>
              That same dynamic is what makes us excited about the summer intern program. We
              wouldn&apos;t just be two people placed on the same team — we&apos;d arrive with an
              existing creative shorthand.{" "}
              <span className="text-white font-medium">
                The kind of trust that produces better content faster,
              </span>{" "}
              because we&apos;re not spending energy figuring each other out. We can pitch
              together, build together, and push each other&apos;s ideas further from day one.
            </p>
            <p>
              We&apos;re also genuinely excited about AI&apos;s role in the future of sports media.
              Not as a gimmick, but as a tool for doing more with the same creative energy.
              We believe we can help Snapback{" "}
              <span className="text-white font-medium">
                experiment fast, execute well, and stay ahead.
              </span>
            </p>
          </div>
        </section>

        {/* ── 4. World Cup opportunity ─────────────────────────────────────── */}
        <section>
          <SectionLabel>Global growth</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">World Cup Opportunity</h2>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-8 space-y-4 text-sm text-gray-400 leading-relaxed">
            <p>
              The upcoming World Cup represents one of the biggest international growth opportunities
              in sports media. Global audiences will be tuned in, engaged, and hungry for content —
              and the window to capture that attention is limited.
            </p>
            <p>
              Both of us have strong soccer knowledge and a real appreciation for the global game.
              We believe we can help Snapback create{" "}
              <span className="text-white font-medium">
                smart, engaging, AI-assisted soccer content
              </span>{" "}
              that resonates with international fans — bringing new audiences into the Snapback
              orbit at exactly the right moment.
            </p>
            <p className="italic text-gray-500 border-l-2 border-snap-yellow pl-4">
              The World Cup doesn&apos;t wait. Neither do we.
            </p>
          </div>
        </section>

        {/* ── 5. Back to home ──────────────────────────────────────────────── */}
        <section className="text-center pt-4 pb-8">
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-snap-yellow text-snap-black font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition text-sm tracking-wide"
          >
            ← Back to Home
          </Link>
        </section>

      </div>
    </main>
  );
}
