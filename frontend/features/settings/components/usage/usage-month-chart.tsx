"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useT } from "@/lib/i18n/client";
import {
  formatCompactNumber,
  formatDayLabel,
} from "@/features/settings/lib/usage-analytics";
import type { UsageAnalyticsBucket } from "@/features/settings/types";

interface UsageMonthChartProps {
  buckets: UsageAnalyticsBucket[];
  activeDay: string | null;
  locale: string;
  onSelectDay: (day: string) => void;
}

export function UsageMonthChart({
  buckets,
  activeDay,
  locale,
  onSelectDay,
}: UsageMonthChartProps) {
  const { t } = useT("translation");
  const chartConfig = React.useMemo(
    () =>
      ({
        input_tokens: {
          label: t("settings.usageTab.inputTokens"),
          color: "var(--chart-1)",
        },
        output_tokens: {
          label: t("settings.usageTab.outputTokens"),
          color: "var(--chart-2)",
        },
        cache_creation_input_tokens: {
          label: t("settings.usageTab.cacheWriteTokens"),
          color: "var(--chart-4)",
        },
        cache_read_input_tokens: {
          label: t("settings.usageTab.cacheReadTokens"),
          color: "var(--chart-5)",
        },
      }) satisfies ChartConfig,
    [t],
  );
  const activeBucket = React.useMemo(
    () => buckets.find((bucket) => bucket.bucket_id === activeDay) ?? null,
    [activeDay, buckets],
  );

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>{t("settings.usageTab.dailyDistribution")}</CardTitle>
        <CardDescription>{t("settings.usageTab.clickDayHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <ChartContainer
          config={chartConfig}
          className="h-[320px] w-full min-w-0 !aspect-auto"
        >
          <BarChart
            data={buckets}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onClick={(state: unknown) => {
              const bucketId = (
                state as {
                  activePayload?: Array<{ payload?: UsageAnalyticsBucket }>;
                }
              ).activePayload?.[0]?.payload?.bucket_id;
              if (bucketId) onSelectDay(bucketId);
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) =>
                formatCompactNumber(value, locale)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const bucketId = payload?.[0]?.payload?.bucket_id;
                    return typeof bucketId === "string"
                      ? formatDayLabel(bucketId, locale)
                      : null;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {activeBucket ? (
              <ReferenceLine
                x={activeBucket.label}
                stroke="var(--primary)"
                strokeDasharray="4 4"
              />
            ) : null}
            <Bar
              dataKey="input_tokens"
              stackId="tokens"
              fill="var(--color-input_tokens)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="output_tokens"
              stackId="tokens"
              fill="var(--color-output_tokens)"
            />
            <Bar
              dataKey="cache_creation_input_tokens"
              stackId="tokens"
              fill="var(--color-cache_creation_input_tokens)"
            />
            <Bar
              dataKey="cache_read_input_tokens"
              stackId="tokens"
              fill="var(--color-cache_read_input_tokens)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="text-sm text-muted-foreground">
          {activeBucket
            ? t("settings.usageTab.selectedDayLabel", {
                day: formatDayLabel(activeBucket.bucket_id, locale),
              })
            : t("settings.usageTab.selectedDayFallback")}
        </div>
      </CardContent>
    </Card>
  );
}
