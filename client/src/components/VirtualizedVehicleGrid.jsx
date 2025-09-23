import React, { useRef, useEffect, useState, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import VehicleCard from './VehicleCard.jsx';
import VehicleCardSkeleton from './VehicleCardSkeleton.jsx';

// --- Constants for easy configuration ---
const CARD_WIDTH_ESTIMATE = 300; // Used to calculate column count
const ROW_HEIGHT_ESTIMATE = 196; // Estimated height of a row (card height + gap)

/**
 * A memoized component to render a single row in our virtualized grid.
 * This prevents re-renders unless the specific props for this row change.
 */
const MemoizedRow = memo(({ virtualRow, columnCount, filteredVehicles, isLoaderRow }) => {
  const vehiclesInRow = isLoaderRow
    ? []
    : filteredVehicles.slice(
        virtualRow.index * columnCount,
        virtualRow.index * columnCount + columnCount
      );

  return (
    <div
      key={virtualRow.key}
      className="grid gap-4 p-2"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {isLoaderRow
        ? Array.from({ length: columnCount }).map((_, i) => <VehicleCardSkeleton key={i} />)
        : vehiclesInRow.map((vehicle) => <VehicleCard key={vehicle.id} v={vehicle} />)}
    </div>
  );
});

/**
 * The main virtualized grid component.
 */
export default function VirtualizedVehicleGrid({ filteredVehicles, fetchNextPage, hasMore, isLoading }) {
  const parentRef = useRef(null);
  const [columnCount, setColumnCount] = useState(0);

  // Effect to calculate responsive column count based on container width
  useEffect(() => {
    if (!parentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const width = parentRef.current.offsetWidth;
      setColumnCount(Math.max(1, Math.floor(width / CARD_WIDTH_ESTIMATE)));
    });

    resizeObserver.observe(parentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate row and item counts for the virtualizer
  const rowCount = columnCount > 0 ? Math.ceil(filteredVehicles.length / columnCount) : 0;
  const totalItemCount = hasMore ? rowCount + 1 : rowCount;

  // Setup the virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: totalItemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Effect to trigger fetching the next page of data
  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];
    if (lastItem && lastItem.index >= rowCount - 1 && hasMore && !isLoading) {
      fetchNextPage();
    }
  }, [virtualRows, rowCount, hasMore, isLoading, fetchNextPage]);

  // Placeholder for initial render to prevent layout flash
  const Placeholder = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
      {Array.from({ length: 9 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div ref={parentRef} className="w-full h-[calc(100vh-200px)] overflow-auto">
      {columnCount === 0 ? (
        <Placeholder />
      ) : (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => (
            <MemoizedRow
              key={virtualRow.key}
              virtualRow={virtualRow}
              columnCount={columnCount}
              filteredVehicles={filteredVehicles}
              isLoaderRow={virtualRow.index >= rowCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}