import { useState, useEffect, useRef } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable: boolean;
}

export function useSortable<
  T extends Record<string, any>,
  K extends keyof T = keyof T,
>(
  initialKey: K | null = null,
  onSortChange?: (key: K | null, direction: SortDirection) => void,
  initialDirection: SortDirection = null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialKey,
    direction: initialDirection,
  });

  const initialEffectCalled = useRef(false);

  useEffect(() => {
    if (
      !initialEffectCalled.current &&
      initialDirection !== null &&
      initialKey !== null &&
      onSortChange
    ) {
      initialEffectCalled.current = true;
      onSortChange(initialKey, initialDirection);
    }
  }, [initialKey, initialDirection, onSortChange]);

  const requestSort = (key: K, columnConfig: ColumnConfig<T>[]): void => {
    const column = columnConfig.find((col) => col.key === key);
    if (!column || !column.sortable) return;

    let direction: SortDirection = 'asc';

    if (sortConfig.key === key) {
      direction =
        sortConfig.direction === 'asc'
          ? 'desc'
          : sortConfig.direction === 'desc'
            ? null
            : 'asc';
    }

    const newSortConfig = {
      key: direction ? key : null,
      direction,
    };

    setSortConfig(newSortConfig);
    if (onSortChange) onSortChange(newSortConfig.key, newSortConfig.direction);
  };

  const getSortState = (key: K): SortDirection => {
    if (sortConfig.key !== key || !sortConfig.direction) return null;
    return sortConfig.direction;
  };

  return {
    sortConfig,
    requestSort,
    getSortState,
  };
}
