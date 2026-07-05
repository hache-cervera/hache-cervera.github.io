export default function Footer() {
  return (
    <footer className="relative">
      <div className="absolute inset-0 z-0 bg-ink" aria-hidden="true" />
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-8 text-sm text-white/40 md:flex-row md:px-12">
        <p>&copy; 2026 Hache Cervera. Built by hand in Valencia.</p>
        <p className="font-display">
          Design <span className="text-accent">→</span> Code <span className="text-accent">→</span> Motion{' '}
          <span className="text-accent">→</span> SEO
        </p>
      </div>
    </footer>
  );
}
