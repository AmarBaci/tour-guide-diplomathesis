import React from 'react';

/**
 * Skeleton loading placeholder.
 *
 * Usage:
 *   <Skeleton className="h-6 w-48 rounded" />
 *   <Skeleton.Card />   — a card-shaped skeleton
 *   <Skeleton.Row />    — a single row skeleton
 *   <Skeleton.Avatar /> — a circular avatar skeleton
 */
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

Skeleton.Card = function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
      <Skeleton className="h-4 w-2/3 rounded-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 rounded-full ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
};

Skeleton.Row = function SkeletonRow() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ size = 10 }) {
  return <Skeleton className={`h-${size} w-${size} rounded-full`} />;
};

export default Skeleton;
