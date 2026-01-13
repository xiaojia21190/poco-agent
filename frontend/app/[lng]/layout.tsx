import { languages } from "../i18n/settings";
import { LanguageProvider } from "./language-provider";

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  return <LanguageProvider lng={lng}>{children}</LanguageProvider>;
}
