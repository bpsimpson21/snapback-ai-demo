import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a travel operations planner for a sports media production company called Snapback Sports. The crew is traveling to shoot content at live sporting events. They need specific, actionable logistics — not generic travel advice. You must return ONLY valid JSON with no markdown formatting, no backticks, no explanation outside the JSON. Include real airline names, real hotel and Airbnb price estimates for 2026, real transit systems, real neighborhood names, real weather averages for the destination during the travel dates, and real safety information. All prices should be in USD.

IMPORTANT: All URLs MUST be Google Search or Google Maps links. Do NOT use booking site URLs (airbnb.com, ticketmaster.com, booking.com, etc.) because they often break. Replace spaces with + signs in all URLs. Use these exact formats:
- Flight options: "https://www.google.com/search?q=British+Airways+flights+JAX+to+LHR+October+2026"
- Hotels: "https://www.google.com/search?q=Premier+Inn+Kings+Cross+London+booking"
- Airbnb: "https://www.google.com/search?q=Airbnb+Islington+London+October+2026"
- Game tickets: "https://www.google.com/search?q=Jaguars+tickets+Wembley+Stadium+October+2026"
- Content locations: use Google Maps — "https://www.google.com/maps/search/Tottenham+Hotspur+Stadium+London" (the one exception — Maps URLs are reliable)
- Restaurants/bars: "https://www.google.com/search?q=Boxpark+Tottenham+London+reservations"
- Embassy: "https://www.google.com/search?q=US+Embassy+London"
Every single URL in the response must follow one of these patterns. No exceptions.

If the crew is bringing equipment (camera gear, drones, audio kits, lighting, tripods, laptops), factor that into your recommendations:
- Baggage: note checked bag fees and oversize/overweight policies for equipment cases
- Transport: recommend vehicle sizes that fit equipment (e.g. larger Ubers, van rentals)
- Accommodation: note storage space needs and secure areas for gear
- Drone regulations: if a drone is listed, include local drone laws and permit requirements for the destination
- Packing: include equipment-specific packing advice (rain covers, cases, power adapters)

Use this exact JSON structure: { "flights": { "options": [{ "airline": string, "route": string, "type": string, "price_per_person": string, "url": string }], "recommendation": string, "estimated_total": string }, "accommodation": { "options": [{ "type": string, "name_or_area": string, "price_per_night": string, "pros": string, "url": string }], "recommendation": string, "estimated_total": string }, "transportation": { "recommendation": string, "details": string, "daily_cost": string, "estimated_total": string, "money_saving_note": string }, "game_tickets": { "games": [{ "matchup": string, "venue": string, "date": string, "price_range": string, "url": string }], "media_credential_note": string, "estimated_total": string }, "content_locations": { "pregame": [{ "name": string, "why": string, "url": string }], "broll": [{ "name": string, "why": string, "url": string }], "between_events": [{ "name": string, "why": string, "url": string }] }, "weather_packing": { "forecast": string, "temperatures": string, "rain_chance": string, "pack_list": [string] }, "safety_briefing": { "overview": string, "areas": [{ "name": string, "safety_level": string, "notes": string }], "emergency_number": string, "nearest_embassy": string, "embassy_url": string }, "budget_summary": { "categories": [{ "name": string, "low": number, "high": number }], "total_low": number, "total_high": number, "budget_status": string, "notes": string } }`;

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

  const userPrompt = `Plan a trip for ${input.crew_size || 2} crew members from a sports media company. Departing from: ${input.departing_from || "not specified"}. Destination: ${input.destination}. Arriving: ${input.arrival}. Departing: ${input.departure}. Budget: ${input.budget} total. Purpose: ${input.purpose}. They need: ${(input.needs || []).join(", ")}.${equipmentLine} Additional notes: ${input.notes}. Provide a complete, specific, actionable travel operations plan.`;

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
        max_tokens: 4096,
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
