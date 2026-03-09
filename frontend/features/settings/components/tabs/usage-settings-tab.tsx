"use client";

import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";
import { UsageDayChart } from "@/features/settings/components/usage/usage-day-chart";
import { UsageMonthChart } from "@/features/settings/components/usage/usage-month-chart";
import { UsageSummaryCards } from "@/features/settings/components/usage/usage-summary-cards";
import {
  formatDayLabel,
  formatMonthLabel,
} from "@/features/settings/lib/usage-analytics";
import { useUsageAnalytics } from "@/features/settings/hooks/use-usage-analytics";

function UsageLoadingSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-xl border border-border bg-muted/50" />
        <div className="h-[420px] animate-pulse rounded-xl border border-border bg-muted/50" />
      </div>
    </div>
  );
}

export function UsageSettingsTab() {
  const { t, i18n } = useT("translation");
  const {
    data,
    timezone,
    error,
    isLoading,
    activeMonth,
    activeDay,
    goToNextMonth,
    goToPreviousMonth,
    refresh,
    selectDay,
  } = useUsageAnalytics();

  if (isLoading && !data) {
    return <UsageLoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="text-sm text-muted-foreground">
              {error || t("settings.usageTab.loadFailed")}
            </div>
            <Button onClick={refresh} variant="outline">
              {t("settings.usageTab.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthLabel = formatMonthLabel(activeMonth, i18n.language);
  const dayLabel = formatDayLabel(data.day, i18n.language);
  const hasAnyUsage = data.summary.all_time.total_tokens > 0;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-xl font-semibold tracking-tight">
              {monthLabel}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("settings.usageTab.timezoneLabel", { timezone })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label={t("settings.usageTab.previousMonth")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              aria-label={t("settings.usageTab.nextMonth")}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              {t("settings.usageTab.refresh")}
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-dashed border-amber-500/40 bg-amber-500/5">
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="text-sm text-muted-foreground">
                {error || t("settings.usageTab.loadFailed")}
              </div>
              <Button variant="outline" size="sm" onClick={refresh}>
                {t("settings.usageTab.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <UsageSummaryCards
          summary={data.summary}
          locale={i18n.language}
          monthLabel={monthLabel}
          dayLabel={dayLabel}
        />

        {hasAnyUsage ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <UsageMonthChart
              buckets={data.month_view.buckets}
              activeDay={activeDay}
              locale={i18n.language}
              onSelectDay={selectDay}
            />
            <UsageDayChart
              day={data.day_view.day}
              buckets={data.day_view.buckets}
              locale={i18n.language}
            />
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("settings.usageTab.empty")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
