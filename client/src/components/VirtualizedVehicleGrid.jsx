import React, { useRef, useCallback, useEffect } from 'react'; // Add useEffect here
import { useVirtualizer } from '@tanstack/react-virtual';
import VehicleCard from './VehicleCard.jsx';
import VehicleCardSkeleton from './VehicleCardSkeleton.jsx';

export default function VirtualizedVehicleGrid({ filteredVehicles, fetchNextPage, hasMore, isLoading }) {
  const parentRef = useRef();

  const count = hasMore ? filteredVehicles.length + 1 : filteredVehicles.length;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimate the height of each row
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const lastItem = virtualItems[virtualItems.length - 1];
  useEffect(() => {
    if (lastItem && lastItem.index >= filteredVehicles.length - 1 && hasMore && !isLoading) {
      fetchNextPage();
    }
  }, [lastItem, filteredVehicles.length, hasMore, isLoading, fetchNextPage]);

  return (
    <div ref={parentRef} className="w-full h-[calc(100vh-200px)] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-2"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index > filteredVehicles.length - 1;
            const vehicle = filteredVehicles[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
              >
                {isLoaderRow ? (
                  <VehicleCardSkeleton />
                ) : (
                  <VehicleCard v={vehicle} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}