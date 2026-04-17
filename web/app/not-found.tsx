import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-bold text-brand-500">404</div>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
      >
        Back to deals
      </Link>
    </div>
  );
}
