import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a travel operations planner for a sports media production company called Snapback Sports. The crew is traveling to shoot content at live sporting events. They need specific, actionable logistics — not generic travel advice. You must return ONLY valid JSON with no markdown formatting, no backticks, no explanation outside the JSON. Include real airline names, real hotel and Airbnb price estimates for 2026, real transit systems, real neighborhood names, real weather averages for the destination during the travel dates, and real safety information. All prices should be in USD.

IMPORTANT: Do NOT generate any URLs in your response. The frontend constructs all booking links automatically from the structured data you provide. Instead, include IATA airport codes: add "origin_code" (e.g. "JFK") and "destination_code" (e.g. "MAD") to each flight option so the frontend can build direct airline booking links. Use real 3-letter IATA codes only.

If the crew is bringing equipment (camera gear, drones, audio kits, lighting, tripods, laptops), factor that into your recommendations:
- Baggage: note checked bag fees and oversize/overweight policies for equipment cases
- Transport: recommend vehicle sizes that fit equipment (e.g. larger Ubers, van rentals)
- Accommodation: note storage space needs and secure areas for gear
- Drone regulations: if a drone is listed, include local drone laws and permit requirements for the destination
- Packing: include equipment-specific packing advice (rain covers, cases, power adapters)

CRITICAL — ADDITIONAL ACTIVITIES DETECTION (DO NOT SKIP):
You MUST carefully read the user's notes, purpose, and all input fields. If they mention ANY specific activities, interests, or requests beyond standard travel logistics, you MUST create additional sections for them in the "additionalSections" array. This is NOT optional — if the user mentions golf, there MUST be a golf section. If they mention dinner/restaurants, there MUST be a dining section.

Scan for keywords and phrases like:
- Sports: "golf", "tennis", "surfing", "skiing", "gym", "workout"
- Food: "restaurant", "dinner", "steakhouse", "brunch", "food tour", "nice meal"
- Entertainment: "nightlife", "bars", "clubs", "concert", "show", "theater"
- Relaxation: "spa", "massage", "beach", "pool"
- Culture: "museum", "gallery", "tours", "sightseeing", "history"
- Shopping: "shopping", "outlets", "markets"
- Any other specific activity they mention → create an appropriately named section

For EACH detected activity, add an object to the "additionalSections" array with:
- id: short lowercase identifier (e.g. "golf", "dining")
- title: display name for the section header (e.g. "Golf", "Dining & Restaurants")
- icon: single emoji that represents the category (e.g. "⛳", "🍽️")
- items: array of 2-3 specific recommendations, each with name, description, location, priceRange, bookingTip, and linkQuery (a specific Google search string for booking/viewing, e.g. "The Belfry Golf Course tee time booking")
- recommendation: your top pick and why
- estimatedCost: total estimated cost for this activity as a string (e.g. "$200-$400")
- estimatedCostLow: numeric low estimate in USD
- estimatedCostHigh: numeric high estimate in USD

If the user mentions quantities (e.g. "2 rounds of golf"), factor that into the estimatedCost.

If no additional activities are detected from the user's input, return "additionalSections": [].

IMPORTANT: When additionalSections have costs, you MUST include each one as a row in budget_summary.categories AND factor them into total_low and total_high.

Use this exact JSON structure: { "flights": { "options": [{ "airline": string, "route": string, "origin_code": string, "destination_code": string, "type": string, "price_per_person": string }], "recommendation": string, "estimated_total": string }, "accommodation": { "options": [{ "type": string, "name_or_area": string, "price_per_night": string, "pros": string }], "recommendation": string, "estimated_total": string }, "transportation": { "recommendation": string, "details": string, "daily_cost": string, "estimated_total": string, "money_saving_note": string }, "game_tickets": { "games": [{ "matchup": string, "venue": string, "date": string, "price_range": string }], "media_credential_note": string, "estimated_total": string }, "content_locations": { "pregame": [{ "name": string, "why": string }], "broll": [{ "name": string, "why": string }], "between_events": [{ "name": string, "why": string }] }, "weather_packing": { "forecast": string, "temperatures": string, "rain_chance": string, "pack_list": [string] }, "safety_briefing": { "overview": string, "areas": [{ "name": string, "safety_level": string, "notes": string }], "emergency_number": string, "nearest_embassy": string }, "budget_summary": { "categories": [{ "name": string, "low": number, "high": number }], "total_low": number, "total_high": number, "budget_status": string, "notes": string }, "additionalSections": [{ "id": string, "title": string, "icon": string, "items": [{ "name": string, "description": string, "location": string, "priceRange": string, "bookingTip": string, "linkQuery": string }], "recommendation": string, "estimatedCost": string, "estimatedCostLow": number, "estimatedCostHigh": number }] }`;

interface TripInput {
  departing_from: string;
  destination: string;
  crew_size: number;
  arrival: string;
  departure: string;
  budget: string;
  purpose: string;
  needs: string[];
  equipment: string[];
  notes: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Add ANTHROPIC_API_KEY to your Vercel environment variables." },
      { status: 500 },
    );
  }

  let input: TripInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!input.destination?.trim()) {
    return NextResponse.json({ error: "Destination is required." }, { status: 400 });
  }

  const equipmentLine = input.equipment?.length
    ? ` Equipment they are bringing: ${input.equipment.join(", ")}.`
    : "";

  const notesLine = input.notes?.trim()
    ? `\n\nIMPORTANT — The user's additional notes (scan these for extra activities to create additionalSections): "${input.notes}"`
    : "";

  const userPrompt = `Plan a trip for ${input.crew_size || 2} crew members from a sports media company. Departing from: ${input.departing_from || "not specified"}. Destination: ${input.destination}. Arriving: ${input.arrival}. Departing: ${input.departure}. Budget: ${input.budget} total. Purpose: ${input.purpose}. They need: ${(input.needs || []).join(", ")}.${equipmentLine}${notesLine}

Provide a complete, specific, actionable travel operations plan. Remember: if the notes mention any activities (golf, dining, shopping, etc.), you MUST include them in additionalSections.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const msg =
        body?.error?.message || `Anthropic API returned ${response.status}`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text ?? "";

    // Parse the JSON from the response — strip markdown fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const plan = JSON.parse(cleaned);

    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof SyntaxError
      ? "Failed to parse AI response as JSON. Please try again."
      : err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
