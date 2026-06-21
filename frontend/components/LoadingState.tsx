export function LoadingState({ label = "Loading data" }: { label?: string }) {
  return (
    <div className="enterprise-panel p-6 text-sm text-slate-600">
      {label}...
    </div>
  );
}
