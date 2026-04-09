export function PartDivider({
  number,
  title,
  summary,
  epigraph,
}: {
  number: string;
  title: string;
  summary?: string;
  epigraph?: string;
}) {
  return (
    <div className="py-16 md:py-24 text-center">
      <p
        className="text-4xl md:text-5xl mb-4"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 100 }}
      >
        {number}
      </p>
      <h2
        className="text-xl md:text-2xl mb-6"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
      >
        {title}
      </h2>
      {summary && (
        <p className="text-sm italic text-muted max-w-md mx-auto">{summary}</p>
      )}
      {epigraph && (
        <p className="text-sm italic text-muted max-w-md mx-auto mt-4">
          {epigraph}
        </p>
      )}
    </div>
  );
}
