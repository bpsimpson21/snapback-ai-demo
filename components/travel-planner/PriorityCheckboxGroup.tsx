"use client";

import { TravelInputs } from "@/types/travel";

type Props = {
  priorities: TravelInputs["priorities"];
  onChange: (key: keyof TravelInputs["priorities"], checked: boolean) => void;
};

const PRIORITY_OPTIONS: { key: keyof TravelInputs["priorities"]; label: string }[] = [
  { key: "lowFriction", label: "Low friction" },
  { key: "bestSeats", label: "Best seats" },
  { key: "contentMoments", label: "Content moments" },
  { key: "recovery", label: "Recovery-aware" },
];

export default function PriorityCheckboxGroup({ priorities, onChange }: Props) {
  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Priorities</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {PRIORITY_OPTIONS.map((p) => (
          <label
            key={p.key}
            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              className="accent-snap-yellow w-4 h-4 cursor-pointer"
              checked={priorities[p.key]}
              onChange={(e) => onChange(p.key, e.target.checked)}
            />
            {p.label}
          </label>
        ))}
      </div>
    </div>
  );
}
