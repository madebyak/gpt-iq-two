"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/login?returnUrl=${pathname}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) return null;
  return <>{children}</>;
}
