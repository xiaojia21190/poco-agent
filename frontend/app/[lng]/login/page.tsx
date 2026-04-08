import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_SESSION_COOKIE_NAME,
  LoginPageClient,
  normalizeNextPath,
} from "@/features/auth";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { lng } = await params;
  const { next, error } = await searchParams;
  const cookieStore = await cookies();
  const nextPath = normalizeNextPath(next, lng);

  if (cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value) {
    redirect(nextPath);
  }

  return <LoginPageClient lng={lng} nextPath={nextPath} errorCode={error} />;
}
