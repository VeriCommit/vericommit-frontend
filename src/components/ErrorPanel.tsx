"use client";

import { getUserMessage } from "@/lib/errors";
import type { EvaluateFailure } from "@/lib/errors";

export default function ErrorPanel({
  failure,
  onBackToForm,
}: {
  failure: EvaluateFailure;
  onBackToForm: () => void;
}) {
  const message = getUserMessage(failure);
  const isApi = failure.kind === "api";

  return (
    <section
      role="alert"
      className="flex flex-col gap-3 rounded border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950"
    >
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Evaluation could not be completed
      </h2>
      <p className="text-red-900 dark:text-red-100">{message}</p>

      <button
        type="button"
        onClick={onBackToForm}
        className="self-start rounded border border-red-300 px-4 py-2 text-red-900 dark:border-red-700 dark:text-red-100"
      >
        Back to form
      </button>

      {isApi && (
        <details className="text-sm">
          <summary className="cursor-pointer">Technical details</summary>
          <dl className="mt-2 flex flex-col gap-1">
            <div className="flex gap-2">
              <dt className="font-medium">HTTP status:</dt>
              <dd>{failure.status}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Error code:</dt>
              <dd>{failure.error.code}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Message:</dt>
              <dd>{failure.error.message}</dd>
            </div>
          </dl>
        </details>
      )}
    </section>
  );
}
