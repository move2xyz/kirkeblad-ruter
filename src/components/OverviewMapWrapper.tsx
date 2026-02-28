"use client";

import dynamic from "next/dynamic";
import type { Route } from "@/types";

const OverviewMap = dynamic(() => import("@/components/OverviewMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
      <span className="text-slate-400">Indlæser kort...</span>
    </div>
  ),
});

interface OverviewMapWrapperProps {
  routes: Route[];
}

export default function OverviewMapWrapper({
  routes,
}: OverviewMapWrapperProps) {
  return <OverviewMap routes={routes} />;
}
