"use client";

import { useEffect, useRef, useState } from "react";
import type { EvaluationRequest, EvaluationResponse } from "@/types/evaluation";
import { evaluate, type EvaluateResult } from "@/lib/api/client";
import type { EvaluateFailure } from "@/lib/errors";
import MilestoneForm from "./MilestoneForm";
import LoadingPanel from "./LoadingPanel";
import ErrorPanel from "./ErrorPanel";
import EvaluationReport from "./EvaluationReport";

type FlowState =
  | { view: "idle" }
  | { view: "loading" }
  | { view: "success"; data: EvaluationResponse }
  | { view: "error"; failure: EvaluateFailure };

export default function EvaluationFlow() {
  const [state, setState] = useState<FlowState>({ view: "idle" });
  const isLoading = state.view === "loading";
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousView = useRef(state.view);

  // When returning to the form, move focus to its heading so keyboard and
  // screen reader users land on the form they are editing again.
  useEffect(() => {
    const cameFrom = previousView.current;
    previousView.current = state.view;
    if (state.view === "idle" && cameFrom !== "idle") {
      formHeadingRef.current?.focus();
    }
  }, [state.view]);

  async function handleSubmit(request: EvaluationRequest) {
    if (isLoading) {
      return;
    }
    setState({ view: "loading" });

    const result: EvaluateResult = await evaluate(request);
    if (result.ok) {
      setState({ view: "success", data: result.data });
    } else {
      setState({ view: "error", failure: result });
    }
  }

  function backToForm() {
    setState({ view: "idle" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The form stays mounted so the user's input is preserved when
          returning from the loading, error or report views. */}
      <div hidden={state.view !== "idle"}>
        <MilestoneForm
          onSubmit={handleSubmit}
          submitting={isLoading}
          headingRef={formHeadingRef}
        />
      </div>

      {state.view === "loading" && <LoadingPanel />}

      {state.view === "error" && (
        <ErrorPanel failure={state.failure} onBackToForm={backToForm} />
      )}

      {state.view === "success" && (
        <EvaluationReport report={state.data} onBackToForm={backToForm} />
      )}
    </div>
  );
}
