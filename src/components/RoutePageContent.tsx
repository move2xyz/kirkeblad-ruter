"use client";

import dynamic from "next/dynamic";
import StreetList from "@/components/StreetList";
import FeedbackSection from "@/components/FeedbackSection";
import InfoSection from "@/components/InfoSection";
import type { Route } from "@/types";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
      <span className="text-slate-400">Indlæser kort...</span>
    </div>
  ),
});

interface RoutePageContentProps {
  route: Route;
}

export default function RoutePageContent({ route }: RoutePageContentProps) {
  const streetNames = route.streets.map((s) => s.name);

  return (
    <>
      {/* Map */}
      <section className="mb-6">
        <RouteMap routeId={route.id} streetNames={streetNames} />
      </section>

      {/* Street List */}
      <section className="mb-6">
        <StreetList streets={route.streets} notes={route.notes} />
      </section>

      {/* Route Note */}
      {route.routeNote && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Note</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-900 whitespace-pre-line">
            {route.routeNote}
          </div>
        </section>
      )}

      {/* Door Codes */}
      {route.koder && (
        <section className="mb-6">
          <details className="group">
            <summary className="text-lg font-semibold text-slate-800 cursor-pointer select-none flex items-center gap-1">
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Dørkoder
            </summary>
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-900 whitespace-pre-line">
              {route.koder}
            </div>
          </details>
        </section>
      )}

      {/* Feedback */}
      <section className="mb-6">
        <FeedbackSection routeId={route.id} />
      </section>

      {/* Practical Info */}
      <section className="mb-8">
        <InfoSection />
      </section>
    </>
  );
}
