"use client";

export default function InfoSection() {
  return (
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
        Praktisk info
      </summary>
      <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 space-y-3">
        <div>
          <p className="font-semibold text-slate-900">Alle skal have et kirkeblad</p>
          <p>Også hvis der står &quot;Reklamer nej tak&quot;.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Afhentning</p>
          <p>
            Spejderhytten Skrænten, brændeskuret. Hent bladene så hurtigt som
            muligt.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Tips til opgange</p>
          <p>
            Ring på og sig: &quot;Vi er ude med kirkebladet og kommer fra
            Nørresundby Spejderne.&quot;
          </p>
          <p className="mt-1">
            Hvis nogen siger de ikke er medlem: &quot;Det er helt fint, der er
            sikkert nogle af jeres naboer, der er.&quot;
          </p>
        </div>
      </div>
    </details>
  );
}
