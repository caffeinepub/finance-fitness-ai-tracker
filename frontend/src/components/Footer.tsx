export default function Footer() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'finfit-app';
  const appId = encodeURIComponent(hostname || 'finfit-app');
  const year = new Date().getFullYear();

  return (
    <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border bg-card/50">
      <p>
        © {year} FinFit · Built with{' '}
        <span className="text-destructive">♥</span>{' '}
        using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-accent hover:underline"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}
