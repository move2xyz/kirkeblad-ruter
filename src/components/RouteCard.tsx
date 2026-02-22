import Link from "next/link";
import type { Route } from "@/types";

interface RouteCardProps {
  route: Route;
}

export default function RouteCard({ route }: RouteCardProps) {
  const streetPreview = route.streets
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ");
  const moreCount = route.streets.length - 3;

  return (
    <Link
      href={`/rute/${route.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.98]"
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800">Rute {route.id}</h2>
        <span className="text-sm font-medium text-slate-500">
          {route.antalBlade} blade
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">
        {streetPreview}
        {moreCount > 0 && (
          <span className="text-slate-400"> +{moreCount} mere</span>
        )}
      </p>
    </Link>
  );
}
