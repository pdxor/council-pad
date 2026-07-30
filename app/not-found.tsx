/**
 * 404 Not Found Page
 * App Router convention for handling 404 errors
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-futurist-navy flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-futurist-gold mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-futurist-cream mb-6 uppercase tracking-wider">
          Page Not Found
        </h2>
        <p className="text-futurist-muted mb-8 max-w-md">
          The council cannot locate the wisdom you seek. Perhaps it lies elsewhere.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 border-2 border-futurist-gold rounded-council font-semibold uppercase tracking-wider text-sm transition-all duration-council bg-futurist-gold text-futurist-navy hover:bg-futurist-gold-light"
        >
          Return to Council
        </Link>
      </div>
    </div>
  );
}
