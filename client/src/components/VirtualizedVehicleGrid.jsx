import React, { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import VehicleCard from './VehicleCard.jsx';
import VehicleCardSkeleton from './VehicleCardSkeleton.jsx';

export default function VirtualizedVehicleGrid({ filteredVehicles, fetchNextPage, hasMore, isLoading }) {
  const parentRef = useRef(null);
  // Initialize columnCount to 0 to prevent rendering until it's calculated
  const [columnCount, setColumnCount] = useState(0);

  // Use an effect to responsively calculate the number of columns
  useEffect(() => {
    if (!parentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const width = parentRef.current.offsetWidth;
      setColumnCount(Math.max(1, Math.floor(width / 300)));
    });

    resizeObserver.observe(parentRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const rowCount = columnCount > 0 ? Math.ceil(filteredVehicles.length / columnCount) : 0;
  const count = hasMore ? rowCount + 1 : rowCount;

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 196,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];
    if (lastItem && lastItem.index >= rowCount - 1 && hasMore && !isLoading) {
      fetchNextPage();
    }
  }, [virtualRows, rowCount, hasMore, isLoading, fetchNextPage]);

  return (
    <div ref={parentRef} className="w-full h-[calc(100vh-200px)] overflow-auto">
      {/* Only render the grid if the column count has been calculated */}
      {columnCount > 0 && (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= rowCount;
            
            return (
              <div
                key={virtualRow.key}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderRow
                  ? Array.from({ length: columnCount }).map((_, i) => <VehicleCardSkeleton key={i} />)
                  : filteredVehicles
                      .slice(
                        virtualRow.index * columnCount,
                        virtualRow.index * columnCount + columnCount
                      )
                      .map((vehicle) => <VehicleCard key={vehicle.id} v={vehicle} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}