// Placeholder for sections that arrive in a later phase of the roadmap.
export function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="flex flex-col gap-3 py-12 text-center">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="text-muted">
        Bientôt disponible : cette section arrive avec la phase {phase}.
      </p>
    </div>
  );
}
