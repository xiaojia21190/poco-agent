"use client";

import { useEffect } from "react";
import i18next from "../i18n/i18next";

export function LanguageProvider({
  lng,
  children,
}: {
  lng: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (i18next.resolvedLanguage !== lng) {
      i18next.changeLanguage(lng);
    }
  }, [lng]);

  useEffect(() => {
    document.documentElement.lang = lng;
  }, [lng]);

  return <>{children}</>;
}
