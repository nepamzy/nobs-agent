export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-brass)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass)] focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
