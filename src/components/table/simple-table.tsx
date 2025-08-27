import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import type { CSSProperties, UIEvent } from 'react'

export type SimpleTableProps<T> = {
  data: readonly T[]
  columns: readonly ColumnDef<T, unknown>[]
  containerStyle?: CSSProperties
  containerClassName?: string
  onContainerScroll?: (e: UIEvent<HTMLDivElement>) => void
  onContainerRef?: (el: HTMLDivElement | null) => void
}

export function SimpleTable<T>({ data, columns, containerStyle, containerClassName, onContainerScroll, onContainerRef }: SimpleTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable<T>({
    data: data as T[],
    columns: columns as ColumnDef<T, unknown>[],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div
      className={`table-responsive ${containerClassName ?? ''}`}
      style={containerStyle}
      onScroll={onContainerScroll}
      ref={onContainerRef ?? undefined}
    >
      <table className="table align-middle mb-0 table-striped table-borderless table-sticky-header">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const sorted = h.column.getIsSorted()
                const isSortable = h.column.getCanSort?.() ?? true
                return (
                  <th
                    key={h.id}
                    role={isSortable ? 'button' : undefined}
                    onClick={isSortable ? h.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: isSortable ? 'pointer' : undefined, userSelect: 'none', whiteSpace: 'nowrap' }}
                    aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                    title={isSortable ? 'Spalte sortieren' : undefined}
                  >
                    <span>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</span>
                    {isSortable && (
                      <span className="ms-1 text-secondary" aria-hidden="true">
                        {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((c) => (
                <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
