"use client";

import type { ComponentType } from "react";
import { Activity, CalendarDays, Clock3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";
import {
  formatCurrency,
  formatNumber,
} from "@/features/settings/lib/usage-analytics";
import type {
  UsageAnalyticsMetricSummary,
  UsageAnalyticsSummary,
} from "@/features/settings/types";

interface UsageSummaryCardsProps {
  summary: UsageAnalyticsSummary;
  locale: string;
  monthLabel: string;
  dayLabel: string;
}

interface UsageMetricCardProps {
  title: string;
  description: string;
  total: number;
  metric: UsageAnalyticsMetricSummary;
  locale: string;
  icon: ComponentType<{ className?: string }>;
}

function UsageMetricCard({
  title,
  description,
  total,
  metric,
  locale,
  icon: Icon,
}: UsageMetricCardProps) {
  const { t } = useT("translation");

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="text-3xl font-semibold tracking-tight">
          {formatNumber(total, locale)}
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{t("settings.usageTab.inputTokens")}</span>
            <span className="font-medium text-foreground">
              {formatNumber(metric.input_tokens, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("settings.usageTab.outputTokens")}</span>
            <span className="font-medium text-foreground">
              {formatNumber(metric.output_tokens, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("settings.usageTab.cacheWriteTokens")}</span>
            <span className="font-medium text-foreground">
              {formatNumber(metric.cache_creation_input_tokens, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("settings.usageTab.cacheReadTokens")}</span>
            <span className="font-medium text-foreground">
              {formatNumber(metric.cache_read_input_tokens, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-border/70 pt-2">
            <span>{t("settings.usageTab.cost")}</span>
            <span className="font-medium text-foreground">
              {formatCurrency(metric.total_cost_usd, locale)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UsageSummaryCards({
  summary,
  locale,
  monthLabel,
  dayLabel,
}: UsageSummaryCardsProps) {
  const { t } = useT("translation");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <UsageMetricCard
        title={t("settings.usageTab.monthSummary")}
        description={monthLabel}
        total={summary.month.total_tokens}
        metric={summary.month}
        locale={locale}
        icon={CalendarDays}
      />
      <UsageMetricCard
        title={t("settings.usageTab.daySummary")}
        description={dayLabel}
        total={summary.day.total_tokens}
        metric={summary.day}
        locale={locale}
        icon={Clock3}
      />
      <UsageMetricCard
        title={t("settings.usageTab.allTimeSummary")}
        description={t("settings.usageTab.allTimeDescription")}
        total={summary.all_time.total_tokens}
        metric={summary.all_time}
        locale={locale}
        icon={Activity}
      />
    </div>
  );
}
