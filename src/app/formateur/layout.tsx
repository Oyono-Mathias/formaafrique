
"use client";
import React from "react";
import FormateurGuard from "@/components/FormateurGuard";

export default function Layout({ children }: {children: React.ReactNode}) {
  return (
    <FormateurGuard>
      {children}
    </FormateurGuard>
  );
}
