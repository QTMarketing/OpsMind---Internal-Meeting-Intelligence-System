"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { Task } from "@/lib/types/dashboard";
import { formatFullDate, getStatusTone } from "@/lib/utils/dashboard";

type TasksTableProps = {
  data: Task[];
  overallTotal: number;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  contextFilters?: Array<{ id: string; label: string; onClear: () => void }>;
};

const statusOptions: Task["status"][] = ["pending", "in_progress", "completed", "blocked"];

export function TasksTable({
  data,
  overallTotal,
  onCreateTask,
  onEditTask,
  contextFilters = [],
}: TasksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "deadline", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    owner: true,
    deadline: true,
    project: true,
    status: true,
  });

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            aria-label="Select all rows"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            aria-label={`Select ${row.original.title}`}
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "Task",
        cell: ({ row }) => <p className="font-medium text-foreground">{row.original.title}</p>,
      },
      {
        accessorKey: "owner",
        header: "Owner",
      },
      {
        accessorKey: "project",
        header: "Project",
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => formatFullDate(row.original.deadline),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={`text-sm font-medium capitalize ${getStatusTone(row.original.status)}`}>
            {row.original.status.replace("_", " ")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onEditTask(row.original)}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
          >
            Edit
          </button>
        ),
        enableSorting: false,
      },
    ],
    [onEditTask],
  );

  // TanStack Table currently triggers React Compiler compatibility warning in Next 16.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const shownCount = table.getFilteredRowModel().rows.length;

  return (
    <section className="app-card p-4">
      <header className="mb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Task Operations Table</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted">
              {shownCount} shown of {overallTotal} total
            </p>
            <button
              type="button"
              onClick={onCreateTask}
              className="app-button app-button-primary shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
            >
              New Task
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search tasks, owners, projects..."
            aria-label="Search tasks"
            className="app-input w-full lg:max-w-xs"
          />

          <select
            className="app-select"
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("status")?.setFilterValue(event.target.value || undefined);
            }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-xs text-muted" htmlFor="toggle-owner">
              Owner
            </label>
            <input
              id="toggle-owner"
              type="checkbox"
              checked={table.getColumn("owner")?.getIsVisible() ?? false}
              onChange={table.getColumn("owner")?.getToggleVisibilityHandler()}
            />
            <label className="text-xs text-muted" htmlFor="toggle-project">
              Project
            </label>
            <input
              id="toggle-project"
              type="checkbox"
              checked={table.getColumn("project")?.getIsVisible() ?? false}
              onChange={table.getColumn("project")?.getToggleVisibilityHandler()}
            />
          </div>
        </div>

        {selectedCount > 0 ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-1.5">
            <div>
              <p className="text-sm text-foreground">{selectedCount} rows selected</p>
              <p className="text-xs text-muted">Bulk updates are currently read-only in this view.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="app-button app-button-ghost cursor-not-allowed opacity-60"
              >
                Mark Completed
              </button>
              <button
                type="button"
                onClick={() => table.resetRowSelection()}
                className="app-button app-button-ghost text-destructive hover:bg-surface"
              >
                Clear Selection
              </button>
            </div>
          </div>
        ) : null}

        {!selectedCount && contextFilters.length > 0 ? (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
            <p className="text-sm text-foreground">Filtered view</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {contextFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1"
                >
                  <span className="text-xs text-foreground">{filter.label}</span>
                  <button
                    type="button"
                    onClick={filter.onClear}
                    className="app-button app-button-ghost px-1.5 py-0.5 text-xs hover:bg-surface-muted"
                    aria-label={`Clear ${filter.label} filter`}
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-1.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border/70 hover:bg-surface-muted">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2.5 text-sm text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="app-button app-button-ghost disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="app-button app-button-ghost disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
