import EvaluationFlow from "@/components/EvaluationFlow";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Evaluate a milestone</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define a milestone and its acceptance criteria. This demo uses sample
          evidence.
        </p>
      </header>

      <EvaluationFlow />
    </div>
  );
}
