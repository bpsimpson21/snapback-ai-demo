"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FlightOption { airline: string; route: string; origin_code?: string; destination_code?: string; type: string; price_per_person: string; url?: string }
interface AccomOption { type: string; name_or_area: string; price_per_night: string; pros: string; url?: string }
interface Game { matchup: string; venue: string; date: string; price_range: string; url?: string }
interface Location { name: string; why: string; url?: string }
interface SafetyArea { name: string; safety_level: string; notes: string }
interface BudgetCategory { name: string; low: number; high: number }

interface AdditionalItem {
  name: string;
  description: string;
  location?: string;
  priceRange?: string;
  bookingTip?: string;
  linkQuery: string;
}

interface AdditionalSection {
  id: string;
  title: string;
  icon: string;
  items: AdditionalItem[];
  recommendation?: string;
  estimatedCost?: string;
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
}

interface TripPlan {
  flights: { options: FlightOption[]; recommendation: string; estimated_total: string };
  accommodation: { options: AccomOption[]; recommendation: string; estimated_total: string };
  transportation: { recommendation: string; details: string; daily_cost: string; estimated_total: string; money_saving_note: string };
  game_tickets: { games: Game[]; media_credential_note: string; estimated_total: string };
  content_locations: { pregame: Location[]; broll: Location[]; between_events: Location[] };
  weather_packing: { forecast: string; temperatures: string; rain_chance: string; pack_list: string[] };
  safety_briefing: { overview: string; areas: SafetyArea[]; emergency_number: string; nearest_embassy: string; embassy_url?: string };
  budget_summary: { categories: BudgetCategory[]; total_low: number; total_high: number; budget_status: string; notes: string };
  additionalSections?: AdditionalSection[];
}

// ── Animation helpers ──────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}>
      {children}
    </div>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────────

function Section({ icon, title, defaultOpen = false, children, delay = 0 }: {
  icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode; delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <FadeIn delay={delay}>
      <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
        <button onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16"
            className={`text-gray-500 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ── Tiny shared components ─────────────────────────────────────────────────────

function Pill({ children, color = "gray" }: { children: React.ReactNode; color?: "gray" | "green" | "yellow" | "red" | "blue" }) {
  const colors = {
    gray: "border-white/10 text-gray-400", green: "border-emerald-400/30 text-emerald-400",
    yellow: "border-snap-yellow/40 text-snap-yellow", red: "border-red-400/30 text-red-400",
    blue: "border-blue-400/30 text-blue-400",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>;
}

function Bullet({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accent ? "bg-snap-yellow/60" : "bg-white/20"}`} />
      {children}
    </li>
  );
}

function BookingLink({ url, label = "Book →" }: { url?: string; label?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[11px] text-snap-yellow underline underline-offset-2 hover:text-snap-yellow/80 transition-colors"
    >
      {label}
    </a>
  );
}

const INPUT_CLS = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-snap-yellow/60 focus:border-transparent transition";
const TEXTAREA_CLS = `${INPUT_CLS} resize-none`;

const ALL_EQUIPMENT = [
  "Camera Gear", "Drone", "Audio Kit", "Lighting", "Tripods", "Laptop/Edit Station",
];

// ── Loading messages ───────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Searching flights...",
  "Checking accommodations...",
  "Analyzing weather data...",
  "Mapping transit routes...",
  "Scouting content locations...",
  "Building itinerary...",
];

function LoadingState() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="border border-snap-yellow/20 rounded-2xl bg-yellow-500/5 p-12 text-center">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-snap-yellow animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-snap-yellow animate-pulse" style={{ animationDelay: "300ms" }} />
        <div className="w-2 h-2 rounded-full bg-snap-yellow animate-pulse" style={{ animationDelay: "600ms" }} />
      </div>
      <p className="text-snap-yellow font-semibold text-sm">{LOADING_MESSAGES[idx]}</p>
      <p className="text-gray-600 text-xs mt-2">This usually takes 15–30 seconds</p>
    </div>
  );
}

// ── Default needs ──────────────────────────────────────────────────────────────

const ALL_NEEDS = [
  "Flights", "Accommodation", "Transit", "Game Tickets",
  "Shoot Locations", "Weather / Packing", "Safety Briefing",
];

// ── Safety level → pill color ──────────────────────────────────────────────────

function safetyColor(level: string): "green" | "yellow" | "red" | "gray" {
  const l = level.toLowerCase();
  if (l.includes("safe") && !l.includes("caution") && !l.includes("moderate")) return "green";
  if (l.includes("caution") || l.includes("moderate") || l.includes("game day")) return "yellow";
  if (l.includes("avoid") || l.includes("danger")) return "red";
  return "green";
}

// ── Format currency ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ── AI Itinerary renderer ──────────────────────────────────────────────────────

const NEED_TO_SECTION: Record<string, string> = {
  "Flights": "flights",
  "Accommodation": "accommodation",
  "Transit": "transportation",
  "Game Tickets": "game_tickets",
  "Shoot Locations": "content_locations",
  "Weather / Packing": "weather_packing",
  "Safety Briefing": "safety_briefing",
};

// ── Google search link builder ────────────────────────────────────────────────

function gSearch(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}

interface TripContext {
  destination: string;
  arrival: string;
  departure: string;
}

function AIItinerary({ plan, needs, ctx }: { plan: TripPlan; needs: string[]; ctx: TripContext }) {
  const activeKeys = new Set(needs.map((n) => NEED_TO_SECTION[n]).filter(Boolean));
  const dates = ctx.arrival && ctx.departure ? `${ctx.arrival} to ${ctx.departure}` : "";

  return (
    <div className="space-y-4">
      {/* Flights */}
      {activeKeys.has("flights") && plan.flights && (
        <Section icon="✈️" title="Flights" defaultOpen delay={0}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.flights.options?.map((opt, i) => (
                <div key={i} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white font-medium">{opt.airline}</p>
                    <BookingLink url={gSearch(`book ${opt.airline} flight ${opt.route}${dates ? " " + dates : ""}`)} />
                  </div>
                  <p className="text-xs text-gray-400">{opt.route}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.type} — {opt.price_per_person}/person</p>
                </div>
              ))}
            </div>
            {plan.flights.recommendation && (
              <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold mb-1">Recommendation</p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.flights.recommendation}</p>
              </div>
            )}
            <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
                <p className="text-lg font-bold text-white tabular-nums">{plan.flights.estimated_total}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Accommodation */}
      {activeKeys.has("accommodation") && plan.accommodation && (
        <Section icon="🏨" title="Accommodation" defaultOpen delay={50}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.accommodation.options?.map((opt, i) => {
                const isAirbnb = opt.type.toLowerCase().includes("airbnb") || opt.name_or_area.toLowerCase().includes("airbnb");
                const q = isAirbnb
                  ? `Airbnb ${opt.name_or_area} ${ctx.destination}${dates ? " " + dates : ""}`
                  : `${opt.name_or_area} ${ctx.destination} book${dates ? " " + dates : ""}`;
                return (
                  <div key={i} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-white">{opt.type}: {opt.name_or_area}</p>
                      <BookingLink url={gSearch(q)} label="View →" />
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{opt.pros}</p>
                    <p className="text-xs text-gray-500">{opt.price_per_night}/night</p>
                  </div>
                );
              })}
            </div>
            {plan.accommodation.recommendation && (
              <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold mb-1">Recommendation</p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.accommodation.recommendation}</p>
              </div>
            )}
            <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
                <p className="text-lg font-bold text-white tabular-nums">{plan.accommodation.estimated_total}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Transportation */}
      {activeKeys.has("transportation") && plan.transportation && (
        <Section icon="🚇" title="Transportation" delay={100}>
          <div className="space-y-4">
            <div className="border border-emerald-400/20 rounded-xl bg-emerald-500/5 p-4">
              <p className="text-sm font-bold text-white mb-2">{plan.transportation.recommendation}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{plan.transportation.details}</p>
              {plan.transportation.daily_cost && (
                <p className="text-xs text-gray-500 mt-2">Daily cost: {plan.transportation.daily_cost}</p>
              )}
            </div>
            {plan.transportation.money_saving_note && (
              <div className="border border-snap-yellow/20 bg-yellow-500/5 rounded-xl p-4">
                <p className="text-xs text-snap-yellow font-semibold mb-1">Money Saving Note</p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.transportation.money_saving_note}</p>
              </div>
            )}
            <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
                <p className="text-lg font-bold text-white tabular-nums">{plan.transportation.estimated_total}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Game Tickets */}
      {activeKeys.has("game_tickets") && plan.game_tickets && (
        <Section icon="🏟️" title="Game Tickets" delay={150}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.game_tickets.games?.map((g, i) => (
                <div key={i} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{g.date}</p>
                    <BookingLink url={gSearch(`${g.matchup} tickets ${g.date} ${g.venue}`)} label="Tickets →" />
                  </div>
                  <p className="text-sm text-white font-medium mb-1">{g.matchup}</p>
                  <p className="text-xs text-gray-400">{g.venue}</p>
                  <p className="text-xs text-gray-500 mt-2">{g.price_range}</p>
                </div>
              ))}
            </div>
            {plan.game_tickets.media_credential_note && (
              <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold mb-1">Media Credentials</p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.game_tickets.media_credential_note}</p>
              </div>
            )}
            <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
                <p className="text-lg font-bold text-white tabular-nums">{plan.game_tickets.estimated_total}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Content Locations */}
      {activeKeys.has("content_locations") && plan.content_locations && (
        <Section icon="🎥" title="Content Shooting Locations" delay={200}>
          <div className="space-y-5">
            {plan.content_locations.pregame?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill color="yellow">Pre-Game</Pill>
                </div>
                <ul className="space-y-1.5">
                  {plan.content_locations.pregame.map((loc, i) => (
                    <Bullet key={i} accent><span className="text-white font-medium">{loc.name}</span> — {loc.why} <BookingLink url={gSearch(`${loc.name} ${ctx.destination}`)} label="View →" /></Bullet>
                  ))}
                </ul>
              </div>
            )}
            {plan.content_locations.broll?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill color="yellow">B-Roll</Pill>
                </div>
                <ul className="space-y-1.5">
                  {plan.content_locations.broll.map((loc, i) => (
                    <Bullet key={i} accent><span className="text-white font-medium">{loc.name}</span> — {loc.why} <BookingLink url={gSearch(`${loc.name} ${ctx.destination}`)} label="View →" /></Bullet>
                  ))}
                </ul>
              </div>
            )}
            {plan.content_locations.between_events?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill>Between Events</Pill>
                </div>
                <ul className="space-y-1.5">
                  {plan.content_locations.between_events.map((loc, i) => (
                    <Bullet key={i}><span className="text-white font-medium">{loc.name}</span> — {loc.why} <BookingLink url={gSearch(`${loc.name} ${ctx.destination}`)} label="View →" /></Bullet>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Weather & Packing */}
      {activeKeys.has("weather_packing") && plan.weather_packing && (
        <Section icon="🌦️" title="Weather & Packing" delay={250}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4 text-center">
                <p className="text-sm font-bold text-white mb-1">{plan.weather_packing.temperatures}</p>
                <p className="text-xs text-gray-500">Temperature range</p>
              </div>
              <div className="border border-blue-400/20 rounded-xl bg-blue-500/5 p-4 text-center">
                <p className="text-sm font-bold text-blue-400 mb-1">{plan.weather_packing.rain_chance}</p>
                <p className="text-xs text-gray-500">Rain chance</p>
              </div>
              <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4 text-center sm:col-span-1">
                <p className="text-xs text-gray-400 leading-relaxed">{plan.weather_packing.forecast}</p>
              </div>
            </div>
            {plan.weather_packing.pack_list?.length > 0 && (
              <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Packing List</p>
                <ul className="space-y-1.5">
                  {plan.weather_packing.pack_list.map((item, i) => <Bullet key={i}>{item}</Bullet>)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Safety */}
      {activeKeys.has("safety_briefing") && plan.safety_briefing && (
        <Section icon="🛡️" title="Area Safety Briefing" delay={300}>
          <div className="space-y-4">
            {plan.safety_briefing.overview && (
              <p className="text-sm text-gray-400 leading-relaxed">{plan.safety_briefing.overview}</p>
            )}
            {plan.safety_briefing.areas?.map((area, i) => (
              <div key={i} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{area.name}</p>
                  <Pill color={safetyColor(area.safety_level)}>{area.safety_level}</Pill>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{area.notes}</p>
              </div>
            ))}
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <ul className="space-y-1.5">
                {plan.safety_briefing.emergency_number && (
                  <Bullet accent>Emergency: {plan.safety_briefing.emergency_number}</Bullet>
                )}
                {plan.safety_briefing.nearest_embassy && (
                  <Bullet>Nearest US Embassy: {plan.safety_briefing.nearest_embassy} <BookingLink url={gSearch(`US Embassy ${ctx.destination}`)} label="View →" /></Bullet>
                )}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* Dynamic Additional Sections */}
      {plan.additionalSections && plan.additionalSections.length > 0 &&
        plan.additionalSections.map((section, sIdx) => (
          <Section key={section.id} icon={section.icon} title={section.title} defaultOpen delay={350 + sIdx * 50}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        {item.location && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.location}</p>
                        )}
                        <p className="text-xs text-gray-400 leading-relaxed mt-1">{item.description}</p>
                        {item.priceRange && (
                          <p className="text-xs text-gray-500 mt-1">{item.priceRange}</p>
                        )}
                        {item.bookingTip && (
                          <p className="text-[11px] text-snap-yellow/80 mt-2 italic">
                            💡 {item.bookingTip}
                          </p>
                        )}
                      </div>
                      <BookingLink url={gSearch(item.linkQuery)} label="View →" />
                    </div>
                  </div>
                ))}
              </div>

              {section.recommendation && (
                <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
                  <p className="text-xs text-emerald-400 font-semibold mb-1">Recommendation</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{section.recommendation}</p>
                </div>
              )}

              {section.estimatedCost && (
                <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
                    <p className="text-lg font-bold text-white tabular-nums">{section.estimatedCost}</p>
                  </div>
                </div>
              )}
            </div>
          </Section>
        ))
      }

      {/* Budget Summary */}
      {plan.budget_summary && (
        <Section icon="💰" title="Budget Summary" defaultOpen delay={350 + (plan.additionalSections?.length ?? 0) * 50}>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 pr-4">Category</th>
                    <th className="text-right text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 px-4">Low</th>
                    <th className="text-right text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 pl-4">High</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.budget_summary.categories?.map((row) => (
                    <tr key={row.name} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-gray-300">{row.name}</td>
                      <td className="py-3 px-4 text-right text-gray-400 tabular-nums">{fmt(row.low)}</td>
                      <td className="py-3 pl-4 text-right text-gray-400 tabular-nums">{fmt(row.high)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-snap-yellow/30">
                    <td className="pt-4 pr-4 text-white font-bold">TOTAL</td>
                    <td className="pt-4 px-4 text-right text-snap-yellow font-bold tabular-nums text-lg">{fmt(plan.budget_summary.total_low)}</td>
                    <td className="pt-4 pl-4 text-right text-snap-yellow font-bold tabular-nums text-lg">{fmt(plan.budget_summary.total_high)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {plan.budget_summary.budget_status && (
              <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-emerald-400 font-semibold">{plan.budget_summary.budget_status}</span>
                  {plan.budget_summary.notes && <> {plan.budget_summary.notes}</>}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Static demo itinerary ──────────────────────────────────────────────────────

function StaticItinerary() {
  return (
    <div className="space-y-4">
      <Section icon="✈️" title="Flights" defaultOpen delay={0}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Outbound</p>
                <Pill color="blue">Thu Oct 1</Pill>
              </div>
              <p className="text-sm text-white font-medium mb-1">JAX → LHR</p>
              <p className="text-xs text-gray-400 leading-relaxed">Departs ~6:00 PM, arrives Fri Oct 2 ~7:00 AM (overnight). British Airways direct or Delta/United with one connection.</p>
            </div>
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Return</p>
                <Pill color="blue">Tue Oct 13</Pill>
              </div>
              <p className="text-sm text-white font-medium mb-1">LHR → JAX</p>
              <p className="text-xs text-gray-400 leading-relaxed">Departs ~10:00 AM, arrives ~4:00 PM same day (time zone gain). Same carrier options.</p>
            </div>
          </div>
          <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estimated Cost</p>
              <p className="text-lg font-bold text-white tabular-nums">$1,600 – $2,400</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">$800–$1,200 per person round trip (economy). Book 8+ weeks out for best rates.</p>
          </div>
        </div>
      </Section>

      <Section icon="🏨" title="Accommodation" defaultOpen delay={50}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            Both stadiums are in North/Northwest London. Recommend staying in{" "}
            <span className="text-white font-medium">Central London (King&apos;s Cross / Islington area)</span>{" "}
            — well-connected by Tube to both Tottenham Hotspur Stadium and Wembley.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">Option A: Hotel</p>
                <Pill>Standard</Pill>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">Mid-range chain — Premier Inn, Travelodge, or Holiday Inn near King&apos;s Cross.</p>
              <div className="border-t border-white/5 pt-3 space-y-1">
                <p className="text-xs text-gray-500">£80–£120/night per room</p>
                <p className="text-xs text-gray-500">12 nights × 2 rooms</p>
                <p className="text-sm font-bold text-white tabular-nums">$2,400 – $3,600</p>
              </div>
            </div>
            <div className="border border-emerald-400/20 rounded-xl bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">Option B: Airbnb</p>
                <Pill color="green">Recommended</Pill>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">2-bedroom flat in Islington or Camden. Kitchen for meals, space to edit footage.</p>
              <div className="border-t border-white/5 pt-3 space-y-1">
                <p className="text-xs text-gray-500">£120–£180/night for full flat</p>
                <p className="text-xs text-gray-500">12 nights × 1 flat</p>
                <p className="text-sm font-bold text-emerald-400 tabular-nums">$1,800 – $2,700</p>
              </div>
            </div>
          </div>
          <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-1">Recommendation</p>
            <p className="text-sm text-gray-300 leading-relaxed">Airbnb for extended stay — cost savings of $600–$900, plus kitchen for meals and dedicated space to review/edit footage between shoot days.</p>
          </div>
        </div>
      </Section>

      <Section icon="🚇" title="Transportation" delay={100}>
        <div className="space-y-4">
          <div className="border border-red-400/20 rounded-xl bg-red-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pill color="red">Not Recommended</Pill>
              <p className="text-sm font-bold text-white">Rental Car</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Congestion charge £15/day in central London. Parking is expensive and scarce. Would cost ~$2,000+ for 12 days.{" "}
              <span className="text-red-400 font-medium">AI flags this as a cost trap.</span>
            </p>
          </div>
          <div className="border border-emerald-400/20 rounded-xl bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pill color="green">Recommended</Pill>
              <p className="text-sm font-bold text-white">Oyster Card / Contactless TfL</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">Pay-as-you-go on all Tube, bus, and Overground lines. Daily cap ~£8.10/person.</p>
            <ul className="space-y-1.5">
              <Bullet>TfL daily travel: 12 days × 2 people × ~£8.10 = ~£195 (~$245)</Bullet>
              <Bullet>Uber for equipment transport on shoot days: budget ~£100 (~$125)</Bullet>
            </ul>
          </div>
          <div className="border border-snap-yellow/20 bg-yellow-500/5 rounded-xl p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow">Total Transport</p>
              <p className="text-lg font-bold text-snap-yellow tabular-nums">~$370</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs ~$2,000+ for rental car. AI saves ~$1,600 here.</p>
          </div>
        </div>
      </Section>

      <Section icon="🏟️" title="Game Tickets" delay={150}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Game 1 — Oct 4</p>
              <p className="text-sm text-white font-medium mb-1">Jaguars vs TBD</p>
              <p className="text-xs text-gray-400">Tottenham Hotspur Stadium (62,850 capacity)</p>
              <p className="text-xs text-gray-500 mt-2">Standard tickets: £80–£150 ea (~$100–$190)</p>
            </div>
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Game 2 — Oct 11</p>
              <p className="text-sm text-white font-medium mb-1">Jaguars vs TBD</p>
              <p className="text-xs text-gray-400">Wembley Stadium (90,000 capacity)</p>
              <p className="text-xs text-gray-500 mt-2">Standard tickets: £80–£150 ea (~$100–$190)</p>
            </div>
          </div>
          <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-1">Recommendation: Apply for Media Credentials</p>
            <p className="text-sm text-gray-300 leading-relaxed">Snapback should apply through NFL Communications for press credentials 6–8 weeks before game day. If approved, ticket cost = $0 and you get media access.</p>
          </div>
          <div className="border border-white/5 rounded-xl bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Budget if Buying Tickets</p>
              <p className="text-lg font-bold text-white tabular-nums">$400 – $760</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">2 people × 2 games × $100–$190 each</p>
          </div>
        </div>
      </Section>

      <Section icon="🎥" title="Content Shooting Locations" delay={200}>
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3"><Pill color="yellow">Week 1</Pill><p className="text-sm font-semibold text-white">Tottenham Area — Oct 2–4</p></div>
            <ul className="space-y-1.5">
              <Bullet accent>Tottenham Hotspur Stadium exterior / NFL fan zone setup (day before game)</Bullet>
              <Bullet accent>Seven Sisters Road — local atmosphere, pubs filling up with NFL fans</Bullet>
              <Bullet accent>Boxpark Tottenham — food/fan gathering spot, great for man-on-street content</Bullet>
              <Bullet accent>Central London landmarks for b-roll: Tower Bridge, Big Ben, Piccadilly Circus</Bullet>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Pill color="yellow">Week 2</Pill><p className="text-sm font-semibold text-white">Wembley Area — Oct 9–11</p></div>
            <ul className="space-y-1.5">
              <Bullet accent>Wembley Stadium exterior + Olympic Way (the famous walkway)</Bullet>
              <Bullet accent>Wembley Boxpark — massive fan zone, great for crowd content</Bullet>
              <Bullet accent>London Designer Outlet — adjacent to stadium, pre-game atmosphere</Bullet>
              <Bullet accent>NFL Fan Experience events (NFL UK typically runs week-of events)</Bullet>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Pill>Between Games</Pill><p className="text-sm font-semibold text-white">Oct 5–8 — Rest / Edit / B-Roll</p></div>
            <ul className="space-y-1.5">
              <Bullet>Borough Market, Shoreditch street art, Camden Market for lifestyle b-roll</Bullet>
              <Bullet>Any NFL UK fan events happening that week</Bullet>
              <Bullet>Edit days at accommodation — review footage, start assembly cuts</Bullet>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon="🌦️" title="Weather & Packing" delay={250}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-white tabular-nums mb-1">15°C</p>
              <p className="text-xs text-gray-500">59°F avg high</p>
            </div>
            <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-white tabular-nums mb-1">9°C</p>
              <p className="text-xs text-gray-500">48°F avg low</p>
            </div>
            <div className="border border-blue-400/20 rounded-xl bg-blue-500/5 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400 tabular-nums mb-1">40–50%</p>
              <p className="text-xs text-gray-500">chance of rain daily</p>
            </div>
          </div>
          <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Packing List</p>
            <ul className="space-y-1.5">
              <Bullet>Layered clothing — temps swing 10+ degrees through the day</Bullet>
              <Bullet>Waterproof jacket (essential, not optional)</Bullet>
              <Bullet>Comfortable walking shoes — you&apos;ll average 15k+ steps on shoot days</Bullet>
              <Bullet accent>Rain covers for all camera equipment — critical for outdoor shoots</Bullet>
              <Bullet>Game day: Stadiums are partially open-air. Dress warm, bring hand warmers</Bullet>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon="🛡️" title="Area Safety Briefing" delay={300}>
        <div className="space-y-4">
          {[
            { area: "Central London (King's Cross / Islington / Camden)", status: "Safe", statusColor: "green" as const, detail: "Generally safe. Standard city awareness — watch for pickpockets on Tube and in crowds." },
            { area: "Tottenham (N17)", status: "Safe on Game Day", statusColor: "yellow" as const, detail: "Stadium area is heavily policed on game days. Stick to main roads and the stadium precinct." },
            { area: "Wembley (HA9)", status: "Safe", statusColor: "green" as const, detail: "Very safe on game days, heavily staffed. Olympic Way is a controlled corridor." },
          ].map((loc) => (
            <div key={loc.area} className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{loc.area}</p>
                <Pill color={loc.statusColor}>{loc.status}</Pill>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{loc.detail}</p>
            </div>
          ))}
          <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
            <ul className="space-y-1.5">
              <Bullet>Phone snatching is common on mopeds in central areas — keep devices secure</Bullet>
              <Bullet>Keep camera gear in sealed bags. Don&apos;t leave equipment visible in vehicles</Bullet>
              <Bullet accent>Emergency: 999 (UK equivalent of 911)</Bullet>
              <Bullet>Nearest US Embassy: 33 Nine Elms Lane, SW11</Bullet>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon="💰" title="Budget Summary" defaultOpen delay={350}>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 pr-4">Category</th>
                  <th className="text-right text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 px-4">Low</th>
                  <th className="text-right text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 pl-4">High</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "Flights (2 people)", low: "$1,600", high: "$2,400" },
                  { cat: "Accommodation (12 nights)", low: "$1,800", high: "$3,600" },
                  { cat: "Transport", low: "$300", high: "$400" },
                  { cat: "Game Tickets (if not credentialed)", low: "$400", high: "$760" },
                  { cat: "Food & Misc ($40/person/day)", low: "$960", high: "$960" },
                  { cat: "Content locations / permits", low: "$0", high: "$200" },
                ].map((row) => (
                  <tr key={row.cat} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-gray-300">{row.cat}</td>
                    <td className="py-3 px-4 text-right text-gray-400 tabular-nums">{row.low}</td>
                    <td className="py-3 pl-4 text-right text-gray-400 tabular-nums">{row.high}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-snap-yellow/30">
                  <td className="pt-4 pr-4 text-white font-bold">TOTAL</td>
                  <td className="pt-4 px-4 text-right text-snap-yellow font-bold tabular-nums text-lg">$5,060</td>
                  <td className="pt-4 pl-4 text-right text-snap-yellow font-bold tabular-nums text-lg">$8,320</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border border-emerald-400/20 bg-emerald-500/5 rounded-xl p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Under budget ceiling.</span>{" "}
              Remaining $0–$6,940 available for equipment rental, premium ticket upgrades, or emergency expenses.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TravelPlannerPage() {
  // Form state with defaults
  const [departingFrom, setDepartingFrom] = useState("Jacksonville, FL");
  const [destination, setDestination] = useState("London, UK");
  const [crewSize, setCrewSize] = useState(2);
  const [arrival, setArrival] = useState("2026-10-01");
  const [departure, setDeparture] = useState("2026-10-13");
  const [budget, setBudget] = useState("$8,000 – $12,000");
  const [purpose, setPurpose] = useState(
    "Cover Jaguars London games — back-to-back weeks at Tottenham Hotspur Stadium (Oct 4) and Wembley Stadium (Oct 11)"
  );
  const [needs, setNeeds] = useState<string[]>([...ALL_NEEDS]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [notes, setNotes] = useState(
    "Need to shoot content day before each game + game day. Rest/edit days in between."
  );

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<TripPlan | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [genDuration, setGenDuration] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleNeed = useCallback((need: string) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  }, []);

  const toggleEquipment = useCallback((item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setError(null);
    setAiPlan(null);
    const start = Date.now();

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departing_from: departingFrom,
          destination,
          crew_size: crewSize,
          arrival,
          departure,
          budget,
          purpose,
          needs,
          equipment,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      setAiPlan(data);
      setGenDuration(Math.round((Date.now() - start) / 100) / 10);
      setGeneratedAt(
        new Date().toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true,
        })
      );

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [departingFrom, destination, crewSize, arrival, departure, budget, purpose, needs, equipment, notes]);

  const isAI = aiPlan !== null;

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="inline-block border border-snap-yellow/40 text-snap-yellow text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                Live Demo
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                AI Travel Planner
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-3">
                Demo: AI-powered trip planning for sports media operations. Edit the brief
                below and hit Generate to produce a real itinerary powered by Claude.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed max-w-2xl">
                Today, an operations manager spends 4–6 hours researching flights, hotels,
                transit, safety, weather, and logistics for international trips. This tool
                compresses that to a single prompt.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-white underline underline-offset-2 shrink-0 transition"
            >
              Back home
            </Link>
          </div>
        </section>

        {/* ── Editable Input Brief ────────────────────────────────────────── */}
        <FadeIn>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-snap-yellow" />
              <p className="text-xs font-bold uppercase tracking-widest text-snap-yellow">
                Trip Brief — Input
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Departing From
                </label>
                <input
                  type="text"
                  value={departingFrom}
                  onChange={(e) => setDepartingFrom(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="e.g. Jacksonville, FL"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="e.g. London, UK"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Crew Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={crewSize}
                  onChange={(e) => setCrewSize(parseInt(e.target.value) || 1)}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Arrival
                </label>
                <input
                  type="date"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Departure
                </label>
                <input
                  type="date"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                  Budget (Total)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="e.g. $8,000 – $12,000"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                Purpose
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                className={TEXTAREA_CLS}
              />
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 block">
                Needs
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_NEEDS.map((need) => {
                  const active = needs.includes(need);
                  return (
                    <button
                      key={need}
                      onClick={() => toggleNeed(need)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? "border-snap-yellow/40 bg-snap-yellow/10 text-snap-yellow"
                          : "border-white/10 bg-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20"
                      }`}
                    >
                      {need}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 block">
                Equipment
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_EQUIPMENT.map((item) => {
                  const active = equipment.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? "border-snap-yellow/40 bg-snap-yellow/10 text-snap-yellow"
                          : "border-white/10 bg-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">Select gear you&apos;re bringing — AI factors in baggage, transport sizing, storage, and regulations</p>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={TEXTAREA_CLS}
              />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !destination.trim()}
                className="px-6 py-3 bg-snap-yellow text-snap-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Plan"}
              </button>
              {!loading && !isAI && (
                <span className="text-xs text-gray-600">
                  Sample output shown below — click Generate to create a real AI plan
                </span>
              )}
            </div>
          </div>
        </FadeIn>

        {/* ── Output header ───────────────────────────────────────────────── */}
        <div ref={resultRef}>
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isAI ? "bg-emerald-400" : "bg-gray-500"}`} />
                <p className={`text-xs font-bold uppercase tracking-widest ${isAI ? "text-emerald-400" : "text-gray-500"}`}>
                  {isAI ? "AI-Generated Itinerary" : "Sample Output"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-600">
                {isAI ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                    Generated in {genDuration}s &nbsp;·&nbsp; {generatedAt}
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600" />
                    Jaguars London 2026 — Pre-filled Demo
                  </>
                )}
              </div>
            </div>
          </FadeIn>

          {/* ── Loading / Error / Itinerary ──────────────────────────────── */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="border border-red-400/20 rounded-2xl bg-red-500/5 p-8 text-center">
              <p className="text-red-400 font-semibold text-sm mb-2">Generation Failed</p>
              <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-4 px-5 py-2 text-xs font-semibold border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/10 transition"
              >
                Try Again
              </button>
            </div>
          ) : isAI ? (
            <AIItinerary plan={aiPlan} needs={needs} ctx={{ destination, arrival, departure }} />
          ) : (
            <StaticItinerary />
          )}
        </div>

        {/* ── Footer badge ────────────────────────────────────────────────── */}
        <FadeIn>
          <div className="text-center pt-4 pb-8">
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/5">
              <span className={`w-1.5 h-1.5 rounded-full ${isAI ? "bg-emerald-400" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-500">
                {isAI ? "Generated by AI Travel Planner" : "Sample Output"} &nbsp;·&nbsp; Snapback AI Ops Lab
              </span>
            </div>
          </div>
        </FadeIn>

      </div>
    </main>
  );
}
