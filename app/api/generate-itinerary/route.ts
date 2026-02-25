import { NextRequest, NextResponse } from "next/server";
import { TravelInputs, Itinerary } from "@/types/travel";

// ─── LLM Integration Note ─────────────────────────────────────────────────────
//
// To wire a real model, replace the mock below with an API call:
//
// OpenAI:
//   import OpenAI from "openai";
//   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   const completion = await client.chat.completions.create({ ... });
//
// Anthropic:
//   import Anthropic from "@anthropic-ai/sdk";
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//   const message = await client.messages.create({ ... });
//
// Prompt the model to return JSON matching the Itinerary type from @/types/travel.
// Parse and validate the response before returning it to the client.
// Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env.local file.
//
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const inputs: TravelInputs = await req.json();

  if (!inputs.destination?.trim()) {
    return NextResponse.json({ error: "Destination is required." }, { status: 400 });
  }

  // Simulate realistic LLM latency (remove when using a real API call)
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const vibeLabel =
    inputs.vibe === "value" ? "value-first" : inputs.vibe === "premium" ? "premium" : "balanced";

  const mock: Itinerary = {
    headline: `${inputs.origin || "Origin"} → ${inputs.destination} · AI Ops Brief`,

    assumptions: [
      `Budget: ${inputs.budget || "TBD"}`,
      `Vibe: ${vibeLabel}`,
      "Source: AI (mocked — plug in real model via env vars)",
    ].join(" · "),

    travel: {
      title: "Travel",
      items: [
        `Route: ${inputs.origin || "your city"} → ${inputs.destination}`,
        `Dates: ${inputs.departDate || "TBD"} → ${inputs.returnDate || "TBD"}`,
        inputs.vibe === "premium"
          ? "Book a direct morning flight — non-stops in this corridor are usually competitive on price when booked 3+ weeks out."
          : inputs.vibe === "value"
          ? "If the drive is under 5 hours, seriously consider it — parking and flexibility often offset the flight savings."
          : "A morning economy flight with seat selection is your best balance of cost and control here.",
        inputs.priorities.lowFriction
          ? "Single-leg routing only. Every connection is a failure point."
          : "One connection is acceptable if it saves meaningful money.",
        inputs.priorities.bestSeats
          ? "Set a seat alert on ExpertFlyer or check in exactly at T-24hr for premium seat releases."
          : "Window seat, midplane — quieter ride, no getting climbed over.",
      ],
    },

    lodging: {
      title: "Lodging",
      items: [
        `For ${inputs.destination}, aim for the neighborhood immediately adjacent to the venue — not across town.`,
        inputs.vibe === "premium"
          ? "Boutique hotels within walking distance book out fast for event weekends. Check directly with the property for last-minute availability."
          : inputs.vibe === "value"
          ? "Airbnbs 10–15 minutes out can be half the price of on-site hotels and give you a kitchen."
          : "A mid-range hotel with strong reviews is your sweet spot — prioritize check-in flexibility over amenities.",
        "Book now. Event-weekend inventory in major markets collapses 2–3 weeks out.",
        inputs.priorities.recovery
          ? "Request a high-floor, courtyard-facing room. Venue events create street-level noise until 2AM."
          : "Standard room is fine — you won't be spending much time there.",
      ],
    },

    gameDay: {
      title: "Game-Day Run of Show",
      items: [
        "0700 — Wake. Hydrate before coffee. Light breakfast only.",
        "0830 — Gear check: tickets, ID, charger, camera, cash. Nothing left to chance.",
        "1000 — Final buffer. No plans. This time exists to absorb anything that went sideways.",
        inputs.priorities.lowFriction
          ? "1100 — Pre-booked transport departs. Rideshare surge pricing peaks at this window — book the night before."
          : "1100 — Head toward venue. Leave earlier than the map suggests.",
        "1200 — Arrive at venue area. Scout entrances, restrooms, concessions before it gets loud.",
        "T-45min — In your seat. Setup done. Camera out if you're shooting.",
        "Game — Execute. Minimize in-game decisions. You've already made the plan.",
        "Post-game — Committed exit route. Wait 8 minutes after the final whistle before joining the crush.",
        inputs.priorities.recovery
          ? "Evening — Light food, no alcohol if you're traveling tomorrow. Sleep window matters."
          : "Evening — Celebrate, but know your morning timeline.",
      ],
    },

    contentPlan: {
      title: "Content Plan",
      items: inputs.priorities.contentMoments
        ? [
            "Pre-game (15 min hard budget): venue exterior, crowd energy, your arrival sequence.",
            "Golden-hour window is your best light — prioritize any outdoor frames in the hour before doors.",
            "In-game rule: 5 shots maximum. Reaction, crowd wide, scoreboard, key play, post-whistle. That's the list.",
            "Post-game: 60-second recap format. One interview clip if access allows. Pack up fast.",
            "Edit on the flight home. Memory and energy are still sharp. Don't let the footage sit.",
            "Hard rule: camera goes away when the game is close. Be there.",
          ]
        : [
            "You're not producing on this trip — that's a decision, not a gap.",
            "Phone for memories only. One image per day if something is worth capturing.",
            "Don't let content guilt creep in. Presence is the product here.",
          ],
    },

    checklist: {
      title: "Checklist",
      items: [
        "Tickets — digital in wallet app + screenshot backup in photos",
        "Government ID + backup payment method (not just your primary card)",
        "Portable charger (10,000 mAh min) + the right cable — actually charged",
        "Game-day outfit + weather layer + backup shirt",
        "Snacks + water bottle for travel day (airport food is a tax on poor planning)",
        "Hotel confirmation + venue address saved offline",
        ...(inputs.priorities.bestSeats
          ? ["Boarding pass + seat confirmation screenshot at T-24hr"]
          : []),
        ...(inputs.priorities.contentMoments
          ? ["Camera fully charged night before", "Shot list saved offline — assume no venue signal"]
          : []),
        ...(inputs.priorities.recovery
          ? ["Recovery kit: electrolytes, sleep mask, earplugs"]
          : []),
      ],
    },

    risks: {
      title: "Risks",
      items: [
        "Travel disruption — Morning departures fail more gracefully. You have the day to recover.",
        "Rideshare surge post-game — Pre-book the return leg before you go in. Prices triple after final whistle.",
        "Venue surprises — Read the official venue FAQ 48 hours out. Bag policies, prohibited items, entry gates.",
        ...(!inputs.departDate || !inputs.returnDate
          ? ["Dates not confirmed — everything above is placeholder. Lock this first."]
          : []),
        ...(!inputs.budget
          ? ["No budget ceiling — this is the leading cause of post-trip regret. Set a number before you book anything."]
          : []),
        ...(inputs.priorities.contentMoments
          ? ["Content scope creep — the 5-shot rule is a hard ceiling. Protect the experience."]
          : []),
        ...(inputs.vibe === "premium" && !inputs.budget
          ? ["Premium vibe + no ceiling = the bill arrives later. Define your limit now."]
          : []),
      ],
    },
  };

  return NextResponse.json(mock);
}
