"use client";

import i18next from "./i18next";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation, UseTranslationOptions } from "react-i18next";

const runsOnServerSide = typeof window === "undefined";

export function useT(ns?: string | string[], options?: UseTranslationOptions) {
  const params = useParams();
  const lng = params?.lng as string | undefined;

  if (typeof lng !== "string")
    throw new Error("useT is only available inside /app/[lng]");

  // Update i18next language when lng param changes
  useEffect(() => {
    if (!lng || i18next.resolvedLanguage === lng) return;
    i18next.changeLanguage(lng);
  }, [lng]);

  // Handle server-side language change (no hooks involved)
  if (runsOnServerSide && i18next.resolvedLanguage !== lng) {
    i18next.changeLanguage(lng);
  }

  return useTranslation(ns, options);
}
