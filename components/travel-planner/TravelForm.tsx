"use client";

import { TravelInputs } from "@/types/travel";
import PriorityCheckboxGroup from "./PriorityCheckboxGroup";

type Props = {
  inputs: TravelInputs;
  onChange: (inputs: TravelInputs) => void;
  onGenerate: () => void;
  isLoading: boolean;
  destError: boolean;
  aiMode: boolean;
  onToggleAiMode: () => void;
};

const INPUT_BASE =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-snap-yellow focus:border-transparent transition";

export default function TravelForm({ inputs, onChange, onGenerate, isLoading, destError, aiMode, onToggleAiMode }: Props) {
  return (
    <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-snap-black">Inputs</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Origin</span>
          <input
            className={INPUT_BASE}
            value={inputs.origin}
            onChange={(e) => onChange({ ...inputs, origin: e.target.value })}
            placeholder="Clemson, SC"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Destination <span className="text-red-500">*</span>
          </span>
          <input
            className={`${INPUT_BASE} ${destError ? "border-red-400 ring-2 ring-red-300" : ""}`}
            value={inputs.destination}
            onChange={(e) => {
              onChange({ ...inputs, destination: e.target.value });
            }}
            placeholder="Atlanta, GA"
          />
          {destError && (
            <span className="text-xs text-red-500 mt-0.5">Destination is required.</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Depart date</span>
          <input
            className={INPUT_BASE}
            value={inputs.departDate}
            onChange={(e) => onChange({ ...inputs, departDate: e.target.value })}
            placeholder="Fri, Mar 14"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Return date</span>
          <input
            className={INPUT_BASE}
            value={inputs.returnDate}
            onChange={(e) => onChange({ ...inputs, returnDate: e.target.value })}
            placeholder="Sun, Mar 16"
          />
        </label>

        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Budget</span>
          <input
            className={INPUT_BASE}
            value={inputs.budget}
            onChange={(e) => onChange({ ...inputs, budget: e.target.value })}
            placeholder="$500–$900"
          />
        </label>

        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vibe</span>
          <select
            className={INPUT_BASE}
            value={inputs.vibe}
            onChange={(e) => onChange({ ...inputs, vibe: e.target.value as TravelInputs["vibe"] })}
          >
            <option value="value" className="bg-white text-gray-900">Value-first</option>
            <option value="balanced" className="bg-white text-gray-900">Balanced</option>
            <option value="premium" className="bg-white text-gray-900">Premium</option>
          </select>
        </label>
      </div>

      <PriorityCheckboxGroup
        priorities={inputs.priorities}
        onChange={(key, checked) =>
          onChange({ ...inputs, priorities: { ...inputs.priorities, [key]: checked } })
        }
      />

      {/* AI Mode toggle */}
      <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">AI Mode</span>
          <span className="rounded-full bg-snap-yellow/20 px-2 py-0.5 text-xs font-semibold text-snap-black">
            Beta
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={aiMode}
          onClick={onToggleAiMode}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-snap-yellow focus:ring-offset-1 ${
            aiMode ? "bg-snap-yellow" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              aiMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {aiMode && (
        <p className="mt-2 text-xs text-gray-500">
          Calls{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-700">
            /api/generate-itinerary
          </code>
          . Swap in a real model via{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-700">
            OPENAI_API_KEY
          </code>{" "}
          or{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-700">
            ANTHROPIC_API_KEY
          </code>{" "}
          in{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-700">.env.local</code>.
        </p>
      )}

      <button
        className="mt-4 w-full bg-snap-yellow text-snap-black font-semibold rounded-lg py-3 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        onClick={onGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-snap-black/30 border-t-snap-black rounded-full animate-spin" />
            {aiMode ? "Calling AI..." : "Generating..."}
          </>
        ) : aiMode ? (
          "Generate with AI"
        ) : (
          "Generate plan"
        )}
      </button>

      <p className="text-xs text-gray-400 mt-3">
        {aiMode
          ? "AI Mode is on — results come from the API route, not the local builder."
          : "Toggle AI Mode above to call the API route instead of the deterministic builder."}
      </p>
    </section>
  );
}
