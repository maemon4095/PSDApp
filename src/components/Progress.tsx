import type { h } from "preact";
export default function Progress(
  { progress, status }: { progress: number; status: string },
) {
  const percentage = Math.min(Math.max(progress, 0), 100) * 100;
  return (
    <div class="p-1 flex flex-col items-stretch">
      <div>
        <span class="text-gray-600 text-sm">{percentage.toFixed(1)}%</span>
      </div>
      <div class="border h-4 shadow-inner rounded">
        <div
          class="bg-sky-700 h-full rounded"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div class="mt-1">
        <span class="text-gray-600 text-sm">{status}</span>
      </div>
    </div>
  );
}
