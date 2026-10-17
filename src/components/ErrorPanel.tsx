"use client";

import { useEffect, useRef } from "react";
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the error heading so keyboard and screen reader users are
  // taken to the failure. The message below carries role="alert", so the
  // heading is not announced twice.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="flex flex-col gap-3 rounded border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-semibold text-red-800 dark:text-red-200"
      >
        Evaluation could not be completed
      </h2>
      <p role="alert" className="break-words text-red-900 dark:text-red-100">
        {message}
      </p>

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
              <dd className="min-w-0 break-words">{failure.error.code}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Message:</dt>
              <dd className="min-w-0 break-words">{failure.error.message}</dd>
            </div>
          </dl>
        </details>
      )}
    </section>
  );
}
