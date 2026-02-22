interface FeedbackSectionProps {
  routeId: string;
}

// Google Forms URLs - replace with your actual form URLs
const DONE_FORM_BASE = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform";
const PROBLEM_FORM_BASE = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform";

export default function FeedbackSection({ routeId }: FeedbackSectionProps) {
  const doneUrl = `${DONE_FORM_BASE}?usp=pp_url&entry.FIELD_ID=Rute+${encodeURIComponent(routeId)}`;
  const problemUrl = `${PROBLEM_FORM_BASE}?usp=pp_url&entry.FIELD_ID=Rute+${encodeURIComponent(routeId)}`;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">Feedback</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={doneUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-white font-semibold text-lg shadow-sm hover:bg-green-700 active:bg-green-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Jeg er færdig
        </a>
        <a
          href={problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-4 text-white font-semibold text-lg shadow-sm hover:bg-amber-600 active:bg-amber-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Meld et problem
        </a>
      </div>
    </div>
  );
}
