"use client";

import { useState } from "react";
import MilestoneForm from "@/components/MilestoneForm";
import type { EvaluationRequest } from "@/types/evaluation";

export default function Home() {
  const [submitted, setSubmitted] = useState<EvaluationRequest | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Evaluate a milestone</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define a milestone and its acceptance criteria. This demo uses sample
          evidence.
        </p>
      </header>

      <MilestoneForm onSubmit={setSubmitted} />

      {submitted && (
        <section className="flex flex-col gap-2" aria-live="polite">
          <h2 className="text-lg font-medium">Submitted request</h2>
          {/*
            TEMPORARY PLACEHOLDER: shows the submitted payload as JSON so the
            form can be verified. This will be replaced by the evaluation flow
            (API client, report UI) in a later issue.
          */}
          <pre className="overflow-x-auto rounded border border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
