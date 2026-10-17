"use client";

import type { EvaluationResponse } from "@/types/evaluation";
import { appConfig } from "@/lib/config";
import { groupCriteriaByStatus } from "@/lib/report";
import ReviewerDecision from "./ReviewerDecision";

const SAMPLE_LABEL =
  "Sample evidence — demonstration data, not verified GitHub evidence.";
const MOCK_LABEL = "Mock evaluation — demo only.";
const HUMAN_REVIEW_NOTICE =
  "Human review is required. This report is advisory and does not approve milestones or release funds.";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { symbol: string; label: string }> = {
    supported: { symbol: "✓", label: "Supported" },
    insufficient_evidence: { symbol: "○", label: "Insufficient evidence" },
    uncertain: { symbol: "?", label: "Uncertain" },
  };
  const entry = map[status] ?? { symbol: "•", label: status };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium dark:bg-zinc-800">
      <span aria-hidden="true">{entry.symbol}</span>
      {entry.label}
    </span>
  );
}

function EvidenceItem({
  type,
  title,
  url,
}: {
  type: string;
  title: string;
  url: string | null;
}) {
  return (
    <li className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {type}
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline dark:text-blue-400"
        >
          {title}
        </a>
      ) : (
        <span>
          {title}{" "}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            (No external URL)
          </span>
        </span>
      )}
    </li>
  );
}

export default function EvaluationReport({
  report,
  onBackToForm,
}: {
  report: EvaluationResponse;
  onBackToForm: () => void;
}) {
  const groups = groupCriteriaByStatus(report.criteria_results);

  return (
    <article className="flex flex-col gap-6">
      {/* Evidence-source and mock labels, shown prominently at the top. */}
      <div className="flex flex-col gap-2">
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          {SAMPLE_LABEL}
        </p>
        {appConfig.useMock && (
          <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            {MOCK_LABEL}
          </p>
        )}
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Evaluation {report.evaluation_id}
        </p>
        <h2 className="text-2xl font-semibold">{report.project_name}</h2>
        <h3 className="text-lg font-medium">{report.milestone_title}</h3>
        <p className="leading-relaxed">{report.overall_summary}</p>
      </header>

      <ReviewerDecision
        key={report.evaluation_id}
        evaluationId={report.evaluation_id}
      />

      <section
        aria-live="polite"
        className="rounded border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <p className="font-medium">{HUMAN_REVIEW_NOTICE}</p>
      </section>

      <section className="flex flex-col gap-4">
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          {SAMPLE_LABEL}
        </p>
        {appConfig.useMock && (
          <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            {MOCK_LABEL}
          </p>
        )}

        {groups.map((group) => (
          <div key={group.status} className="flex flex-col gap-3">
            <h4 className="text-lg font-semibold">{group.heading}</h4>
            {group.results.map((result) => (
              <div
                key={result.criterion}
                className="flex flex-col gap-2 rounded border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={result.status} />
                  <span className="font-medium">{result.criterion}</span>
                </div>
                {result.status === "insufficient_evidence" && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Not demonstrated by the available evidence. This does not
                    necessarily mean the work was not completed.
                  </p>
                )}
                <p className="leading-relaxed">{result.explanation}</p>
                {result.evidence.length === 0 ? (
                  <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="font-medium">
                      No supporting evidence was identified for this criterion.
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      This does not necessarily mean the work was not
                      completed. The available evidence may be insufficient to
                      establish whether the criterion has been satisfied.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {result.evidence.map((item, index) => (
                      <EvidenceItem
                        key={`${item.title}-${index}`}
                        type={item.type}
                        title={item.title}
                        url={item.url}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold">Suggested next steps</h4>
        <ul className="list-disc pl-5">
          {report.suggested_next_steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold">Limitations</h4>
        <ul className="list-disc pl-5">
          {report.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      {onBackToForm && (
        <button
          type="button"
          onClick={onBackToForm}
          className="self-start rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        >
          Back to form
        </button>
      )}
    </article>
  );
}
