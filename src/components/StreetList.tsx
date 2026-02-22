import { getStreetColor } from "@/lib/colors";
import type { Street } from "@/types";

interface StreetListProps {
  streets: Street[];
  notes: string[];
}

export default function StreetList({ streets, notes }: StreetListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-800">Gader</h2>
      <ul className="space-y-1.5">
        {streets.map((street, i) => (
          <li key={`${street.name}-${i}`} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStreetColor(i) }}
            />
            <div>
              <span className="font-medium text-slate-800">{street.name}</span>
              {street.details && (
                <span className="text-sm text-slate-500 ml-1">
                  ({street.details})
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {notes.length > 0 && (
        <div className="mt-3 space-y-1">
          {notes.map((note, i) => (
            <div
              key={i}
              className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded px-3 py-2"
            >
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
