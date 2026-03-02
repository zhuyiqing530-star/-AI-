"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { VideoProvider } from "@/contexts/VideoContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <VideoProvider>{children}</VideoProvider>
    </AuthProvider>
  );
}
