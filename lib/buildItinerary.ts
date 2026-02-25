import { TravelInputs, Itinerary, OpsSection } from "@/types/travel";

export function buildItinerary(i: TravelInputs): Itinerary {
  const vibeLabel =
    i.vibe === "value" ? "Value-first" : i.vibe === "premium" ? "Premium" : "Balanced";

  // Assumptions summary
  const activePriorities = [
    i.priorities.lowFriction && "Low friction",
    i.priorities.bestSeats && "Best seats",
    i.priorities.contentMoments && "Content moments",
    i.priorities.recovery && "Recovery-aware",
  ]
    .filter(Boolean)
    .join(", ");

  const assumptions = [
    `Budget: ${i.budget || "TBD"}`,
    `Vibe: ${vibeLabel}`,
    activePriorities ? `Priorities: ${activePriorities}` : "No priorities selected",
  ].join(" · ");

  // ─── TRAVEL ───────────────────────────────────────────────────────────────
  const travelItems: string[] = [
    `Route: ${i.origin || "your city"} → ${i.destination}`,
    `Dates: ${i.departDate || "TBD"} → ${i.returnDate || "TBD"}`,
  ];

  if (i.vibe === "value")
    travelItems.push("Mode: Economy or drive — minimize cost over comfort");
  else if (i.vibe === "balanced")
    travelItems.push("Mode: Economy with seat selection; rideshare on the ground");
  else
    travelItems.push("Mode: Direct flights preferred; rental car or rideshare to skip logistics friction");

  if (i.priorities.lowFriction)
    travelItems.push("Routing: Direct only — fewer connections = fewer failure points");
  if (i.priorities.bestSeats)
    travelItems.push("Seat strategy: Aisle rows 15–20 for fast boarding and exit; check in at T-24hr");

  const travel: OpsSection = { title: "Travel", items: travelItems };

  // ─── LODGING ──────────────────────────────────────────────────────────────
  const lodgingItems: string[] = [
    "Location: Within 10 min of the venue — saves 45+ min on game day",
  ];

  if (i.vibe === "value")
    lodgingItems.push("Target: Budget hotel or Airbnb — proximity over amenity");
  else if (i.vibe === "balanced")
    lodgingItems.push("Target: Mid-range hotel with strong reviews; breakfast included is a bonus");
  else
    lodgingItems.push("Target: Boutique hotel or high-rated Airbnb within walking distance of venue");

  lodgingItems.push(
    `Check-in: night before game${i.departDate ? ` (${i.departDate})` : ""} · Check-out: morning of departure`
  );

  if (i.priorities.recovery)
    lodgingItems.push("Request quiet room away from street noise — sleep quality = game-day energy");

  const lodging: OpsSection = { title: "Lodging", items: lodgingItems };

  // ─── GAME-DAY RUN OF SHOW ─────────────────────────────────────────────────
  const gameDayItems: string[] = [
    "Morning — Hydrate, light breakfast, gear check. No distractions before noon.",
    "Pre-game buffer — Build in 90-min cushion before you need to leave. Nothing scheduled.",
    "Transit — Head to venue early; scout entrance and parking before crowds build.",
    "Gate entry — Arrive 45–60 min before tip/kickoff. Content setup while energy is building.",
    "Game time — Stay present. Minimize in-game logistics decisions.",
    "Post-game — Pre-planned exit route. Wait out the main rush if possible.",
  ];

  if (i.priorities.lowFriction)
    gameDayItems.splice(2, 0, "Transit note: Pre-book rideshare or confirm parking the night before. Don't wing it on game day.");
  if (i.priorities.recovery)
    gameDayItems.push("Wind-down — Light food, hydration, in bed by midnight if departing next morning.");

  const gameDay: OpsSection = { title: "Game-Day Run of Show", items: gameDayItems };

  // ─── CONTENT PLAN ─────────────────────────────────────────────────────────
  const contentItems: string[] = [];

  if (i.priorities.contentMoments) {
    contentItems.push("Pre-game (15 min budget): arrival shot, venue exterior, fan energy b-roll");
    contentItems.push("Golden hour window: priority outdoor shots in the 60 min before event");
    contentItems.push("In-game shot list (5 max): reaction, crowd, scoreboard, key moment, post-play");
    contentItems.push("Post-game: 60-sec recap clip + one interview clip if accessible");
    contentItems.push("Hard rule: put the camera down when the game is close — be there first");
  } else {
    contentItems.push("Content plan: minimal — shoot for memories, not production");
    contentItems.push("Phone only, no dedicated gear or content schedule");
    contentItems.push("One solid photo per day for social if the moment calls for it");
  }

  const contentPlan: OpsSection = { title: "Content Plan", items: contentItems };

  // ─── CHECKLIST ────────────────────────────────────────────────────────────
  const checklistItems: string[] = [
    "IDs + tickets — digital copy and screenshot backup",
    "Portable charger (10,000 mAh min) + cable",
    "Game-day outfit + one backup + travel clothes",
    "Snacks + water bottle for travel day",
    "Hotel confirmation + parking/transit info saved offline",
  ];

  if (i.priorities.bestSeats)
    checklistItems.push("Boarding pass + seat confirmation downloaded at T-24hr");
  if (i.priorities.contentMoments) {
    checklistItems.push("Camera / phone fully charged the night before");
    checklistItems.push("Shot list saved offline — no relying on signal at the venue");
  }
  if (i.priorities.recovery)
    checklistItems.push("Recovery kit: sleep mask, earplugs, electrolytes");

  const checklist: OpsSection = { title: "Checklist", items: checklistItems };

  // ─── RISKS ────────────────────────────────────────────────────────────────
  const riskItems: string[] = [
    "Travel delay — Book morning departures to preserve buffer if something slips",
    "Lodging issues — Confirm booking 24hr before departure; screenshot the confirmation",
    "Logistics on game day — Make every decision the night before. Zero day-of improvisation.",
  ];

  if (!i.departDate || !i.returnDate)
    riskItems.push("Dates not locked — all timing above is placeholder. Fix this first.");
  if (!i.budget)
    riskItems.push("No budget set — define a hard spend ceiling before booking anything");
  if (i.vibe === "premium" && !i.budget)
    riskItems.push("Premium vibe + no budget = scope creep. Set the ceiling before it sets itself.");
  if (i.priorities.contentMoments)
    riskItems.push("Content overload — the 5-shot rule exists to prevent this from ruining the trip");

  const risks: OpsSection = { title: "Risks", items: riskItems };

  return {
    headline: `${i.origin || "Origin"} → ${i.destination} · Ops Brief`,
    assumptions,
    travel,
    lodging,
    gameDay,
    contentPlan,
    checklist,
    risks,
  };
}
