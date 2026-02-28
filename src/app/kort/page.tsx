import Link from "next/link";
import Image from "next/image";
import OverviewMapWrapper from "@/components/OverviewMapWrapper";
import type { Route } from "@/types";
import routesData from "../../../data/routes.json";

export const metadata = {
  title: "Samlet kort - Kirkeblad Ruter",
  description: "Oversigt over alle kirkebladruter i Nørresundby på ét kort",
};

export default function KortPage() {
  const routes = routesData as Route[];

  return (
    <main className="min-h-screen px-4 py-4 max-w-5xl mx-auto flex flex-col">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <Image
          src="/logo.png"
          alt="Nørresundby Spejderne"
          width={120}
          height={48}
          className="h-8 w-auto"
        />
        <div>
          <h1 className="text-lg font-bold text-slate-900">Samlet kort</h1>
          <p className="text-xs text-slate-500">
            {routes.length} ruter &middot; Klik på en rute i listen for at
            fremhæve
          </p>
        </div>
      </header>

      <div className="flex-1">
        <OverviewMapWrapper routes={routes} />
      </div>
    </main>
  );
}
