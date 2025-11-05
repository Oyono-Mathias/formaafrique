"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SecurityBanner() {
  const { userProfile, loading } = useUser();

  if (loading) {
    return null; 
  }

  if (userProfile?.role !== "admin") {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white flex items-center justify-between px-6 py-3 rounded-md shadow-lg animate-fade-in-down border border-green-400">
      <div className="flex items-center space-x-3">
        <ShieldCheck className="w-5 h-5 text-white" />
        <h2 className="text-sm md:text-base font-semibold">
          🔒 Mode protégé activé — Modifications restreintes aux fichiers critiques.
        </h2>
      </div>
      <Lock className="w-4 h-4 text-white animate-pulse" />
    </div>
  );
}
