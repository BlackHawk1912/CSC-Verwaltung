import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
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
  const table = useReactTable<T>({
    data: data as T[],
    columns: columns as ColumnDef<T, unknown>[],
    getCoreRowModel: getCoreRowModel(),
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
              {hg.headers.map((h) => (
                <th key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
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
