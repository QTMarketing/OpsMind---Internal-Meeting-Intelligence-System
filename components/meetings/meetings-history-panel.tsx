"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/foundation/empty-state";
import { ErrorState } from "@/components/foundation/error-state";
import { SkeletonBlock } from "@/components/foundation/skeleton-block";
import { useMeetingDetailQuery, useMeetingsQuery } from "@/lib/query/dashboard-query";
import { formatFullDate } from "@/lib/utils/dashboard";

export function MeetingsHistoryPanel() {
  const meetingsQuery = useMeetingsQuery();
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const meetings = useMemo(() => meetingsQuery.data ?? [], [meetingsQuery.data]);
  const filteredMeetings = useMemo(() => {
    const next = meetings.filter((meeting) =>
      `${meeting.title} ${meeting.summary}`.toLowerCase().includes(searchValue.toLowerCase()),
    );

    next.sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? right - left : left - right;
    });

    return next;
  }, [meetings, searchValue, sortOrder]);

  const activeMeetingId = selectedMeetingId ?? filteredMeetings[0]?.id ?? null;
  const detailQuery = useMeetingDetailQuery(activeMeetingId);

  if (meetingsQuery.isLoading) {
    return (
      <section className="space-y-4">
        <div className="app-card p-4">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="mt-4 h-12 w-full" />
          <SkeletonBlock className="mt-3 h-12 w-full" />
        </div>
      </section>
    );
  }

  if (meetingsQuery.isError) {
    return (
      <ErrorState
        message="We could not load meeting history right now. Please try again."
        onRetry={() => {
          void meetingsQuery.refetch();
        }}
      />
    );
  }

  if (filteredMeetings.length === 0) {
    return (
      <EmptyState
        title="No meetings found"
        description="Try adjusting search or upload new meeting audio to populate this history."
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="app-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search meetings..."
              className="app-input"
              aria-label="Search meetings"
            />
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
              className="app-select"
              aria-label="Sort meetings by date"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <p className="text-xs text-success">Meeting history is up to date</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  Title
                </th>
                <th className="px-2 py-1.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  Date
                </th>
                <th className="px-2 py-1.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  Tasks
                </th>
                <th className="px-2 py-1.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-border/70 hover:bg-surface-muted">
                  <td className="px-2 py-2.5 text-sm">
                    <p className="font-medium text-foreground">{meeting.title}</p>
                    <p className="mt-1 text-xs text-muted">{meeting.summary}</p>
                  </td>
                  <td className="px-2 py-2.5 text-sm text-foreground">{formatFullDate(meeting.createdAt)}</td>
                  <td className="px-2 py-2.5 text-sm text-foreground">{meeting.taskCount}</td>
                  <td className="px-2 py-2.5 text-sm">
                    <button
                      type="button"
                      onClick={() => setSelectedMeetingId(meeting.id)}
                      className="app-button app-button-ghost hover:bg-surface"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="app-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Meeting Detail</h2>
        {detailQuery.isLoading ? (
          <div className="mt-3 space-y-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        ) : detailQuery.isError ? (
          <ErrorState
            message="We could not load meeting details. Please try again."
            onRetry={() => {
              void detailQuery.refetch();
            }}
          />
        ) : detailQuery.data ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-foreground">{detailQuery.data.title}</p>
            <p className="text-sm text-muted">{detailQuery.data.summary}</p>
            <p className="text-sm text-foreground">
              Transcript preview: <span className="text-muted">{detailQuery.data.transcriptPreview}</span>
            </p>
            <p className="text-sm text-foreground">Tasks linked: {detailQuery.data.taskCount}</p>
            <p className="text-xs text-success">Detail data is up to date.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
