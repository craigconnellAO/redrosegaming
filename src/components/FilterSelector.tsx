'use client';

import { allFilters } from '@/lib/filters/filters';
import { Filter } from '@/lib/filters/types';

interface FilterSelectorProps {
  selectedFilter: Filter | null;
  onSelectFilter: (filter: Filter | null) => void;
}

export function FilterSelector({ selectedFilter, onSelectFilter }: FilterSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 8,
        marginTop: 12,
      }}
    >
      {/* No filter button */}
      <button
        onClick={() => onSelectFilter(null)}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: selectedFilter === null ? '2px solid var(--accent)' : '1px solid var(--border)',
          background: selectedFilter === null ? 'var(--accent)' : 'var(--card)',
          color: selectedFilter === null ? '#fff' : 'var(--text)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.2s var(--ease)',
        }}
      >
        None
      </button>

      {/* Filter buttons */}
      {allFilters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onSelectFilter(filter)}
          title={filter.description}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: selectedFilter?.id === filter.id ? '2px solid var(--accent)' : '1px solid var(--border)',
            background: selectedFilter?.id === filter.id ? 'var(--accent)' : 'var(--card)',
            color: selectedFilter?.id === filter.id ? '#fff' : 'var(--text)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.2s var(--ease)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>{filter.emoji}</span>
        </button>
      ))}
    </div>
  );
}
