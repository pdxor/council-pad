/**
 * 404 Not Found Page
 * App Router convention for handling 404 errors
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-futurist-light flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-futurist-teal mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-futurist-dark-text mb-6">
          Page Not Found
        </h2>
        <p className="text-futurist-muted-text mb-8 max-w-md">
          The council cannot locate the wisdom you seek. Perhaps it lies elsewhere.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 rounded-council font-medium text-sm transition-all duration-council bg-futurist-teal text-white hover:bg-futurist-navy"
        >
          Return to Council
        </Link>
      </div>
    </div>
  );
}
