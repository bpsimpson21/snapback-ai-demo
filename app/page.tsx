"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const DEMOS = [
  {
    href: "/ai-strategy",
    icon: "📈",
    title: "The Case for AI",
    description:
      "70% of sports media costs are labor. AI unlocks 15% efficiency gains and a 10-point margin expansion — here's the math and the 90-day roadmap.",
  },
  {
    href: "/ai-workflow",
    icon: "🎬",
    title: "AI Workflow",
    description:
      "A tool-by-tool breakdown of how AI removes 40–50% of mechanical editing hours — mapped directly to Snapback's actual production process.",
  },
  {
    href: "/travel-planner",
    icon: "✈",
    title: "Travel Planner",
    description:
      "Generates full game-weekend ops briefs in seconds — travel, lodging, run of show, and risk flags.",
  },
  {
    href: "/analysis",
    icon: "📊",
    title: "YouTube Audit",
    description:
      "Automated channel diagnostics — upload velocity, engagement trends, and keyword gaps in one click.",
  },
  {
    href: "/world-cup-ai",
    icon: "⚽",
    title: "World Cup AI",
    description:
      "AI-powered content scaling strategy for reaching 5B+ World Cup viewers with Snapback's voice.",
  },
  {
    href: "/about",
    icon: "👋",
    title: "Who We Are",
    description:
      "The operators behind the lab — and why we built it specifically for Snapback.",
  },
];

function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    // Slow-drifting gradient blobs
    const blobs = [
      { x: 0.3, y: 0.25, r: 0.45, vx: 0.008, vy: 0.006, hue: 0 },
      { x: 0.7, y: 0.7, r: 0.5, vx: -0.006, vy: 0.009, hue: 30 },
      { x: 0.5, y: 0.5, r: 0.4, vx: 0.007, vy: -0.005, hue: 50 },
    ];

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);

      for (const blob of blobs) {
        // Gentle sinusoidal drift
        const bx = (blob.x + Math.sin(t * blob.vx) * 0.15) * w;
        const by = (blob.y + Math.cos(t * blob.vy) * 0.15) * h;
        const br = blob.r * Math.min(w, h);

        const grad = ctx!.createRadialGradient(bx, by, 0, bx, by, br);
        // Very faint charcoal tones — barely visible over #0A0A0A
        const alpha = 0.035;
        const lightness = 18 + blob.hue * 0.05;
        grad.addColorStop(0, `hsla(${blob.hue}, 4%, ${lightness}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${blob.hue}, 2%, 10%, 0)`);

        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(() => draw(t + 0.016));
    }

    draw(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

export default function Home() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
      <MeshBackground />
      <div className="relative max-w-3xl w-full">
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
                {
                  demo.href === "/ai-workflow"   ? "See the pipeline →" :
                  demo.href === "/ai-strategy"   ? "Read the case →"   :
                  demo.href === "/about"         ? "Meet the team →"   :
                  demo.href === "/world-cup-ai"  ? "See the plan →"    :
                  demo.href === "/analysis"      ? "Open audit →"      :
                  "Open demo →"
                }
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
