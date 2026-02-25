import { Itinerary, OpsSection } from "@/types/travel";

type Props = {
  itinerary: Itinerary | null;
  isLoading: boolean;
  generateError: string | null;
  aiMode: boolean;
};

const SECTION_ICONS: Record<string, string> = {
  Travel: "✈",
  Lodging: "🏨",
  "Game-Day Run of Show": "🏈",
  "Content Plan": "📷",
  Checklist: "☑",
  Risks: "⚠",
};

function OpsBlock({ section }: { section: OpsSection }) {
  const icon = SECTION_ICONS[section.title] ?? "·";
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-snap-yellow text-xs">{icon}</span>
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {section.title}
        </h4>
      </div>
      <ul className="space-y-1.5 pl-4 border-l-2 border-gray-100">
        {section.items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-700 leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="pl-4 border-l-2 border-gray-100 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TravelOutput({ itinerary, isLoading, generateError, aiMode }: Props) {
  const sections: OpsSection[] = itinerary
    ? [
        itinerary.travel,
        itinerary.lodging,
        itinerary.gameDay,
        itinerary.contentPlan,
        itinerary.checklist,
        itinerary.risks,
      ]
    : [];

  return (
    <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-snap-black">Output</h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : generateError ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">Generation failed</p>
          <p className="mt-1 text-xs text-red-600">{generateError}</p>
        </div>
      ) : !itinerary ? (
        <div className="mt-6 text-gray-400 text-sm">
          Fill in a destination and hit{" "}
          <span className="font-semibold text-gray-600">Generate plan</span>.
        </div>
      ) : (
        <div className="mt-5">
          {/* Header */}
          <div className="flex items-start gap-2">
            <h3 className="text-base font-bold text-snap-black leading-tight flex-1">
              {itinerary.headline}
            </h3>
            {aiMode && (
              <span className="shrink-0 rounded-full bg-snap-yellow/20 px-2 py-0.5 text-xs font-semibold text-snap-black">
                AI
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
            {itinerary.assumptions}
          </p>

          {/* Ops sections */}
          <div className="mt-5 space-y-5 divide-y divide-gray-100">
            {sections.map((section) => (
              <div key={section.title} className="pt-5 first:pt-0">
                <OpsBlock section={section} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
