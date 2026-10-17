import { appConfig } from "@/lib/config";

export default function MockModeBanner() {
  if (!appConfig.useMock) {
    return null;
  }

  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      Mock mode: responses are simulated
    </div>
  );
}
