'use client';

import { useEffect, useRef, useState } from 'react';

interface ViewTrackerProps {
  slug: string;
  initialViews?: number;
  showCount?: boolean;
}

export function ViewTracker({ slug, initialViews = 0, showCount = true }: ViewTrackerProps) {
  const [views, setViews] = useState(initialViews);
  const [isLoading, setIsLoading] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track view once per page load
    if (hasTracked.current) return;

    const trackView = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/views/${slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setViews(data.views);
          hasTracked.current = true;
          console.log(`View tracked for ${slug}: ${data.views} views`);
        } else {
          console.error('Failed to track view:', response.statusText);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Delay tracking slightly to ensure page is fully loaded
    const timer = setTimeout(() => {
      trackView();
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  if (!showCount) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span>
        {isLoading ? (
          <span className="inline-block w-12 h-4 bg-gray-200 rounded animate-pulse"></span>
        ) : (
          `${views.toLocaleString()} views`
        )}
      </span>
    </div>
  );
}