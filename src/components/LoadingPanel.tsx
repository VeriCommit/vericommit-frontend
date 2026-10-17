export default function LoadingPanel() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent dark:border-zinc-500"
      />
      <span>Evaluating the milestone. This may take a moment.</span>
    </div>
  );
}
