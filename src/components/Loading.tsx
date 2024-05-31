export default function Loading({ name }: { name: string }) {
  return (
    <div class="min-w-0 min-h-0 w-96 rounded-md border bg-slate-300 shadow p-2 pt-1 flex flex-col">
      <div>
        <span>読み込み中</span>
      </div>
      <div class="flex flex-col p-2 bg-slate-200 rounded border">
        <div class="child-center">
          <span>{name}</span>
        </div>
        <div class="loading-bar mt-1"></div>
      </div>
    </div>
  );
}
