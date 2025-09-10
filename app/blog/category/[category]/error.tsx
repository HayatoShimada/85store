'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Category page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-8">An error occurred while loading the category page.</p>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Try again
          </button>
          
          <div className="text-sm text-gray-500">or</div>
          
          <Link 
            href="/blog"
            className="inline-block text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
