import React from 'react';

/**
 * Empty state display when a list/section has no data.
 *
 * Usage:
 *   <EmptyState icon="📭" title="No bookings yet" description="Explore tours to get started." />
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
