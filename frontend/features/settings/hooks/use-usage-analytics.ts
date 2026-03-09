"use client";

import * as React from "react";

import { getUsageAnalytics } from "@/features/settings/api/usage-analytics-api";
import {
  getBrowserTimeZone,
  getCurrentYearMonth,
  shiftYearMonth,
} from "@/features/settings/lib/usage-analytics";
import type { UsageAnalyticsResponse } from "@/features/settings/types";

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return null;
}

export function useUsageAnalytics() {
  const [timezone, setTimezone] = React.useState("UTC");
  const [requestedMonth, setRequestedMonth] =
    React.useState(getCurrentYearMonth);
  const [requestedDay, setRequestedDay] = React.useState<string | null>(null);
  const [data, setData] = React.useState<UsageAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const requestTokenRef = React.useRef(0);

  React.useEffect(() => {
    setTimezone(getBrowserTimeZone());
  }, []);

  const load = React.useCallback(async () => {
    const requestToken = requestTokenRef.current + 1;
    requestTokenRef.current = requestToken;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUsageAnalytics({
        month: requestedMonth,
        day: requestedDay ?? undefined,
        timezone,
      });
      if (requestTokenRef.current !== requestToken) return;
      setData(result);
    } catch (loadError) {
      if (requestTokenRef.current !== requestToken) return;
      setError(toErrorMessage(loadError));
    } finally {
      if (requestTokenRef.current === requestToken) {
        setIsLoading(false);
      }
    }
  }, [requestedDay, requestedMonth, timezone]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const goToPreviousMonth = React.useCallback(() => {
    setRequestedMonth((current) => shiftYearMonth(current, -1));
    setRequestedDay(null);
  }, []);

  const goToNextMonth = React.useCallback(() => {
    setRequestedMonth((current) => shiftYearMonth(current, 1));
    setRequestedDay(null);
  }, []);

  const selectDay = React.useCallback((day: string) => {
    setRequestedDay(day);
  }, []);

  const refresh = React.useCallback(() => {
    void load();
  }, [load]);

  return {
    data,
    timezone,
    error,
    isLoading,
    activeMonth: data?.month ?? requestedMonth,
    activeDay: data?.day ?? requestedDay,
    goToPreviousMonth,
    goToNextMonth,
    refresh,
    selectDay,
  };
}
