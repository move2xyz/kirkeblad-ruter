import Image from "next/image";
import RouteCard from "@/components/RouteCard";
import type { Route } from "@/types";
import routesData from "../../data/routes.json";

export default function Home() {
  const routes = routesData as Route[];

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <header className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt="Nørresundby Spejderne"
          width={200}
          height={80}
          className="mx-auto mb-3"
          priority
        />
        <h1 className="text-2xl font-bold text-slate-900">
          Kirkeblad Ruter
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Nørresundby &middot; {routes.length} ruter
        </p>
      </header>
      <div className="grid gap-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </main>
  );
}
