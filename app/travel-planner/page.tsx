"use client";

import { useState } from "react";
import Link from "next/link";
import { TravelInputs, Itinerary } from "@/types/travel";
import { buildItinerary } from "@/lib/buildItinerary";
import TravelForm from "@/components/travel-planner/TravelForm";
import TravelOutput from "@/components/travel-planner/TravelOutput";

export default function TravelPlannerPage() {
  const [inputs, setInputs] = useState<TravelInputs>({
    origin: "",
    destination: "",
    departDate: "",
    returnDate: "",
    budget: "",
    vibe: "balanced",
    priorities: {
      lowFriction: true,
      bestSeats: false,
      contentMoments: true,
      recovery: true,
    },
  });

  const [generated, setGenerated] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [destError, setDestError] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputs.destination.trim()) {
      setDestError(true);
      return;
    }
    setDestError(false);
    setGenerateError(null);
    setIsLoading(true);

    try {
      if (aiMode) {
        const res = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        const data: Itinerary = await res.json();
        setGenerated(data);
      } else {
        const delay = Math.floor(Math.random() * 300 + 300);
        await new Promise((resolve) => setTimeout(resolve, delay));
        setGenerated(buildItinerary(inputs));
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Travel Planner Assistant</h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">
              A demo of how Snapback could use AI to remove travel friction for game-weekend trips.
              Toggle AI Mode to call the API route — swap in OpenAI or Anthropic via env vars when ready.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 transition"
          >
            Back home
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <TravelForm
            inputs={inputs}
            onChange={setInputs}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            destError={destError}
            aiMode={aiMode}
            onToggleAiMode={() => setAiMode((prev) => !prev)}
          />
          <TravelOutput
            itinerary={generated}
            isLoading={isLoading}
            generateError={generateError}
            aiMode={aiMode}
          />
        </div>
      </div>
    </main>
  );
}
