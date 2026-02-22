import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RoutePageContent from "@/components/RoutePageContent";
import type { Route } from "@/types";
import routesData from "../../../../data/routes.json";

const routes = routesData as Route[];

export function generateStaticParams() {
  return routes.map((route) => ({ id: route.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return {
    title: `Rute – Kirkeblad Nørresundby`,
    description: `Se ruten for kirkebladsomdeling i Nørresundby`,
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = routes.find((r) => r.id === id);
  if (!route) notFound();

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Alle ruter
      </Link>

      <header className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Image
            src="/logo.png"
            alt="Nørresundby Spejderne"
            width={100}
            height={40}
            className="shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Rute {route.id}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {route.antalBlade} blade &middot; {route.streets.length} gader
            </p>
          </div>
        </div>
      </header>

      <RoutePageContent route={route} />
    </main>
  );
}
