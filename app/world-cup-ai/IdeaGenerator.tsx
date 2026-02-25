"use client";

import { useState } from "react";

const CONTENT_TYPES = [
  "Travel Guide",
  "Trivia Game",
  "Short-Form Script",
  "Fan Culture",
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

function buildIdea(type: ContentType, input: string): string {
  const target = input.trim() || "your city or match";

  switch (type) {
    case "Travel Guide":
      return [
        `Matchday Travel Guide — ${target}`,
        "",
        "Angle: Snapback crew arrives day before. Here's what to film, eat, and do.",
        "",
        "• Opening shot: arrival at the main fan zone near the stadium",
        "• B-roll list: street food stalls, supporter scarves, local kit shops",
        `• Hero hook: "We ranked the 3 best ways to experience ${target} like a local"`,
        "",
        "Deliverables: 60-sec short, caption kit, city tip card graphic",
        "AI time saved: ~2 hrs of research + caption drafting",
      ].join("\n");

    case "Trivia Game":
      return [
        `World Cup Trivia — ${target} Edition`,
        "",
        "Format: 5-question rapid-fire, share your score",
        "",
        `• Q1: Which player scored the most goals in ${target}'s World Cup history?`,
        `• Q2: What year did ${target} first qualify for the tournament?`,
        "• Q3: Name the coach who took them to their furthest run.",
        "",
        "Difficulty: Medium | Est. play time: 90 seconds",
        `Share hook: "Only real fans score 5/5 on the ${target} pack →"`,
      ].join("\n");

    case "Short-Form Script":
      return [
        `Short-Form Script — ${target}`,
        "",
        `Hook (0–3s): "Nobody talks about what it's actually like to be at ${target} matchday."`,
        "",
        "Body (3–25s):",
        "• Cut 1 — wide stadium exterior, crowd noise up",
        "• Cut 2 — close-up on a supporter's face reaction",
        "• Cut 3 — behind-the-scenes of Snapback crew setting up",
        "",
        `CTA (25–30s): "Follow for our full World Cup coverage →"`,
        "",
        "Caption: Drop this into our Script Builder for 3 platform variants.",
      ].join("\n");

    case "Fan Culture":
      return [
        `Fan Culture Spotlight — ${target}`,
        "",
        "Story angle: What makes supporting this team unlike anywhere else.",
        "",
        "• Signature chant or song with translation and context",
        "• Best supporter pub or fan zone in the host city",
        "• One rivalry or tradition casual fans don't know about",
        "",
        `Hook: "Here's why ${target} fans are the most interesting story of this World Cup"`,
        "",
        "Content formats: short-form video, carousel explainer, trivia pack",
      ].join("\n");
  }
}

export default function IdeaGenerator() {
  const [type, setType] = useState<ContentType>("Travel Guide");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function handleGenerate() {
    setResult(buildIdea(type, input));
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-snap-yellow shrink-0" />
        <h3 className="text-sm font-bold text-snap-black uppercase tracking-widest">
          World Cup Idea Generator
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Content type
          </label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as ContentType);
              setResult(null);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-snap-black bg-white focus:outline-none focus:ring-2 focus:ring-snap-yellow/50"
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Match or city
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
            placeholder="e.g. Brazil vs Argentina, Miami"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-snap-black placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-snap-yellow/50"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="px-6 py-2.5 bg-snap-yellow text-snap-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition"
      >
        Generate idea →
      </button>

      {result && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
          <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
