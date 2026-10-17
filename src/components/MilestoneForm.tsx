"use client";

import { useId, useState } from "react";
import type { RefObject } from "react";
import type { EvaluationRequest } from "@/types/evaluation";
import {
  validateAcceptanceCriteria,
  validateRepositoryUrl,
  validateRequired,
} from "@/lib/validation";

const DEMO_REPOSITORY_URL = "https://github.com/example/demo";

interface MilestoneFormProps {
  onSubmit: (request: EvaluationRequest) => void;
  submitting?: boolean;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

interface FormErrors {
  project_name: string | null;
  repository_url: string | null;
  milestone_title: string | null;
  milestone_description: string | null;
  acceptance_criteria: (string | null)[];
  acceptance_criteria_form: string | null;
}

const EMPTY_ERRORS: FormErrors = {
  project_name: null,
  repository_url: null,
  milestone_title: null,
  milestone_description: null,
  acceptance_criteria: [],
  acceptance_criteria_form: null,
};

export default function MilestoneForm({
  onSubmit,
  submitting = false,
  headingRef,
}: MilestoneFormProps) {
  const ids = {
    formHeading: useId(),
    projectName: useId(),
    repositoryUrl: useId(),
    repositoryUrlNote: useId(),
    milestoneTitle: useId(),
    milestoneDescription: useId(),
    sourceNote: useId(),
    criteria: useId(),
  };

  const [projectName, setProjectName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState(DEMO_REPOSITORY_URL);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);

  function updateCriterion(index: number, value: string) {
    setCriteria((current) =>
      current.map((criterion, i) => (i === index ? value : criterion)),
    );
  }

  function addCriterion() {
    setCriteria((current) => [...current, ""]);
  }

  function removeCriterion(index: number) {
    setCriteria((current) =>
      current.length > 1 ? current.filter((_, i) => i !== index) : current,
    );
  }

  function validate(): FormErrors {
    const criteriaResult = validateAcceptanceCriteria(criteria);

    return {
      project_name: validateRequired(projectName, "a project name"),
      repository_url: validateRepositoryUrl(repositoryUrl),
      milestone_title: validateRequired(milestoneTitle, "a milestone title"),
      milestone_description: validateRequired(
        milestoneDescription,
        "a milestone description",
      ),
      acceptance_criteria: criteriaResult.itemErrors,
      acceptance_criteria_form: criteriaResult.formError,
    };
  }

  function hasErrors(result: FormErrors): boolean {
    return (
      result.project_name !== null ||
      result.repository_url !== null ||
      result.milestone_title !== null ||
      result.milestone_description !== null ||
      result.acceptance_criteria_form !== null ||
      result.acceptance_criteria.some((error) => error !== null)
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const result = validate();
    setErrors(result);
    if (hasErrors(result)) {
      return;
    }

    const request: EvaluationRequest = {
      project_name: projectName,
      repository_url: repositoryUrl,
      milestone: {
        title: milestoneTitle,
        description: milestoneDescription,
        acceptance_criteria: criteria,
      },
      evidence_source: "sample",
    };

    onSubmit(request);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <h2
        id={ids.formHeading}
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-semibold"
      >
        Milestone details
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.projectName} className="font-medium">
          Project name
        </label>
        <input
          id={ids.projectName}
          name="project_name"
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          aria-invalid={errors.project_name !== null}
          aria-describedby={
            errors.project_name ? `${ids.projectName}-error` : undefined
          }
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.project_name && (
          <p
            id={`${ids.projectName}-error`}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.project_name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.repositoryUrl} className="font-medium">
          GitHub repository URL
        </label>
        <input
          id={ids.repositoryUrl}
          name="repository_url"
          type="url"
          value={repositoryUrl}
          onChange={(event) => setRepositoryUrl(event.target.value)}
          aria-invalid={errors.repository_url !== null}
          aria-describedby={`${ids.repositoryUrlNote}${
            errors.repository_url ? ` ${ids.repositoryUrl}-error` : ""
          }`}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <p
          id={ids.repositoryUrlNote}
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          Required for both evidence modes. Sample evidence is synthetic and
          not necessarily retrieved from this repository.
        </p>
        {errors.repository_url && (
          <p
            id={`${ids.repositoryUrl}-error`}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.repository_url}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-medium">Evidence source</span>
        <p
          id={ids.sourceNote}
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          Sample evidence — demonstration data, not verified GitHub evidence.
          This demo uses sample evidence only.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.milestoneTitle} className="font-medium">
          Milestone title
        </label>
        <input
          id={ids.milestoneTitle}
          name="milestone_title"
          type="text"
          value={milestoneTitle}
          onChange={(event) => setMilestoneTitle(event.target.value)}
          aria-invalid={errors.milestone_title !== null}
          aria-describedby={
            errors.milestone_title ? `${ids.milestoneTitle}-error` : undefined
          }
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.milestone_title && (
          <p
            id={`${ids.milestoneTitle}-error`}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.milestone_title}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.milestoneDescription} className="font-medium">
          Milestone description
        </label>
        <textarea
          id={ids.milestoneDescription}
          name="milestone_description"
          rows={3}
          value={milestoneDescription}
          onChange={(event) => setMilestoneDescription(event.target.value)}
          aria-invalid={errors.milestone_description !== null}
          aria-describedby={
            errors.milestone_description
              ? `${ids.milestoneDescription}-error`
              : undefined
          }
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.milestone_description && (
          <p
            id={`${ids.milestoneDescription}-error`}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.milestone_description}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Acceptance criteria</legend>
        {criteria.map((criterion, index) => {
          const error = errors.acceptance_criteria[index] ?? null;
          const inputId = `${ids.criteria}-${index}`;
          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label htmlFor={inputId} className="sr-only">
                  Acceptance criterion {index + 1}
                </label>
                <input
                  id={inputId}
                  type="text"
                  value={criterion}
                  onChange={(event) => updateCriterion(index, event.target.value)}
                  aria-invalid={error !== null}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  className="min-w-0 flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  disabled={criteria.length <= 1}
                  aria-label={`Remove acceptance criterion ${index + 1}`}
                  className="rounded border border-zinc-300 px-3 py-2 disabled:opacity-40 dark:border-zinc-700"
                >
                  Remove
                </button>
              </div>
              {error && (
                <p
                  id={`${inputId}-error`}
                  role="alert"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={addCriterion}
            className="self-start rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            Add criterion
          </button>
          {errors.acceptance_criteria_form && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errors.acceptance_criteria_form}
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="self-start rounded bg-black px-5 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Evaluate milestone
      </button>
    </form>
  );
}
