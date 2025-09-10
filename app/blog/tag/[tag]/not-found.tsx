import Link from 'next/link';

export default function TagNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tag Not Found</h2>
        <p className="text-gray-600 mb-8">The tag you&apos;re looking for doesn&apos;t exist.</p>
        
        <Link 
          href="/blog"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
