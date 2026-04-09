export function CalloutBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="callout-box my-6">
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
